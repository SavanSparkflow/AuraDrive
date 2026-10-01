import React, { useEffect } from 'react';
import {
  X,
  History,
  Upload,
  Trash2,
  Edit2,
  FolderInput,
  Star,
  Share2,
  Copy,
  Tag as TagIcon,
  FolderPlus,
  RefreshCw,
  Clock,
  Trash
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { formatDate } from '../../utils/formatDate';

const actionIcons = {
  upload: { icon: Upload, color: 'text-brand-600 bg-brand-50' },
  create_folder: { icon: FolderPlus, color: 'text-violet-600 bg-violet-50' },
  rename: { icon: Edit2, color: 'text-amber-600 bg-amber-50' },
  move: { icon: FolderInput, color: 'text-blue-600 bg-blue-50' },
  copy: { icon: Copy, color: 'text-emerald-600 bg-emerald-50' },
  star: { icon: Star, color: 'text-amber-500 bg-amber-50' },
  unstar: { icon: Star, color: 'text-slate-400 bg-slate-50' },
  trash: { icon: Trash2, color: 'text-rose-600 bg-rose-50' },
  restore: { icon: RefreshCw, color: 'text-teal-600 bg-teal-50' },
  delete: { icon: Trash, color: 'text-rose-700 bg-rose-100' },
  share: { icon: Share2, color: 'text-cyan-600 bg-cyan-50' },
  unshare: { icon: Share2, color: 'text-slate-500 bg-slate-50' },
  tag_update: { icon: TagIcon, color: 'text-purple-600 bg-purple-50' }
};

const actionLabels = {
  upload: 'Uploaded',
  create_folder: 'Created folder',
  rename: 'Renamed',
  move: 'Moved',
  copy: 'Copied',
  star: 'Starred',
  unstar: 'Unstarred',
  trash: 'Moved to Trash',
  restore: 'Restored',
  delete: 'Permanently deleted',
  share: 'Shared',
  unshare: 'Turned off sharing',
  tag_update: 'Updated tags'
};

export default function ActivityDrawer() {
  const {
    isActivityOpen,
    setIsActivityOpen,
    activities,
    fetchActivities,
    clearActivitiesAction
  } = useDriveStore();

  useEffect(() => {
    if (isActivityOpen) {
      fetchActivities();
    }
  }, [isActivityOpen, fetchActivities]);

  if (!isActivityOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsActivityOpen(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Activity Log</h2>
                <p className="text-xs text-slate-400">Audit trail of file & folder events</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {activities.length > 0 && (
                <button
                  onClick={clearActivitiesAction}
                  title="Clear history"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-semibold"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsActivityOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {activities.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-sm font-medium">No activity recorded yet</p>
                <p className="text-xs">Your file uploads, moves, and shares will appear here.</p>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activities.map((act) => {
                  const meta = actionIcons[act.action] || { icon: Clock, color: 'text-slate-500 bg-slate-50' };
                  const Icon = meta.icon;
                  const label = actionLabels[act.action] || act.action;

                  return (
                    <div key={act._id} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${meta.color} shadow-xs`}
                      >
                        <Icon className="w-2.5 h-2.5 stroke-[2.5]" />
                      </div>

                      <div className="bg-slate-50/80 hover:bg-slate-100 border border-slate-200/60 rounded-xl p-3 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-700">{label}</span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(act.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {act.itemName}
                        </p>
                        {act.details && act.details.newName && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            New name: <span className="font-medium text-slate-700">{act.details.newName}</span>
                          </p>
                        )}
                        {act.details && act.details.hasPassword && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                            Password Protected
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
