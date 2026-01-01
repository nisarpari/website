'use client';

import Link from 'next/link';
import { useWishlist } from '@/context';
import { ProductImage } from '@/components/ProductImage';
import { type Product } from '@/lib/api/odoo';
import { motion } from 'framer-motion';

export default function ProductCard({ product }: { product: Product }) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id);

    return (
        <Link href={`/product/${product.slug}`} className="group relative block h-full">
            <motion.div
                className="h-full bg-white dark:bg-navy-light rounded-xl overflow-hidden border border-bella-100 dark:border-white/10 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Image block - 4:5 ratio for elegant vertical look */}
                <div className="relative aspect-[4/5] bg-bella-50 dark:bg-navy overflow-hidden">
                    <ProductImage
                        src={product.thumbnail || product.image || '/placeholder.jpg'}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 160px, 180px"
                    />

                    {/* Wishlist Button - Top Right */}
                    <motion.div
                        className="absolute top-3 right-3 z-10"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <button
                            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${inWishlist
                                ? 'bg-red-50 text-red-500'
                                : 'bg-white/90 text-bella-600 dark:bg-navy/80 dark:text-white hover:bg-gold hover:text-white dark:hover:bg-gold'
                                }`}
                        >
                            <svg className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </motion.div>

                    {/* Quick View / Action Overlay - Appears on Hover */}
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto flex justify-center pb-6">
                        <motion.button
                            className="bg-navy text-white dark:bg-white dark:text-navy px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2"
                            onClick={(e) => { e.preventDefault(); /* Open quick view logic if implemented */ }}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            Quick View
                        </motion.button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="p-4 bg-white dark:bg-navy-light relative z-20">
                    <h3 className="text-sm font-semibold text-navy dark:text-white line-clamp-2 leading-snug group-hover:text-gold transition-colors duration-300 min-h-[40px]">
                        {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-bella-400 uppercase tracking-wider">Details &rarr;</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
