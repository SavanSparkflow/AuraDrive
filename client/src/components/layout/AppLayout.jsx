import React, { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CreateFolderModal from '../drive/CreateFolderModal';
import RenameModal from '../drive/RenameModal';
import ShareModal from '../drive/ShareModal';
import FilePreviewModal from '../drive/FilePreviewModal';
import DeleteConfirmModal from '../drive/DeleteConfirmModal';
import VersionHistoryModal from '../drive/VersionHistoryModal';
import TagModal from '../drive/TagModal';
import MoveModal from '../drive/MoveModal';
import UploadArea from '../drive/UploadArea';
import { useDriveStore } from '../../store/driveStore';

export default function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { uploadMultipleFiles, currentFolder } = useDriveStore();
  const location = useLocation();

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        uploadMultipleFiles(acceptedFiles, currentFolder?._id);
      }
    },
    [uploadMultipleFiles, currentFolder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true
  });

  return (
    <div {...getRootProps()} className="flex h-screen w-screen overflow-hidden bg-slate-50 relative">
      <input {...getInputProps()} />

      {/* Global Drag & Drop Overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-brand-900/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none animate-fade-in border-4 border-dashed border-brand-300 m-4 rounded-3xl">
          <div className="p-6 rounded-3xl bg-white shadow-2xl text-center flex flex-col items-center gap-3 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center animate-bounce">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Drop files here to upload</h3>
              <p className="text-xs text-slate-500 mt-1">
                Files will automatically be added to {currentFolder ? `"${currentFolder.name}"` : 'My Drive'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Mobile Sidebar Overlay / Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 h-full bg-white z-50 animate-scale-in">
            <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Floating Upload Status */}
      <UploadArea />

      {/* Global Modal dialogs */}
      <CreateFolderModal />
      <RenameModal />
      <ShareModal />
      <FilePreviewModal />
      <DeleteConfirmModal />
      <VersionHistoryModal />
      <TagModal />
      <MoveModal />
    </div>
  );
}
