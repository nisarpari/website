// GET /api/products/by-slug/[slug] - Fetch single product by slug
import { NextRequest } from 'next/server';
import { odooApiCall, ODOO_CONFIG, getOptimizedImageUrl } from '@/lib/server/odoo';
import { transformProduct, TransformedProduct } from '@/lib/server/transform';
import { getCachedOrFetch, CACHE_KEYS, CACHE_TTL } from '@/lib/server/cache';

interface ProductWithDetails extends TransformedProduct {
  additionalImages?: Array<{ id: number; name: string; url: string }>;
  accessoryProducts?: Array<{ id: number; name: string; price: number; thumbnail: string; slug: string }>;
  alternativeProducts?: Array<{ id: number; name: string; price: number; thumbnail: string; slug: string }>;
  documents?: Array<{ id: number; name: string; url: string }>;
}

async function fetchProductDetails(productId: number): Promise<ProductWithDetails | null> {
  // Fetch product with ALL eCommerce fields
  const products = await odooApiCall<Array<Record<string, unknown>>>(
    'product.template',
    'search_read',
    [[['id', '=', productId]]],
    {
      fields: [
        'id', 'name', 'list_price', 'categ_id',
        'description_sale', 'default_code', 'qty_available', 'website_url',
        'public_categ_ids',
        'accessory_product_ids',
        'alternative_product_ids',
        'website_ribbon_id',
        'allow_out_of_stock_order',
        'out_of_stock_message',
        'show_availability',
        'available_threshold',
        'website_description',
        'product_template_image_ids',
        'barcode'
      ]
    }
  );

  if (products.length === 0) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product: ProductWithDetails = transformProduct(products[0] as any);

  // Fetch additional images if any
  if (product.additionalImageIds.length > 0) {
    try {
      const images = await odooApiCall<Array<{ id: number; name: string; image_1920: string }>>(
        'product.image',
        'search_read',
        [[['id', 'in', product.additionalImageIds]]],
        { fields: ['id', 'name', 'image_1920'] }
      );
      product.additionalImages = images.map(img => ({
        id: img.id,
        name: img.name,
        url: getOptimizedImageUrl(
          `${ODOO_CONFIG.imageBaseUrl}/web/image/product.image/${img.id}/image_1920`
        )
      }));
    } catch {
      product.additionalImages = [];
    }
  } else {
    product.additionalImages = [];
  }

  // Fetch accessory products (basic info only)
  if (product.accessoryProductIds.length > 0) {
    try {
      const accessories = await odooApiCall<Array<{ id: number; name: string; list_price: number; website_url: string }>>(
        'product.template',
        'search_read',
        [[['id', 'in', product.accessoryProductIds], ['is_published', '=', true]]],
        { fields: ['id', 'name', 'list_price', 'website_url'], limit: 20 }
      );
      product.accessoryProducts = accessories.map(p => ({
        id: p.id,
        name: p.name,
        price: p.list_price,
        thumbnail: getOptimizedImageUrl(
          `${ODOO_CONFIG.imageBaseUrl}/web/image/product.template/${p.id}/image_512`
        ),
        slug: p.website_url ? p.website_url.replace('/shop/', '') : `${p.name.toLowerCase().replace(/\s+/g, '-')}-${p.id}`
      }));
    } catch {
      product.accessoryProducts = [];
    }
  } else {
    product.accessoryProducts = [];
  }

  // Fetch alternative products (basic info only)
  if (product.alternativeProductIds.length > 0) {
    try {
      const alternatives = await odooApiCall<Array<{ id: number; name: string; list_price: number; website_url: string }>>(
        'product.template',
        'search_read',
        [[['id', 'in', product.alternativeProductIds], ['is_published', '=', true]]],
        { fields: ['id', 'name', 'list_price', 'website_url'], limit: 20 }
      );
      product.alternativeProducts = alternatives.map(p => ({
        id: p.id,
        name: p.name,
        price: p.list_price,
        thumbnail: getOptimizedImageUrl(
          `${ODOO_CONFIG.imageBaseUrl}/web/image/product.template/${p.id}/image_512`
        ),
        slug: p.website_url ? p.website_url.replace('/shop/', '') : `${p.name.toLowerCase().replace(/\s+/g, '-')}-${p.id}`
      }));
    } catch {
      product.alternativeProducts = [];
    }
  } else {
    product.alternativeProducts = [];
  }

  // Fetch documents attached to this product
  try {
    let documents: Array<{ id: number; name: string; url: string }> = [];

    // Try ir.attachment for product.template
    const attachments = await odooApiCall<Array<{ id: number; name: string; mimetype: string; file_size: number }>>(
      'ir.attachment',
      'search_read',
      [[
        '|',
        '&', ['res_model', '=', 'product.template'], ['res_id', '=', productId],
        '&', ['res_model', '=', 'product.product'], ['res_id', 'in', product.variantIds || []]
      ]],
      { fields: ['id', 'name', 'mimetype', 'file_size'] }
    );

    // Filter for PDF files
    const pdfAttachments = attachments.filter(att =>
      att.mimetype && att.mimetype.toLowerCase().includes('pdf')
    );
    if (pdfAttachments.length > 0) {
      documents = pdfAttachments.map(att => ({
        id: att.id,
        name: att.name,
        url: `/api/products/document/${att.id}`
      }));
    }

    // Query documents by product barcode if no documents found
    if (documents.length === 0 && product.barcode) {
      try {
        const docsByBarcode = await odooApiCall<Array<{ id: number; name: string; mimetype: string }>>(
          'ir.attachment',
          'search_read',
          [[
            ['name', 'ilike', product.barcode],
            ['mimetype', 'ilike', 'pdf']
          ]],
          { fields: ['id', 'name', 'mimetype'], limit: 5, order: 'id desc' }
        );

        const relevantDocs = docsByBarcode.filter(att =>
          att.name.toLowerCase().includes(product.barcode.toLowerCase())
        );

        if (relevantDocs.length > 0) {
          const seen = new Set<string>();
          const uniqueDocs = relevantDocs.filter(att => {
            const normalizedName = att.name.replace(/[_\d]+\.pdf$/i, '.pdf');
            if (seen.has(normalizedName)) return false;
            seen.add(normalizedName);
            return true;
          });
          documents = uniqueDocs.map(att => ({
            id: att.id,
            name: att.name.replace(/[_\d]+\.pdf$/i, '.pdf'),
            url: `/api/products/document/${att.id}`
          }));
        }
      } catch {
        // Barcode search failed
      }
    }

    product.documents = documents;
  } catch (e) {
    console.error('Error fetching product documents:', e);
    product.documents = [];
  }

  return product;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Extract product ID from slug (last segment after final hyphen)
    const match = slug.match(/-(\d+)$/);
    if (!match) {
      return new Response(JSON.stringify({ error: 'Invalid product slug format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const productId = parseInt(match[1]);

    // Use Redis cache for product details
    const cacheKey = `${CACHE_KEYS.PRODUCT_BY_SLUG}${productId}`;

    const product = await getCachedOrFetch(
      cacheKey,
      CACHE_TTL.PRODUCT_BY_SLUG,
      async () => fetchProductDetails(productId)
    );

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return with cache headers - product data is cached in Redis for 7 days
    return new Response(JSON.stringify(product), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
