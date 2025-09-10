import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertHasOrgAccess } from "./auth";
import { GoalStatus } from "./schema";

const actionStepSchema = v.object({
    description: v.string(),
    completed: v.boolean(),
    dueDate: v.optional(v.string()),
    notes: v.optional(v.string()),
});

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    description: v.string(),
    targetValue: v.number(),
    currentValue: v.number(),
  },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin") {
      throw new Error("Only admins can create new goals.");
    }
    
    const goalId = await ctx.db.insert("goals", {
      orgId: args.orgId,
      description: args.description,
      targetValue: args.targetValue,
      currentValue: args.currentValue,
      // FIX: `GoalStatus` is a validator, not an enum. Use string literals.
      status: args.currentValue >= args.targetValue ? 'completed' : 'active',
    });
    
    return goalId;
  },
});

export const update = mutation({
    args: {
        id: v.id("goals"),
        description: v.optional(v.string()),
        targetValue: v.optional(v.number()),
        currentValue: v.optional(v.number()),
        status: v.optional(GoalStatus),
        actionPlan: v.optional(v.array(actionStepSchema)),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const goal = await ctx.db.get(id);

        if (!goal) {
            throw new Error("Goal not found");
        }

        const { role } = await assertHasOrgAccess(ctx, goal.orgId);
        if (role !== "admin" && role !== "member") {
            throw new Error("You do not have permission to update goals in this organization.");
        }

        const newUpdates: Partial<typeof goal> = { ...updates };

        // Auto-update status if not explicitly set
        if (!updates.status && (updates.currentValue !== undefined || updates.targetValue !== undefined)) {
            const current = updates.currentValue ?? goal.currentValue;
            const target = updates.targetValue ?? goal.targetValue;
            // FIX: `GoalStatus` is a validator, not an enum. Use string literal for comparison.
            if (goal.status === 'active' && current >= target) {
                // FIX: `GoalStatus` is a validator, not an enum. Use string literal.
                newUpdates.status = 'completed';
            }
        }
        
        await ctx.db.patch(id, newUpdates);
    }
});

export const deleteGoal = mutation({
    args: {
        id: v.id("goals"),
    },
    handler: async (ctx, args) => {
        const goal = await ctx.db.get(args.id);
        if (!goal) {
            throw new Error("Goal not found");
        }

        const { role } = await assertHasOrgAccess(ctx, goal.orgId);
        if (role !== "admin") {
            throw new Error("Only admins can delete goals.");
        }

        await ctx.db.delete(args.id);
    }
});

// FIX: Added missing `get` query function called by the `generatePlan` action.
export const get = query({
    args: { id: v.id("goals") },
    handler: async (ctx, args) => {
        const goal = await ctx.db.get(args.id);
        if (!goal) {
            return null;
        }
        // Ensure the user has access to the organization this goal belongs to.
        await assertHasOrgAccess(ctx, goal.orgId);
        return goal;
    }
});
