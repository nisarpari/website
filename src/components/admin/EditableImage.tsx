'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useAdmin } from '@/context';

interface EditableImageProps {
  src: string;
  alt: string;
  configKey: string; // e.g., "categoryImages.260" or "banners.hero.image"
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  onUpdate?: (newUrl: string) => void;
}

export function EditableImage({
  src,
  alt,
  configKey,
  fill = false,
  width,
  height,
  sizes,
  className = '',
  onUpdate
}: EditableImageProps) {
  const { isAdmin, editMode, token, refreshConfig } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [urlInput, setUrlInput] = useState(src);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Track mount state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update imageUrl when src prop changes
  useEffect(() => {
    setImageUrl(src);
    setUrlInput(src);
  }, [src]);

  const handleSaveUrl = async () => {
    if (!token || !urlInput) return;

    try {
      // Parse configKey to determine the API endpoint
      const [section, ...rest] = configKey.split('.');

      if (section === 'categoryImages') {
        const categoryId = rest[0];
        const res = await fetch(`${API_BASE}/api/admin/category-images/${categoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageUrl: urlInput })
        });
        if (res.ok) {
          setImageUrl(urlInput);
          onUpdate?.(urlInput);
          await refreshConfig();
        }
      } else if (section === 'heroImages') {
        // Hero image update - update the array at the specific index
        const index = parseInt(rest[0]);
        const res = await fetch(`${API_BASE}/api/admin/hero-images/${index}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: urlInput })
        });
        if (res.ok) {
          setImageUrl(urlInput);
          onUpdate?.(urlInput);
          await refreshConfig();
        }
      } else {
        // Generic config update
        const res = await fetch(`${API_BASE}/api/admin/config/${section}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ [rest.join('.')]: urlInput })
        });
        if (res.ok) {
          setImageUrl(urlInput);
          onUpdate?.(urlInput);
          await refreshConfig();
        }
      }
    } catch (error) {
      console.error('Failed to save image:', error);
    }
    setIsEditing(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!token) return;
    setUploading(true);

    try {
      const [section, ...rest] = configKey.split('.');
      const formData = new FormData();
      formData.append('image', file);

      let endpoint = `${API_BASE}/api/admin/upload`;

      if (section === 'categoryImages') {
        const categoryId = rest[0];
        endpoint = `${API_BASE}/api/admin/category-images/${categoryId}/upload`;
      } else if (section === 'heroImages') {
        const index = rest[0];
        endpoint = `${API_BASE}/api/admin/hero-images/${index}/upload`;
      } else {
        formData.append('folder', section);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        const newUrl = data.imageUrl || data.path || data.url;
        setImageUrl(newUrl);
        setUrlInput(newUrl);
        onUpdate?.(newUrl);
        await refreshConfig();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
    setUploading(false);
    setIsEditing(false);
  };

  // If not admin or not in edit mode, render normal image
  if (!isAdmin || !editMode) {
    if (fill) {
      return <Image src={imageUrl} alt={alt} fill sizes={sizes || "100vw"} className={className} />;
    }
    return <Image src={imageUrl} alt={alt} width={width} height={height} className={className} />;
  }

  // Admin edit mode - show editable overlay
  // For fill images, we need absolute positioning to match parent's dimensions
  return (
    <>
      {fill ? (
        <Image src={imageUrl} alt={alt} fill sizes={sizes || "100vw"} className={className} />
      ) : (
        <Image src={imageUrl} alt={alt} width={width} height={height} className={className} />
      )}

      {/* Edit overlay - positioned absolutely to cover the image */}
      <div
        className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer z-20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Edit clicked for:', configKey);
          setIsEditing(true);
        }}
      >
        <div className="opacity-0 hover:opacity-100 transition-opacity">
          <button
            className="bg-white text-navy px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2 pointer-events-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Image
          </button>
        </div>
      </div>

      {/* Admin badge */}
      <div className="absolute top-2 right-2 bg-gold text-navy text-[10px] font-bold px-2 py-1 rounded z-20">
        EDITABLE
      </div>

      {/* Edit Modal - Rendered via Portal to escape Link component */}
      {mounted && isEditing && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(false);
          }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h3 className="text-lg font-bold text-navy mb-4">Edit Image</h3>

            {/* Preview */}
            <div className="relative h-48 bg-bella-50 rounded-lg overflow-hidden mb-4">
              <Image src={urlInput || imageUrl} alt="Preview" fill sizes="400px" className="object-contain" />
            </div>

            {/* URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-bella-700 mb-2">Image URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
              />
            </div>

            {/* Or Upload */}
            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-bella-500">or</span>
                <div className="flex-1 h-px bg-bella-200" />
              </div>
              <label
                className={`block w-full px-4 py-3 border-2 border-dashed border-bella-300 rounded-lg text-bella-600 hover:border-gold hover:text-gold transition-colors text-center cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                {uploading ? 'Uploading...' : 'Upload from Computer'}
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className="flex-1 px-4 py-3 bg-bella-100 text-bella-700 rounded-lg font-medium hover:bg-bella-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSaveUrl();
                }}
                className="flex-1 px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
              >
                Save URL
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
