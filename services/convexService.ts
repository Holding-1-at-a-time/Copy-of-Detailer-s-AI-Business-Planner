import { MOCK_ANALYTICS, MOCK_GOALS, MOCK_MEMBERSHIPS, MOCK_JOBS } from './mockData';
// FIX: Imported InsightData to resolve missing type error.
import { InsightData, Role, User, Goal, GoalStatus, BusinessAnalytic, Job } from '../types';
import { Id } from '../convex/_generated/dataModel';

// This is a mock implementation of the Convex query functions.
// In a real application, these would be API calls to your Convex backend.

/**
 * Simulates an authenticated Convex query to get business analytics and goals.
 * It checks if the user has the required role for the organization.
 * It now calculates key metrics from the raw job log.
 * @param orgId - The ID of the organization to fetch data for.
 * @param user - The current authenticated user.
 * @returns A promise that resolves with the analytics, goals, and raw jobs data.
 */
export const getInsights = async (orgId: string, user: User): Promise<InsightData> => {
  // FIX: Used `user._id` instead of `user.id`.
  console.log(`Fetching insights for org: ${orgId}, user: ${user._id}`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const membership = MOCK_MEMBERSHIPS.find(
        // FIX: Used `user._id` instead of `user.id`.
        (m) => m.orgId === orgId && m.userId === user._id
      );

      if (!membership || (membership.role !== Role.Admin && membership.role !== Role.Member)) {
        console.error("User does not have permission to view insights for this organization.");
        reject(new Error('Permission denied.'));
        return;
      }
      
      const orgJobs = MOCK_JOBS.filter(j => j.orgId === orgId);
      const otherAnalytics = MOCK_ANALYTICS.filter(a => a.orgId === orgId);
      const goals = MOCK_GOALS.filter(g => g.orgId === orgId);

      // --- On-the-fly aggregation from jobs ---
      const monthlyData: { [key: string]: { revenue: number, jobs: number } } = {};

      orgJobs.forEach(job => {
        const month = job.date.slice(0, 7); // "YYYY-MM"
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, jobs: 0 };
        }
        monthlyData[month].revenue += job.value;
        monthlyData[month].jobs += 1;
      });

      const calculatedAnalytics: BusinessAnalytic[] = Object.entries(monthlyData).flatMap(([month, data]) => {
        const date = `${month}-01T00:00:00.000Z`; // Use first day of the month for consistency
        return [
          // FIX: Used `_id` instead of `id` to match the BusinessAnalytic type.
          { _id: `rev_${month}_${orgId}` as Id<'analytics'>, orgId: orgId as Id<'organizations'>, dataType: 'Monthly Revenue', value: data.revenue, date },
          // FIX: Used `_id` instead of `id` to match the BusinessAnalytic type.
          { _id: `acq_${month}_${orgId}` as Id<'analytics'>, orgId: orgId as Id<'organizations'>, dataType: 'Customer Acquisition', value: data.jobs, date }
        ];
      });

      const allAnalytics = [...otherAnalytics, ...calculatedAnalytics];

      resolve({ analytics: allAnalytics, goals, jobs: orgJobs });
    }, 500); // Simulate network delay
  });
};

/**
 * Simulates adding a new job record.
 * @param orgId - The ID of the organization the job belongs to.
 * @param newJobData - The data for the new job.
 * @returns A promise that resolves with the newly created job.
 */
export const addJob = async (
  orgId: string,
  // FIX: Omitted `_id` instead of `id`.
  newJobData: Omit<Job, '_id' | 'orgId'>
): Promise<Job> => {
  console.log(`Adding new job for org: ${orgId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newJob: Job = {
        ...newJobData,
        // FIX: Used `_id` instead of `id` to match the Job type.
        _id: `job_${Date.now()}_${Math.random()}` as Id<'jobs'>,
        orgId: orgId as Id<'organizations'>,
      };
      // In a real app, this would be an API call. Here we mutate the mock array.
      MOCK_JOBS.push(newJob);
      resolve(newJob);
    }, 300);
  });
};


/**
 * Simulates adding a new business analytic data point (for non-job data).
 * @param orgId - The ID of the organization the data belongs to.
 * @param newData - The data for the new analytic point.
 * @returns A promise that resolves with the newly created analytic.
 */
export const addAnalytic = async (
  orgId: string,
  // FIX: Omitted `_id` instead of `id`.
  newData: Omit<BusinessAnalytic, '_id' | 'orgId'>
): Promise<BusinessAnalytic> => {
  console.log(`Adding new analytic for org: ${orgId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newAnalytic: BusinessAnalytic = {
        ...newData,
        // FIX: Used `_id` instead of `id` to match the BusinessAnalytic type.
        _id: `analytic_${Date.now()}_${Math.random()}` as Id<'analytics'>, // Mock unique ID
        orgId: orgId as Id<'organizations'>,
      };
      MOCK_ANALYTICS.push(newAnalytic);
      resolve(newAnalytic);
    }, 300);
  });
};

/**
 * Simulates creating a new goal in the Convex backend.
 * @param orgId - The ID of the organization the goal belongs to.
 * @param newGoalData - The data for the new goal.
 * @returns A promise that resolves with the newly created goal.
 */
export const addGoal = async (
  orgId: string,
  // FIX: Omit `_id` instead of `id`.
  newGoalData: Omit<Goal, '_id' | 'orgId' | 'status'>
): Promise<Goal> => {
  console.log(`Adding new goal for org: ${orgId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGoal: Goal = {
        ...newGoalData,
        // FIX: Use `_id` for the new goal.
        _id: `goal_${Date.now()}_${Math.random()}` as Id<'goals'>, // Mock unique ID
        orgId: orgId as Id<'organizations'>,
        status: newGoalData.currentValue >= newGoalData.targetValue ? GoalStatus.Completed : GoalStatus.Active,
      };
      MOCK_GOALS.unshift(newGoal);
      resolve(newGoal);
    }, 300);
  });
};

/**
 * Simulates updating an existing goal in the Convex backend.
 * @param goalId - The ID of the goal to update.
 * @param updates - An object containing the fields to update.
 * @returns A promise that resolves with the updated goal.
 */
export const updateGoal = async (
  goalId: string,
  // FIX: Omit `_id` instead of `id`.
  updates: Partial<Omit<Goal, '_id' | 'orgId'>>
): Promise<Goal> => {
  console.log(`Updating goal: ${goalId} with`, updates);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // FIX: Find goal by `_id`.
      const goalIndex = MOCK_GOALS.findIndex(g => g._id === goalId);
      if (goalIndex === -1) {
        return reject(new Error('Goal not found.'));
      }
      
      const originalGoal = MOCK_GOALS[goalIndex];
      const updatedGoal = { ...originalGoal, ...updates };

      if (updates.status) {
          updatedGoal.status = updates.status;
      } 
      else if (updates.currentValue !== undefined || updates.targetValue !== undefined) {
         if (updatedGoal.status === GoalStatus.Active && updatedGoal.currentValue >= updatedGoal.targetValue) {
            updatedGoal.status = GoalStatus.Completed;
         }
      }

      MOCK_GOALS[goalIndex] = updatedGoal;
      resolve(updatedGoal);
    }, 300);
  });
};

/**
 * Simulates deleting a goal from the Convex backend.
 * @param goalId - The ID of the goal to delete.
 * @returns A promise that resolves with the ID of the deleted goal.
 */
export const deleteGoal = async (goalId: string): Promise<{ _id: string }> => {
  console.log(`Deleting goal: ${goalId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // FIX: Find goal by `_id`.
      const goalIndex = MOCK_GOALS.findIndex(g => g._id === goalId);
      if (goalIndex === -1) {
        return reject(new Error('Goal not found.'));
      }
      
      MOCK_GOALS.splice(goalIndex, 1);
      // FIX: Return `_id`.
      resolve({ _id: goalId });
    }, 300);
  });
};