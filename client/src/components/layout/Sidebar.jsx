import React, { useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HardDrive,
  Star,
  Clock,
  Trash2,
  Plus,
  FolderPlus,
  Upload,
  Cloud,
  ChevronRight
} from 'lucide-react';
import Logo from '../common/Logo';
import StorageWidget from '../drive/StorageWidget';
import { useDriveStore } from '../../store/driveStore';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';

export default function Sidebar({ onCloseMobile }) {
  const { setIsCreateFolderOpen, uploadMultipleFiles, currentFolder } = useDriveStore();
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMultipleFiles(e.target.files, currentFolder?._id);
      e.target.value = null; // reset
    }
  };

  const navItems = [
    { name: 'My Drive', path: '/dashboard', icon: HardDrive },
    { name: 'Starred', path: '/starred', icon: Star },
    { name: 'Recent', path: '/recent', icon: Clock },
    { name: 'Trash', path: '/trash', icon: Trash2 }
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 select-none shrink-0">
      {/* Top Section: Logo & New Action */}
      <div className="space-y-6">
        <div className="px-2 pt-2">
          <Logo to="/dashboard" />
        </div>

        {/* Action Button: "+ New" */}
        <div className="px-1">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />

          <Dropdown
            className="w-full"
            menuClassName="w-56"
            align="left"
            trigger={
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-2xl shadow-lg shadow-brand-600/25 transition-all duration-200 hover:shadow-brand-600/35 active:scale-[0.98]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span className="text-sm">New Upload</span>
              </button>
            }
          >
            <DropdownItem
              icon={Upload}
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              Upload Files
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem
              icon={FolderPlus}
              onClick={() => {
                setIsCreateFolderOpen(true);
              }}
            >
              New Folder
            </DropdownItem>
          </Dropdown>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-100/90 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Storage Progress Widget */}
      <div className="pt-4 border-t border-slate-100">
        <StorageWidget />
      </div>
    </aside>
  );
}
