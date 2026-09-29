import React, { useEffect } from 'react';
import { Clock, File as FileIcon, Loader2 } from 'lucide-react';
import { useDriveStore } from '../store/driveStore';
import FileCard from '../components/drive/FileCard';
import VirtualizedGridList from '../components/drive/VirtualizedGridList';
import BulkActionBar from '../components/drive/BulkActionBar';

export default function Recent() {
  const { recentFiles, isLoading, viewMode, fetchRecent } = useDriveStore();

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-600 shadow-xs">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Recent Files</h1>
          <p className="text-xs text-slate-500">Files you have opened or uploaded recently</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-medium">Loading recent files...</p>
        </div>
      ) : recentFiles.length === 0 ? (
        <div className="py-20 px-4 bg-white/60 border border-dashed border-slate-300 rounded-3xl text-center max-w-md mx-auto flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No recent activity</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Files you upload or modify will appear here automatically for fast access.
          </p>
        </div>
      ) : (
        <VirtualizedGridList
          items={recentFiles}
          viewMode={viewMode}
          renderItem={(file) => (
            <FileCard file={file} viewMode={viewMode} />
          )}
        />
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar />
    </div>
  );
}
