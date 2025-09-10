import { User, Organization, Membership, BusinessAnalytic, Goal, Job, Role, GoalStatus } from '../types';
import { Id } from '../convex/_generated/dataModel';

export const MOCK_USERS: User[] = [
  // FIX: Changed `id` to `_id` to match the User type.
  { _id: 'user_1' as Id<'users'>, name: 'Alex Johnson', tokenIdentifier: 'clerk_token_1', orgIds: ['org_1', 'org_2'] },
  // FIX: Changed `id` to `_id` to match the User type.
  { _id: 'user_2' as Id<'users'>, name: 'Maria Garcia', tokenIdentifier: 'clerk_token_2', orgIds: ['org_1'] },
  // FIX: Changed `id` to `_id` to match the User type.
  { _id: 'user_3' as Id<'users'>, name: 'Sam Lee', tokenIdentifier: 'clerk_token_3', orgIds: ['org_2'] },
];

export const MOCK_ORGANIZATIONS: Organization[] = [
  // FIX: Changed `id` to `_id` to match the Organization type.
  { _id: 'org_1' as Id<'organizations'>, name: "Alex's Elite Detailing", plan: 'pro' },
  // FIX: Changed `id` to `_id` to match the Organization type.
  { _id: 'org_2' as Id<'organizations'>, name: "Pro Shine Auto Spa", plan: 'solo' },
];

export const MOCK_MEMBERSHIPS: Membership[] = [
  // FIX: Added `_id` to match the Membership type.
  { _id: 'mem_1' as Id<'memberships'>, userId: 'user_1' as Id<'users'>, orgId: 'org_1' as Id<'organizations'>, role: Role.Admin },
  // FIX: Added `_id` to match the Membership type.
  { _id: 'mem_2' as Id<'memberships'>, userId: 'user_1' as Id<'users'>, orgId: 'org_2' as Id<'organizations'>, role: Role.Admin },
  // FIX: Added `_id` to match the Membership type.
  { _id: 'mem_3' as Id<'memberships'>, userId: 'user_2' as Id<'users'>, orgId: 'org_1' as Id<'organizations'>, role: Role.Member },
  // FIX: Added `_id` to match the Membership type.
  { _id: 'mem_4' as Id<'memberships'>, userId: 'user_3' as Id<'users'>, orgId: 'org_2' as Id<'organizations'>, role: Role.Member },
];

export const MOCK_JOBS: Job[] = [
  // Org 1 Jobs - July 2024
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_1' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Full Detail', value: 250, leadSource: 'Referral', date: '2024-07-02' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_2' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Ceramic Coating', value: 1200, leadSource: 'Website', date: '2024-07-05' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_3' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Paint Correction', value: 600, leadSource: 'Social Media', date: '2024-07-10' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_4' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Full Detail', value: 250, leadSource: 'Repeat Customer', date: '2024-07-12' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_5' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Interior Detail', value: 150, leadSource: 'Referral', date: '2024-07-15' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_6' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Ceramic Coating', value: 1500, leadSource: 'Website', date: '2024-07-18' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_7' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Paint Correction', value: 800, leadSource: 'Website', date: '2024-07-22' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_8' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Full Detail', value: 300, leadSource: 'Referral', date: '2024-07-25' },
  // Org 1 Jobs - June 2024
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_11' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Ceramic Coating', value: 1100, leadSource: 'Website', date: '2024-06-03' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_12' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Full Detail', value: 220, leadSource: 'Referral', date: '2024-06-10' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_18' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Paint Correction', value: 750, leadSource: 'Social Media', date: '2024-06-18' },
  // Org 1 Jobs - May 2024
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_13' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Paint Correction', value: 550, leadSource: 'Social Media', date: '2024-05-15' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_19' as Id<'jobs'>, orgId: 'org_1' as Id<'organizations'>, type: 'Full Detail', value: 200, leadSource: 'Repeat Customer', date: '2024-05-25' },

  // Org 2 Jobs - July 2024
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_14' as Id<'jobs'>, orgId: 'org_2' as Id<'organizations'>, type: 'Fleet Wash', value: 2500, leadSource: 'Corporate', date: '2024-07-05' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_15' as Id<'jobs'>, orgId: 'org_2' as Id<'organizations'>, type: 'Ceramic Coating', value: 1800, leadSource: 'Website', date: '2024-07-10' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_16' as Id<'jobs'>, orgId: 'org_2' as Id<'organizations'>, type: 'Full Detail', value: 400, leadSource: 'Referral', date: '2024-07-15' },
  // Org 2 Jobs - June 2024
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_17' as Id<'jobs'>, orgId: 'org_2' as Id<'organizations'>, type: 'Fleet Wash', value: 2200, leadSource: 'Corporate', date: '2024-06-08' },
  // FIX: Changed `id` to `_id` to match the Job type.
  { _id: 'job_20' as Id<'jobs'>, orgId: 'org_2' as Id<'organizations'>, type: 'Ceramic Coating', value: 1600, leadSource: 'Website', date: '2024-06-20' },
];

export const MOCK_ANALYTICS: BusinessAnalytic[] = [
  // This now only contains data that isn't derived from individual jobs.
  // FIX: Changed `id` to `_id` to match the BusinessAnalytic type.
  { _id: 'analytic_12' as Id<'analytics'>, orgId: 'org_2' as Id<'organizations'>, dataType: 'Marketing Spend', value: 1500, date: '2024-07-01' },
  // FIX: Changed `id` to `_id` to match the BusinessAnalytic type.
  { _id: 'analytic_13' as Id<'analytics'>, orgId: 'org_1' as Id<'organizations'>, dataType: 'Marketing Spend', value: 500, date: '2024-07-01' },
];

export const MOCK_GOALS: Goal[] = [
  // Org 1 Goals
  {
    // FIX: Changed `id` to `_id` to match the Goal type.
    _id: 'goal_1' as Id<'goals'>,
    orgId: 'org_1' as Id<'organizations'>,
    description: 'Reach $8,000 in monthly revenue',
    targetValue: 8000,
    currentValue: 7500,
    status: GoalStatus.Active,
  },
  {
    // FIX: Changed `id` to `_id` to match the Goal type.
    _id: 'goal_2' as Id<'goals'>,
    orgId: 'org_1' as Id<'organizations'>,
    description: 'Acquire 15 new customers this month',
    targetValue: 15,
    currentValue: 8,
    status: GoalStatus.Active,
  },
  {
    // FIX: Changed `id` to `_id` to match the Goal type.
    _id: 'goal_3' as Id<'goals'>,
    orgId: 'org_1' as Id<'organizations'>,
    description: 'Launch new website (Q2)',
    targetValue: 1,
    currentValue: 1,
    status: GoalStatus.Completed,
  },
  // Org 2 Goals
  {
    // FIX: Changed `id` to `_id` to match the Goal type.
    _id: 'goal_4' as Id<'goals'>,
    orgId: 'org_2' as Id<'organizations'>,
    description: 'Achieve $20,000 in monthly revenue',
    targetValue: 20000,
    currentValue: 14500,
    status: GoalStatus.Active,
  },
    {
    // FIX: Changed `id` to `_id` to match the Goal type.
    _id: 'goal_5' as Id<'goals'>,
    orgId: 'org_2' as Id<'organizations'>,
    description: 'Hire a new detailer',
    targetValue: 1,
    currentValue: 0,
    status: GoalStatus.Active,
  },
];