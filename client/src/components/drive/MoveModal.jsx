import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder as FolderIcon,
  FolderOpen,
  HardDrive,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Loader2,
  Check,
  Search
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDriveStore } from '../../store/driveStore';
import api from '../../api/apiClient';

// Recursive Folder Tree Node Component
function TreeNode({
  node,
  depth = 0,
  selectedFolderId,
  onSelectFolder,
  expandedIds,
  onToggleExpand,
  isFolderDisabled
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node._id);
  const isSelected = selectedFolderId === node._id;
  const disabled = isFolderDisabled(node);
  const folderColor = node.color || '#7C3AED';

  return (
    <div>
      <div
        className={`group flex items-center justify-between py-1.5 px-2 rounded-xl text-xs transition-all cursor-pointer select-none my-0.5 ${
          disabled
            ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
            : isSelected
            ? 'bg-brand-600 text-white font-bold shadow-xs'
            : 'hover:bg-slate-100/90 text-slate-700'
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 18 + 8)}px` }}
        onClick={() => {
          if (!disabled) {
            onSelectFolder(node._id, node.name, node);
          }
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {/* Expand/Collapse Toggle Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node._id);
              }}
              className={`p-0.5 rounded-md hover:bg-black/10 transition-transform shrink-0 ${
                isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4.5 shrink-0" />
          )}

          {/* Folder Icon */}
          <div
            className="p-1 rounded-md text-white shrink-0 flex items-center justify-center transition-transform"
            style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : folderColor }}
          >
            {isExpanded || isSelected ? (
              <FolderOpen className="w-3.5 h-3.5 fill-current" />
            ) : (
              <FolderIcon className="w-3.5 h-3.5 fill-current" />
            )}
          </div>

          {/* Folder Name */}
          <span className="truncate">{node.name}</span>

          {/* Subfolder counter */}
          {hasChildren && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-normal ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-500'
              }`}
            >
              {node.children.length}
            </span>
          )}
        </div>

        {/* Selected Checkmark Indicator */}
        {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
      </div>

      {/* Recursive Children (Subfolders) */}
      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Subtle Indentation guide line */}
          <div
            className="absolute top-0 bottom-0 border-l border-slate-200/80 pointer-events-none"
            style={{ left: `${depth * 18 + 16}px` }}
          />
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              depth={depth + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              isFolderDisabled={isFolderDisabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MoveModal() {
  const { moveModalItem, setMoveModalItem, moveItemAction, bulkMoveAction } = useDriveStore();
  const [allFolders, setAllFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFolderObj, setSelectedFolderObj] = useState(null);
  const [selectedFolderName, setSelectedFolderName] = useState('My Drive');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBulk = moveModalItem?.isBulk;
  const item = moveModalItem?.item;
  const itemType = moveModalItem?.type;

  useEffect(() => {
    if (moveModalItem) {
      loadAllFolders();
      setSelectedFolderId(null);
      setSelectedFolderObj(null);
      setSelectedFolderName('My Drive (Root)');
      setSearchQuery('');
    }
  }, [moveModalItem]);

  const loadAllFolders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/folders?all=true');
      const folders = res.data.folders || [];
      setAllFolders(folders);

      // By default, auto-expand all top-level folders that have children
      const initialExpanded = new Set();
      folders.forEach((f) => {
        if (!f.parentFolder) {
          initialExpanded.add(f._id);
        }
      });
      setExpandedIds(initialExpanded);
    } catch (err) {
      console.error('Error loading folders for move:', err);
    }
    setIsLoading(false);
  };

  // Build hierarchical tree structure from flat list
  const folderTree = useMemo(() => {
    const map = {};
    const roots = [];

    // Filter by search query if any
    const filteredFolders = searchQuery.trim()
      ? allFolders.filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      : allFolders;

    if (searchQuery.trim()) {
      // If searching, return flat filtered list as roots for easy direct selection
      return filteredFolders.map((f) => ({ ...f, children: [] }));
    }

    allFolders.forEach((f) => {
      map[f._id] = { ...f, children: [] };
    });

    allFolders.forEach((f) => {
      if (f.parentFolder && map[f.parentFolder]) {
        map[f.parentFolder].children.push(map[f._id]);
      } else {
        if (map[f._id]) {
          roots.push(map[f._id]);
        }
      }
    });

    return roots;
  }, [allFolders, searchQuery]);

  const toggleExpand = (folderId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Prevent moving folder into itself or into its own subfolders
  const isFolderDisabled = (folder) => {
    if (!isBulk && itemType === 'folder' && item) {
      if (folder._id === item._id) return true;
      if (folder.path && folder.path.some((p) => p._id === item._id)) return true;
    }
    return false;
  };

  const handleSelectFolder = (id, name, folderObj = null) => {
    setSelectedFolderId(id);
    setSelectedFolderName(name);
    setSelectedFolderObj(folderObj);
  };

  const handleConfirmMove = async () => {
    setIsSubmitting(true);
    if (isBulk) {
      await bulkMoveAction(selectedFolderId, selectedFolderName);
    } else if (item) {
      await moveItemAction(item._id, itemType, selectedFolderId, selectedFolderName);
    }
    setIsSubmitting(false);
  };

  if (!moveModalItem) return null;

  // Build full path label for destination feedback
  const getDestinationPathDisplay = () => {
    if (!selectedFolderId || !selectedFolderObj) return 'My Drive';
    const pathParts = ['My Drive'];
    if (selectedFolderObj.path && selectedFolderObj.path.length > 0) {
      selectedFolderObj.path.forEach((p) => pathParts.push(p.name));
    }
    pathParts.push(selectedFolderObj.name);
    return pathParts.join(' > ');
  };

  return (
    <Modal
      isOpen={Boolean(moveModalItem)}
      onClose={() => setMoveModalItem(null)}
      title={isBulk ? 'Move Selected Items' : `Move "${item?.name}"`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-3.5">
        <p className="text-xs text-slate-500">
          Browse the folder tree and choose the exact destination subfolder:
        </p>

        {/* Quick Search Filter */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destination folder..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Folder Tree Box */}
        <div className="border border-slate-200/90 rounded-2xl p-2 bg-slate-50/80 max-h-72 overflow-y-auto space-y-0.5 scrollbar-thin">
          {/* Root Option: My Drive */}
          {!searchQuery && (
            <div
              onClick={() => handleSelectFolder(null, 'My Drive (Root)', null)}
              className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all select-none ${
                selectedFolderId === null
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <HardDrive className={`w-4 h-4 shrink-0 ${selectedFolderId === null ? 'text-white' : 'text-brand-600'}`} />
                <span>My Drive (Root)</span>
              </div>
              {selectedFolderId === null && <Check className="w-4 h-4 text-white shrink-0" />}
            </div>
          )}

          {/* Expandable Subfolders Tree */}
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
              <span className="text-xs">Loading folder tree...</span>
            </div>
          ) : folderTree.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {searchQuery ? 'No matching folders found' : 'No folders available'}
            </div>
          ) : (
            <div className="pt-1">
              {folderTree.map((rootFolder) => (
                <TreeNode
                  key={rootFolder._id}
                  node={rootFolder}
                  depth={0}
                  selectedFolderId={selectedFolderId}
                  onSelectFolder={handleSelectFolder}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                  isFolderDisabled={isFolderDisabled}
                />
              ))}
            </div>
          )}
        </div>

        {/* Full Destination Path Preview Banner */}
        <div className="p-3 bg-brand-50/80 border border-brand-100/90 rounded-xl flex items-center gap-2 text-xs text-brand-900 font-medium">
          <ArrowRight className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="truncate">
            Target Destination: <strong className="font-bold text-brand-700">{getDestinationPathDisplay()}</strong>
          </span>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMoveModalItem(null)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleConfirmMove}
          >
            Move Here
          </Button>
        </div>
      </div>
    </Modal>
  );
}
