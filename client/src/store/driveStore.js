import { create } from 'zustand';
import api from '../api/apiClient';
import toast from 'react-hot-toast';
import { useAuthStore } from './authStore';

export const useDriveStore = create((set, get) => ({
  // Data State
  folders: [],
  files: [],
  currentFolder: null,
  starredFiles: [],
  starredFolders: [],
  recentFiles: [],
  trashFiles: [],
  trashFolders: [],
  searchResults: { files: [], folders: [] },
  storageStats: null,

  // Selection State for Bulk Actions
  selectedFileIds: [],
  selectedFolderIds: [],

  // UI State
  isLoading: false,
  viewMode: localStorage.getItem('auradrive_view_mode') || 'grid', // 'grid' | 'list'
  filterType: 'all', // 'all' | 'image' | 'document' | 'video' | 'audio'
  activeTagFilter: null, // tag string or null
  searchQuery: '',

  // Upload State
  isUploading: false,
  uploadProgress: 0,
  uploadQueue: [],

  // Modals & Active Elements
  previewItem: null,
  shareItem: null,
  renameItem: null, // { item, type: 'file' | 'folder' }
  deleteConfirmItem: null, // { item, type: 'file' | 'folder', isPermanent: boolean }
  isCreateFolderOpen: false,
  versionHistoryItem: null, // File object currently being inspected for versions
  tagModalItem: null, // { item, type: 'file' | 'folder', isBulk?: boolean }
  moveModalItem: null, // { item, type: 'file' | 'folder', isBulk?: boolean }
  isDownloadingZip: false,

  // Setters
  setViewMode: (mode) => {
    localStorage.setItem('auradrive_view_mode', mode);
    set({ viewMode: mode });
  },
  setFilterType: (type) => set({ filterType: type }),
  setActiveTagFilter: (tag) => set({ activeTagFilter: tag }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPreviewItem: (item) => set({ previewItem: item }),
  setShareItem: (item) => set({ shareItem: item }),
  setRenameItem: (item) => set({ renameItem: item }),
  setDeleteConfirmItem: (item) => set({ deleteConfirmItem: item }),
  setIsCreateFolderOpen: (isOpen) => set({ isCreateFolderOpen: isOpen }),
  setVersionHistoryItem: (item) => set({ versionHistoryItem: item }),
  setTagModalItem: (item) => set({ tagModalItem: item }),
  setMoveModalItem: (item) => set({ moveModalItem: item }),

  // --- SELECTION ACTIONS ---
  toggleSelectItem: (id, type, isMulti = false) => {
    if (type === 'file') {
      const current = get().selectedFileIds;
      if (current.includes(id)) {
        set({ selectedFileIds: current.filter((item) => item !== id) });
      } else {
        set({
          selectedFileIds: isMulti ? [...current, id] : [id],
          selectedFolderIds: isMulti ? get().selectedFolderIds : []
        });
      }
    } else {
      const current = get().selectedFolderIds;
      if (current.includes(id)) {
        set({ selectedFolderIds: current.filter((item) => item !== id) });
      } else {
        set({
          selectedFolderIds: isMulti ? [...current, id] : [id],
          selectedFileIds: isMulti ? get().selectedFileIds : []
        });
      }
    }
  },

  selectAll: (fileList = [], folderList = []) => {
    set({
      selectedFileIds: fileList.map((f) => f._id),
      selectedFolderIds: folderList.map((f) => f._id)
    });
  },

  clearSelection: () => {
    set({ selectedFileIds: [], selectedFolderIds: [] });
  },

  // --- FETCH CONTENT ---
  fetchDriveContent: async (folderId = null) => {
    set({ isLoading: true });
    try {
      const type = get().filterType !== 'all' ? get().filterType : '';
      const params = {};
      if (folderId && folderId !== 'root') params.folderId = folderId;
      if (type) params.type = type;

      const folderParams = {};
      if (folderId && folderId !== 'root') folderParams.parentId = folderId;

      const [foldersRes, filesRes] = await Promise.all([
        api.get('/folders', { params: folderParams }),
        api.get('/files', { params })
      ]);

      set({
        folders: foldersRes.data.folders || [],
        currentFolder: foldersRes.data.currentFolder || null,
        files: filesRes.data.files || [],
        isLoading: false,
        selectedFileIds: [],
        selectedFolderIds: []
      });
    } catch (err) {
      console.error('Fetch drive content error:', err);
      set({ isLoading: false });
      toast.error('Failed to load drive items');
    }
  },

  // --- CREATE FOLDER ---
  createFolder: async (name, parentFolderId = null, color = '#7C3AED') => {
    try {
      const res = await api.post('/folders', {
        name,
        parentFolderId: parentFolderId || get().currentFolder?._id || null,
        color
      });
      const newFolder = res.data.folder;
      set((state) => ({ folders: [newFolder, ...state.folders] }));
      toast.success(`Folder "${name}" created`);
      return { success: true, folder: newFolder };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create folder';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  // --- CHUNKED UPLOAD (For files > 10MB or large transfers) ---
  uploadChunkedFile: async (file, folderId = null, toastId = null) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `chunk_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const targetFolderId = folderId !== undefined ? folderId : get().currentFolder?._id;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunkBlob = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunkBlob, file.name);
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', totalChunks);
      formData.append('originalName', file.name);
      formData.append('mimetype', file.type || 'application/octet-stream');
      if (targetFolderId) {
        formData.append('folderId', targetFolderId);
      }

      const res = await api.post('/files/chunk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const currentPercent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      set({ uploadProgress: currentPercent });

      if (res.data.isComplete && res.data.file) {
        const uploadedFile = res.data.file;
        set((state) => ({
          files: state.files.some((f) => f._id === uploadedFile._id)
            ? state.files.map((f) => (f._id === uploadedFile._id ? uploadedFile : f))
            : [uploadedFile, ...state.files],
          isUploading: false,
          uploadProgress: 100
        }));

        useAuthStore.getState().fetchMe();
        toast.success(res.data.message || `"${file.name}" uploaded successfully!`, { id: toastId });
        return { success: true, file: uploadedFile };
      }
    }
  },

  // --- REGULAR OR AUTO-CHUNKED UPLOAD ---
  uploadFile: async (file, folderId = null) => {
    set({ isUploading: true, uploadProgress: 0 });
    const toastId = toast.loading(`Uploading "${file.name}"...`);

    // If file > 10MB, use Chunked Upload!
    if (file.size > 10 * 1024 * 1024) {
      try {
        return await get().uploadChunkedFile(file, folderId, toastId);
      } catch (err) {
        console.error('Chunked upload error:', err);
        set({ isUploading: false, uploadProgress: 0 });
        toast.error('Large file upload failed', { id: toastId });
        return { success: false };
      }
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const targetFolderId = folderId !== undefined ? folderId : get().currentFolder?._id;
      if (targetFolderId) {
        formData.append('folderId', targetFolderId);
      }

      const res = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          set({ uploadProgress: percentCompleted });
        }
      });

      const uploadedFile = res.data.file;

      set((state) => ({
        files: state.files.some((f) => f._id === uploadedFile._id)
          ? state.files.map((f) => (f._id === uploadedFile._id ? uploadedFile : f))
          : [uploadedFile, ...state.files],
        isUploading: false,
        uploadProgress: 100
      }));

      useAuthStore.getState().fetchMe();

      toast.success(res.data.message || `"${file.name}" uploaded successfully!`, { id: toastId });
      return { success: true, file: uploadedFile };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload file';
      set({ isUploading: false, uploadProgress: 0 });
      toast.error(msg, { id: toastId });
      return { success: false, message: msg };
    }
  },

  uploadMultipleFiles: async (filesList, folderId = null) => {
    const filesArray = Array.from(filesList);
    for (const file of filesArray) {
      await get().uploadFile(file, folderId);
    }
  },

  // --- ZIP ARCHIVE DOWNLOAD ---
  downloadZipAction: async (fileIds = [], folderIds = []) => {
    const activeFileIds = fileIds.length > 0 ? fileIds : get().selectedFileIds;
    const activeFolderIds = folderIds.length > 0 ? folderIds : get().selectedFolderIds;

    if (activeFileIds.length === 0 && activeFolderIds.length === 0) {
      toast.error('No items selected for download');
      return;
    }

    set({ isDownloadingZip: true });
    const toastId = toast.loading('Generating ZIP archive...');

    try {
      const response = await api.post(
        '/files/download-zip',
        { fileIds: activeFileIds, folderIds: activeFolderIds },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `AuraDrive_Archive_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      set({ isDownloadingZip: false });
      toast.success('ZIP download started!', { id: toastId });
    } catch (err) {
      console.error('Download ZIP error:', err);
      set({ isDownloadingZip: false });
      toast.error('Failed to generate ZIP archive', { id: toastId });
    }
  },

  downloadFolderZipAction: async (folderId, folderName = 'Folder') => {
    const toastId = toast.loading(`Zipping folder "${folderName}"...`);
    try {
      const response = await api.get(`/folders/${folderId}/download-zip`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/zip' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${folderName.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`"${folderName}" ZIP downloaded!`, { id: toastId });
    } catch (err) {
      console.error('Download folder zip error:', err);
      toast.error('Failed to download folder as ZIP', { id: toastId });
    }
  },

  // --- VERSION HISTORY ACTIONS ---
  fetchFileVersions: async (fileId) => {
    try {
      const res = await api.get(`/files/${fileId}/versions`);
      return res.data;
    } catch (err) {
      toast.error('Failed to load version history');
      return null;
    }
  },

  restoreFileVersion: async (fileId, versionNumber) => {
    const toastId = toast.loading(`Restoring version v${versionNumber}...`);
    try {
      const res = await api.put(`/files/${fileId}/restore-version/${versionNumber}`);
      const updated = res.data.file;

      set((state) => ({
        files: state.files.map((f) => (f._id === fileId ? updated : f)),
        versionHistoryItem: updated,
        previewItem: state.previewItem?._id === fileId ? updated : state.previewItem
      }));

      useAuthStore.getState().fetchMe();
      toast.success(res.data.message || `Version v${versionNumber} restored!`, { id: toastId });
      return { success: true, file: updated };
    } catch (err) {
      toast.error('Failed to restore version', { id: toastId });
      return { success: false };
    }
  },

  deleteFileVersion: async (fileId, versionNumber) => {
    const toastId = toast.loading(`Deleting version v${versionNumber}...`);
    try {
      const res = await api.delete(`/files/${fileId}/versions/${versionNumber}`);
      const updated = res.data.file;

      set((state) => ({
        files: state.files.map((f) => (f._id === fileId ? updated : f)),
        versionHistoryItem: updated
      }));

      toast.success(`Version v${versionNumber} deleted`, { id: toastId });
      return { success: true, file: updated };
    } catch (err) {
      toast.error('Failed to delete version', { id: toastId });
      return { success: false };
    }
  },

  // --- TAGGING ACTIONS ---
  updateItemTags: async (id, type, tags) => {
    try {
      if (type === 'folder') {
        const res = await api.put(`/folders/${id}/tags`, { tags });
        const updated = res.data.folder;
        set((state) => ({
          folders: state.folders.map((f) => (f._id === id ? updated : f)),
          starredFolders: state.starredFolders.map((f) => (f._id === id ? updated : f))
        }));
      } else {
        const res = await api.put(`/files/${id}/tags`, { tags });
        const updated = res.data.file;
        set((state) => ({
          files: state.files.map((f) => (f._id === id ? updated : f)),
          starredFiles: state.starredFiles.map((f) => (f._id === id ? updated : f)),
          recentFiles: state.recentFiles.map((f) => (f._id === id ? updated : f))
        }));
      }
      toast.success('Tags updated');
      return { success: true };
    } catch (err) {
      toast.error('Failed to update tags');
      return { success: false };
    }
  },

  bulkTagAction: async (tag, action = 'add') => {
    const { selectedFileIds, selectedFolderIds } = get();
    if (selectedFileIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      await api.post('/files/bulk-tag', {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
        tag,
        action
      });

      // Refresh current drive view
      get().fetchDriveContent(get().currentFolder?._id);
      toast.success(action === 'add' ? `Tag "${tag.name}" added` : `Tag "${tag.name}" removed`);
      set({ tagModalItem: null });
    } catch (err) {
      toast.error('Bulk tag failed');
    }
  },

  // --- BULK OPERATIONS ---
  bulkStarAction: async (isStarred = true) => {
    const { selectedFileIds, selectedFolderIds } = get();
    if (selectedFileIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      await api.post('/files/bulk-star', {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
        isStarred
      });

      set((state) => ({
        files: state.files.map((f) =>
          selectedFileIds.includes(f._id) ? { ...f, isStarred } : f
        ),
        folders: state.folders.map((f) =>
          selectedFolderIds.includes(f._id) ? { ...f, isStarred } : f
        ),
        selectedFileIds: [],
        selectedFolderIds: []
      }));

      toast.success(isStarred ? 'Selected items starred' : 'Selected items unstarred');
    } catch (err) {
      toast.error('Bulk star action failed');
    }
  },

  bulkTrashAction: async (trash = true) => {
    const { selectedFileIds, selectedFolderIds } = get();
    if (selectedFileIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      await api.post('/files/bulk-trash', {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
        trash
      });

      set((state) => ({
        files: state.files.filter((f) => !selectedFileIds.includes(f._id)),
        folders: state.folders.filter((f) => !selectedFolderIds.includes(f._id)),
        starredFiles: state.starredFiles.filter((f) => !selectedFileIds.includes(f._id)),
        starredFolders: state.starredFolders.filter((f) => !selectedFolderIds.includes(f._id)),
        selectedFileIds: [],
        selectedFolderIds: []
      }));

      toast.success(trash ? 'Selected items moved to Trash' : 'Selected items restored');
    } catch (err) {
      toast.error('Bulk trash action failed');
    }
  },

  bulkDeleteAction: async () => {
    const { selectedFileIds, selectedFolderIds } = get();
    if (selectedFileIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      await api.post('/files/bulk-delete', {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds
      });

      set((state) => ({
        trashFiles: state.trashFiles.filter((f) => !selectedFileIds.includes(f._id)),
        trashFolders: state.trashFolders.filter((f) => !selectedFolderIds.includes(f._id)),
        selectedFileIds: [],
        selectedFolderIds: []
      }));

      useAuthStore.getState().fetchMe();
      toast.success('Selected items permanently deleted');
    } catch (err) {
      toast.error('Bulk permanent delete failed');
    }
  },

  // --- MOVE ACTIONS ---
  moveItemAction: async (id, type, targetFolderId = null, targetFolderName = 'target folder') => {
    try {
      if (type === 'folder') {
        await api.put(`/folders/${id}/move`, { targetParentId: targetFolderId });
        set((state) => ({
          folders: state.folders.filter((f) => f._id !== id)
        }));
      } else {
        await api.put(`/files/${id}/move`, { targetFolderId });
        set((state) => ({
          files: state.files.filter((f) => f._id !== id)
        }));
      }

      toast.success(`Moved to ${targetFolderName}`);
      set({ moveModalItem: null });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Move operation failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  bulkMoveAction: async (targetFolderId = null, targetFolderName = 'target folder') => {
    const { selectedFileIds, selectedFolderIds } = get();
    if (selectedFileIds.length === 0 && selectedFolderIds.length === 0) return;

    try {
      await api.post('/files/bulk-move', {
        fileIds: selectedFileIds,
        folderIds: selectedFolderIds,
        targetFolderId
      });

      set((state) => ({
        files: state.files.filter((f) => !selectedFileIds.includes(f._id)),
        folders: state.folders.filter((f) => !selectedFolderIds.includes(f._id)),
        selectedFileIds: [],
        selectedFolderIds: [],
        moveModalItem: null
      }));

      toast.success(`Items moved to ${targetFolderName}`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Bulk move failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  },

  getAllFolders: async () => {
    try {
      const res = await api.get('/folders');
      return res.data.folders || [];
    } catch (err) {
      return [];
    }
  },

  // --- RENAME & SINGLE ACTIONS ---
  renameItemAction: async (id, newName, type) => {
    try {
      if (type === 'folder') {
        const res = await api.put(`/folders/${id}/rename`, { name: newName });
        const updated = res.data.folder;
        set((state) => ({
          folders: state.folders.map((f) => (f._id === id ? updated : f)),
          starredFolders: state.starredFolders.map((f) => (f._id === id ? updated : f))
        }));
      } else {
        const res = await api.put(`/files/${id}/rename`, { name: newName });
        const updated = res.data.file;
        set((state) => ({
          files: state.files.map((f) => (f._id === id ? updated : f)),
          starredFiles: state.starredFiles.map((f) => (f._id === id ? updated : f)),
          recentFiles: state.recentFiles.map((f) => (f._id === id ? updated : f))
        }));
      }
      toast.success('Renamed successfully');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rename failed');
      return { success: false };
    }
  },

  toggleStar: async (id, type) => {
    try {
      if (type === 'folder') {
        const res = await api.put(`/folders/${id}/star`);
        const updated = res.data.folder;
        set((state) => ({
          folders: state.folders.map((f) => (f._id === id ? updated : f)),
          starredFolders: updated.isStarred
            ? [...state.starredFolders, updated]
            : state.starredFolders.filter((f) => f._id !== id)
        }));
        toast.success(updated.isStarred ? 'Added to starred' : 'Removed from starred');
      } else {
        const res = await api.put(`/files/${id}/star`);
        const updated = res.data.file;
        set((state) => ({
          files: state.files.map((f) => (f._id === id ? updated : f)),
          starredFiles: updated.isStarred
            ? [...state.starredFiles, updated]
            : state.starredFiles.filter((f) => f._id !== id),
          recentFiles: state.recentFiles.map((f) => (f._id === id ? updated : f))
        }));
        toast.success(updated.isStarred ? 'Added to starred' : 'Removed from starred');
      }
    } catch {
      toast.error('Failed to update star');
    }
  },

  trashAction: async (id, type, trash = true) => {
    try {
      if (type === 'folder') {
        await api.put(`/folders/${id}/trash`, { trash });
        set((state) => ({
          folders: state.folders.filter((f) => f._id !== id),
          starredFolders: state.starredFolders.filter((f) => f._id !== id),
          trashFolders: trash
            ? state.trashFolders
            : state.trashFolders.filter((f) => f._id !== id)
        }));
      } else {
        await api.put(`/files/${id}/trash`, { trash });
        set((state) => ({
          files: state.files.filter((f) => f._id !== id),
          starredFiles: state.starredFiles.filter((f) => f._id !== id),
          recentFiles: state.recentFiles.filter((f) => f._id !== id),
          trashFiles: trash
            ? state.trashFiles
            : state.trashFiles.filter((f) => f._id !== id)
        }));
      }
      toast.success(trash ? 'Moved to Trash' : 'Restored successfully');
    } catch {
      toast.error('Operation failed');
    }
  },

  deletePermanently: async (id, type) => {
    try {
      if (type === 'folder') {
        await api.delete(`/folders/${id}`);
        set((state) => ({
          trashFolders: state.trashFolders.filter((f) => f._id !== id)
        }));
      } else {
        await api.delete(`/files/${id}`);
        set((state) => ({
          trashFiles: state.trashFiles.filter((f) => f._id !== id)
        }));
        useAuthStore.getState().fetchMe();
      }
      toast.success('Permanently deleted');
    } catch {
      toast.error('Failed to delete permanently');
    }
  },

  toggleShare: async (fileId, isPublic) => {
    try {
      const res = await api.put(`/files/${fileId}/share`, { isPublic });
      const updated = res.data.file;
      set((state) => ({
        files: state.files.map((f) => (f._id === fileId ? updated : f)),
        shareItem: updated
      }));
      toast.success(updated.isPublic ? 'Public link generated' : 'Sharing disabled');
      return updated;
    } catch {
      toast.error('Failed to update share settings');
    }
  },

  fetchStarred: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/files/starred');
      set({
        starredFiles: res.data.files || [],
        starredFolders: res.data.folders || [],
        isLoading: false,
        selectedFileIds: [],
        selectedFolderIds: []
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchRecent: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/files/recent');
      set({
        recentFiles: res.data.files || [],
        isLoading: false,
        selectedFileIds: [],
        selectedFolderIds: []
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTrash: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/files/trash');
      set({
        trashFiles: res.data.files || [],
        trashFolders: res.data.folders || [],
        isLoading: false,
        selectedFileIds: [],
        selectedFolderIds: []
      });
    } catch {
      set({ isLoading: false });
    }
  },

  emptyTrashAction: async () => {
    try {
      await api.delete('/files/trash/empty');
      set({ trashFiles: [], trashFolders: [], selectedFileIds: [], selectedFolderIds: [] });
      toast.success('Trash emptied');
      useAuthStore.getState().fetchMe();
    } catch {
      toast.error('Failed to empty trash');
    }
  },

  searchItems: async (query) => {
    if (!query.trim()) {
      set({ searchResults: { files: [], folders: [] } });
      return;
    }
    try {
      const res = await api.get('/files/search', { params: { q: query } });
      set({
        searchResults: {
          files: res.data.files || [],
          folders: res.data.folders || []
        }
      });
    } catch {
      // ignore
    }
  },

  fetchStorageStats: async () => {
    try {
      const res = await api.get('/files/storage-stats');
      set({ storageStats: res.data.stats });
    } catch (err) {
      console.error('Storage stats error:', err);
    }
  }
}));
