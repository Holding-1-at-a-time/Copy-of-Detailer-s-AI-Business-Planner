

import { Id } from './convex/_generated/dataModel';

export enum Role {
  Admin = 'admin',
  Member = 'member',
  Client = 'client',
}

export enum GoalStatus {
  Active = 'active',
  Completed = 'completed',
  Archived = 'archived',
}

export interface User {
  _id: Id<"users">;
  name: string;
  tokenIdentifier: string;
  orgIds: string[];
}

export interface Organization {
  _id: Id<"organizations">;
  name: string;
  plan: 'solo' | 'pro' | 'enterprise';
}

export interface Membership {
  _id: Id<"memberships">;
  orgId: Id<"organizations">;
  userId: Id<"users">;
  role: Role;
}

export interface BusinessAnalytic {
  _id: Id<"analytics">;
  orgId: Id<"organizations">;
  dataType: string; // e.g., "Monthly Revenue", "Customer Acquisition"
  value: number;
  date: string; // ISO 8601 format
  details?: Record<string, any>;
}

export interface ActionStep {
  description: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  notes?: string;
}

export interface Goal {
  _id: Id<"goals">;
  orgId: Id<"organizations">;
  description: string;
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
  actionPlan?: ActionStep[];
}

export interface Job {
  _id: Id<"jobs">;
  orgId: Id<"organizations">;
  type: string; // e.g., 'Ceramic Coating', 'Full Detail'
  value: number;
  leadSource: string; // e.g., 'Referral', 'Website'
  date: string; // ISO 8601 format
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface OrgMember {
  userId: Id<"users">;
  name: string;
  membershipId: Id<"memberships">;
  role: Role;
}

// FIX: Added InsightData interface for use in convexService.
export interface InsightData {
  analytics: BusinessAnalytic[];
  goals: Goal[];
  jobs: Job[];
}