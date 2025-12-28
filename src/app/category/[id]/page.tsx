'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useAdmin } from '@/context';
import { EditableImage } from '@/components/admin';
import { OdooAPI, type Category, type Product } from '@/lib/api/odoo';

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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

export default function CategoryLandingPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);
  const { t } = useLocale();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isAdmin, editMode } = useAdmin(); // Used by child components via context

  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [categoryProducts, setCategoryProducts] = useState<Record<number, Product[]>>({});
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch categories, products, and category images in parallel
      const [cats, mainProducts, catImages] = await Promise.all([
        OdooAPI.fetchPublicCategories(),
        OdooAPI.fetchProductsByPublicCategory(categoryId),
        OdooAPI.fetchCategoryImages()
      ]);

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
  }, [categoryId, router]);

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
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = sessionStorage.getItem('bella_admin_token');

    if (token && newUrl) {
      try {
        const res = await fetch(`${API_BASE}/api/admin/category-images/${catId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

  return (
    <div className="min-h-screen bg-bella-50">
      {/* Hero */}
      <section className="relative h-[200px] md:h-[300px] overflow-hidden bg-navy">
        {heroProduct?.image && (
          <Image
            src={heroProduct.image}
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
              <span className="text-white">{category.name}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{category.name}</h1>
            <p className="text-white/80 text-sm md:text-base">
              {childCategories.length > 0
                ? `${childCategories.length} subcategories | ${category.totalCount || 0} products`
                : `${category.totalCount || 0} products`
              }
            </p>
          </div>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {childCategories.length > 0 ? (
            <>
              <h2 className="font-display text-xl md:text-2xl font-bold text-navy mb-6">
                Explore {category.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {childCategories.map((subCat) => {
                  const hasGrandchildren = subCat.childIds && subCat.childIds.length > 0;
                  const subCatProducts = categoryProducts[subCat.id] || [];

                  return (
                    <Link
                      key={subCat.id}
                      href={hasGrandchildren ? `/category/${subCat.id}` : `/shop?category=${subCat.id}`}
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

      {/* Features */}
      <section className="py-8 md:py-12 bg-white border-t border-bella-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Quality Assured', desc: 'Premium materials' },
              { icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', title: 'Fast Delivery', desc: 'Secure packaging' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: 'Expert Support', desc: 'Dedicated assistance' }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-bella-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                  </svg>
                </div>
                <h4 className="font-semibold text-navy text-sm">{feature.title}</h4>
                <p className="text-bella-500 text-xs mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
