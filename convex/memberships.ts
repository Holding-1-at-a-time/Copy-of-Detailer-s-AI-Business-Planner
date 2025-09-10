import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assertHasOrgAccess, assertHasFeature } from "./auth";
import { Role } from "./schema";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";
import { Id } from './_generated/dataModel';

export const addMember = mutation({
  args: { orgId: v.id("organizations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin") {
      throw new ConvexError("Only admins can add members.");
    }
    
    await assertHasFeature(ctx, args.orgId, "role_management");

    const existingMembership = await ctx.db
      .query("memberships")
      .withIndex("by_orgId_userId", q => q.eq("orgId", args.orgId).eq("userId", args.userId))
      .unique();
      
    if (existingMembership) {
      throw new ConvexError("User is already a member of this organization.");
    }
    
    await ctx.db.insert("memberships", {
      orgId: args.orgId,
      userId: args.userId,
      role: "member", // Default role for new members
    });
    
    await ctx.scheduler.runAfter(0, internal.users.addOrgToUser, {
        userId: args.userId,
        orgId: args.orgId,
    });
  },
});

export const updateRole = mutation({
  args: { membershipId: v.id("memberships"), role: Role },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new ConvexError("Membership not found");
    }
    
    await assertHasFeature(ctx, membership.orgId, "role_management");

    const { role: callerRole } = await assertHasOrgAccess(ctx, membership.orgId);
    if (callerRole !== "admin") {
      throw new ConvexError("Only admins can change roles.");
    }

    if (args.role === 'client') {
        throw new ConvexError("Client role cannot be assigned through this function.");
    }
    
    await ctx.db.patch(args.membershipId, { role: args.role });
  },
});

export const removeMember = mutation({
  args: { membershipId: v.id("memberships") },
  handler: async (ctx, args) => {
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) {
      throw new ConvexError("Membership not found");
    }
    
    await assertHasFeature(ctx, membership.orgId, "role_management");

    const { role: callerRole } = await assertHasOrgAccess(ctx, membership.orgId);
    if (callerRole !== "admin") {
      throw new ConvexError("Only admins can remove members.");
    }
    
    await ctx.db.delete(args.membershipId);
    
    await ctx.scheduler.runAfter(0, internal.users.removeOrgFromUser, {
        userId: membership.userId,
        orgId: membership.orgId,
    });
  },
});