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
  Star,
  SlidersHorizontal,
  History,
  PieChart,
  Calendar,
  Layers,
  Filter
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
    setPreviewItem,
    searchFilters,
    setSearchFilters,
    isSearchFilterOpen,
    setIsSearchFilterOpen,
    setIsActivityOpen,
    setIsStorageAnalyticsOpen,
    setIsStorageOptimizerOpen
  } = useDriveStore();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Search debounce with filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0 || searchFilters.type !== 'all' || searchFilters.dateRange !== 'all') {
        searchItems(searchQuery, searchFilters);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFilters, searchItems]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
        setIsSearchFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSearchFilterOpen]);

  const handleSelectSearchResult = (item, type) => {
    setIsSearchFocused(false);
    setIsSearchFilterOpen(false);
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

  const hasActiveFilters = searchFilters.type !== 'all' || searchFilters.dateRange !== 'all' || searchFilters.minSize > 0 || searchFilters.maxSize > 0;

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

      {/* Center: Global Search Bar with Filter dropdown */}
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
            ref={searchInputRef}
            id="global-search-input"
            type="text"
            placeholder="Search files & folders (Press '/' to focus)..."
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
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Filter options trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchFilterOpen(!isSearchFilterOpen);
            }}
            title="Advanced Search Filters"
            className={`p-1.5 rounded-lg transition-all shrink-0 ${
              hasActiveFilters || isSearchFilterOpen
                ? 'bg-brand-100 text-brand-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Popup Modal/Dropdown */}
        {isSearchFilterOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-50 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Search Filters</h4>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setSearchFilters({ type: 'all', dateRange: 'all', minSize: 0, maxSize: 0 })}
                  className="text-xs text-brand-600 hover:underline font-semibold"
                >
                  Reset All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">File Type</label>
                <select
                  value={searchFilters.type}
                  onChange={(e) => setSearchFilters({ type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images (PNG, JPG, SVG)</option>
                  <option value="document">Documents & PDFs</option>
                  <option value="video">Videos (MP4, MKV)</option>
                  <option value="audio">Audio (MP3, WAV)</option>
                  <option value="archive">Archives (ZIP, RAR)</option>
                  <option value="code">Code & Scripts</option>
                </select>
              </div>

              {/* Date Modified Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date Modified</label>
                <select
                  value={searchFilters.dateRange}
                  onChange={(e) => setSearchFilters({ dateRange: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="all">Any time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="year">Past year</option>
                </select>
              </div>

              {/* Size Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">File Size</label>
                <select
                  value={
                    searchFilters.maxSize === 1048576
                      ? 'small'
                      : searchFilters.maxSize === 10485760
                      ? 'medium'
                      : searchFilters.minSize === 104857600
                      ? 'huge'
                      : 'all'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'small') setSearchFilters({ minSize: 0, maxSize: 1024 * 1024 });
                    else if (val === 'medium') setSearchFilters({ minSize: 1024 * 1024, maxSize: 10 * 1024 * 1024 });
                    else if (val === 'huge') setSearchFilters({ minSize: 100 * 1024 * 1024, maxSize: 0 });
                    else setSearchFilters({ minSize: 0, maxSize: 0 });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  <option value="all">Any size</option>
                  <option value="small">Small (&lt; 1 MB)</option>
                  <option value="medium">Medium (1 MB - 10 MB)</option>
                  <option value="huge">Large (&gt; 100 MB)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Instant Search Results Dropdown */}
        {isSearchFocused && (searchQuery.trim().length > 0 || hasActiveFilters) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 max-h-96 overflow-y-auto animate-scale-in">
            {searchResults.folders.length === 0 && searchResults.files.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No results found {searchQuery ? `for "${searchQuery}"` : 'matching filters'}
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

      {/* Right side: Activity Log + Storage Analytics + View Toggle + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Activity Logs Trigger Button */}
        <button
          type="button"
          onClick={() => setIsActivityOpen(true)}
          title="Recent Activity Feed"
          className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors relative"
        >
          <History className="w-5 h-5" />
        </button>

        {/* Storage Analytics Trigger Button */}
        <button
          type="button"
          onClick={() => setIsStorageAnalyticsOpen(true)}
          title="Storage Breakdown Analytics"
          className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <PieChart className="w-5 h-5" />
        </button>

        {/* Storage Optimizer & Duplicate Cleaner Button */}
        <button
          type="button"
          onClick={() => setIsStorageOptimizerOpen(true)}
          title="Storage Optimizer & Duplicate Cleaner"
          className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors relative"
        >
          <HardDrive className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

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
          <DropdownItem icon={History} onClick={() => setIsActivityOpen(true)}>
            Activity Logs
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
