import React from 'react';
import {
  Download,
  Star,
  Trash2,
  Tag as TagIcon,
  X,
  RotateCcw,
  CheckSquare,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function BulkActionBar({ isTrashView = false }) {
  const {
    selectedFileIds,
    selectedFolderIds,
    clearSelection,
    downloadZipAction,
    bulkStarAction,
    bulkTrashAction,
    bulkDeleteAction,
    setTagModalItem,
    isDownloadingZip
  } = useDriveStore();

  const totalSelected = selectedFileIds.length + selectedFolderIds.length;

  if (totalSelected === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md border border-slate-700/80">
        {/* Counter Badge */}
        <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-700">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
            {totalSelected}
          </span>
          <span className="text-xs font-semibold hidden sm:inline text-slate-200">
            Selected
          </span>
        </div>

        {/* Action Buttons */}
        {!isTrashView ? (
          <>
            {/* Download as ZIP */}
            <button
              type="button"
              disabled={isDownloadingZip}
              onClick={() => downloadZipAction()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors disabled:opacity-50"
            >
              {isDownloadingZip ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-brand-400" />
              )}
              <span>Download ZIP</span>
            </button>

            {/* Add Tag */}
            <button
              type="button"
              onClick={() => setTagModalItem({ isBulk: true })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            >
              <TagIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>Tag</span>
            </button>

            {/* Star All */}
            <button
              type="button"
              onClick={() => bulkStarAction(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Star</span>
            </button>

            {/* Move to Trash */}
            <button
              type="button"
              onClick={() => bulkTrashAction(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors border border-rose-800/40"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Trash</span>
            </button>
          </>
        ) : (
          <>
            {/* Restore All */}
            <button
              type="button"
              onClick={() => bulkTrashAction(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white transition-colors border border-emerald-800/40"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore</span>
            </button>

            {/* Permanent Delete */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Permanently delete ${totalSelected} selected items? This cannot be undone.`)) {
                  bulkDeleteAction();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors border border-rose-800/40"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete Permanently</span>
            </button>
          </>
        )}

        {/* Clear Selection */}
        <button
          type="button"
          title="Clear Selection"
          onClick={clearSelection}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
