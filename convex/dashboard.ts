import { query } from "./_generated/server";
import { v } from "convex/values";
import { assertHasOrgAccess } from "./auth";
import { GoalStatus } from "./schema";

// Utility function for chart data aggregation, now on the backend
const aggregateJobDataForCharts = (jobs: any[]) => {
  if (!jobs || jobs.length === 0) {
    return { revenueData: [], customerData: [], revenueByType: [], jobsBySource: [] };
  }
  const monthlyAggregates: { [key: string]: { revenue: number; jobs: number } } = {};
  jobs.forEach(job => {
    const monthKey = job.date.slice(0, 7);
    if (!monthlyAggregates[monthKey]) {
      monthlyAggregates[monthKey] = { revenue: 0, jobs: 0 };
    }
    monthlyAggregates[monthKey].revenue += job.value;
    monthlyAggregates[monthKey].jobs += 1;
  });
  const sortedMonthKeys = Object.keys(monthlyAggregates).sort();
  const revenueData = sortedMonthKeys.map(key => ({
    date: new Date(`${key}-02`).toLocaleString('default', { month: 'short', year: 'numeric' }),
    value: monthlyAggregates[key].revenue
  }));
  const customerData = sortedMonthKeys.map(key => ({
    date: new Date(`${key}-02`).toLocaleString('default', { month: 'short', year: 'numeric' }),
    value: monthlyAggregates[key].jobs
  }));
  const typeAggregates: { [key: string]: number } = {};
  jobs.forEach(job => {
    typeAggregates[job.type] = (typeAggregates[job.type] || 0) + job.value;
  });
  const revenueByType = Object.entries(typeAggregates).map(([name, value]) => ({ name, value }));
  const sourceAggregates: { [key: string]: number } = {};
  jobs.forEach(job => {
    sourceAggregates[job.leadSource] = (sourceAggregates[job.leadSource] || 0) + 1;
  });
  const jobsBySource = Object.entries(sourceAggregates).map(([name, value]) => ({ name, value }));
  return { revenueData, customerData, revenueByType, jobsBySource };
};

export const get = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const { role } = await assertHasOrgAccess(ctx, args.orgId);
    if (role !== "admin" && role !== "member") {
      return null;
    }

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();

    const analytics = await ctx.db
      .query("analytics")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    
    // Sort goals by status and creation time
    goals.sort((a, b) => {
        // FIX: `GoalStatus` is a validator, not an enum. Use string literal for comparison.
        if (a.status === 'active' && b.status !== 'active') return -1;
        // FIX: `GoalStatus` is a validator, not an enum. Use string literal for comparison.
        if (a.status !== 'active' && b.status === 'active') return 1;
        return b._creationTime - a._creationTime;
    });

    const chartData = aggregateJobDataForCharts(jobs);

    return { goals, jobs, analytics, chartData };
  },
});
