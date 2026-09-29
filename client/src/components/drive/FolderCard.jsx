import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder as FolderIcon,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';
import { useDriveStore } from '../../store/driveStore';
import { formatDate } from '../../utils/formatDate';

export default function FolderCard({ folder, viewMode = 'grid', isTrashView = false }) {
  const navigate = useNavigate();
  const { toggleStar, setRenameItem, trashAction, setDeleteConfirmItem } = useDriveStore();

  const handleOpen = () => {
    if (!isTrashView) {
      navigate(`/drive/folder/${folder._id}`);
    }
  };

  const folderColor = folder.color || '#7C3AED';

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
    return (
      <div
        onDoubleClick={handleOpen}
        className="group relative bg-white hover:bg-brand-50/40 border border-slate-200/80 hover:border-brand-200 rounded-2xl p-4 transition-all duration-200 hover:shadow-card cursor-pointer select-none flex flex-col justify-between"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Folder Icon */}
          <div
            onClick={handleOpen}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
            style={{ backgroundColor: folderColor }}
          >
            <FolderIcon className="w-5 h-5 fill-current" />
          </div>

          {/* Actions Menu */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            {!isTrashView && (
              <button
                type="button"
                onClick={() => toggleStar(folder._id, 'folder')}
                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                  folder.isStarred ? 'text-amber-500 opacity-100' : 'text-slate-400'
                }`}
              >
                <Star className={`w-4 h-4 ${folder.isStarred ? 'fill-current' : ''}`} />
              </button>
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
          <p className="text-[11px] text-slate-400 mt-1">{formatDate(folder.updatedAt, true)}</p>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div
      onDoubleClick={handleOpen}
      className="group flex items-center justify-between px-4 py-3 bg-white hover:bg-brand-50/40 border-b border-slate-100 transition-colors select-none cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1" onClick={handleOpen}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
          style={{ backgroundColor: folderColor }}
        >
          <FolderIcon className="w-4 h-4 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-brand-700">
            {folder.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0">
        <span className="hidden sm:inline-block w-32">{formatDate(folder.updatedAt)}</span>
        <span className="w-16 text-right">Folder</span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isTrashView && (
            <button
              type="button"
              onClick={() => toggleStar(folder._id, 'folder')}
              className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                folder.isStarred ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
              }`}
            >
              <Star className={`w-4 h-4 ${folder.isStarred ? 'fill-current' : ''}`} />
            </button>
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
