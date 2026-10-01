import React from 'react';
import { Sparkles, Star, Clock, Eye, Download, ChevronRight } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';
import { getFileIcon } from '../../utils/fileHelpers';
import { formatBytes } from '../../utils/formatBytes';

export default function QuickAccessBar({ files = [], folders = [] }) {
  const { setPreviewItem, toggleStar, openContextMenu } = useDriveStore();

  // Pick starred items and up to 6 recent items
  const quickItems = [
    ...folders.filter((f) => f.isStarred).map((f) => ({ ...f, itemType: 'folder' })),
    ...files.filter((f) => f.isStarred).map((f) => ({ ...f, itemType: 'file' })),
    ...files.slice(0, 4).map((f) => ({ ...f, itemType: 'file' }))
  ].filter((v, i, a) => a.findIndex((t) => t._id === v._id) === i).slice(0, 6);

  if (quickItems.length === 0) return null;

  return (
    <div className="space-y-2.5 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-50 text-amber-600">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Access & Pinned
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {quickItems.map((item) => {
          const isFolder = item.itemType === 'folder';
          const iconMeta = isFolder ? null : getFileIcon(item.mimetype, item.name);
          const Icon = isFolder ? null : iconMeta.icon;

          return (
            <div
              key={item._id}
              onClick={() => {
                if (isFolder) {
                  window.location.hash = `#/drive/folder/${item._id}`;
                } else {
                  setPreviewItem(item);
                }
              }}
              onContextMenu={(e) => openContextMenu(e, item, isFolder ? 'folder' : 'file')}
              className="group relative bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-card rounded-2xl p-3 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  {isFolder ? (
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color || '#7C3AED' }}
                    >
                      📁
                    </div>
                  ) : (
                    <div className={`w-7 h-7 rounded-lg ${iconMeta.bg} ${iconMeta.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                    {item.name}
                  </span>
                </div>

                {item.isStarred && (
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{isFolder ? 'Folder' : formatBytes(item.size)}</span>
                <span className="opacity-0 group-hover:opacity-100 text-brand-600 font-semibold transition-opacity flex items-center gap-0.5">
                  Open <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
