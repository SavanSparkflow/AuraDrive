import React, { useEffect } from 'react';
import { Star, Folder as FolderIcon, File as FileIcon, Loader2 } from 'lucide-react';
import { useDriveStore } from '../store/driveStore';
import FolderCard from '../components/drive/FolderCard';
import FileCard from '../components/drive/FileCard';
import VirtualizedGridList from '../components/drive/VirtualizedGridList';
import BulkActionBar from '../components/drive/BulkActionBar';

export default function Starred() {
  const { starredFiles, starredFolders, isLoading, viewMode, fetchStarred } = useDriveStore();

  useEffect(() => {
    fetchStarred();
  }, [fetchStarred]);

  const isEmpty = starredFiles.length === 0 && starredFolders.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600 shadow-xs">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Starred Items</h1>
          <p className="text-xs text-slate-500">Quickly access your favorite files and folders</p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-medium">Loading starred items...</p>
        </div>
      ) : isEmpty ? (
        <div className="py-20 px-4 bg-white/60 border border-dashed border-slate-300 rounded-3xl text-center max-w-md mx-auto flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No starred items</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Add stars to files and folders to easily find your most important documents here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders */}
          {starredFolders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderIcon className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Starred Folders ({starredFolders.length})
                </h3>
              </div>

              <VirtualizedGridList
                items={starredFolders}
                viewMode={viewMode}
                renderItem={(folder) => (
                  <FolderCard folder={folder} viewMode={viewMode} />
                )}
              />
            </div>
          )}

          {/* Files */}
          {starredFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileIcon className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Starred Files ({starredFiles.length})
                </h3>
              </div>

              <VirtualizedGridList
                items={starredFiles}
                viewMode={viewMode}
                renderItem={(file) => (
                  <FileCard file={file} viewMode={viewMode} />
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      <BulkActionBar />
    </div>
  );
}
