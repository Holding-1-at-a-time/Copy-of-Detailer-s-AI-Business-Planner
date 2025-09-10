// FIX: Imported `useEffect` to resolve hook-related errors in modal components.
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { User, Organization, Goal, GoalStatus, Job, ActionStep } from '../types';
import AnalyticsChart from './AnalyticsChart';
import GoalCard from './GoalCard';
import ChatPanel from './ChatPanel';
import Spinner from './Spinner';

// --- LogJobModal Component ---
interface LogJobModalProps {
  onClose: () => void;
  onAddJob: (args: { type: string; value: number; leadSource: string; date: string; }) => Promise<void>;
  uniqueJobTypes: string[];
  uniqueLeadSources: string[];
}
const LogJobModal: React.FC<LogJobModalProps> = ({ onClose, onAddJob, uniqueJobTypes, uniqueLeadSources }) => {
  const defaultDate = new Date().toISOString().split('T')[0];
  const [jobType, setJobType] = useState('');
  const [value, setValue] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ value?: string; jobType?: string; leadSource?: string }>({});

  const validate = useCallback(() => {
    const newErrors: { value?: string; jobType?: string; leadSource?: string } = {};
    if (!jobType.trim()) newErrors.jobType = 'Job type is required.';
    if (!leadSource.trim()) newErrors.leadSource = 'Lead source is required.';
    if (!value) newErrors.value = 'Job value is required.';
    else if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) newErrors.value = 'Please enter a valid, positive number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [jobType, value, leadSource]);

  useEffect(() => {
    validate();
  }, [validate]);
  
  const isFormValid = useMemo(() => Object.keys(errors).length === 0 && !!jobType && !!value && !!leadSource && !!date, [errors, jobType, value, leadSource, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await onAddJob({ type: jobType.trim(), value: parseFloat(value), leadSource: leadSource.trim(), date: new Date(date).toISOString() });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 p-8 rounded-2xl border border-green-500/30 shadow-2xl shadow-green-500/10 max-w-lg w-full m-4">
        <h2 className="text-2xl font-bold text-green-400 mb-6">Log a New Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-300 mb-1">Job Type</label>
              <input id="jobType" type="text" value={jobType} onChange={(e) => setJobType(e.target.value)} list="jobType-suggestions" placeholder="e.g., Ceramic Coating" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
              <datalist id="jobType-suggestions">{uniqueJobTypes.map(type => <option key={type} value={type} />)}</datalist>
              {errors.jobType && <p className="text-red-400 text-sm mt-1">{errors.jobType}</p>}
            </div>
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-300 mb-1">Job Value ($)</label>
              <input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g., 250" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
              {errors.value && <p className="text-red-400 text-sm mt-1">{errors.value}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="leadSource" className="block text-sm font-medium text-gray-300 mb-1">Lead Source</label>
              <input id="leadSource" type="text" value={leadSource} onChange={(e) => setLeadSource(e.target.value)} list="leadSource-suggestions" placeholder="e.g., Referral" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
              <datalist id="leadSource-suggestions">{uniqueLeadSources.map(type => <option key={type} value={type} />)}</datalist>
              {errors.leadSource && <p className="text-red-400 text-sm mt-1">{errors.leadSource}</p>}
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date Completed</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!isFormValid || isSubmitting} className="py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition disabled:bg-green-800 disabled:cursor-not-allowed flex items-center">
              {isSubmitting && <Spinner size="sm"/>}<span className={isSubmitting ? 'ml-2' : ''}>{isSubmitting ? 'Saving...' : 'Log Job'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- AddGoalModal Component ---
interface AddGoalModalProps {
  onClose: () => void;
  onAddGoal: (args: { description: string; targetValue: number; currentValue: number; }) => Promise<void>;
}
const AddGoalModal: React.FC<AddGoalModalProps> = ({ onClose, onAddGoal }) => {
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; targetValue?: string; currentValue?: string }>({});

  const validate = useCallback(() => {
    const newErrors: { description?: string; targetValue?: string; currentValue?: string } = {};
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!targetValue) newErrors.targetValue = 'Target value is required.';
    else if (isNaN(parseFloat(targetValue)) || parseFloat(targetValue) <= 0) newErrors.targetValue = 'Target must be a positive number.';
    if (currentValue && (isNaN(parseFloat(currentValue)) || parseFloat(currentValue) < 0)) newErrors.currentValue = 'Current value must be a valid number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [description, targetValue, currentValue]);
  
  useEffect(() => { validate() }, [validate]);
  const isFormValid = useMemo(() => Object.keys(errors).length === 0 && !!description && !!targetValue, [errors, description, targetValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await onAddGoal({ description: description.trim(), targetValue: parseFloat(targetValue), currentValue: parseFloat(currentValue || '0') });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 p-8 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 max-w-lg w-full m-4">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Set a New Business Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Goal Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Increase ceramic coating jobs by 20%" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" rows={3} required />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetValue" className="block text-sm font-medium text-gray-300 mb-1">Target Value</label>
              <input id="targetValue" type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="e.g., 8000" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" required />
              {errors.targetValue && <p className="text-red-400 text-sm mt-1">{errors.targetValue}</p>}
            </div>
            <div>
              <label htmlFor="currentValue" className="block text-sm font-medium text-gray-300 mb-1">Current Value (Optional)</label>
              <input id="currentValue" type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="0" className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
              {errors.currentValue && <p className="text-red-400 text-sm mt-1">{errors.currentValue}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!isFormValid || isSubmitting} className="py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition disabled:bg-cyan-800 disabled:cursor-not-allowed flex items-center">
              {isSubmitting && <Spinner size="sm"/>}<span className={isSubmitting ? 'ml-2' : ''}>{isSubmitting ? 'Saving...' : 'Save Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- UpdateGoalModal Component ---
interface UpdateGoalModalProps {
  goal: Goal;
  onClose: () => void;
  onUpdateGoal: (args: { id: Id<'goals'>; description?: string; targetValue?: number; currentValue?: number; }) => Promise<void>;
}
const UpdateGoalModal: React.FC<UpdateGoalModalProps> = ({ goal, onClose, onUpdateGoal }) => {
  const [description, setDescription] = useState(goal.description);
  const [targetValue, setTargetValue] = useState(goal.targetValue.toString());
  const [currentValue, setCurrentValue] = useState(goal.currentValue.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; targetValue?: string; currentValue?: string }>({});

  const validate = useCallback(() => {
    const newErrors: { description?: string; targetValue?: string; currentValue?: string } = {};
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (!targetValue) newErrors.targetValue = 'Target value is required.';
    else if (isNaN(parseFloat(targetValue)) || parseFloat(targetValue) <= 0) newErrors.targetValue = 'Target must be a positive number.';
    if (currentValue && (isNaN(parseFloat(currentValue)) || parseFloat(currentValue) < 0)) newErrors.currentValue = 'Current value must be a valid number.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [description, targetValue, currentValue]);

  useEffect(() => { validate() }, [validate]);
  const isFormValid = useMemo(() => Object.keys(errors).length === 0 && !!description && !!targetValue, [errors, description, targetValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // FIX: Access `goal._id` which is now correctly typed on the `Goal` interface.
    await onUpdateGoal({ id: goal._id, description: description.trim(), targetValue: parseFloat(targetValue), currentValue: parseFloat(currentValue || '0') });
    setIsSubmitting(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 p-8 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 max-w-lg w-full m-4">
        <h2 className="text-2xl font-bold text-indigo-400 mb-6">Edit Business Goal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Goal Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" rows={3} required />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetValue" className="block text-sm font-medium text-gray-300 mb-1">Target Value</label>
              <input id="targetValue" type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
              {errors.targetValue && <p className="text-red-400 text-sm mt-1">{errors.targetValue}</p>}
            </div>
            <div>
              <label htmlFor="currentValue" className="block text-sm font-medium text-gray-300 mb-1">Current Value</label>
              <input id="currentValue" type="number" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
              {errors.currentValue && <p className="text-red-400 text-sm mt-1">{errors.currentValue}</p>}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!isFormValid || isSubmitting} className="py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition disabled:bg-indigo-800 disabled:cursor-not-allowed flex items-center">
              {isSubmitting && <Spinner size="sm"/>}<span className={isSubmitting ? 'ml-2' : ''}>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface DashboardProps {
  user: User;
  organization: Organization;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, organization, showToast }) => {
  // FIX: Used `organization._id` instead of `organization.id`.
  const data = useQuery(api.dashboard.get, { orgId: organization._id as Id<"organizations"> });

  const [isLogJobModalOpen, setIsLogJobModalOpen] = useState<boolean>(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState<boolean>(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const createJob = useMutation(api.jobs.create);
  const createGoal = useMutation(api.goals.create);
  const updateGoalMutation = useMutation(api.goals.update);
  const deleteGoalMutation = useMutation(api.goals.deleteGoal);
  const generatePlanAction = useAction(api.agent.generatePlan);

  const [isGeneratingPlanFor, setIsGeneratingPlanFor] = useState<string | null>(null);

  // Feature Gating Logic
  const canUseAiActions = organization.plan === 'pro' || organization.plan === 'enterprise';

  // FIX: Updated parameter type to use `_id`.
  const handleAddJob = async (newJobData: Omit<Job, '_id' | 'orgId'>) => {
    try {
        // FIX: Used `organization._id` instead of `organization.id`.
        await createJob({ orgId: organization._id as Id<"organizations">, ...newJobData });
        setIsLogJobModalOpen(false);
        showToast('Job logged successfully!', 'success');
    } catch (error) { 
        console.error("Failed to log job:", error); 
        showToast('Failed to log job. Please try again.', 'error');
    }
  };
  
  const handleAddGoal = async (newGoalData: Omit<Goal, '_id' | 'orgId' | 'status'>) => {
    try {
      // FIX: Used `organization._id` instead of `organization.id`.
      await createGoal({ orgId: organization._id as Id<"organizations">, ...newGoalData });
      setIsAddGoalModalOpen(false);
      showToast('Goal added successfully!', 'success');
    } catch (error) { 
        console.error("Failed to add new goal:", error); 
        showToast('Failed to add goal.', 'error');
    }
  };

  const handleUpdateGoal = async (
    updates: { id: Id<'goals'> } & Partial<Omit<Goal, '_id' | 'orgId'>>,
    successMessage: string | null = 'Goal updated successfully!'
  ) => {
    try {
      await updateGoalMutation(updates);
      setGoalToEdit(null);
      if (successMessage) {
        showToast(successMessage, 'success');
      }
    } catch (error) { 
        console.error("Failed to update goal:", error); 
        showToast('Failed to update goal.', 'error');
    }
  };

  const handleDeleteGoal = async (goalId: Id<'goals'>) => {
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      try {
        await deleteGoalMutation({ id: goalId });
        showToast('Goal deleted.', 'success');
      } catch (error) { 
          console.error("Failed to delete goal:", error); 
          showToast('Failed to delete goal.', 'error');
      }
    }
  };

  const handleStatusChange = async (goalId: Id<'goals'>, status: GoalStatus) => {
    await handleUpdateGoal({ id: goalId, status }, `Goal marked as ${status}.`);
  };

  const handleGenerateActionPlan = async (goalId: Id<'goals'>) => {
    if (!canUseAiActions) {
        showToast("AI Action Plans are a Pro feature. Please upgrade your plan.", 'error');
        return;
    }
    setIsGeneratingPlanFor(goalId);
    try {
      const newActionPlan = await generatePlanAction({ goalId });
      await handleUpdateGoal({ id: goalId, actionPlan: newActionPlan }, 'AI Action Plan generated!');
    } catch (error) {
      console.error("Failed to generate and save action plan:", error);
      showToast('Failed to generate AI plan.', 'error');
    } finally {
      setIsGeneratingPlanFor(null);
    }
  };
  
  const handleUpdateActionStep = async (goalId: Id<'goals'>, stepIndex: number, updates: Partial<ActionStep>) => {
    if (!data) return;
    const targetGoal = data.goals.find(g => g._id === goalId);
    if (!targetGoal || !targetGoal.actionPlan) return;
    
    const newActionPlan = targetGoal.actionPlan.map((step, index) => 
        index === stepIndex ? { ...step, ...updates } : step
    );
    await handleUpdateGoal({ id: goalId, actionPlan: newActionPlan }, null);
  };


  const { activeGoals, nonActiveGoals } = useMemo(() => {
    const goals = data?.goals || [];
    return {
        activeGoals: goals.filter(g => g.status === GoalStatus.Active),
        nonActiveGoals: goals.filter(g => g.status !== GoalStatus.Active),
    };
  }, [data]);

  const { uniqueJobTypes, uniqueLeadSources } = useMemo(() => {
    const PRESET_JOB_TYPES = ['Full Detail', 'Interior Detail', 'Exterior Wash', 'Ceramic Coating', 'Paint Correction', 'Fleet Wash'];
    const PRESET_LEAD_SOURCES = ['Referral', 'Website', 'Social Media', 'Repeat Customer', 'Corporate', 'Walk-in'];
    // FIX: Explicitly type `Set` to prevent incorrect inference to `unknown`.
    const jobTypes = new Set<string>(data?.jobs.map(j => j.type) ?? []);
    // FIX: Explicitly type `Set` to prevent incorrect inference to `unknown`.
    const leadSources = new Set<string>(data?.jobs.map(j => j.leadSource) ?? []);
    PRESET_JOB_TYPES.forEach(t => jobTypes.add(t));
    PRESET_LEAD_SOURCES.forEach(s => leadSources.add(s));
    return { uniqueJobTypes: Array.from(jobTypes).sort(), uniqueLeadSources: Array.from(leadSources).sort() };
  }, [data?.jobs]);
  
  if (data === undefined) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (data === null) return <div className="text-center text-red-400">Could not load dashboard data. You might not have permission to view this organization.</div>;

  const { chartData } = data;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">Dashboard</h1>
              <p className="text-gray-400">Welcome back, here's your business overview.</p>
            </div>
            <button onClick={() => setIsLogJobModalOpen(true)} className="w-full mt-4 sm:mt-0 sm:w-auto bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              <span className="ml-2">Log a Job</span>
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart data={chartData.revenueData} title="Monthly Revenue" dataKey="value" color="#22d3ee" valuePrefix="$" />
              <AnalyticsChart data={chartData.customerData} title="Customer Acquisition" dataKey="value" color="#818cf8" />
              <AnalyticsChart data={chartData.revenueByType} title="Revenue by Job Type" dataKey="value" color="#a78bfa" valuePrefix="$" />
              <AnalyticsChart data={chartData.jobsBySource} title="Jobs by Lead Source" dataKey="value" color="#f472b6" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-semibold text-cyan-400 mb-2 sm:mb-0">Active Goals</h2>
              <button onClick={() => setIsAddGoalModalOpen(true)} className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                <span className="ml-2">Add New Goal</span>
              </button>
            </div>
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeGoals.map(goal => <GoalCard key={goal._id} goal={goal} isGeneratingPlan={isGeneratingPlanFor === goal._id} onEdit={() => setGoalToEdit(goal)} onDelete={() => handleDeleteGoal(goal._id)} onStatusChange={handleStatusChange} onGeneratePlan={handleGenerateActionPlan} onUpdateActionStep={handleUpdateActionStep} canUseAiActions={canUseAiActions} />)}
              </div>
              ) : (
              <div className="text-center py-10 bg-gray-800 rounded-lg border border-dashed border-gray-600">
                <p className="text-gray-400">No active goals set yet.</p>
                <p className="text-gray-500 text-sm">Click "Add New Goal" to get started.</p>
              </div>
            )}
            
            {nonActiveGoals.length > 0 && (
                <div>
                    <button onClick={() => setShowArchived(!showArchived)} className="flex items-center space-x-2 text-gray-400 hover:text-white transition w-full text-left p-2 rounded-lg hover:bg-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showArchived ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                        <h3 className="text-lg font-semibold">Completed & Archived Goals ({nonActiveGoals.length})</h3>
                    </button>
                    {showArchived && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                            {nonActiveGoals.map(goal => <GoalCard key={goal._id} goal={goal} isGeneratingPlan={isGeneratingPlanFor === goal._id} onEdit={() => setGoalToEdit(goal)} onDelete={() => handleDeleteGoal(goal._id)} onStatusChange={handleStatusChange} onGeneratePlan={handleGenerateActionPlan} onUpdateActionStep={handleUpdateActionStep} canUseAiActions={canUseAiActions} />)}
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
            {/* FIX: Used `organization._id` instead of `organization.id`. */}
            <ChatPanel orgId={organization._id as Id<"organizations">} />
        </div>
      </div>
      
      {isLogJobModalOpen && <LogJobModal onClose={() => setIsLogJobModalOpen(false)} onAddJob={handleAddJob} uniqueJobTypes={uniqueJobTypes} uniqueLeadSources={uniqueLeadSources} />}
      {isAddGoalModalOpen && <AddGoalModal onClose={() => setIsAddGoalModalOpen(false)} onAddGoal={handleAddGoal} />}
      {goalToEdit && <UpdateGoalModal goal={goalToEdit} onClose={() => setGoalToEdit(null)} onUpdateGoal={handleUpdateGoal} />}
    </>
  );
};

export default Dashboard;