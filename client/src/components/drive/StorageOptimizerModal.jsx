import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FolderOpen,
  CheckSquare,
  Square,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes } from '../../utils/formatBytes';
import Button from '../common/Button';
import toast from 'react-hot-toast';

export default function StorageOptimizerModal() {
  const {
    isStorageOptimizerOpen,
    setIsStorageOptimizerOpen,
    duplicateGroups,
    potentialSavingsBytes,
    duplicateFilesCount,
    isScanningDuplicates,
    isCleaningDuplicates,
    fetchDuplicatesAction,
    cleanDuplicatesAction,
    purgeExpiredTrashAction
  } = useDriveStore();

  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  const [isPurgingTrash, setIsPurgingTrash] = useState(false);

  useEffect(() => {
    if (isStorageOptimizerOpen) {
      fetchDuplicatesAction();
    }
  }, [isStorageOptimizerOpen]);

  // When duplicate groups are loaded, auto-select redundant files (keep newest by default)
  useEffect(() => {
    if (duplicateGroups && duplicateGroups.length > 0) {
      autoSelectKeepNewest();
    } else {
      setSelectedFileIds(new Set());
    }
  }, [duplicateGroups]);

  if (!isStorageOptimizerOpen) return null;

  const autoSelectKeepNewest = () => {
    const ids = new Set();
    duplicateGroups.forEach((group) => {
      // Sort newest first
      const sorted = [...group.files].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Keep index 0 (newest), select the rest for deletion
      for (let i = 1; i < sorted.length; i++) {
        ids.add(sorted[i]._id);
      }
    });
    setSelectedFileIds(ids);
  };

  const autoSelectKeepOldest = () => {
    const ids = new Set();
    duplicateGroups.forEach((group) => {
      // Sort oldest first
      const sorted = [...group.files].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      // Keep index 0 (oldest), select the rest
      for (let i = 1; i < sorted.length; i++) {
        ids.add(sorted[i]._id);
      }
    });
    setSelectedFileIds(ids);
  };

  const selectAll = () => {
    const ids = new Set();
    duplicateGroups.forEach((g) => g.files.forEach((f) => ids.add(f._id)));
    setSelectedFileIds(ids);
  };

  const deselectAll = () => {
    setSelectedFileIds(new Set());
  };

  const toggleSelect = (id) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate selected savings
  let selectedSavingsBytes = 0;
  duplicateGroups.forEach((group) => {
    group.files.forEach((f) => {
      if (selectedFileIds.has(f._id)) {
        selectedSavingsBytes += f.size || 0;
      }
    });
  });

  const handleClean = async () => {
    if (selectedFileIds.size === 0) {
      toast('Please select at least one file to clean', { icon: 'ℹ️' });
      return;
    }
    await cleanDuplicatesAction(Array.from(selectedFileIds));
  };

  const handleRetentionPurge = async () => {
    setIsPurgingTrash(true);
    await purgeExpiredTrashAction();
    setIsPurgingTrash(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl h-[90vh] bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-scale-in text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Storage Optimizer & Duplicate Cleaner
              </h3>
              <p className="text-xs text-slate-400">Reclaim wasted storage by detecting duplicate files</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDuplicatesAction}
              disabled={isScanningDuplicates}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Rescan Storage"
            >
              <RefreshCw className={`w-4 h-4 ${isScanningDuplicates ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsStorageOptimizerOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="p-6 bg-slate-900/60 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20">
            <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Potential Savings</span>
            <h4 className="text-2xl font-bold text-white mt-1">{formatBytes(potentialSavingsBytes)}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{duplicateFilesCount} redundant copies found</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">Selected to Clean</span>
            <h4 className="text-2xl font-bold text-white mt-1">{formatBytes(selectedSavingsBytes)}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{selectedFileIds.size} files marked</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">30-Day Trash Policy</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-400">Auto-purge active</span>
              <button
                type="button"
                onClick={handleRetentionPurge}
                disabled={isPurgingTrash}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isPurgingTrash ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                <span>Purge Expired</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Selection Toolbar */}
        {duplicateGroups.length > 0 && (
          <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Quick Select:</span>
              <button
                type="button"
                onClick={autoSelectKeepNewest}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Keep Newest
              </button>
              <button
                type="button"
                onClick={autoSelectKeepOldest}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Keep Oldest
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              >
                Clear
              </button>
            </div>

            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleClean}
              isLoading={isCleaningDuplicates}
              disabled={selectedFileIds.size === 0}
            >
              Clean Selected ({formatBytes(selectedSavingsBytes)})
            </Button>
          </div>
        )}

        {/* Duplicates List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isScanningDuplicates ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <h4 className="text-sm font-semibold text-white">Scanning Drive for Duplicate Clusters...</h4>
              <p className="text-xs text-slate-400">Comparing file hashes, byte sizes, and formats.</p>
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Your Drive is 100% Clean!</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                No duplicate files detected. Your cloud storage is fully optimized.
              </p>
            </div>
          ) : (
            duplicateGroups.map((group, gIdx) => (
              <div key={gIdx} className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-md">
                <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Cluster #{gIdx + 1}:</span>
                    <span className="text-slate-300">{group.files[0]?.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] text-slate-300">
                      {group.count} copies
                    </span>
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    {formatBytes(group.potentialSavingsBytes)} reclaimable
                  </div>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {group.files.map((file, fIdx) => {
                    const isSelected = selectedFileIds.has(file._id);
                    return (
                      <div
                        key={file._id}
                        onClick={() => toggleSelect(file._id)}
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-rose-500/10 hover:bg-rose-500/15' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button type="button" className="text-slate-400 hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-rose-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </button>

                          <div className="truncate">
                            <p className="text-xs font-medium text-white truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <FolderOpen className="w-3 h-3 text-slate-500" />
                                {file.folderName}
                              </span>
                              <span>•</span>
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Delete
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
