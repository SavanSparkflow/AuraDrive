import React, { useEffect, useRef } from 'react';
import {
  Eye,
  Download,
  Edit2,
  FolderInput,
  Copy,
  Star,
  Tag as TagIcon,
  Share2,
  History,
  Trash2,
  FolderPlus,
  Upload,
  ClipboardPaste,
  RefreshCw,
  FolderOpen,
  Wand2,
  Crop,
  Highlighter,
  Play,
  FileCode
} from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function ContextMenu() {
  const {
    contextMenu,
    closeContextMenu,
    setPreviewItem,
    setRenameItem,
    setMoveModalItem,
    setShareItem,
    setTagModalItem,
    setVersionHistoryItem,
    toggleStar,
    trashAction,
    copyItemToClipboard,
    clipboardItem,
    pasteClipboardAction,
    setIsCreateFolderOpen,
    downloadFolderZipAction,
    currentFolder,
    fetchDriveContent,
    setTextEditorItem,
    setImageEditorItem,
    setPdfViewerItem,
    setMediaPlayerItem
  } = useDriveStore();

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeContextMenu();
      }
    };

    const handleScroll = () => closeContextMenu();

    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen) return null;

  const { x, y, item, type } = contextMenu;

  // Adjust menu position so it doesn't overflow screen bounds
  const menuWidth = 220;
  const menuHeight = type === 'file' ? 340 : type === 'folder' ? 300 : 180;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 16);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 16);

  const handleDownload = () => {
    closeContextMenu();
    if (type === 'file' && item) {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === 'folder' && item) {
      downloadFolderZipAction(item._id, item.name);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 p-1.5 text-xs text-slate-700 animate-scale-in select-none"
    >
      {/* File Context Menu */}
      {type === 'file' && item && (
        <div className="space-y-0.5">
          <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
            <p className="font-semibold text-slate-900 truncate">{item.name}</p>
          </div>

          <button
            onClick={() => {
              closeContextMenu();
              setPreviewItem(item);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Quick Preview</span>
            </div>
          </button>

          {/* Contextual In-App Tools */}
          {(item.name?.match(/\.(txt|md|js|jsx|ts|tsx|json|html|css|py|env|csv|sql|xml|yaml|yml)$/i) || item.mimetype?.includes('text') || item.mimetype?.includes('json')) && (
            <button
              onClick={() => {
                closeContextMenu();
                setTextEditorItem(item);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-brand-50/70 hover:bg-brand-100/80 text-brand-700 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-brand-600" />
                <span>Edit in Code Studio</span>
              </div>
            </button>
          )}

          {item.mimetype?.startsWith('image/') && (
            <button
              onClick={() => {
                closeContextMenu();
                setImageEditorItem(item);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/80 text-purple-700 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Crop className="w-4 h-4 text-purple-600" />
                <span>Edit Photo & Crop</span>
              </div>
            </button>
          )}

          {(item.mimetype?.includes('pdf') || item.name?.toLowerCase().endsWith('.pdf')) && (
            <button
              onClick={() => {
                closeContextMenu();
                setPdfViewerItem(item);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Highlighter className="w-4 h-4 text-rose-600" />
                <span>PDF Annotation Studio</span>
              </div>
            </button>
          )}

          {(item.mimetype?.startsWith('video/') || item.mimetype?.startsWith('audio/')) && (
            <button
              onClick={() => {
                closeContextMenu();
                setMediaPlayerItem(item);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 text-amber-700 font-semibold transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-amber-600 fill-current" />
                <span>Cinema Player</span>
              </div>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setRenameItem({ item, type: 'file' });
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Edit2 className="w-4 h-4 text-slate-500" />
              <span>Rename</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">F2</span>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setMoveModalItem({ item, type: 'file' });
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderInput className="w-4 h-4 text-slate-500" />
              <span>Move to...</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              copyItemToClipboard(item, 'file');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copy</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              toggleStar(item._id, 'file');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Star className={`w-4 h-4 ${item.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-500'}`} />
              <span>{item.isStarred ? 'Unstar' : 'Add to Starred'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setTagModalItem({ item, type: 'file' });
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <TagIcon className="w-4 h-4 text-slate-500" />
              <span>Manage Tags</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setShareItem(item);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>Share Link</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setVersionHistoryItem(item);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4 text-slate-500" />
              <span>Version History</span>
            </div>
          </button>

          <div className="border-t border-slate-100 my-1" />

          <button
            onClick={() => {
              closeContextMenu();
              trashAction(item._id, 'file', true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4" />
              <span>Move to Trash</span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono">Del</span>
          </button>
        </div>
      )}

      {/* Folder Context Menu */}
      {type === 'folder' && item && (
        <div className="space-y-0.5">
          <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
            <p className="font-semibold text-slate-900 truncate">{item.name}</p>
          </div>

          <button
            onClick={() => {
              closeContextMenu();
              window.location.hash = `#/drive/folder/${item._id}`;
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <span>Open Folder</span>
            </div>
          </button>

          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-slate-500" />
              <span>Download ZIP</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setRenameItem({ item, type: 'folder' });
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Edit2 className="w-4 h-4 text-slate-500" />
              <span>Rename</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">F2</span>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setMoveModalItem({ item, type: 'folder' });
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderInput className="w-4 h-4 text-slate-500" />
              <span>Move to...</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              copyItemToClipboard(item, 'folder');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copy</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              toggleStar(item._id, 'folder');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Star className={`w-4 h-4 ${item.isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-500'}`} />
              <span>{item.isStarred ? 'Unstar' : 'Add to Starred'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              closeContextMenu();
              setTagModalItem({ item, type: 'folder' });
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <TagIcon className="w-4 h-4 text-slate-500" />
              <span>Manage Tags</span>
            </div>
          </button>

          <div className="border-t border-slate-100 my-1" />

          <button
            onClick={() => {
              closeContextMenu();
              trashAction(item._id, 'folder', true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4" />
              <span>Move to Trash</span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono">Del</span>
          </button>
        </div>
      )}

      {/* Background / Canvas Context Menu */}
      {type === 'canvas' && (
        <div className="space-y-0.5">
          <button
            onClick={() => {
              closeContextMenu();
              setIsCreateFolderOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderPlus className="w-4 h-4 text-brand-600" />
              <span className="font-semibold">New Folder</span>
            </div>
          </button>

          {clipboardItem && (
            <button
              onClick={() => {
                closeContextMenu();
                pasteClipboardAction(currentFolder?._id || null);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardPaste className="w-4 h-4 text-emerald-600" />
                <span>Paste "{clipboardItem.item.name}"</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
            </button>
          )}

          <button
            onClick={() => {
              closeContextMenu();
              fetchDriveContent(currentFolder?._id || null);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Refresh</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
