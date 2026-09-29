import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Menu,
  X,
  LogOut,
  User,
  HardDrive,
  Folder as FolderIcon,
  Sparkles,
  ChevronRight,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDriveStore } from '../../store/driveStore';
import { getFileIcon } from '../../utils/fileHelpers';
import { formatBytes } from '../../utils/formatBytes';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ onMenuToggle, isMobileMenuOpen }) {
  const { user, logout } = useAuthStore();
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    searchItems,
    searchResults,
    setPreviewItem
  } = useDriveStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        searchItems(searchQuery);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchItems]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item, type) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    if (type === 'folder') {
      navigate(`/drive/folder/${item._id}`);
    } else {
      setPreviewItem(item);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger on mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onMenuToggle}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl focus:outline-none transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-2xl relative" ref={searchContainerRef}>
        <div
          className={`flex items-center gap-2.5 px-4 py-2 bg-slate-100/90 hover:bg-slate-100 border rounded-2xl transition-all duration-200 ${
            isSearchFocused
              ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
              : 'border-transparent'
          }`}
        >
          <Search className={`w-4 h-4 shrink-0 transition-colors ${isSearchFocused ? 'text-brand-600' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search in AuraDrive (files, folders, formats)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Instant Search Results Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 max-h-96 overflow-y-auto animate-scale-in">
            {searchResults.folders.length === 0 && searchResults.files.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No results found for "<span className="font-semibold text-slate-700">{searchQuery}</span>"
              </div>
            ) : (
              <>
                {/* Folder Results */}
                {searchResults.folders.length > 0 && (
                  <div className="px-3 pb-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                      Folders ({searchResults.folders.length})
                    </p>
                    {searchResults.folders.map((folder) => (
                      <button
                        key={folder._id}
                        type="button"
                        onClick={() => handleSelectSearchResult(folder, 'folder')}
                        className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-brand-50/70 text-slate-800 transition-colors text-sm group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div
                            className="p-1.5 rounded-lg text-white"
                            style={{ backgroundColor: folder.color || '#7C3AED' }}
                          >
                            <FolderIcon className="w-4 h-4 fill-current" />
                          </div>
                          <span className="font-medium truncate">{folder.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* File Results */}
                {searchResults.files.length > 0 && (
                  <div className="px-3 pt-1 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1 mt-2">
                      Files ({searchResults.files.length})
                    </p>
                    {searchResults.files.map((file) => {
                      const iconMeta = getFileIcon(file.mimetype, file.name);
                      const IconComponent = iconMeta.icon;
                      return (
                        <button
                          key={file._id}
                          type="button"
                          onClick={() => handleSelectSearchResult(file, 'file')}
                          className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-brand-50/70 text-slate-800 transition-colors text-sm group"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className={`p-1.5 rounded-lg ${iconMeta.bg} ${iconMeta.color}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="font-medium text-slate-900 truncate">{file.name}</p>
                              <p className="text-[11px] text-slate-400">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right side: View Toggle + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Grid / List View Toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            title="List View"
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* User Profile Menu */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-full transition-colors focus:outline-none">
              <img
                src={
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}&backgroundColor=7c3aed`
                }
                alt={user?.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
              />
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block max-w-[100px] truncate">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>
          }
        >
          <div
            onClick={() => navigate('/profile')}
            className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>

          <DropdownItem icon={User} onClick={() => navigate('/profile')}>
            My Profile
          </DropdownItem>
          <DropdownItem icon={HardDrive} onClick={() => navigate('/dashboard')}>
            My Drive
          </DropdownItem>
          <DropdownItem icon={Star} onClick={() => navigate('/starred')}>
            Starred Items
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem icon={LogOut} danger onClick={handleLogout}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
