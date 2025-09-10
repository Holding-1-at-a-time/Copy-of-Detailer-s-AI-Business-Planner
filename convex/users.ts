
import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from './_generated/api';
import { ConvexError } from "convex/values";

// This is a placeholder for a real webhook verification library.
const verifyWebhook = (payload: any, headers: any): any => {
    // In production, use `svix` or a similar library.
    // DO NOT DO THIS IN PRODUCTION WITHOUT VERIFICATION.
    const event = JSON.parse(payload);
    return event;
}

export const getOrCreate = internalAction({
  args: {
    payload: v.string(),
    headers: v.object({
        "svix-id": v.string(),
        "svix-timestamp": v.string(),
        "svix-signature": v.string(),
    })
  },
  handler: async (ctx, args) => {
    const event = verifyWebhook(args.payload, args.headers);
    
    if (event.type === 'user.created') {
        const user = await ctx.runQuery(internal.users.getUserByToken, { tokenIdentifier: `https://...clerk.accounts.dev|${event.data.id}` });
        if (user === null) {
            await ctx.runMutation(internal.users.createUser, {
                tokenIdentifier: `https://...clerk.accounts.dev|${event.data.id}`,
                name: `${event.data.first_name ?? ''} ${event.data.last_name ?? ''}`.trim(),
            });
        }
    }
    return event;
  },
});


export const getUserByToken = internal.query({
    args: { tokenIdentifier: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_token", q => q.eq("tokenIdentifier", args.tokenIdentifier))
            .unique();
    },
});

export const createUser = internal.mutation({
    args: { tokenIdentifier: v.string(), name: v.string() },
    handler: async (ctx, args) => {
        await ctx.db.insert("users", {
            tokenIdentifier: args.tokenIdentifier,
            name: args.name,
            orgIds: [],
        });
    },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Not logged in
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      // This can happen if the user was created in Clerk but the webhook hasn't fired yet.
      // Or if the user was deleted from the DB but not Clerk.
      return { user: null, organizations: [], memberships: [] };
    }

    const memberships = await ctx.db
        .query("memberships")
        .withIndex("by_userId", q => q.eq("userId", user._id))
        .collect();

    const organizationIds = memberships.map(m => m.orgId);
    
    const organizations = await Promise.all(
        organizationIds.map(orgId => ctx.db.get(orgId))
    );
    
    const validOrgs = organizations.filter(org => org !== null);

    return { user, organizations: validOrgs, memberships };
  },
});


export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError("You must be logged in to list users.");
    }
    return await ctx.db.query("users").collect();
  },
});

export const addOrgToUser = internalMutation({
  args: { userId: v.id("users"), orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (!user.orgIds.includes(args.orgId)) {
      await ctx.db.patch(args.userId, {
        orgIds: [...user.orgIds, args.orgId],
      });
    }
  },
});

export const removeOrgFromUser = internalMutation({
  args: { userId: v.id("users"), orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, {
      orgIds: user.orgIds.filter((id) => id !== args.orgId),
    });
  },
});