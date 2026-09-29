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

  // UI State
  isLoading: false,
  viewMode: localStorage.getItem('auradrive_view_mode') || 'grid', // 'grid' | 'list'
  filterType: 'all', // 'all' | 'image' | 'document' | 'video' | 'audio'
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

  // Setters
  setViewMode: (mode) => {
    localStorage.setItem('auradrive_view_mode', mode);
    set({ viewMode: mode });
  },
  setFilterType: (type) => set({ filterType: type }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setPreviewItem: (item) => set({ previewItem: item }),
  setShareItem: (item) => set({ shareItem: item }),
  setRenameItem: (item) => set({ renameItem: item }),
  setDeleteConfirmItem: (item) => set({ deleteConfirmItem: item }),
  setIsCreateFolderOpen: (isOpen) => set({ isCreateFolderOpen: isOpen }),

  // Fetch folders and files in current directory
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
        isLoading: false
      });
    } catch (err) {
      console.error('Fetch drive content error:', err);
      set({ isLoading: false });
      toast.error('Failed to load drive items');
    }
  },

  // Create new folder
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

  // Upload file with progress tracking
  uploadFile: async (file, folderId = null) => {
    set({ isUploading: true, uploadProgress: 0 });
    const toastId = toast.loading(`Uploading "${file.name}"...`);

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

      // Add to current file view if matches current folder
      set((state) => ({
        files: [uploadedFile, ...state.files],
        isUploading: false,
        uploadProgress: 100
      }));

      // Refresh storage usage in auth store
      useAuthStore.getState().fetchMe();

      toast.success(`"${file.name}" uploaded successfully!`, { id: toastId });
      return { success: true, file: uploadedFile };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload file';
      set({ isUploading: false, uploadProgress: 0 });
      toast.error(msg, { id: toastId });
      return { success: false, message: msg };
    }
  },

  // Upload multiple files sequentially
  uploadMultipleFiles: async (filesList, folderId = null) => {
    const filesArray = Array.from(filesList);
    for (const file of filesArray) {
      await get().uploadFile(file, folderId);
    }
  },

  // Rename folder or file
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

  // Toggle Star
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

  // Move item to Trash / Restore
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

  // Permanent Delete
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

  // Toggle Sharing & Generate Link
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

  // Fetch Starred Page Content
  fetchStarred: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/files/starred');
      set({
        starredFiles: res.data.files || [],
        starredFolders: res.data.folders || [],
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Fetch Recent Page Content
  fetchRecent: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/files/recent');
      set({
        recentFiles: res.data.files || [],
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Fetch Trash Page Content
  fetchTrash: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/files/trash');
      set({
        trashFiles: res.data.files || [],
        trashFolders: res.data.folders || [],
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
    }
  },

  // Empty Trash Action
  emptyTrashAction: async () => {
    try {
      await api.delete('/files/trash/empty');
      set({ trashFiles: [], trashFolders: [] });
      toast.success('Trash emptied');
      useAuthStore.getState().fetchMe();
    } catch {
      toast.error('Failed to empty trash');
    }
  },

  // Perform Global Search
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

  // Fetch Storage Stats
  fetchStorageStats: async () => {
    try {
      const res = await api.get('/files/storage-stats');
      set({ storageStats: res.data.stats });
    } catch (err) {
      console.error('Storage stats error:', err);
    }
  }
}));
