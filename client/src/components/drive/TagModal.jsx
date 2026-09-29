import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, Plus, X, Sparkles, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import TagChip from './TagChip';
import { useDriveStore } from '../../store/driveStore';

const COLOR_PRESETS = [
  { label: 'Violet', color: '#7C3AED' },
  { label: 'Blue', color: '#2563EB' },
  { label: 'Emerald', color: '#059669' },
  { label: 'Amber', color: '#D97706' },
  { label: 'Rose', color: '#E11D48' },
  { label: 'Indigo', color: '#4F46E5' },
  { label: 'Pink', color: '#DB2777' },
  { label: 'Cyan', color: '#0891B2' }
];

const SUGGESTIONS = ['Work', 'Personal', 'Finance', 'Urgent', 'Project', 'Archive', 'Taxes', 'Design'];

export default function TagModal() {
  const { tagModalItem, setTagModalItem, updateItemTags, bulkTagAction } = useDriveStore();
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#7C3AED');
  const [tagsList, setTagsList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const isBulk = tagModalItem?.isBulk;
  const item = tagModalItem?.item;
  const itemType = tagModalItem?.type;

  useEffect(() => {
    if (tagModalItem && !isBulk && item) {
      setTagsList(item.tags || []);
    } else {
      setTagsList([]);
    }
    setTagName('');
    setSelectedColor('#7C3AED');
  }, [tagModalItem, item, isBulk]);

  if (!tagModalItem) return null;

  const handleAddTag = (nameToAdd = tagName, colorToAdd = selectedColor) => {
    const cleanName = nameToAdd.trim();
    if (!cleanName) return;

    if (tagsList.some((t) => t.name.toLowerCase() === cleanName.toLowerCase())) {
      setTagName('');
      return;
    }

    const newTag = { name: cleanName, color: colorToAdd };
    setTagsList([...tagsList, newTag]);
    setTagName('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTagsList(tagsList.filter((t) => t.name !== tagToRemove.name));
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (isBulk) {
      if (tagsList.length > 0) {
        for (const tag of tagsList) {
          await bulkTagAction(tag, 'add');
        }
      }
    } else if (item) {
      await updateItemTags(item._id, itemType, tagsList);
    }
    setIsSaving(false);
    setTagModalItem(null);
  };

  return (
    <Modal
      isOpen={Boolean(tagModalItem)}
      onClose={() => setTagModalItem(null)}
      title={isBulk ? 'Add Tags to Selected Items' : `Manage Tags for "${item?.name || 'Item'}"`}
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        {/* Existing / Pending Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {isBulk ? 'Tags to Add' : 'Current Tags'}
          </label>
          <div className="min-h-[44px] p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap gap-2 items-center">
            {tagsList.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No tags attached yet</span>
            ) : (
              tagsList.map((tag, i) => (
                <TagChip key={i} tag={tag} onRemove={() => handleRemoveTag(tag)} />
              ))
            )}
          </div>
        </div>

        {/* Add New Tag Input & Color Selector */}
        <div className="space-y-3 pt-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Create or Add Label
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="e.g. Work, Taxes, Urgent..."
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                icon={TagIcon}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddTag()}
              disabled={!tagName.trim()}
              className="shrink-0"
              icon={Plus}
            >
              Add
            </Button>
          </div>

          {/* Color Palette Presets */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Color:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  title={preset.label}
                  onClick={() => setSelectedColor(preset.color)}
                  className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                    selectedColor === preset.color
                      ? 'ring-2 ring-brand-500 scale-110 shadow-xs'
                      : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.color }}
                >
                  {selectedColor === preset.color && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Quick Suggestions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug) => {
              const isAlreadyAdded = tagsList.some(
                (t) => t.name.toLowerCase() === sug.toLowerCase()
              );
              return (
                <button
                  key={sug}
                  type="button"
                  disabled={isAlreadyAdded}
                  onClick={() => handleAddTag(sug, selectedColor)}
                  className={`px-2.5 py-1 text-xs rounded-xl border transition-all ${
                    isAlreadyAdded
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                      : 'bg-white hover:bg-brand-50 hover:border-brand-300 text-slate-700 border-slate-200'
                  }`}
                >
                  + {sug}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTagModalItem(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSaving}
            onClick={handleSave}
          >
            {isBulk ? 'Apply Tags to Selection' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
