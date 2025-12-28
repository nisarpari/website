'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl } from '@/lib/api/config';

const API_BASE = getApiUrl();

interface SiteConfig {
  categoryImages: Record<string, string>;
  hiddenCategories: string[];
  banners: {
    hero: { image: string; mobileImage: string; title: string; subtitle: string };
    promo: { enabled: boolean; image: string; link: string; text: string };
  };
  customTexts: Record<string, string>;
  [key: string]: unknown;
}

interface AdminContextType {
  isAdmin: boolean;
  token: string | null;
  siteConfig: SiteConfig | null;
  editMode: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  toggleEditMode: () => void;
  updateCategoryImage: (categoryId: string, imageUrl: string) => Promise<boolean>;
  uploadCategoryImage: (categoryId: string, file: File) => Promise<string | null>;
  updateConfig: (section: string, data: Record<string, unknown>) => Promise<boolean>;
  toggleCategoryVisibility: (categoryId: string) => Promise<boolean>;
  isCategoryHidden: (categoryId: string) => boolean;
  refreshConfig: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check for existing session on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedToken = sessionStorage.getItem('bella_admin_token');
      if (savedToken) {
        setToken(savedToken);
        setIsAdmin(true);
        setEditMode(true); // Auto-enable edit mode for admins
      }
    }
    // Load site config
    refreshConfig();
  }, []);

  const refreshConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/config`);
      if (res.ok) {
        const config = await res.json();
        setSiteConfig(config);
      }
    } catch (error) {
      console.error('Failed to load site config:', error);
    }
  };

  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setIsAdmin(true);
        setEditMode(true);
        sessionStorage.setItem('bella_admin_token', data.token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setToken(null);
    setEditMode(false);
    sessionStorage.removeItem('bella_admin_token');
  };

  const toggleEditMode = () => {
    if (isAdmin) {
      setEditMode(!editMode);
    }
  };

  const updateCategoryImage = async (categoryId: string, imageUrl: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/api/admin/category-images/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
      });
      if (res.ok) {
        await refreshConfig();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const uploadCategoryImage = async (categoryId: string, file: File): Promise<string | null> => {
    if (!token) return null;
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'categories');

      const res = await fetch(`${API_BASE}/api/admin/category-images/${categoryId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        await refreshConfig();
        return data.imageUrl;
      }
      return null;
    } catch {
      return null;
    }
  };

  const updateConfig = async (section: string, data: Record<string, unknown>): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/api/admin/config/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await refreshConfig();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleCategoryVisibility = async (categoryId: string): Promise<boolean> => {
    console.log('toggleCategoryVisibility called with:', categoryId, 'token:', token ? 'present' : 'missing');
    if (!token) {
      console.error('No token available for visibility toggle');
      return false;
    }
    try {
      const url = `${API_BASE}/api/admin/categories/${categoryId}/toggle-visibility`;
      console.log('Fetching:', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Toggle response:', data);
        await refreshConfig();
        return true;
      }
      const errorData = await res.json();
      console.error('Toggle failed:', errorData);
      return false;
    } catch (err) {
      console.error('Toggle error:', err);
      return false;
    }
  };

  const isCategoryHidden = (categoryId: string): boolean => {
    if (!siteConfig?.hiddenCategories) return false;
    return siteConfig.hiddenCategories.includes(categoryId.toString());
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      token,
      siteConfig,
      editMode,
      login,
      logout,
      toggleEditMode,
      updateCategoryImage,
      uploadCategoryImage,
      updateConfig,
      toggleCategoryVisibility,
      isCategoryHidden,
      refreshConfig
    }}>
      {/* Admin Toolbar - Fixed at top, above everything */}
      {mounted && isAdmin && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] px-4 py-2 shadow-lg flex items-center justify-center gap-4"
          style={{ background: 'linear-gradient(to right, #9333ea, #4f46e5)', color: '#ffffff' }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>ADMIN MODE</span>
          </div>
          <div className="h-4 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <button
            type="button"
            onClick={toggleEditMode}
            className="px-4 py-1 rounded-full text-xs font-semibold transition-all"
            style={editMode
              ? { backgroundColor: '#4ade80', color: '#14532d', boxShadow: '0 10px 15px -3px rgba(74, 222, 128, 0.3)' }
              : { backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }
            }
          >
            {editMode ? '✓ Editing ON' : 'Editing OFF'}
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-1 rounded-full text-xs font-semibold transition-colors"
            style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
          >
            Logout
          </button>
        </div>
      )}
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
