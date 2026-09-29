import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import { FolderPlus } from 'lucide-react';

const FOLDER_COLORS = [
  '#7C3AED', // Violet (Primary)
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#64748B'  // Slate
];

export default function CreateFolderModal() {
  const { isCreateFolderOpen, setIsCreateFolderOpen, createFolder } = useDriveStore();
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#7C3AED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    setIsSubmitting(true);
    const result = await createFolder(folderName.trim(), null, selectedColor);
    setIsSubmitting(false);

    if (result.success) {
      setFolderName('');
      setIsCreateFolderOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateFolderOpen}
      onClose={() => setIsCreateFolderOpen(false)}
      title="Create New Folder"
      subtitle="Organize your documents and files into a dedicated directory"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Folder Name"
          placeholder="e.g., Marketing Assets, Financial Reports"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          autoFocus
          required
        />

        <div>
          <label className="text-xs font-semibold text-slate-700 tracking-wide block mb-2">
            Folder Color Theme
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full transition-all duration-150 flex items-center justify-center ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-brand-500 scale-110'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateFolderOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!folderName.trim()}
            icon={FolderPlus}
          >
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
}
