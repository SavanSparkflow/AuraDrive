import { create } from 'zustand';
import api from '../api/apiClient';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('auradrive_user') || 'null'),
  token: localStorage.getItem('auradrive_token') || null,
  isAuthenticated: !!localStorage.getItem('auradrive_token'),
  isLoading: false,
  error: null,

  // Login action
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user } = response.data;
      const { token, ...userData } = user;

      localStorage.setItem('auradrive_token', token);
      localStorage.setItem('auradrive_user', JSON.stringify(userData));

      set({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  // Register action
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user } = response.data;
      const { token, ...userData } = user;

      localStorage.setItem('auradrive_token', token);
      localStorage.setItem('auradrive_user', JSON.stringify(userData));

      set({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ isLoading: false, error: msg });
      return { success: false, message: msg };
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('auradrive_token');
    localStorage.removeItem('auradrive_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  // Update user profile info
  updateProfile: async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      const updated = res.data.user;
      localStorage.setItem('auradrive_user', JSON.stringify(updated));
      set({ user: updated });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  },

  // Refresh profile & storage usage
  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.user;
      localStorage.setItem('auradrive_user', JSON.stringify(userData));
      set({ user: userData });
    } catch (err) {
      console.error('Failed to sync user data', err);
    }
  }
}));
