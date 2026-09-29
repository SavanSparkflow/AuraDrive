import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Folder, MoreHorizontal } from 'lucide-react';
import { useDriveStore } from '../../store/driveStore';

export default function Breadcrumbs({ currentFolder, rootTitle = 'My Drive', rootPath = '/dashboard' }) {
  const { moveItemAction } = useDriveStore();
  const [dragOverTarget, setDragOverTarget] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pathList = currentFolder?.path || [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // If path is long (> 3 items), collapse middle items
  const shouldCollapse = pathList.length > 3;
  const firstCrumb = shouldCollapse ? pathList[0] : null;
  const hiddenCrumbs = shouldCollapse ? pathList.slice(1, -1) : [];
  const lastCrumb = shouldCollapse ? pathList[pathList.length - 1] : null;
  const visibleCrumbs = shouldCollapse ? [] : pathList;

  return (
    <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-600 font-medium py-1 max-w-full overflow-x-auto scrollbar-none flex-wrap">
      {/* Root / My Drive Breadcrumb Target */}
      <Link
        to={rootPath}
        title={rootTitle}
        onDragOver={(e) => handleDragOver(e, 'root')}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDropOnTarget(e, null, 'My Drive')}
        className={`flex items-center gap-1.5 transition-all py-1 px-2.5 rounded-lg shrink-0 ${
          dragOverTarget === 'root'
            ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 font-bold scale-105 shadow-xs'
            : 'hover:text-brand-600 hover:bg-slate-100 text-slate-600'
        }`}
      >
        <Home className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
        <span className="font-semibold">{rootTitle}</span>
      </Link>

      {/* When Path is short: render all crumbs */}
      {!shouldCollapse &&
        visibleCrumbs.map((crumb) => {
          const isOver = dragOverTarget === crumb._id;
          return (
            <React.Fragment key={crumb._id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <Link
                to={`/drive/folder/${crumb._id}`}
                title={crumb.name}
                onDragOver={(e) => handleDragOver(e, crumb._id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnTarget(e, crumb._id, crumb.name)}
                className={`transition-all py-1 px-2.5 rounded-lg truncate max-w-[160px] sm:max-w-[200px] shrink-0 ${
                  isOver
                    ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 font-bold scale-105 shadow-xs'
                    : 'hover:text-brand-600 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          );
        })}

      {/* When Path is long (> 3): show first crumb -> ellipsis dropdown -> last crumb */}
      {shouldCollapse && (
        <>
          {/* First Parent Folder */}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link
            to={`/drive/folder/${firstCrumb._id}`}
            title={firstCrumb.name}
            onDragOver={(e) => handleDragOver(e, firstCrumb._id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropOnTarget(e, firstCrumb._id, firstCrumb.name)}
            className={`transition-all py-1 px-2.5 rounded-lg truncate max-w-[140px] shrink-0 ${
              dragOverTarget === firstCrumb._id
                ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 font-bold scale-105 shadow-xs'
                : 'hover:text-brand-600 hover:bg-slate-100 text-slate-600'
            }`}
          >
            {firstCrumb.name}
          </Link>

          {/* Ellipsis Dropdown for intermediate hidden folders */}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title={`${hiddenCrumbs.length} hidden folders`}
              className="flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200/80 bg-white shadow-xs"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-scale-in">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Intermediate Folders ({hiddenCrumbs.length})
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {hiddenCrumbs.map((crumb) => {
                    const isOver = dragOverTarget === crumb._id;
                    return (
                      <Link
                        key={crumb._id}
                        to={`/drive/folder/${crumb._id}`}
                        onClick={() => setIsDropdownOpen(false)}
                        title={crumb.name}
                        onDragOver={(e) => handleDragOver(e, crumb._id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => {
                          handleDropOnTarget(e, crumb._id, crumb.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                          isOver
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        <span className="truncate">{crumb.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Immediate Parent Folder */}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link
            to={`/drive/folder/${lastCrumb._id}`}
            title={lastCrumb.name}
            onDragOver={(e) => handleDragOver(e, lastCrumb._id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropOnTarget(e, lastCrumb._id, lastCrumb.name)}
            className={`transition-all py-1 px-2.5 rounded-lg truncate max-w-[140px] shrink-0 ${
              dragOverTarget === lastCrumb._id
                ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500 font-bold scale-105 shadow-xs'
                : 'hover:text-brand-600 hover:bg-slate-100 text-slate-600'
            }`}
          >
            {lastCrumb.name}
          </Link>
        </>
      )}

      {/* Active Current Folder */}
      {currentFolder && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span
            title={currentFolder.name}
            className="text-brand-700 font-semibold py-1 px-2.5 bg-brand-50/80 border border-brand-100 rounded-lg truncate max-w-[180px] sm:max-w-[240px] shrink-0"
          >
            {currentFolder.name}
          </span>
        </>
      )}
    </nav>
  );
}
