import { Job } from '../types';

export interface ChartData {
  revenueData: { date: string; value: number }[];
  customerData: { date: string; value: number }[];
  revenueByType: { name: string; value: number }[];
  jobsBySource: { name: string; value: number }[];
}

/**
 * Aggregates raw job data into structured formats suitable for charting.
 * @param jobs - An array of raw job records.
 * @returns An object containing processed data for all dashboard charts.
 */
export const aggregateJobDataForCharts = (jobs: Job[]): ChartData => {
  if (!jobs || jobs.length === 0) {
    return { revenueData: [], customerData: [], revenueByType: [], jobsBySource: [] };
  }

  // 1. Monthly Aggregates (Revenue & Customer Acquisition)
  const monthlyAggregates: { [key: string]: { revenue: number; jobs: number } } = {};
  jobs.forEach(job => {
    const monthKey = job.date.slice(0, 7); // "YYYY-MM"
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

  // 2. Revenue by Job Type
  const typeAggregates: { [key: string]: number } = {};
  jobs.forEach(job => {
    typeAggregates[job.type] = (typeAggregates[job.type] || 0) + job.value;
  });
  const revenueByType = Object.entries(typeAggregates).map(([name, value]) => ({ name, value }));

  // 3. Jobs by Lead Source
  const sourceAggregates: { [key: string]: number } = {};
  jobs.forEach(job => {
    sourceAggregates[job.leadSource] = (sourceAggregates[job.leadSource] || 0) + 1;
  });
  const jobsBySource = Object.entries(sourceAggregates).map(([name, value]) => ({ name, value }));

  return { revenueData, customerData, revenueByType, jobsBySource };
};