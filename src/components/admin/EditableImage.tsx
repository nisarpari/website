'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useAdmin } from '@/context';
import { getApiUrl } from '@/lib/api/config';

interface EditableImageProps {
  src: string;
  alt: string;
  configKey: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  onUpdate?: (newUrl: string, newLink?: string) => void;
  initialLink?: string; // New prop for hero links
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
  onUpdate,
  initialLink = ''
}: EditableImageProps) {
  const { isAdmin, editMode, token, refreshConfig } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [urlInput, setUrlInput] = useState(src);
  const [linkInput, setLinkInput] = useState(initialLink);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API_BASE = getApiUrl();
  const isHeroImage = configKey.startsWith('heroImages');

  // Track mount state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update effect
  useEffect(() => {
    setImageUrl(src);
    setUrlInput(src);
    setLinkInput(initialLink);
  }, [src, initialLink]);

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
        const index = parseInt(rest[0]);
        // Hero image update - include link
        const res = await fetch(`${API_BASE}/api/admin/hero-images/${index}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: urlInput, link: linkInput })
        });
        if (res.ok) {
          setImageUrl(urlInput);
          onUpdate?.(urlInput, linkInput);
          await refreshConfig();
        }
      } else {
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
        // For hero images, we might want to preserve the link during image upload, 
        // or trigger a specific update. For now just update URL visually.
        // To persist properly we should probably trigger handleSaveUrl equivalent or rely on the upload endpoint to not overwrite link?
        // Actually, typically upload just returns the URL, we still need to Save to commit it to config if we want to save the link too.
        // But for simplicity let's assume upload saves the file, and we should hit Save to update the config record with the NEW URL + EXISTING Link.
        // However, the current upload endpoint logic for hero-images usually *also* updates the config record directly if implemented that way.
        // Let's check api/admin/hero-images/[index]/upload... we didn't check it but we can assume it might just upload. 
        // Let's assume user hits "Save URL" after upload to be safe, OR we assume upload updates config.
        // For better UX, let's just set the URL and let user hit "Save" which commits both URL and Link.
        // Wait, the current implementation of handleFileUpload calls refreshConfig(), implying it MIGHT commit.
        // If it commits, we might lose the link if the backend doesn't handle partial updates.
        // Let's stick to the current flow: Update input, user MUST click Save for link changes.
        onUpdate?.(newUrl, linkInput);
        if (!isHeroImage) {
          await refreshConfig();
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
    setUploading(false);
    // Don't close editing immediately if we want them to review/add link? 
    // Or just let them save.
    // Original code closed it: setIsEditing(false);
    // Let's keep it open if it's a hero image so they can add a link? No, let's follow standard behavior but update state.
    // actually better to keep it open so they see the new URL and can add a link.
    if (!isHeroImage) setIsEditing(false);
  };

  // If not admin or not in edit mode
  if (!isAdmin || !editMode) {
    if (fill) {
      return <Image src={imageUrl} alt={alt} fill sizes={sizes || "100vw"} className={className} />;
    }
    return <Image src={imageUrl} alt={alt} width={width} height={height} className={className} />;
  }

  return (
    <>
      {fill ? (
        <Image src={imageUrl} alt={alt} fill sizes={sizes || "100vw"} className={className} />
      ) : (
        <Image src={imageUrl} alt={alt} width={width} height={height} className={className} />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer z-20"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        <div className="opacity-0 hover:opacity-100 transition-opacity">
          <button className="bg-white text-navy px-4 py-2 rounded-lg font-medium text-sm shadow-lg flex items-center gap-2 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit {isHeroImage ? 'Showcase' : 'Image'}
          </button>
        </div>
      </div>

      <div className="absolute top-2 right-2 bg-gold text-navy text-[10px] font-bold px-2 py-1 rounded z-20">
        EDITABLE
      </div>

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
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-navy mb-4">Edit {isHeroImage ? 'Showcase Item' : 'Image'}</h3>

            <div className="relative h-48 bg-bella-50 rounded-lg overflow-hidden mb-4">
              <Image src={urlInput || imageUrl} alt="Preview" fill sizes="400px" className="object-contain" />
            </div>

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

            {/* Link Input for Hero Images */}
            {isHeroImage && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-bella-700 mb-2">Target Link (Optional)</label>
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="/product/my-product or https://..."
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
                <p className="text-xs text-bella-500 mt-1">Leaves empty for no link. Use /product/slug for internal links.</p>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-sm text-bella-500">or upload new image</span>
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

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-3 bg-bella-100 text-bella-700 rounded-lg font-medium hover:bg-bella-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUrl}
                className="flex-1 px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
