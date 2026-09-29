import React, { useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  FolderPlus,
  Upload,
  Folder as FolderIcon,
  File as FileIcon,
  Sparkles,
  Layers,
  Image,
  FileText,
  Video,
  Music,
  Loader2,
  Tag as TagIcon,
  CheckSquare,
  Square,
  Download
} from 'lucide-react';
import { useDriveStore } from '../store/driveStore';
import Breadcrumbs from '../components/drive/Breadcrumbs';
import FolderCard from '../components/drive/FolderCard';
import FileCard from '../components/drive/FileCard';
import VirtualizedGridList from '../components/drive/VirtualizedGridList';
import BulkActionBar from '../components/drive/BulkActionBar';
import Button from '../components/common/Button';

export default function Dashboard() {
  const { folderId } = useParams();
  const {
    folders,
    files,
    currentFolder,
    isLoading,
    viewMode,
    filterType,
    setFilterType,
    activeTagFilter,
    setActiveTagFilter,
    fetchDriveContent,
    setIsCreateFolderOpen,
    uploadMultipleFiles,
    selectedFileIds,
    selectedFolderIds,
    selectAll,
    clearSelection,
    downloadFolderZipAction
  } = useDriveStore();

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDriveContent(folderId || null);
  }, [folderId, filterType, fetchDriveContent]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMultipleFiles(e.target.files, folderId || null);
      e.target.value = null;
    }
  };

  // Collect all unique tags from current files & folders
  const availableTags = useMemo(() => {
    const tagsSet = new Map();
    [...files, ...folders].forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          if (t && t.name && !tagsSet.has(t.name.toLowerCase())) {
            tagsSet.set(t.name.toLowerCase(), t);
          }
        });
      }
    });
    return Array.from(tagsSet.values());
  }, [files, folders]);

  // Apply Tag filter if active
  const filteredFiles = useMemo(() => {
    if (!activeTagFilter) return files;
    return files.filter(
      (f) => f.tags && f.tags.some((t) => t.name.toLowerCase() === activeTagFilter.toLowerCase())
    );
  }, [files, activeTagFilter]);

  const filteredFolders = useMemo(() => {
    if (!activeTagFilter) return folders;
    return folders.filter(
      (f) => f.tags && f.tags.some((t) => t.name.toLowerCase() === activeTagFilter.toLowerCase())
    );
  }, [folders, activeTagFilter]);

  const allItemsSelected =
    filteredFiles.length + filteredFolders.length > 0 &&
    selectedFileIds.length === filteredFiles.length &&
    selectedFolderIds.length === filteredFolders.length;

  const handleToggleSelectAll = () => {
    if (allItemsSelected) {
      clearSelection();
    } else {
      selectAll(filteredFiles, filteredFolders);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Files', icon: Layers },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Top Header Row: Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs currentFolder={currentFolder} />

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download whole current folder as ZIP */}
          {currentFolder && (
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => downloadFolderZipAction(currentFolder._id, currentFolder.name)}
            >
              Download Folder ZIP
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            icon={FolderPlus}
            onClick={() => setIsCreateFolderOpen(true)}
          >
            New Folder
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload
          </Button>
        </div>
      </div>

      {/* Category & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Select All Toggle Button */}
        {(filteredFiles.length > 0 || filteredFolders.length > 0) && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                allItemsSelected
                  ? 'bg-brand-100 text-brand-700 border border-brand-300'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {allItemsSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-brand-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{allItemsSelected ? 'Deselect All' : 'Select All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Available Tags Filter Bar */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <TagIcon className="w-3 h-3" />
            Tags:
          </span>
          <button
            type="button"
            onClick={() => setActiveTagFilter(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              !activeTagFilter
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {availableTags.map((tag) => {
            const isActive = activeTagFilter === tag.name;
            return (
              <button
                key={tag.name}
                type="button"
                onClick={() => setActiveTagFilter(isActive ? null : tag.name)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'ring-2 ring-brand-500 font-semibold'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `${tag.color || '#7C3AED'}20`,
                  color: tag.color || '#7C3AED',
                  border: `1px solid ${tag.color || '#7C3AED'}40`
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: tag.color || '#7C3AED' }}
                />
                <span>{tag.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Area */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-medium">Loading your cloud storage...</p>
        </div>
      ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
        /* Empty State */
        <div className="py-20 px-4 bg-white/60 border border-dashed border-slate-300 rounded-3xl text-center max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {activeTagFilter
                ? `No items found tagged with "${activeTagFilter}"`
                : 'This directory is empty'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Drag and drop files anywhere on the screen, or click below to add your first file or folder.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={FolderPlus}
              onClick={() => setIsCreateFolderOpen(true)}
            >
              Create Folder
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders Section */}
          {filteredFolders.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FolderIcon className="w-4 h-4 text-brand-600" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Folders ({filteredFolders.length})
                  </h3>
                </div>
              </div>

              <VirtualizedGridList
                items={filteredFolders}
                viewMode={viewMode}
                renderItem={(folder) => (
                  <FolderCard folder={folder} viewMode={viewMode} />
                )}
              />
            </div>
          )}

          {/* Files Section */}
          {filteredFiles.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileIcon className="w-4 h-4 text-brand-600" />
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Files ({filteredFiles.length})
                  </h3>
                </div>
              </div>

              <VirtualizedGridList
                items={filteredFiles}
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
