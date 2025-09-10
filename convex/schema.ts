import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const Role = v.union(v.literal("admin"), v.literal("member"), v.literal("client"));
export const GoalStatus = v.union(v.literal("active"), v.literal("completed"), v.literal("archived"));

const actionStepSchema = v.object({
    description: v.string(),
    completed: v.boolean(),
    dueDate: v.optional(v.string()), // YYYY-MM-DD
    notes: v.optional(v.string()),
});

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), // This will link to the Clerk user
    orgIds: v.array(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  organizations: defineTable({
    name: v.string(),
    plan: v.union(v.literal("solo"), v.literal("pro"), v.literal("enterprise")),
    clerkId: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  memberships: defineTable({
    orgId: v.id("organizations"),
    userId: v.id("users"),
    role: Role,
  }).index("by_orgId_userId", ["orgId", "userId"])
    .index("by_userId", ["userId"]),

  jobs: defineTable({
    orgId: v.id("organizations"),
    type: v.string(), // e.g., 'Ceramic Coating', 'Full Detail'
    value: v.number(),
    leadSource: v.string(), // e.g., 'Referral', 'Website'
    date: v.string(), // ISO 8601 format
  }).index("by_orgId", ["orgId"]),

  goals: defineTable({
    orgId: v.id("organizations"),
    description: v.string(),
    targetValue: v.number(),
    currentValue: v.number(),
    status: GoalStatus,
    actionPlan: v.optional(v.array(actionStepSchema)),
  }).index("by_orgId", ["orgId"]),

  analytics: defineTable({
    orgId: v.id("organizations"),
    dataType: v.string(), // e.g., "Marketing Spend"
    value: v.number(),
    date: v.string(), // ISO 8601 format
    details: v.optional(v.object({})),
  }).index("by_orgId", ["orgId"]),

  knowledgeBase: defineTable({
    orgId: v.id("organizations"),
    title: v.string(),
    text: v.string(),
  }).index("by_orgId", ["orgId"]),
});