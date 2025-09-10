
import React, { useState, useRef, useEffect } from 'react';
import { Goal, GoalStatus, ActionStep } from '../types';
import Spinner from './Spinner';

// --- ActionStepItem Sub-component ---
interface ActionStepItemProps {
  step: ActionStep;
  goalId: string;
  stepIndex: number;
  onUpdate: (goalId: string, stepIndex: number, updates: Partial<ActionStep>) => void;
}
const ActionStepItem: React.FC<ActionStepItemProps> = ({ step, goalId, stepIndex, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(step.notes || '');
  const [editedDueDate, setEditedDueDate] = useState(step.dueDate || '');

  const handleSave = () => {
    onUpdate(goalId, stepIndex, { notes: editedNotes, dueDate: editedDueDate });
    setIsEditing(false);
  };
  
  const hasDetails = step.dueDate || step.notes;

  return (
    <li className="flex flex-col bg-gray-900/50 p-2 rounded-md">
        <div className="flex items-center">
            <input
              type="checkbox"
              id={`step-${goalId}-${stepIndex}`}
              checked={step.completed}
              onChange={() => onUpdate(goalId, stepIndex, { completed: !step.completed })}
              className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer flex-shrink-0"
            />
            <label
              htmlFor={`step-${goalId}-${stepIndex}`}
              className={`ml-3 text-sm text-gray-300 cursor-pointer w-full ${step.completed ? 'line-through text-gray-500' : ''}`}
            >
              {step.description}
            </label>
            <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`ml-2 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition ${isEditing || hasDetails ? 'opacity-100' : 'opacity-40'}`}
                aria-label="Edit details"
                title="Edit details"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
        {(hasDetails && !isEditing) && (
            <div className="pl-7 mt-1 space-y-1 text-xs text-gray-400">
                {step.dueDate && <p><strong>Due:</strong> {new Date(step.dueDate + 'T00:00:00').toLocaleDateString()}</p>}
                {step.notes && <p className="whitespace-pre-wrap"><strong>Notes:</strong> {step.notes}</p>}
            </div>
        )}
        {isEditing && (
            <div className="pl-7 mt-2 space-y-2">
                <div>
                    <label className="text-xs font-semibold text-gray-400">Due Date</label>
                    <input type="date" value={editedDueDate} onChange={e => setEditedDueDate(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 text-white rounded p-1 text-sm"/>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-400">Notes</label>
                    <textarea value={editedNotes} onChange={e => setEditedNotes(e.target.value)} className="w-full mt-1 bg-gray-700 border-gray-600 text-white rounded p-1 text-sm" rows={2}/>
                </div>
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs bg-gray-600 rounded">Cancel</button>
                    <button onClick={handleSave} className="px-2 py-1 text-xs bg-cyan-600 rounded">Save</button>
                </div>
            </div>
        )}
    </li>
  );
};


// --- GoalCard Component ---
interface GoalCardProps {
  goal: Goal;
  isGeneratingPlan: boolean;
  canUseAiActions: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onStatusChange: (goalId: string, status: GoalStatus) => void;
  onGeneratePlan: (goalId: string) => void;
  onUpdateActionStep: (goalId: string, stepIndex: number, updates: Partial<ActionStep>) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, isGeneratingPlan, canUseAiActions, onEdit, onDelete, onStatusChange, onGeneratePlan, onUpdateActionStep }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const progressTitle = `Progress: ${goal.currentValue.toLocaleString()} / ${goal.targetValue.toLocaleString()} (${progress.toFixed(1)}%)`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getStatusBadgeColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.Completed:
        return 'bg-green-500/20 text-green-400';
      case GoalStatus.Archived:
        return 'bg-gray-500/20 text-gray-400';
      case GoalStatus.Active:
      default:
        return 'bg-cyan-500/20 text-cyan-400';
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };
  
  const ActionPlan: React.FC<{ plan: ActionStep[]; onUpdate: (goalId: string, stepIndex: number, updates: Partial<ActionStep>) => void }> = ({ plan, onUpdate }) => (
    <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
      <h4 className="text-sm font-semibold text-gray-400">Action Plan</h4>
      <ul className="space-y-1">
        {plan.map((step, index) => (
          // FIX: Pass `goal._id` instead of `goal.id`.
          <ActionStepItem key={index} step={step} goalId={goal._id} stepIndex={index} onUpdate={onUpdate} />
        ))}
      </ul>
    </div>
  );
  
  const AiPlanButton = () => (
    <button 
      onClick={() => onGeneratePlan(goal._id)} 
      disabled={isGeneratingPlan || !canUseAiActions} 
      className="text-cyan-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" 
      aria-label="Generate AI Action Plan"
    >
      {isGeneratingPlan ? <Spinner size="sm" /> : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 00.707.293l2.414 2.414a1 1 0 01.293.707V10a1 1 0 01-1 1h-1v1a1 1 0 11-2 0v-1H7a1 1 0 01-1-1V6.414a1 1 0 01.293-.707l2.414-2.414A1 1 0 0010 3zm-2.293 8.293a1 1 0 011.414 0L10 12.172l.879-.879a1 1 0 111.414 1.414L11.414 13l.879.879a1 1 0 11-1.414 1.414L10 14.828l-.879.879a1 1 0 01-1.414-1.414L8.586 13l-.879-.879a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500/20 shadow-lg flex flex-col justify-between transition-all hover:shadow-cyan-500/10 hover:border-cyan-500/40">
      <div> {/* Main content wrapper */}
        <div className="flex justify-between items-start mb-2">
            <p className="text-gray-300 font-medium pr-2">{goal.description}</p>
            <span className={`flex-shrink-0 px-2 py-1 text-xs font-bold rounded-full ${getStatusBadgeColor(goal.status)}`}>
                {goal.status}
            </span>
        </div>
        <div className="text-2xl font-bold text-white mb-4">
          {goal.currentValue.toLocaleString()} / <span className="text-gray-400">{goal.targetValue.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2" title={progressTitle}>
          <div
            className="bg-cyan-500 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">{progress.toFixed(0)}% Complete</p>
            <div className="flex items-center space-x-2">
                {goal.status === GoalStatus.Active && !goal.actionPlan && (
                    canUseAiActions ? (
                        <AiPlanButton />
                    ) : (
                        <div title="Upgrade to the Pro plan to use AI Action Plans">
                            <AiPlanButton />
                        </div>
                    )
                )}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-700" aria-label="Goal options">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-700 rounded-lg shadow-xl z-10 border border-gray-600 overflow-hidden">
                            <ul>
                               {goal.status === GoalStatus.Active && (
                                    <>
                                        {/* FIX: Pass `goal._id` instead of `goal.id`. */}
                                        <li><button onClick={() => handleAction(() => onStatusChange(goal._id, GoalStatus.Completed))} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-green-600 transition">Mark as Completed</button></li>
                                        {/* FIX: Pass `goal._id` instead of `goal.id`. */}
                                        <li><button onClick={() => handleAction(() => onStatusChange(goal._id, GoalStatus.Archived))} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600 transition">Archive</button></li>
                                    </>
                               )}
                               {goal.status !== GoalStatus.Active && (
                                    // FIX: Pass `goal._id` instead of `goal.id`.
                                    <li><button onClick={() => handleAction(() => onStatusChange(goal._id, GoalStatus.Active))} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-cyan-600 transition">Re-activate</button></li>
                               )}
                                <hr className="border-gray-600"/>
                                <li><button onClick={() => handleAction(() => onEdit(goal))} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-indigo-600 transition">Edit</button></li>
                                {/* FIX: Pass `goal._id` instead of `goal.id`. */}
                                <li><button onClick={() => handleAction(() => onDelete(goal._id))} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition">Delete</button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
      
      {/* Action Plan Section */}
      {isGeneratingPlan && !goal.actionPlan && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center space-x-2">
            <Spinner size="sm"/>
            <p className="text-sm text-gray-400">Generating AI action plan...</p>
        </div>
      )}
      {goal.actionPlan && goal.actionPlan.length > 0 && (
        <ActionPlan plan={goal.actionPlan} onUpdate={onUpdateActionStep} />
      )}
    </div>
  );
};

export default GoalCard;