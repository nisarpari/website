'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useAdmin } from '@/context';
import { EditableImage } from '@/components/admin';
import { OdooAPI, type Category, type Product } from '@/lib/api/odoo';
import { getApiUrl } from '@/lib/api/config';

// Types for category landing content
interface CategoryFeature {
  icon: string;
  title: string;
  description: string;
}

interface CategoryLandingContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  description?: string;
  features?: CategoryFeature[];
  productSectionTitle?: string;
}

// Default features to show when no custom features are set
const DEFAULT_FEATURES: CategoryFeature[] = [
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Quality Assured', description: 'Premium materials' },
  { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', title: 'Fast Delivery', description: 'Secure packaging' },
  { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', description: '30-day return policy' },
  { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: 'Expert Support', description: 'Dedicated assistance' }
];

// Feature icon options for admin to choose from
const FEATURE_ICON_OPTIONS = [
  { name: 'Shield', path: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { name: 'Box', path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'Refresh', path: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { name: 'Support', path: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Star', path: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { name: 'Water', path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { name: 'Check Circle', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Cog', path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'Lightning', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { name: 'Clock', path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Truck', path: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  { name: 'Badge', path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
];

// Component for 2x2 product grid with edit functionality
function CategoryGridWithEditor({
  products,
  subCatId,
  subCatName,
  onImageUpdate
}: {
  products: Product[];
  subCatId: number;
  subCatName: string;
  onImageUpdate: (catId: string, imageUrl: string) => void;
}) {
  const { isAdmin, editMode, token, refreshConfig } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API_BASE = getApiUrl();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveUrl = async () => {
    if (!token || !urlInput) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/category-images/${subCatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl: urlInput })
      });
      if (res.ok) {
        onImageUpdate(subCatId.toString(), urlInput);
        await refreshConfig();
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
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/api/admin/category-images/${subCatId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const newUrl = data.imageUrl || data.path || data.url;
        onImageUpdate(subCatId.toString(), newUrl);
        await refreshConfig();
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
    setUploading(false);
    setIsEditing(false);
  };

  return (
    <div className="relative h-full">
      {/* 2x2 Product Grid */}
      <div className="grid grid-cols-2 gap-0.5 h-full">
        {products.slice(0, 4).map((product, idx) => (
          <div key={idx} className="relative">
            <Image
              src={product.thumbnail || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Admin edit overlay */}
      {isAdmin && editMode && (
        <>
          <div
            className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center cursor-pointer z-10"
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
                Edit Image
              </button>
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-gold text-navy text-[10px] font-bold px-2 py-1 rounded z-20">
            EDITABLE
          </div>
        </>
      )}

      {/* Edit Modal */}
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
            <h3 className="text-lg font-bold text-navy mb-4">Edit Image - {subCatName}</h3>

            {/* Preview - show current grid */}
            <div className="relative h-48 bg-bella-50 rounded-lg overflow-hidden mb-4">
              <div className="grid grid-cols-2 gap-0.5 h-full">
                {products.slice(0, 4).map((product, idx) => (
                  <div key={idx} className="relative">
                    <Image
                      src={product.thumbnail || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Current: Product Grid</span>
              </div>
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
    </div>
  );
}

// Admin Content Editor Modal
function ContentEditorModal({
  isOpen,
  onClose,
  content,
  onSave,
  categoryName
}: {
  isOpen: boolean;
  onClose: () => void;
  content: CategoryLandingContent;
  onSave: (content: CategoryLandingContent) => void;
  categoryName: string;
}) {
  const [editedContent, setEditedContent] = useState<CategoryLandingContent>(content);
  const [activeTab, setActiveTab] = useState<'hero' | 'description' | 'features'>('hero');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = () => {
    onSave(editedContent);
    onClose();
  };

  const updateFeature = (index: number, field: keyof CategoryFeature, value: string) => {
    const features = [...(editedContent.features || DEFAULT_FEATURES)];
    features[index] = { ...features[index], [field]: value };
    setEditedContent({ ...editedContent, features });
  };

  const addFeature = () => {
    const features = [...(editedContent.features || [])];
    features.push({ icon: FEATURE_ICON_OPTIONS[0].path, title: 'New Feature', description: 'Description' });
    setEditedContent({ ...editedContent, features });
  };

  const removeFeature = (index: number) => {
    const features = [...(editedContent.features || [])];
    features.splice(index, 1);
    setEditedContent({ ...editedContent, features });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-bella-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-navy">Edit Category Page - {categoryName}</h2>
            <button onClick={onClose} className="text-bella-400 hover:text-navy">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {(['hero', 'description', 'features'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  activeTab === tab ? 'bg-navy text-white' : 'bg-bella-100 text-bella-600 hover:bg-bella-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={editedContent.heroTitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, heroTitle: e.target.value })}
                  placeholder={`e.g., "Maximize Space with Contemporary Design"`}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
                <p className="text-xs text-bella-400 mt-1">Leave empty to use category name</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={editedContent.heroSubtitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, heroSubtitle: e.target.value })}
                  placeholder={`e.g., "Efficient Water Management with Our Concealed Cistern"`}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Hero Image URL</label>
                <input
                  type="text"
                  value={editedContent.heroImage || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, heroImage: e.target.value })}
                  placeholder="https://example.com/hero-image.jpg"
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
                <p className="text-xs text-bella-400 mt-1">Leave empty to use product image</p>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Category Description</label>
                <textarea
                  value={editedContent.description || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, description: e.target.value })}
                  placeholder="Enter a compelling description about this category..."
                  rows={6}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bella-700 mb-2">Product Section Title</label>
                <input
                  type="text"
                  value={editedContent.productSectionTitle || ''}
                  onChange={(e) => setEditedContent({ ...editedContent, productSectionTitle: e.target.value })}
                  placeholder={`e.g., "Explore Our Collection"`}
                  className="w-full px-4 py-3 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy"
                />
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              {(editedContent.features || DEFAULT_FEATURES).map((feature, index) => (
                <div key={index} className="p-4 bg-bella-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    {/* Icon Selector */}
                    <div className="flex-shrink-0">
                      <label className="block text-xs font-medium text-bella-500 mb-1">Icon</label>
                      <div className="relative">
                        <select
                          value={feature.icon}
                          onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          className="appearance-none w-20 h-12 pl-3 pr-8 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy bg-white"
                        >
                          {FEATURE_ICON_OPTIONS.map(opt => (
                            <option key={opt.name} value={opt.path}>{opt.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-bella-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Title & Description */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        placeholder="Feature Title"
                        className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy text-sm"
                      />
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        placeholder="Feature Description"
                        className="w-full px-3 py-2 border border-bella-200 rounded-lg focus:outline-none focus:border-gold text-navy text-sm"
                      />
                    </div>
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFeature(index)}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={addFeature}
                className="w-full py-3 border-2 border-dashed border-bella-300 rounded-lg text-bella-600 hover:border-gold hover:text-gold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Feature
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-bella-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-bella-100 text-bella-700 rounded-lg font-medium hover:bg-bella-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-dark"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CategoryLandingPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);
  const { t } = useLocale();
  const { isAdmin, editMode, token } = useAdmin();

  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [categoryProducts, setCategoryProducts] = useState<Record<number, Product[]>>({});
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [landingContent, setLandingContent] = useState<CategoryLandingContent>({});
  const [isEditingContent, setIsEditingContent] = useState(false);

  const API_BASE = getApiUrl();

  // Scroll to top when categoryId changes (navigating to a new category)
  useEffect(() => {
    // Force scroll to top immediately when category changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Fallback for browsers that don't support 'instant'
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [categoryId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch categories, products, category images, and landing content in parallel
      const [cats, mainProducts, catImages] = await Promise.all([
        OdooAPI.fetchPublicCategories(),
        OdooAPI.fetchProductsByPublicCategory(categoryId),
        OdooAPI.fetchCategoryImages()
      ]);

      // Fetch landing content
      try {
        const contentRes = await fetch(`${API_BASE}/api/admin/category-content/${categoryId}`);
        if (contentRes.ok) {
          const content = await contentRes.json();
          if (content) setLandingContent(content);
        }
      } catch (error) {
        console.error('Failed to fetch landing content:', error);
      }

      setCategories(cats);
      setCategoryImages(catImages);
      const cat = cats.find(c => c.id === categoryId);
      setCategory(cat || null);

      // If this is a leaf category (no children), redirect to shop page
      if (cat && (!cat.childIds || cat.childIds.length === 0)) {
        router.replace(`/shop?category=${categoryId}`);
        return;
      }

      if (mainProducts.length > 0) {
        setHeroProduct(mainProducts[0]);
      }

      // Fetch products for each child category to use as thumbnails
      if (cat && cat.childIds && cat.childIds.length > 0) {
        const productsMap: Record<number, Product[]> = {};

        // Fetch 4 products from each child category in parallel
        const childProductPromises = cat.childIds.map(async (childId) => {
          try {
            const products = await OdooAPI.fetchProductsByPublicCategory(childId, 4);
            return { childId, products };
          } catch (error) {
            console.error(`Failed to fetch products for category ${childId}:`, error);
            return { childId, products: [] };
          }
        });

        const results = await Promise.all(childProductPromises);
        results.forEach(({ childId, products }) => {
          productsMap[childId] = products;
        });

        setCategoryProducts(productsMap);
      }

      setLoading(false);
    };
    loadData();
  }, [categoryId, router, API_BASE]);

  const saveLandingContent = async (content: CategoryLandingContent) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/category-content/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });

      if (res.ok) {
        setLandingContent(content);
      }
    } catch (error) {
      console.error('Failed to save landing content:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Category not found</h1>
          <Link href="/shop" className="text-gold hover:text-gold-dark">
            {t('backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  const childCategories = categories.filter(c => category.childIds?.includes(c.id));

  // Get the best image for a subcategory - custom image, product image, or fallback
  const getSubcategoryImage = (subCatId: number): string => {
    // Check for custom image first
    if (categoryImages[subCatId.toString()]) {
      return categoryImages[subCatId.toString()];
    }
    // Then check product images
    const products = categoryProducts[subCatId];
    if (products && products.length > 0 && products[0].thumbnail) {
      return products[0].thumbnail;
    }
    // Fallback to a placeholder
    return 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80';
  };

  // Handle category image update - saves to server and updates local state
  const handleCategoryImageUpdate = async (catId: string, newUrl: string) => {
    const adminToken = sessionStorage.getItem('bella_admin_token');

    if (adminToken && newUrl) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/category-images/${catId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ imageUrl: newUrl })
        });
        if (res.ok) {
          setCategoryImages(prev => ({ ...prev, [catId]: newUrl }));
        }
      } catch (error) {
        console.error('Failed to save category image:', error);
      }
    } else {
      setCategoryImages(prev => ({ ...prev, [catId]: newUrl }));
    }
  };

  // Get display values with fallbacks
  const heroTitle = landingContent.heroTitle || category.name;
  const heroSubtitle = landingContent.heroSubtitle || '';
  const heroImage = landingContent.heroImage || heroProduct?.image;
  const description = landingContent.description || '';
  const features = landingContent.features || DEFAULT_FEATURES;
  const productSectionTitle = landingContent.productSectionTitle || `Explore ${category.name}`;

  return (
    <div className="min-h-screen bg-bella-50">
      {/* Admin Edit Button */}
      {isAdmin && editMode && (
        <button
          onClick={() => setIsEditingContent(true)}
          className="fixed bottom-6 right-6 z-50 bg-navy text-white px-6 py-3 rounded-full shadow-lg hover:bg-navy-dark flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Page Content
        </button>
      )}

      {/* Content Editor Modal */}
      <ContentEditorModal
        isOpen={isEditingContent}
        onClose={() => setIsEditingContent(false)}
        content={landingContent}
        onSave={saveLandingContent}
        categoryName={category.name}
      />

      {/* Hero */}
      <section className="relative h-[250px] md:h-[350px] overflow-hidden bg-navy">
        {heroImage && (
          <Image
            src={heroImage}
            alt={category.name}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/80 to-navy/60" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center text-sm text-white/70 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/shop" className="hover:text-white">Shop</Link>
              <span className="mx-2">/</span>
              {/* Show Basin & WC for Washroom/Washlet categories */}
              {(category.name.toLowerCase() === 'washroom' || category.name.toLowerCase() === 'washlet') ? (
                <span className="text-white">Basin & WC</span>
              ) : (category.parentId && (() => {
                const parentCat = categories.find(c => c.id === category.parentId);
                if (parentCat && (parentCat.name.toLowerCase() === 'washroom' || parentCat.name.toLowerCase() === 'washlet')) {
                  return (
                    <>
                      <Link href={`/shop?category=${parentCat.id}`} className="hover:text-white">Basin & WC</Link>
                      <span className="mx-2">/</span>
                      <span className="text-white">{category.name}</span>
                    </>
                  );
                }
                return <span className="text-white">{category.name}</span>;
              })()) || (
                <span className="text-white">{category.name}</span>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white mb-2">{heroTitle}</h1>
            {heroSubtitle && (
              <p className="text-white/90 text-lg md:text-xl max-w-2xl">{heroSubtitle}</p>
            )}
            {!heroSubtitle && (
              <p className="text-white/80 text-sm md:text-base">
                {childCategories.length > 0
                  ? `${childCategories.length} subcategories | ${category.totalCount || 0} products`
                  : `${category.totalCount || 0} products`
                }
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Description Section */}
      {description && (
        <section className="py-8 md:py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <p className="text-bella-600 text-lg md:text-xl leading-relaxed">{description}</p>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-8 md:py-12 bg-white border-t border-bella-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.slice(0, 4).map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-bella-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h4 className="font-semibold text-navy text-sm md:text-base">{feature.title}</h4>
                <p className="text-bella-500 text-xs md:text-sm mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {childCategories.length > 0 ? (
            <>
              <h2 className="font-display text-xl md:text-2xl font-bold text-navy mb-6">
                {productSectionTitle}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {childCategories.map((subCat) => {
                  const hasGrandchildren = subCat.childIds && subCat.childIds.length > 0;
                  const subCatProducts = categoryProducts[subCat.id] || [];

                  return (
                    <Link
                      key={subCat.id}
                      href={`/shop?category=${subCat.id}`}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                    >
                      {/* Product Image Grid or Single Image */}
                      <div className="aspect-square relative bg-bella-50">
                        {/* If admin has set a custom image, show that with EditableImage */}
                        {categoryImages[subCat.id.toString()] ? (
                          <EditableImage
                            src={categoryImages[subCat.id.toString()]}
                            alt={subCat.name}
                            configKey={`categoryImages.${subCat.id}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onUpdate={(newUrl) => handleCategoryImageUpdate(subCat.id.toString(), newUrl)}
                          />
                        ) : subCatProducts.length >= 4 ? (
                          // 2x2 grid of product images with EditableImage overlay for admin
                          <CategoryGridWithEditor
                            products={subCatProducts}
                            subCatId={subCat.id}
                            subCatName={subCat.name}
                            onImageUpdate={handleCategoryImageUpdate}
                          />
                        ) : subCatProducts.length > 0 ? (
                          // Single product image with EditableImage for admin
                          <EditableImage
                            src={subCatProducts[0].thumbnail || '/placeholder.jpg'}
                            alt={subCat.name}
                            configKey={`categoryImages.${subCat.id}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onUpdate={(newUrl) => handleCategoryImageUpdate(subCat.id.toString(), newUrl)}
                          />
                        ) : (
                          // Fallback placeholder - always editable
                          <EditableImage
                            src={getSubcategoryImage(subCat.id)}
                            alt={subCat.name}
                            configKey={`categoryImages.${subCat.id}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onUpdate={(newUrl) => handleCategoryImageUpdate(subCat.id.toString(), newUrl)}
                          />
                        )}
                      </div>

                      {/* Category Info */}
                      <div className="p-3 md:p-4">
                        <h3 className="font-semibold text-navy text-sm md:text-base group-hover:text-gold transition-colors">
                          {subCat.name}
                        </h3>
                        <p className="text-bella-500 text-xs md:text-sm mt-1">
                          {subCat.totalCount || 0} products
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* View All Products Button */}
              <div className="text-center mt-8">
                <Link
                  href={`/shop?category=${category.id}`}
                  className="inline-flex items-center gap-2 bg-navy hover:bg-navy-dark text-white px-6 py-3 rounded-full font-medium transition-all"
                >
                  View All {category.name} Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-bella-600 mb-6">Explore our {category.name} collection</p>
              <Link
                href={`/shop?category=${category.id}`}
                className="bg-gold hover:bg-gold-dark text-white px-8 py-4 rounded-full font-semibold transition-all"
              >
                {t('viewAllProducts')}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
