import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';

export default function DeleteConfirmModal() {
  const { deleteConfirmItem, setDeleteConfirmItem, deletePermanently } = useDriveStore();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!deleteConfirmItem) return null;

  const { item, type, isPermanent } = deleteConfirmItem;

  const handleDelete = async () => {
    setIsDeleting(true);
    await deletePermanently(item._id, type);
    setIsDeleting(false);
    setDeleteConfirmItem(null);
  };

  return (
    <Modal
      isOpen={!!deleteConfirmItem}
      onClose={() => setDeleteConfirmItem(null)}
      title="Delete Permanently?"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <p className="font-semibold text-rose-950 mb-0.5">This action cannot be undone.</p>
            Are you sure you want to permanently delete{' '}
            <span className="font-bold underline">{item?.name}</span>?
            {type === 'folder' && ' All contents and sub-folders inside will also be deleted forever.'}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDeleteConfirmItem(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
            icon={Trash2}
          >
            Delete Forever
          </Button>
        </div>
      </div>
    </Modal>
  );
}
