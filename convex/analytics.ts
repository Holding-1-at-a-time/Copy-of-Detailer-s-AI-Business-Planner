import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertHasOrgAccess } from "./auth";

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    dataType: v.string(),
    value: v.number(),
    date: v.string(),
    details: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin" && role !== "member") {
      throw new Error("You do not have permission to add analytics data in this organization.");
    }

    const analyticId = await ctx.db.insert("analytics", {
        orgId: args.orgId,
        dataType: args.dataType,
        value: args.value,
        date: args.date,
        details: args.details,
    });

    return analyticId;
  },
});
