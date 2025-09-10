import { v } from "convex/values";
import { Agent } from "@convex-dev/agent";
import { openai } from "@convex-dev/openai";
import { components, internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
import { assertHasFeature, assertHasOrgAccess } from "./auth";
import { Doc, Id } from "./_generated/dataModel";

const systemPrompt = `
You are a world-class business consultant specializing in the car detailing industry. Your analysis must be sharp, proactive, and data-driven. Your primary goal is to help the user increase profitability and efficiency.
- **Use Your Tools:** You have access to a knowledge base and can generate action plans. Use them when appropriate. When a user asks a question, first check the knowledge base to see if a relevant article exists.
- **Correlate Data:** Proactively look for connections. Specifically compare **Marketing Spend** to **Jobs by Lead Source** to evaluate marketing effectiveness.
- **Analyze Profitability:** Use the **Detailed Job Data Summary** to identify the most profitable job types and effective lead sources.
- **Be Actionable:** Always provide clear, actionable recommendations.
Structure your responses in Markdown. Base your analysis on the most recent data provided in the prompt.
`;

// FIX: Moved `summarizeJobs` to module scope so it can be reused.
const summarizeJobs = (jobs: any[]): string => {
    if (jobs.length === 0) return "No job data available.";
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentJobs = jobs.filter(j => new Date(j.date) >= thirtyDaysAgo);
    if (recentJobs.length === 0) return "No jobs logged in the last 30 days.";
    const revenueByType = recentJobs.reduce((acc: any, job: any) => { acc[job.type] = (acc[job.type] || 0) + job.value; return acc; }, {} as Record<string, number>);
    const jobsBySource = recentJobs.reduce((acc: any, job: any) => { acc[job.leadSource] = (acc[job.leadSource] || 0) + 1; return acc; }, {} as Record<string, number>);
    const formattedRevenue = Object.entries(revenueByType).map(([type, total]) => `- ${type}: $${total.toLocaleString()}`).join('\n');
    const formattedSource = Object.entries(jobsBySource).map(([source, count]) => `- ${source}: ${count} jobs`).join('\n');
    return `\n**Recent Job Summary (Last 30 Days):**\nTotal Jobs: ${recentJobs.length}\nTotal Revenue: $${recentJobs.reduce((sum, j) => sum + j.value, 0).toLocaleString()}\nRevenue by Job Type:\n${formattedRevenue}\nJobs by Lead Source:\n${formattedSource}`;
};

// Helper to get all business context for an organization
const getBusinessContext = async (ctx: any, orgId: Id<"organizations">) => {
    const data = await ctx.runQuery(internal.ai.getAiContext, { orgId });
    const { analytics, goals, jobs } = data;

    const formattedGoals = goals.filter(g => g.status === 'active').map(g => `- Goal: ${g.description} (Target: ${g.targetValue}, Current: ${g.currentValue})`).join('\n');
    const jobSummary = summarizeJobs(jobs);

    return `**LATEST BUSINESS DATA:**\n---\n**Active Goals:**\n${formattedGoals}\n---\n**Detailed Job Data Summary (Last 30 Days):**\n${jobSummary}\n---`;
};

export const agent = new Agent(components.agent, {
  name: "Business Consultant",
  instructions: systemPrompt,
  chat: openai.chat("gpt-4o-mini"),
  serverUrl: process.env.CONVEX_SITE_URL,
  // Augment every message with the latest business data.
  async context(ctx, { thread }) {
    const { orgId } = await ctx.runQuery(internal.agent.getThreadOrg, { threadId: thread._id });
    return await getBusinessContext(ctx, orgId);
  },
  // Define tools the agent can use.
  tools: {
    searchKnowledgeBase: {
      description: "Search the organization's knowledge base for relevant articles to answer a user's question.",
      args: { query: v.string() },
      handler: async (ctx, { query }, { thread }) => {
        const { orgId } = await ctx.runQuery(internal.agent.getThreadOrg, { threadId: thread._id });
        const results = await ctx.runQuery(internal.rag.search, { orgId, query });
        if (results.length === 0) {
            return "No relevant articles found in the knowledge base.";
        }
        return "Found relevant articles:\n" + results.map(r => `Article: ${r.title}\nContent: ${r.text}\n---`).join('\n');
      },
    },
  },
});

// Internal helper query to associate a thread with an organization
export const getThreadOrg = internal.query({
    args: { threadId: v.id("threads") },
    handler: async (ctx, { threadId }) => {
        const thread = await ctx.db.get(threadId);
        if (!thread || !thread.metadata?.orgId) {
            throw new Error("Thread not found or missing orgId");
        }
        return { orgId: thread.metadata.orgId as Id<"organizations"> };
    },
});

// Re-implement generatePlan as a public action that uses the new agent backend
export const generatePlan = internalAction({
    args: { goalId: v.id("goals") },
    handler: async (ctx, { goalId }) => {
        const context = await ctx.runQuery(internal.ai.getPlanGenerationContext, { goalId });
        const { goal, allGoals, jobs } = context;

        const jobSummary = summarizeJobs(jobs);

        const prompt = `Based on the following business data, create a concise, actionable, step-by-step plan to achieve this specific goal: "${goal.description}". The target is ${goal.targetValue} and the current value is ${goal.currentValue}. The plan should have between 3 and 5 steps. Each step must be a clear, simple action the business owner can take. If a step is time-sensitive, suggest a dueDate in YYYY-MM-DD format. Add brief notes for clarity.\n\n**LATEST BUSINESS DATA CONTEXT:**\n---\n**Other Goals:**\n${allGoals.map(g => `- ${g.description} (Status: ${g.status})`).join('\n')}\n---\n**Detailed Job Data Summary (Last 30 Days):**\n${jobSummary}\n---`;

        const response = await openai.chat("gpt-4o-mini").prompt(prompt, {
            json: {
                schema: v.array(v.object({
                    description: v.string(),
                    completed: v.boolean(),
                    dueDate: v.optional(v.string()),
                    notes: v.optional(v.string()),
                }))
            }
        });

        return response.map((item: any) => ({
            description: item.description || "No description provided",
            completed: false,
            dueDate: item.dueDate || undefined,
            notes: item.notes || undefined,
        }));
    },
});

// Re-implement suggest as a public action
export const suggest = agent.action({
    args: { threadId: v.id("threads") },
    handler: async (ctx, { threadId }) => {
        await assertHasOrgAccess(ctx, (await ctx.runQuery(internal.agent.getThreadOrg, { threadId })).orgId);

        const businessContext = await getBusinessContext(ctx, (await ctx.runQuery(internal.agent.getThreadOrg, { threadId })).orgId);

        const prompt = `You are a sharp, proactive AI business consultant for a car detailer. Your task is to suggest one single, highly insightful follow-up question for the user to ask based on their business data. Your question should guide the user to discover a hidden opportunity, a potential risk, or a critical connection. Return ONLY the question as a single line of plain text.\n\n**BUSINESS DATA:**\n${businessContext}`;
        
        return await openai.chat("gpt-4o-mini").prompt(prompt);
    },
});
