import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

type Plan = "solo" | "pro" | "enterprise";
type Feature = "ai_action_plans" | "role_management";

const PLANS: Record<Plan, { features: Feature[] }> = {
  solo: {
    features: [],
  },
  pro: {
    features: ["ai_action_plans", "role_management"],
  },
  enterprise: {
    features: ["ai_action_plans", "role_management"],
  },
};

export const assertHasOrgAccess = async (
  ctx: QueryCtx | MutationCtx | ActionCtx,
  orgId: string
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("User is not authenticated.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user) {
    throw new ConvexError("User not found in database.");
  }
  
  const organization = await ctx.db.get(orgId as Id<"organizations">);
  if (!organization) {
    throw new ConvexError("Organization not found.");
  }

  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_orgId_userId", (q) => q.eq("orgId", orgId as any).eq("userId", user._id))
    .unique();

  if (!membership) {
    throw new ConvexError("User is not a member of this organization.");
  }

  return { user, membership, organization, role: membership.role };
};

export const assertHasFeature = async (
    ctx: QueryCtx | MutationCtx | ActionCtx,
    orgId: Id<"organizations">,
    feature: Feature
) => {
    const { organization } = await assertHasOrgAccess(ctx, orgId);
    
    const plan: Plan = organization.plan;
    const allowedFeatures = PLANS[plan].features;
    
    if (!allowedFeatures.includes(feature)) {
        throw new ConvexError(`Your plan does not include the feature: ${feature}. Please upgrade.`);
    }

    return { organization };
};