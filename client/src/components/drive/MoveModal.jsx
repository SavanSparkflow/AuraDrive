import React, { useState, useEffect } from 'react';
import {
  Folder as FolderIcon,
  HardDrive,
  ChevronRight,
  FolderOpen,
  ArrowRight,
  Loader2,
  Check
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import api from '../../api/apiClient';

export default function MoveModal() {
  const { moveModalItem, setMoveModalItem, moveItemAction, bulkMoveAction, currentFolder } = useDriveStore();
  const [foldersTree, setFoldersTree] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('My Drive');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBulk = moveModalItem?.isBulk;
  const item = moveModalItem?.item;
  const itemType = moveModalItem?.type;

  useEffect(() => {
    if (moveModalItem) {
      loadFolders();
      setSelectedFolderId(null);
      setSelectedFolderName('My Drive (Root)');
    }
  }, [moveModalItem]);

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/folders');
      setFoldersTree(res.data.folders || []);
    } catch (err) {
      console.error('Error loading folders for move:', err);
    }
    setIsLoading(false);
  };

  if (!moveModalItem) return null;

  // Filter out the folder being moved (and its children) so user can't move into itself
  const isFolderDisabled = (folder) => {
    if (!isBulk && itemType === 'folder' && item) {
      if (folder._id === item._id) return true;
      if (folder.path && folder.path.some((p) => p._id === item._id)) return true;
    }
    return false;
  };

  const handleConfirmMove = async () => {
    setIsSubmitting(true);
    if (isBulk) {
      await bulkMoveAction(selectedFolderId, selectedFolderName);
    } else if (item) {
      await moveItemAction(item._id, itemType, selectedFolderId, selectedFolderName);
    }
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={Boolean(moveModalItem)}
      onClose={() => setMoveModalItem(null)}
      title={isBulk ? 'Move Selected Items' : `Move "${item?.name}"`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          Select the destination folder where you want to move {isBulk ? 'selected items' : 'this item'}:
        </p>

        {/* Folder Destination Selector List */}
        <div className="border border-slate-200/80 rounded-2xl p-2 bg-slate-50 max-h-64 overflow-y-auto space-y-1">
          {/* Root Option: My Drive */}
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(null);
              setSelectedFolderName('My Drive');
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
              selectedFolderId === null
                ? 'bg-brand-600 text-white font-bold shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <HardDrive className={`w-4 h-4 shrink-0 ${selectedFolderId === null ? 'text-white' : 'text-brand-600'}`} />
              <span className="truncate">My Drive (Root)</span>
            </div>
            {selectedFolderId === null && <Check className="w-4 h-4 text-white shrink-0" />}
          </button>

          {/* Subfolders List */}
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              <span className="text-xs">Loading folders...</span>
            </div>
          ) : (
            foldersTree.map((f) => {
              const disabled = isFolderDisabled(f);
              const isSelected = selectedFolderId === f._id;
              const folderColor = f.color || '#7C3AED';

              return (
                <button
                  key={f._id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedFolderId(f._id);
                    setSelectedFolderName(f.name);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                    disabled
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                      : isSelected
                      ? 'bg-brand-600 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div
                      className="p-1 rounded-md text-white shrink-0"
                      style={{ backgroundColor: isSelected ? '#ffffff30' : folderColor }}
                    >
                      <FolderIcon className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="truncate">{f.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Destination Feedback Banner */}
        <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center gap-2 text-xs text-brand-800 font-medium">
          <ArrowRight className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span>Destination: <strong>{selectedFolderName}</strong></span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMoveModalItem(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleConfirmMove}
          >
            Move Here
          </Button>
        </div>
      </div>
    </Modal>
  );
}
