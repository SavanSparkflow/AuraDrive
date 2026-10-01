import React, { useEffect } from 'react';
import {
  X,
  HardDrive,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Trash2,
  Sparkles,
  PieChart,
  CheckCircle2
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { formatBytes } from '../../utils/formatBytes';
import Button from '../common/Button';

export default function StorageAnalyticsModal() {
  const {
    isStorageAnalyticsOpen,
    setIsStorageAnalyticsOpen,
    storageStats,
    fetchStorageStats,
    emptyTrashAction
  } = useDriveStore();

  useEffect(() => {
    if (isStorageAnalyticsOpen) {
      fetchStorageStats();
    }
  }, [isStorageAnalyticsOpen, fetchStorageStats]);

  if (!isStorageAnalyticsOpen) return null;

  const total = storageStats?.storageLimit || 15 * 1024 * 1024 * 1024;
  const used = storageStats?.totalUsed || 0;
  const usedPercent = Math.min(Math.round((used / total) * 100), 100);

  const images = storageStats?.images || 0;
  const videos = storageStats?.videos || 0;
  const docs = storageStats?.documents || 0;
  const audio = storageStats?.audio || 0;
  const others = storageStats?.others || 0;

  const categories = [
    { label: 'Images', bytes: images, color: 'bg-emerald-500', text: 'text-emerald-500', icon: ImageIcon },
    { label: 'Videos', bytes: videos, color: 'bg-rose-500', text: 'text-rose-500', icon: Video },
    { label: 'Documents & PDFs', bytes: docs, color: 'bg-blue-500', text: 'text-blue-500', icon: FileText },
    { label: 'Audio', bytes: audio, color: 'bg-amber-500', text: 'text-amber-500', icon: Music },
    { label: 'Other Files', bytes: others, color: 'bg-indigo-500', text: 'text-indigo-500', icon: Archive }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Storage Breakdown</h2>
              <p className="text-xs text-slate-500">Visual storage analytics & quota usage</p>
            </div>
          </div>
          <button
            onClick={() => setIsStorageAnalyticsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Usage Card */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Cloud Usage</span>
              <span className="text-sm font-bold text-slate-800">
                {formatBytes(used)} <span className="text-xs font-normal text-slate-400">/ {formatBytes(total)}</span>
              </span>
            </div>

            {/* Multi-segmented Progress Bar */}
            <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
              {used > 0 && categories.map((cat) => {
                const widthPercent = (cat.bytes / total) * 100;
                if (widthPercent <= 0) return null;
                return (
                  <div
                    key={cat.label}
                    style={{ width: `${widthPercent}%` }}
                    className={`${cat.color} transition-all duration-500`}
                    title={`${cat.label}: ${formatBytes(cat.bytes)}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{usedPercent}% used</span>
              <span>{formatBytes(Math.max(0, total - used))} available</span>
            </div>
          </div>

          {/* Breakdown Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Usage by Category
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const percentOfUsed = used > 0 ? Math.round((cat.bytes / used) * 100) : 0;

                return (
                  <div
                    key={cat.label}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/70 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-slate-50 ${cat.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{cat.label}</p>
                        <p className="text-[10px] text-slate-400">{percentOfUsed}% of total files</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-slate-700 font-mono">
                      {formatBytes(cat.bytes)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Cleanup Actions */}
          <div className="bg-brand-50/50 border border-brand-100 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
              <p className="text-xs text-brand-900 font-medium">
                Need more free space? Empty trash or clean up old versions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Trash2}
              onClick={() => {
                emptyTrashAction();
              }}
              className="shrink-0 text-xs border-brand-200 hover:bg-brand-100 text-brand-800"
            >
              Empty Trash
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button variant="secondary" size="sm" onClick={() => setIsStorageAnalyticsOpen(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
