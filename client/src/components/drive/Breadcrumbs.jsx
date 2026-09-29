import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function Breadcrumbs({ currentFolder, rootTitle = 'My Drive', rootPath = '/dashboard' }) {
  const { moveItemAction } = useDriveStore();
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const pathList = currentFolder?.path || [];

  const handleDragOver = (e, targetKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(targetKey);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverTarget(null);
  };

  const handleDropOnTarget = (e, targetFolderId, targetFolderName) => {
    e.preventDefault();
    setDragOverTarget(null);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && data.id && data.id !== targetFolderId) {
          moveItemAction(data.id, data.type, targetFolderId, targetFolderName);
        }
      }
    } catch (err) {
      console.error('Breadcrumb drop error:', err);
    }
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium py-1 overflow-x-auto whitespace-nowrap">
      {/* Root / My Drive Breadcrumb Target */}
      <Link
        to={rootPath}
        onDragOver={(e) => handleDragOver(e, 'root')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDropOnTarget(e, null, 'My Drive')}
        className={`flex items-center gap-1.5 transition-all py-1 px-2 rounded-lg ${
          dragOverTarget === 'root'
            ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 font-bold scale-105 shadow-sm'
            : 'hover:text-brand-600 hover:bg-slate-100'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>{rootTitle}</span>
      </Link>

      {pathList.map((crumb) => {
        const isOver = dragOverTarget === crumb._id;
        return (
          <React.Fragment key={crumb._id}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link
              to={`/drive/folder/${crumb._id}`}
              onDragOver={(e) => handleDragOver(e, crumb._id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDropOnTarget(e, crumb._id, crumb.name)}
              className={`transition-all py-1 px-2 rounded-lg truncate max-w-[120px] ${
                isOver
                  ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 font-bold scale-105 shadow-sm'
                  : 'hover:text-brand-600 hover:bg-slate-100'
              }`}
            >
              {crumb.name}
            </Link>
          </React.Fragment>
        );
      })}

      {currentFolder && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-semibold py-1 px-2 bg-brand-50 text-brand-700 rounded-lg truncate max-w-[150px]">
            {currentFolder.name}
          </span>
        </>
      )}
    </nav>
  );
}
