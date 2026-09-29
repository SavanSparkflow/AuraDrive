import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Folder } from 'lucide-react';

export default function Breadcrumbs({ currentFolder, rootTitle = 'My Drive', rootPath = '/dashboard' }) {
  const pathList = currentFolder?.path || [];

  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium py-1 overflow-x-auto whitespace-nowrap">
      <Link
        to={rootPath}
        className="flex items-center gap-1.5 hover:text-brand-600 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{rootTitle}</span>
      </Link>

      {pathList.map((crumb) => (
        <React.Fragment key={crumb._id}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <Link
            to={`/drive/folder/${crumb._id}`}
            className="hover:text-brand-600 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100 truncate max-w-[120px]"
          >
            {crumb.name}
          </Link>
        </React.Fragment>
      ))}

      {currentFolder && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-semibold py-1 px-1.5 bg-brand-50 text-brand-700 rounded-lg truncate max-w-[150px]">
            {currentFolder.name}
          </span>
        </>
      )}
    </nav>
  );
}
