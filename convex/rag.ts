import { v } from "convex/values";
import { RAG } from "@convex-dev/rag";
import { openai } from "@convex-dev/openai";
import { components, internal } from "./_generated/api";
import { internalMutation, internalQuery, query, mutation } from "./_generated/server";
import { assertHasOrgAccess } from "./auth";
import { Id } from "./_generated/dataModel";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set");
}

export const rag = new RAG(components.rag, {
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
  async getDocument(ctx, id: Id<"knowledgeBase">) {
    return await ctx.db.get(id);
  },
});

export const addArticle = mutation({
    args: {
        orgId: v.id("organizations"),
        title: v.string(),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const { role } = await assertHasOrgAccess(ctx, args.orgId);
        if (role !== "admin") {
            throw new Error("Only admins can add to the knowledge base.");
        }
        
        const docId = await ctx.db.insert("knowledgeBase", {
            orgId: args.orgId,
            title: args.title,
            text: args.text,
        });

        await ctx.scheduler.runAfter(0, internal.rag.index, {
            documentId: docId,
            namespace: args.orgId,
        });
    }
});

export const listArticles = query({
    args: { orgId: v.id("organizations") },
    handler: async (ctx, args) => {
        await assertHasOrgAccess(ctx, args.orgId);
        return await ctx.db
            .query("knowledgeBase")
            .withIndex("by_orgId", q => q.eq("orgId", args.orgId))
            .order("desc")
            .collect();
    }
});

export const search = internalQuery({
    args: { orgId: v.id("organizations"), query: v.string() },
    handler: async (ctx, args) => {
        const results = await rag.query(ctx, args.orgId, args.query, { topK: 3 });
        return Promise.all(
            results.map(async (r) => {
                const doc = await ctx.db.get(r.id as Id<"knowledgeBase">);
                return {
                    title: doc?.title,
                    text: r.text,
                    score: r.score
                };
            })
        );
    }
});
