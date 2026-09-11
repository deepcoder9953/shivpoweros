import React from 'react';
import {
  X,
  UserPlus,
  Building2,
  FileText,
  CheckSquare,
  CalendarPlus,
  FolderKanban,
  Sparkles,
} from 'lucide-react';

interface MobileCreateActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: 'lead' | 'customer' | 'quotation' | 'task' | 'followup' | 'project') => void;
  onAddLead?: () => void;
  onAddCustomer?: () => void;
  onCreateQuotation?: () => void;
  onScheduleFollowup?: () => void;
  onAddTask?: () => void;
  onAddProject?: () => void;
}

export const MobileCreateActionSheet: React.FC<MobileCreateActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  onAddLead,
  onAddCustomer,
  onCreateQuotation,
  onScheduleFollowup,
  onAddTask,
  onAddProject,
}) => {
  if (!isOpen) return null;

  const handleActionClick = (actionId: 'lead' | 'customer' | 'quotation' | 'task' | 'followup' | 'project') => {
    if (onSelectAction) {
      try {
        onSelectAction(actionId);
      } catch (e) {
        console.warn('onSelectAction error:', e);
      }
    }

    if (actionId === 'lead' && onAddLead) {
      onAddLead();
    } else if (actionId === 'customer' && onAddCustomer) {
      onAddCustomer();
    } else if (actionId === 'quotation' && onCreateQuotation) {
      onCreateQuotation();
    } else if (actionId === 'task' && onAddTask) {
      onAddTask();
    } else if (actionId === 'followup' && onScheduleFollowup) {
      onScheduleFollowup();
    } else if (actionId === 'project' && onAddProject) {
      onAddProject();
    }

    onClose();
  };

  const actions = [
    {
      id: 'lead' as const,
      title: 'New Lead',
      description: 'Capture inquiry from client, call, or referral',
      icon: UserPlus,
      color: 'bg-blue-500 text-white',
    },
    {
      id: 'customer' as const,
      title: 'New Customer',
      description: 'Create business or client account profile',
      icon: Building2,
      color: 'bg-emerald-500 text-white',
    },
    {
      id: 'quotation' as const,
      title: 'New Quotation',
      description: 'Generate commercial pricing proposal',
      icon: FileText,
      color: 'bg-indigo-500 text-white',
    },
    {
      id: 'task' as const,
      title: 'New Task',
      description: 'Assign action item or team deliverable',
      icon: CheckSquare,
      color: 'bg-amber-500 text-white',
    },
    {
      id: 'followup' as const,
      title: 'Schedule Follow-up',
      description: 'Set call, meeting, or reminder',
      icon: CalendarPlus,
      color: 'bg-cyan-500 text-white',
    },
    {
      id: 'project' as const,
      title: 'New Project',
      description: 'Initialize engineering or installation contract',
      icon: FolderKanban,
      color: 'bg-purple-500 text-white',
    },
  ];

  return (
    <div
      id="mobile-create-action-sheet-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-2xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="mobile-create-action-sheet-panel"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 pb-8 sm:pb-6 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Quick Create</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                Choose an entity
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => handleActionClick(act.id)}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${act.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {act.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
