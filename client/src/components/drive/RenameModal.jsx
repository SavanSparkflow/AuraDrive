import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import { Edit2 } from 'lucide-react';

export default function RenameModal() {
  const { renameItem, setRenameItem, renameItemAction } = useDriveStore();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (renameItem?.item) {
      setName(renameItem.item.name || '');
    }
  }, [renameItem]);

  const handleClose = () => {
    setRenameItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !renameItem) return;

    setIsSubmitting(true);
    const res = await renameItemAction(renameItem.item._id, name.trim(), renameItem.type);
    setIsSubmitting(false);

    if (res.success) {
      handleClose();
    }
  };

  const isFolder = renameItem?.type === 'folder';

  return (
    <Modal
      isOpen={!!renameItem}
      onClose={handleClose}
      title={isFolder ? 'Rename Folder' : 'Rename File'}
      subtitle={`Enter a new name for "${renameItem?.item?.name}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!name.trim() || name === renameItem?.item?.name}
            icon={Edit2}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
