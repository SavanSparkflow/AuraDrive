import React from 'react';
import {
  MoreVertical,
  Star,
  Download,
  Share2,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  History,
  Tag as TagIcon,
  Check
} from 'lucide-react';
import { getFileIcon, getFileTypeCategory } from '../../utils/fileHelpers';
import { formatBytes } from '../../utils/formatBytes';
import { formatDate } from '../../utils/formatDate';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';
import TagChip from './TagChip';
import { useDriveStore } from '../../store/driveStore';

export default function FileCard({ file, viewMode = 'grid', isTrashView = false }) {
  const {
    toggleStar,
    setPreviewItem,
    setShareItem,
    setRenameItem,
    trashAction,
    setDeleteConfirmItem,
    setVersionHistoryItem,
    setTagModalItem,
    selectedFileIds,
    toggleSelectItem
  } = useDriveStore();

  const isSelected = selectedFileIds.includes(file._id);
  const iconMeta = getFileIcon(file.mimetype, file.name);
  const Icon = iconMeta.icon;
  const isImage = file.mimetype.startsWith('image/');
  const hasMultipleVersions = (file.currentVersion && file.currentVersion > 1) || (file.versions && file.versions.length > 0);

  const handleDownload = (e) => {
    e?.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url;
    link.target = '_blank';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (e) => {
    if (e?.ctrlKey || e?.metaKey) {
      e.stopPropagation();
      toggleSelectItem(file._id, 'file', true);
      return;
    }
    if (!isTrashView) {
      setPreviewItem(file);
    }
  };

  const handleSelectCheckbox = (e) => {
    e.stopPropagation();
    toggleSelectItem(file._id, 'file', true);
  };

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
    return (
      <div
        onClick={handlePreview}
        className={`group relative bg-white border rounded-2xl transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
          isSelected
            ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/20 shadow-md'
            : 'border-slate-200/80 hover:border-brand-300 hover:bg-slate-50/70 hover:shadow-card'
        }`}
      >
        {/* Preview Thumbnail Header */}
        <div className="relative h-32 w-full bg-slate-100 flex items-center justify-center rounded-t-2xl border-b border-slate-100">
          <div className="absolute inset-0 overflow-hidden rounded-t-2xl flex items-center justify-center">
            {isImage ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className={`p-4 rounded-2xl ${iconMeta.bg} ${iconMeta.color} shadow-xs transition-transform group-hover:scale-110`}>
                <Icon className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Selection Checkbox */}
          <div
            onClick={handleSelectCheckbox}
            className={`absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-brand-600 text-white shadow-xs opacity-100 scale-100'
                : 'bg-white/90 backdrop-blur-xs text-slate-400 border border-slate-300 opacity-0 group-hover:opacity-100 hover:border-brand-500 hover:text-brand-600'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>

          {/* Version badge */}
          {hasMultipleVersions && (
            <button
              type="button"
              title="View Version History"
              onClick={(e) => {
                e.stopPropagation();
                setVersionHistoryItem(file);
              }}
              className="absolute bottom-2 left-2.5 z-10 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white rounded-md text-[10px] font-bold shadow-xs hover:bg-brand-600 transition-colors flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              <span>v{file.currentVersion || 1}</span>
            </button>
          )}

          {/* Star indicator badge */}
          {file.isStarred && !isTrashView && (
            <div className={`absolute top-2.5 ${isSelected ? 'left-10' : 'left-10 opacity-0 group-hover:opacity-100'} z-10 p-1 bg-white/90 backdrop-blur-xs rounded-lg text-amber-500 shadow-xs transition-opacity`}>
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          )}

          {/* Quick Action Overlay */}
          <div
            className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {!isTrashView && (
              <>
                <button
                  type="button"
                  title="Preview"
                  onClick={handlePreview}
                  className="p-1.5 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-brand-600 rounded-lg shadow-sm transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Download"
                  onClick={handleDownload}
                  className="p-1.5 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-brand-600 rounded-lg shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Dropdown Menu */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="p-1.5 bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-slate-900 rounded-lg shadow-sm transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              }
            >
              {!isTrashView ? (
                <>
                  <DropdownItem icon={Eye} onClick={handlePreview}>
                    Preview
                  </DropdownItem>
                  <DropdownItem icon={History} onClick={() => setVersionHistoryItem(file)}>
                    Version History {hasMultipleVersions ? `(v${file.currentVersion})` : ''}
                  </DropdownItem>
                  <DropdownItem icon={TagIcon} onClick={() => setTagModalItem({ item: file, type: 'file' })}>
                    Manage Tags
                  </DropdownItem>
                  <DropdownItem icon={Share2} onClick={() => setShareItem(file)}>
                    Share Link
                  </DropdownItem>
                  <DropdownItem icon={Download} onClick={handleDownload}>
                    Download
                  </DropdownItem>
                  <DropdownItem
                    icon={Star}
                    onClick={() => toggleStar(file._id, 'file')}
                  >
                    {file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                  </DropdownItem>
                  <DropdownItem
                    icon={Edit2}
                    onClick={() => setRenameItem({ item: file, type: 'file' })}
                  >
                    Rename
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    icon={Trash2}
                    danger
                    onClick={() => trashAction(file._id, 'file', true)}
                  >
                    Move to Trash
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem
                    icon={RotateCcw}
                    onClick={() => trashAction(file._id, 'file', false)}
                  >
                    Restore
                  </DropdownItem>
                  <DropdownItem
                    icon={Trash2}
                    danger
                    onClick={() => setDeleteConfirmItem({ item: file, type: 'file', isPermanent: true })}
                  >
                    Delete Permanently
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>
        </div>

        {/* File Metadata footer & Tags */}
        <div className="p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 shrink-0 ${iconMeta.color}`} />
            <h4 className="text-xs font-semibold text-slate-800 truncate flex-1 group-hover:text-brand-600">
              {file.name}
            </h4>
          </div>

          {/* Tags list */}
          {file.tags && file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1.5">
              {file.tags.map((tag, i) => (
                <TagChip key={i} tag={tag} size="xs" />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>{formatBytes(file.size)}</span>
            <span>{formatDate(file.createdAt, true)}</span>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div
      onClick={handlePreview}
      className={`group flex items-center justify-between px-4 py-3 border-b transition-colors select-none cursor-pointer ${
        isSelected
          ? 'bg-brand-50/50 border-brand-200'
          : 'bg-white hover:bg-brand-50/40 border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Selection Checkbox */}
        <div
          onClick={handleSelectCheckbox}
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-600 text-white'
              : 'border border-slate-300 opacity-0 group-hover:opacity-100 hover:border-brand-500 text-slate-400'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>

        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconMeta.bg} ${iconMeta.color}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-600">
            {file.name}
          </p>

          {hasMultipleVersions && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setVersionHistoryItem(file);
              }}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px] hover:bg-brand-100 hover:text-brand-700 transition-colors"
            >
              v{file.currentVersion || 1}
            </span>
          )}

          {file.tags && file.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {file.tags.slice(0, 3).map((tag, i) => (
                <TagChip key={i} tag={tag} size="xs" />
              ))}
              {file.tags.length > 3 && (
                <span className="text-[10px] text-slate-400">+{file.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0">
        <span className="hidden md:inline-block w-28">{formatDate(file.createdAt)}</span>
        <span className="w-20 text-right font-medium text-slate-500">{formatBytes(file.size)}</span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isTrashView && (
            <>
              <button
                type="button"
                onClick={() => toggleStar(file._id, 'file')}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                  file.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                <Star className={`w-4 h-4 ${file.isStarred ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </>
          )}

          <Dropdown
            align="right"
            trigger={
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
          >
            {!isTrashView ? (
              <>
                <DropdownItem icon={Eye} onClick={handlePreview}>
                  Preview
                </DropdownItem>
                <DropdownItem icon={History} onClick={() => setVersionHistoryItem(file)}>
                  Version History {hasMultipleVersions ? `(v${file.currentVersion})` : ''}
                </DropdownItem>
                <DropdownItem icon={TagIcon} onClick={() => setTagModalItem({ item: file, type: 'file' })}>
                  Manage Tags
                </DropdownItem>
                <DropdownItem icon={Share2} onClick={() => setShareItem(file)}>
                  Share Link
                </DropdownItem>
                <DropdownItem
                  icon={Edit2}
                  onClick={() => setRenameItem({ item: file, type: 'file' })}
                >
                  Rename
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  icon={Trash2}
                  danger
                  onClick={() => trashAction(file._id, 'file', true)}
                >
                  Move to Trash
                </DropdownItem>
              </>
            ) : (
              <>
                <DropdownItem
                  icon={RotateCcw}
                  onClick={() => trashAction(file._id, 'file', false)}
                >
                  Restore
                </DropdownItem>
                <DropdownItem
                  icon={Trash2}
                  danger
                  onClick={() => setDeleteConfirmItem({ item: file, type: 'file', isPermanent: true })}
                >
                  Delete Permanently
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
