import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle, RotateCcw, Folder as FolderIcon, File as FileIcon, Loader2 } from 'lucide-react';
import { useDriveStore } from '../store/driveStore';
import FolderCard from '../components/drive/FolderCard';
import FileCard from '../components/drive/FileCard';
import VirtualizedGridList from '../components/drive/VirtualizedGridList';
import BulkActionBar from '../components/drive/BulkActionBar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function Trash() {
  const {
    trashFiles,
    trashFolders,
    isLoading,
    viewMode,
    fetchTrash,
    emptyTrashAction
  } = useDriveStore();

  const [isEmptying, setIsEmptying] = useState(false);
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const isEmpty = trashFiles.length === 0 && trashFolders.length === 0;

  const handleEmptyTrash = async () => {
    setIsEmptying(true);
    await emptyTrashAction();
    setIsEmptying(false);
    setShowConfirmEmpty(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600 shadow-xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Trash</h1>
            <p className="text-xs text-slate-500">Items in trash can be restored or permanently removed</p>
          </div>
        </div>

        {!isEmpty && (
          <Button
            variant="dangerGhost"
            size="sm"
            icon={Trash2}
            onClick={() => setShowConfirmEmpty(true)}
          >
            Empty Trash
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <p className="text-xs font-medium">Loading trash items...</p>
        </div>
      ) : isEmpty ? (
        <div className="py-20 px-4 bg-white/60 border border-dashed border-slate-300 rounded-3xl text-center max-w-md mx-auto flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Trash is empty</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Deleted files and folders will appear here until you empty them.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Folders in Trash */}
          {trashFolders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FolderIcon className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Trashed Folders ({trashFolders.length})
                </h3>
              </div>

              <VirtualizedGridList
                items={trashFolders}
                viewMode={viewMode}
                renderItem={(folder) => (
                  <FolderCard key={folder._id} folder={folder} viewMode={viewMode} isTrashView={true} />
                )}
              />
            </div>
          )}

          {/* Files in Trash */}
          {trashFiles.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileIcon className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Trashed Files ({trashFiles.length})
                </h3>
              </div>

              <VirtualizedGridList
                items={trashFiles}
                viewMode={viewMode}
                renderItem={(file) => (
                  <FileCard key={file._id} file={file} viewMode={viewMode} isTrashView={true} />
                )}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar for Trash View */}
      <BulkActionBar isTrashView={true} />

      {/* Empty Trash Confirmation Modal */}
      <Modal
        isOpen={showConfirmEmpty}
        onClose={() => setShowConfirmEmpty(false)}
        title="Empty Entire Trash?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3.5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <p className="font-semibold text-rose-950 mb-0.5">This action cannot be undone.</p>
              Are you sure you want to permanently delete all{' '}
              <span className="font-bold underline">{trashFiles.length + trashFolders.length} items</span> in your trash? All files and folders will be removed forever.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmEmpty(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isEmptying}
              onClick={handleEmptyTrash}
              icon={Trash2}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
