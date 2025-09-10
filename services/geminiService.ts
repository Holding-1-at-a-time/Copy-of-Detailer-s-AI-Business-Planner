

import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { Content } from "@google/genai";
import { BusinessAnalytic, Goal, ChatMessage, ActionStep, Job } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = "gemini-2.5-flash";

const summarizeJobs = (jobs: Job[]): string => {
    if (jobs.length === 0) return "No job data available.";
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentJobs = jobs.filter(j => new Date(j.date) >= thirtyDaysAgo);
    if (recentJobs.length === 0) return "No jobs logged in the last 30 days.";
    const revenueByType = recentJobs.reduce((acc, job) => { acc[job.type] = (acc[job.type] || 0) + job.value; return acc; }, {} as Record<string, number>);
    const jobsBySource = recentJobs.reduce((acc, job) => { acc[job.leadSource] = (acc[job.leadSource] || 0) + 1; return acc; }, {} as Record<string, number>);
    const formattedRevenue = Object.entries(revenueByType).map(([type, total]) => `- ${type}: $${total.toLocaleString()}`).join('\n');
    const formattedSource = Object.entries(jobsBySource).map(([source, count]) => `- ${source}: ${count} jobs`).join('\n');
    return `
**Recent Job Summary (Last 30 Days):**
Total Jobs: ${recentJobs.length}
Total Revenue: $${recentJobs.reduce((sum, j) => sum + j.value, 0).toLocaleString()}
Revenue by Job Type:
${formattedRevenue}
Jobs by Lead Source:
${formattedSource}
    `;
};

const formatMarketingSpend = (analytics: BusinessAnalytic[]): string => {
  const marketingData = analytics
    .filter(a => a.dataType === 'Marketing Spend')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (marketingData.length === 0) return "No marketing spend data available.";
  return marketingData.slice(0, 3).map(d => 
    `- $${d.value.toLocaleString()} in ${new Date(d.date).toLocaleString('default', { month: 'long', year: 'numeric' })}`
  ).join('\n');
};

const formatRecentJobs = (jobs: Job[]): string => {
  if (jobs.length === 0) return "No recent jobs to display.";
  const recentJobs = [...jobs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  return recentJobs.map(j => 
    `- ${new Date(j.date).toLocaleDateString()}: ${j.type} for $${j.value} (Source: ${j.leadSource})`
  ).join('\n');
};

export const getChatResponse = async (
  history: ChatMessage[],
  analyticsData: BusinessAnalytic[],
  goals: Goal[],
  jobs: Job[],
  newUserMessage: string,
): Promise<string> => {
    if (!API_KEY) return "AI functionality is disabled because the API key is not configured.";

    const formattedAnalytics = analyticsData.map(d => `- ${d.dataType} on ${new Date(d.date).toLocaleDateString()}: ${d.value.toLocaleString()}`).join('\n');
    const formattedGoals = goals.filter(g => g.status === 'active').map(g => `- Goal: ${g.description} (Target: ${g.targetValue}, Current: ${g.currentValue})`).join('\n');
    const jobSummary = summarizeJobs(jobs);
    const marketingSpendSummary = formatMarketingSpend(analyticsData);
    const recentJobsSummary = formatRecentJobs(jobs);

    const systemInstruction = `
        You are a world-class business consultant specializing in the car detailing industry. Your analysis must be sharp, proactive, and data-driven.
        Your primary goal is to help the user increase profitability and efficiency.
        - **Correlate Data:** Proactively look for connections. Specifically compare **Marketing Spend** to **Jobs by Lead Source** to evaluate marketing effectiveness. Ask probing questions if the data is insufficient.
        - **Analyze Profitability:** Use the **Detailed Job Data Summary** to identify the most profitable job types and effective lead sources.
        - **Spot Trends:** Use the **Last 5 Logged Jobs** to identify immediate, tactical trends or anomalies.
        - **Be Actionable:** Always provide clear, actionable recommendations.
        Structure your responses in Markdown. Base your analysis on the most recent data provided in the prompt.
    `;
    
    const messageWithContext = `
        **LATEST BUSINESS DATA:**
        ---
        **Marketing Spend:**
        ${marketingSpendSummary}
        ---
        **Last 5 Logged Jobs:**
        ${recentJobsSummary}
        ---
        **Key Metrics (Calculated from all jobs):**
        ${formattedAnalytics}
        ---
        **Active Goals:**
        ${formattedGoals}
        ---
        **Detailed Job Data Summary (Last 30 Days):**
        ${jobSummary}
        ---
        
        **MY QUESTION:** ${newUserMessage}
    `;

    const geminiHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
    }));

    try {
        const chat: Chat = ai.chats.create({ model, config: { systemInstruction }, history: geminiHistory });
        const response = await chat.sendMessage({ message: messageWithContext });
        return response.text;
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        return "There was an error generating a response. Please check the console for more details.";
    }
};

export const generateActionPlan = async (
  goal: Goal,
  analyticsData: BusinessAnalytic[],
  allGoals: Goal[],
  jobs: Job[],
): Promise<ActionStep[]> => {
  if (!API_KEY) {
    console.warn("AI functionality is disabled because the API key is not configured.");
    return [];
  }

  const formattedAnalytics = analyticsData.map(d => `- ${d.dataType} on ${new Date(d.date).toLocaleDateString()}: ${d.value.toLocaleString()}`).join('\n');
  const formattedGoals = allGoals.map(g => `- Goal: ${g.description} (Status: ${g.status})`).join('\n');
  const jobSummary = summarizeJobs(jobs);
  const marketingSpendSummary = formatMarketingSpend(analyticsData);
  const recentJobsSummary = formatRecentJobs(jobs);

  const prompt = `
    Based on the following business data, create a concise, actionable, step-by-step plan to achieve this specific goal: "${goal.description}".
    The target is ${goal.targetValue} and the current value is ${goal.currentValue}.
    The plan should have between 3 and 5 steps. Each step must be a clear, simple action the business owner can take.
    If a step is time-sensitive or has a logical timeline, suggest a reasonable dueDate in YYYY-MM-DD format. Add brief notes for clarity where needed.

    **LATEST BUSINESS DATA CONTEXT:**
    ---
    **Marketing Spend:**
    ${marketingSpendSummary}
    ---
    **Last 5 Logged Jobs:**
    ${recentJobsSummary}
    ---
    **Key Metrics (Calculated):**
    ${formattedAnalytics}
    ---
    **Other Goals:**
    ${formattedGoals}
    ---
    **Detailed Job Data Summary (Last 30 Days):**
    ${jobSummary}
    ---
  `;

  const actionPlanSchema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              description: { type: Type.STRING, description: "A single, actionable step to achieve the goal." },
              completed: { type: Type.BOOLEAN, description: "The completion status of the step, should always be false initially." },
              dueDate: { type: Type.STRING, description: "An optional, suggested due date in YYYY-MM-DD format if applicable." },
              notes: { type: Type.STRING, description: "Optional, brief notes or context for the step." }
          },
          required: ["description", "completed"]
      }
  };

  try {
    const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json", responseSchema: actionPlanSchema } });
    const plan = JSON.parse(response.text.trim());
    if (Array.isArray(plan)) return plan.map(item => ({ 
        description: item.description || "No description provided",
        completed: false,
        dueDate: item.dueDate || undefined,
        notes: item.notes || undefined,
    }));
    return [];
  } catch (error) {
    console.error("Error generating action plan from Gemini API:", error);
    return [{ description: "There was an error generating the plan.", completed: false }, { description: "Please check your API key and try again.", completed: false }];
  }
};

export const suggestNextAction = async (
  history: ChatMessage[],
  analyticsData: BusinessAnalytic[],
  goals: Goal[],
  jobs: Job[],
): Promise<string> => {
    if (!API_KEY) return "AI features are disabled.";
    
    const jobSummary = summarizeJobs(jobs);
    const marketingSpendSummary = formatMarketingSpend(analyticsData);
    const recentJobsSummary = formatRecentJobs(jobs);
    const conversationHistory = history.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n'); // Last 4 messages

    const prompt = `
        You are a sharp, proactive AI business consultant for a car detailer. Your task is to suggest one single, highly insightful follow-up question for the user to ask.
        Analyze the provided business data and conversation. Your question should guide the user to discover a hidden opportunity, a potential risk, or a critical connection between their data.
        For example, correlate marketing spend with lead sources, or job types with profitability.
        Do not ask a generic question. It must be specific to their data.
        Return ONLY the question as a single line of plain text, without any preamble, explanation, or quotation marks.

        **RECENT CONVERSATION:**
        ${conversationHistory}
        
        **LATEST BUSINESS DATA CONTEXT:**
        - Recent Marketing Spend: ${marketingSpendSummary.split('\n')[0]}
        - Summary of Last 5 Jobs: ${recentJobsSummary.split('\n')[0]}
        - 30-Day Job & Revenue Summary: ${jobSummary.split('\n').slice(1,3).join('; ')}
    `;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating suggestion from Gemini API:", error);
        return "Could not generate a suggestion.";
    }
};