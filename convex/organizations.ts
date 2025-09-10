import { query, mutation, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { assertHasOrgAccess, assertHasFeature } from "./auth";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

export const getDetails = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin" && role !== "member") {
      throw new Error("You do not have permission to view organization details.");
    }
    
    const organization = await ctx.db.get(args.orgId);
    if (!organization) {
      throw new Error("Organization not found");
    }
    
    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_orgId_userId", (q) => q.eq("orgId", args.orgId))
      .collect();
      
    const members = await Promise.all(
      memberships.map(async (m) => {
        const user = await ctx.db.get(m.userId);
        if (!user) {
          return null;
        }
        return {
          userId: user._id,
          name: user.name,
          membershipId: m._id,
          role: m.role,
        };
      })
    );
    
    const validMembers = members
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .sort((a, b) => a.name.localeCompare(b.name));
    
    return { organization, members: validMembers };
  },
});

export const updateName = mutation({
  args: { orgId: v.id("organizations"), name: v.string() },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin") {
      throw new Error("Only admins can update the organization name.");
    }

    await assertHasFeature(ctx, args.orgId, "role_management");

    if (args.name.length === 0) {
        throw new Error("Organization name cannot be empty.");
    }
    await ctx.db.patch(args.orgId, { name: args.name });
  },
});

// --- BILLING WEBHOOK LOGIC ---

// This is a placeholder for a real webhook verification library.
const verifyBillingWebhook = (payload: any, headers: any): any => {
    // In production, use `svix` or a similar library with a secret.
    // DO NOT DO THIS IN PRODUCTION WITHOUT VERIFICATION.
    const event = JSON.parse(payload);
    return event;
}

// This maps Clerk's auto-generated plan IDs to your app's internal names.
// You would get these IDs from your Clerk Dashboard's "Plans" page.
const CLERK_PLAN_IDS_TO_APP_PLANS = {
  "plan_xxxxxxxxxxxxxx1": "solo",
  "plan_xxxxxxxxxxxxxx2": "pro",
  "plan_xxxxxxxxxxxxxx3": "enterprise",
} as const;

export const updatePlanFromWebhook = internalAction({
  args: {
    payload: v.string(),
    headers: v.object({
      "svix-id": v.string(),
      "svix-timestamp": v.string(),
      "svix-signature": v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const event = verifyBillingWebhook(args.payload, args.headers);

    if (event.type === 'subscription.created' || event.type === 'subscription.updated') {
      const clerkOrgId = event.data.organization_id;
      const clerkPlanId = event.data.plan_id;

      if (!clerkOrgId || !clerkPlanId) {
        console.warn("Billing webhook missing organization_id or plan_id", event);
        return;
      }

      const plan = CLERK_PLAN_IDS_TO_APP_PLANS[clerkPlanId as keyof typeof CLERK_PLAN_IDS_TO_APP_PLANS];

      if (!plan) {
        console.warn(`Unknown Clerk plan ID received in webhook: ${clerkPlanId}`);
        return;
      }

      await ctx.runMutation(internal.organizations.updatePlanByClerkId, {
        clerkId: clerkOrgId,
        plan: plan,
      });
    }
  },
});

export const updatePlanByClerkId = internalMutation({
  args: {
    clerkId: v.string(),
    plan: v.union(v.literal("solo"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!organization) {
      console.error(`Could not find organization with clerkId: ${args.clerkId} to update plan.`);
      // In a real-world scenario, you might want more robust error handling,
      // like a retry queue or sending an alert to a monitoring service.
      return;
    }

    await ctx.db.patch(organization._id, { plan: args.plan });
  },
});