import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertHasOrgAccess } from "./auth";

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    type: v.string(),
    value: v.number(),
    leadSource: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin" && role !== "member") {
      throw new Error("You do not have permission to create jobs in this organization.");
    }
    
    const jobId = await ctx.db.insert("jobs", {
      orgId: args.orgId,
      type: args.type,
      value: args.value,
      leadSource: args.leadSource,
      date: args.date,
    });
    
    return jobId;
  },
});
