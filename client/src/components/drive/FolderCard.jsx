import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder as FolderIcon,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink,
  Download,
  Tag as TagIcon,
  Check
} from 'lucide-react';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';
import TagChip from './TagChip';
import { useDriveStore } from '../../store/driveStore';
import { formatDate } from '../../utils/formatDate';

export default function FolderCard({ folder, viewMode = 'grid', isTrashView = false }) {
  const navigate = useNavigate();
  const {
    toggleStar,
    setRenameItem,
    trashAction,
    setDeleteConfirmItem,
    downloadFolderZipAction,
    setTagModalItem,
    selectedFolderIds,
    toggleSelectItem
  } = useDriveStore();

  const isSelected = selectedFolderIds.includes(folder._id);

  const handleOpen = (e) => {
    if (e?.ctrlKey || e?.metaKey) {
      e?.stopPropagation();
      toggleSelectItem(folder._id, 'folder', true);
      return;
    }
    if (!isTrashView) {
      navigate(`/drive/folder/${folder._id}`);
    }
  };

  const handleSelectCheckbox = (e) => {
    e.stopPropagation();
    toggleSelectItem(folder._id, 'folder', true);
  };

  const handleDownloadZip = (e) => {
    e?.stopPropagation();
    downloadFolderZipAction(folder._id, folder.name);
  };

  const folderColor = folder.color || '#7C3AED';

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
    return (
      <div
        onDoubleClick={handleOpen}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
            toggleSelectItem(folder._id, 'folder', true);
          }
        }}
        className={`group relative border rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
          isSelected
            ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/30 shadow-md'
            : 'bg-white hover:bg-brand-50/40 border-slate-200/80 hover:border-brand-200 hover:shadow-card'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Folder Icon & Checkbox */}
          <div className="flex items-center gap-2">
            <div
              onClick={handleSelectCheckbox}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-xs opacity-100 scale-100'
                  : 'bg-white text-slate-400 border border-slate-300 opacity-0 group-hover:opacity-100 hover:border-brand-500 hover:text-brand-600'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div
              onClick={handleOpen}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
              style={{ backgroundColor: folderColor }}
            >
              <FolderIcon className="w-5 h-5 fill-current" />
            </div>
          </div>

          {/* Actions Menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            {!isTrashView && (
              <>
                <button
                  type="button"
                  title="Download as ZIP"
                  onClick={handleDownloadZip}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleStar(folder._id, 'folder')}
                  className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                    folder.isStarred ? 'text-amber-500 opacity-100' : 'text-slate-400'
                  }`}
                >
                  <Star className={`w-4 h-4 ${folder.isStarred ? 'fill-current' : ''}`} />
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
                  <DropdownItem icon={ExternalLink} onClick={handleOpen}>
                    Open Folder
                  </DropdownItem>
                  <DropdownItem icon={Download} onClick={handleDownloadZip}>
                    Download as ZIP
                  </DropdownItem>
                  <DropdownItem icon={TagIcon} onClick={() => setTagModalItem({ item: folder, type: 'folder' })}>
                    Manage Tags
                  </DropdownItem>
                  <DropdownItem
                    icon={Star}
                    onClick={() => toggleStar(folder._id, 'folder')}
                  >
                    {folder.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                  </DropdownItem>
                  <DropdownItem
                    icon={Edit2}
                    onClick={() => setRenameItem({ item: folder, type: 'folder' })}
                  >
                    Rename
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    icon={Trash2}
                    danger
                    onClick={() => trashAction(folder._id, 'folder', true)}
                  >
                    Move to Trash
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem
                    icon={RotateCcw}
                    onClick={() => trashAction(folder._id, 'folder', false)}
                  >
                    Restore
                  </DropdownItem>
                  <DropdownItem
                    icon={Trash2}
                    danger
                    onClick={() => setDeleteConfirmItem({ item: folder, type: 'folder', isPermanent: true })}
                  >
                    Delete Permanently
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>
        </div>

        {/* Folder Title & Details */}
        <div onClick={handleOpen}>
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-700">
              {folder.name}
            </h4>
            {folder.isStarred && !isTrashView && (
              <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
            )}
          </div>

          {/* Tags */}
          {folder.tags && folder.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 my-1.5">
              {folder.tags.map((tag, i) => (
                <TagChip key={i} tag={tag} size="xs" />
              ))}
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-1">{formatDate(folder.updatedAt, true)}</p>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div
      onDoubleClick={handleOpen}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.stopPropagation();
          toggleSelectItem(folder._id, 'folder', true);
        }
      }}
      className={`group flex items-center justify-between px-4 py-3 border-b transition-colors select-none cursor-pointer ${
        isSelected
          ? 'bg-brand-50/50 border-brand-200'
          : 'bg-white hover:bg-brand-50/40 border-slate-100'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1" onClick={handleOpen}>
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

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
          style={{ backgroundColor: folderColor }}
        >
          <FolderIcon className="w-4 h-4 fill-current" />
        </div>
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-700">
            {folder.name}
          </p>

          {folder.tags && folder.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {folder.tags.map((tag, i) => (
                <TagChip key={i} tag={tag} size="xs" />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0">
        <span className="hidden sm:inline-block w-32">{formatDate(folder.updatedAt)}</span>
        <span className="w-16 text-right">Folder</span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isTrashView && (
            <>
              <button
                type="button"
                onClick={handleDownloadZip}
                className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Download as ZIP"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => toggleStar(folder._id, 'folder')}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                  folder.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                }`}
              >
                <Star className={`w-4 h-4 ${folder.isStarred ? 'fill-current' : ''}`} />
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
                <DropdownItem icon={ExternalLink} onClick={handleOpen}>
                  Open Folder
                </DropdownItem>
                <DropdownItem icon={Download} onClick={handleDownloadZip}>
                  Download as ZIP
                </DropdownItem>
                <DropdownItem icon={TagIcon} onClick={() => setTagModalItem({ item: folder, type: 'folder' })}>
                  Manage Tags
                </DropdownItem>
                <DropdownItem
                  icon={Edit2}
                  onClick={() => setRenameItem({ item: folder, type: 'folder' })}
                >
                  Rename
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem
                  icon={Trash2}
                  danger
                  onClick={() => trashAction(folder._id, 'folder', true)}
                >
                  Move to Trash
                </DropdownItem>
              </>
            ) : (
              <>
                <DropdownItem
                  icon={RotateCcw}
                  onClick={() => trashAction(folder._id, 'folder', false)}
                >
                  Restore
                </DropdownItem>
                <DropdownItem
                  icon={Trash2}
                  danger
                  onClick={() => setDeleteConfirmItem({ item: folder, type: 'folder', isPermanent: true })}
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
