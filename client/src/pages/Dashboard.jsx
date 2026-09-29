import React, { useEffect, useRef } from 'react';
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
  Loader2
} from 'lucide-react';
import { useDriveStore } from '../store/driveStore';
import Breadcrumbs from '../components/drive/Breadcrumbs';
import FolderCard from '../components/drive/FolderCard';
import FileCard from '../components/drive/FileCard';
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
    fetchDriveContent,
    setIsCreateFolderOpen,
    uploadMultipleFiles
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

  const filterTabs = [
    { id: 'all', label: 'All Files', icon: Layers },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
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

        <div className="flex items-center gap-2.5">
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

      {/* Content Area */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-medium">Loading your cloud storage...</p>
        </div>
      ) : folders.length === 0 && files.length === 0 ? (
        /* Empty State */
        <div className="py-20 px-4 bg-white/60 border border-dashed border-slate-300 rounded-3xl text-center max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">This directory is empty</h3>
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
          {folders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderIcon className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Folders ({folders.length})
                </h3>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {folders.map((folder) => (
                    <FolderCard key={folder._id} folder={folder} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
                  {folders.map((folder) => (
                    <FolderCard key={folder._id} folder={folder} viewMode="list" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileIcon className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Files ({files.length})
                </h3>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {files.map((file) => (
                    <FileCard key={file._id} file={file} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
                  {files.map((file) => (
                    <FileCard key={file._id} file={file} viewMode="list" />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
