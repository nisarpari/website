'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/context';
import { type Category } from '@/lib/api/odoo';

interface FooterProps {
  categories?: Category[];
}

export function Footer({ categories = [] }: FooterProps) {
  const { t } = useLocale();

  // Match navbar category logic - hide merged/special categories
  const hiddenFromFooter = ['collections', 'bath assist', 'kitchen', 'water heaters', 'washroom', 'washlet', 'bath accessories'];

  // Rename mappings (same as navbar)
  const renameCategory = (name: string) => {
    const renames: Record<string, string> = {
      'bathroom': 'Showers',
      'wellness': 'Wellness',
    };
    return renames[name.toLowerCase()] || name;
  };

  // Get filtered root categories (same as navbar)
  const filteredRootCategories = categories
    .filter(c => c.parentId === null && !hiddenFromFooter.includes(c.name.toLowerCase()));

  // Find Switches & Sockets to include
  const switchesCategory = categories.find(c =>
    c.parentId === null && c.name.toLowerCase() === 'switches & sockets'
  );

  // Build footer categories: filtered ones + switches if not already included
  const footerCategories = [...filteredRootCategories.slice(0, 4)];
  if (switchesCategory && !footerCategories.find(c => c.id === switchesCategory.id)) {
    footerCategories.push(switchesCategory);
  }

  return (
    <footer className="bg-navy-dark text-white pt-12 md:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Mobile: Stack vertically, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          {/* Logo & Description - Full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/bella_logo_white.png"
                alt="Bella Bathwares"
                width={160}
                height={80}
                className="h-12 md:h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-bella-400 text-sm leading-relaxed">{t('heroSubtitle')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">{t('quickLinks')}</h4>
            <ul className="space-y-2 text-bella-400 text-sm">
              {[
                { href: '/', label: t('home') },
                { href: '/shop', label: t('shop') },
                { href: '/track', label: t('trackOrder') },
                { href: '/about', label: t('about') },
                { href: '/contact', label: t('contact') }
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-gold-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories - synced with navbar */}
          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">{t('categories')}</h4>
            <ul className="space-y-2 text-bella-400 text-sm">
              {footerCategories.map((cat) => {
                const isShowers = cat.name.toLowerCase() === 'bathroom';
                return (
                  <>
                    <li key={cat.id}>
                      <Link
                        href={cat.childIds && cat.childIds.length > 0 ? `/${cat.slug}` : `/shop?category=${cat.id}`}
                        className="hover:text-gold-light transition-colors text-left"
                      >
                        {renameCategory(cat.name)}
                      </Link>
                    </li>
                    {/* Insert Basins & WC after Showers */}
                    {isShowers && (
                      <li key="basins-wc">
                        <Link
                          href="/shop?category=washroom"
                          className="hover:text-gold-light transition-colors text-left"
                        >
                          Basins & WC
                        </Link>
                      </li>
                    )}
                  </>
                );
              })}
            </ul>
          </div>

          {/* Stay Connected - Full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold mb-4 text-sm md:text-base">{t('stayConnected')}</h4>
            <div className="flex gap-3">
              {/* Facebook */}
              <a href="https://facebook.com/bellabathwares" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center hover:bg-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/bellabathwares" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center hover:bg-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2.16c3.2,0,3.58.01,4.85.07,1.17.05,1.8.25,2.23.41.56.22.96.48,1.38.9s.68.82.9,1.38c.16.42.36,1.06.41,2.23.06,1.27.07,1.65.07,4.85s-.01,3.58-.07,4.85c-.05,1.17-.25,1.8-.41,2.23-.22.56-.48.96-.9,1.38s-.82.68-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9s-.68-.82-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38s.82-.68,1.38-.9c.42-.16,1.06-.36,2.23-.41,1.27-.06,1.65-.07,4.85-.07M12,0C8.74,0,8.33.01,7.05.07,5.78.13,4.9.33,4.14.63c-.78.3-1.44.71-2.1,1.37S.93,3.36.63,4.14C.33,4.9.13,5.78.07,7.05.01,8.33,0,8.74,0,12s.01,3.67.07,4.95c.06,1.27.26,2.15.56,2.91.3.78.71,1.44,1.37,2.1s1.32,1.07,2.1,1.37c.76.3,1.64.5,2.91.56,1.28.06,1.69.07,4.95.07s3.67-.01,4.95-.07c1.27-.06,2.15-.26,2.91-.56.78-.3,1.44-.71,2.1-1.37s1.07-1.32,1.37-2.1c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.78-.71-1.44-1.37-2.1S20.64.93,19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01,15.26,0,12,0Z" />
                  <path d="M12,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z" />
                  <circle cx="18.41" cy="5.59" r="1.44" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com/bellabathwares" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center hover:bg-gold transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.5,6.19a3.02,3.02,0,0,0-2.12-2.14C19.5,3.5,12,3.5,12,3.5s-7.5,0-9.38.55A3.02,3.02,0,0,0,.5,6.19,31.56,31.56,0,0,0,0,12a31.56,31.56,0,0,0,.5,5.81,3.02,3.02,0,0,0,2.12,2.14c1.88.55,9.38.55,9.38.55s7.5,0,9.38-.55a3.02,3.02,0,0,0,2.12-2.14A31.56,31.56,0,0,0,24,12,31.56,31.56,0,0,0,23.5,6.19ZM9.55,15.57V8.43L15.82,12Z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://wa.me/96899999999" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center hover:bg-green-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.47,14.38c-.29-.14-1.7-.84-1.96-.94s-.46-.14-.65.14-.75.94-.92,1.13-.34.21-.63.07a7.94,7.94,0,0,1-2.34-1.44,8.77,8.77,0,0,1-1.62-2.01c-.17-.29,0-.45.13-.59s.29-.34.44-.51a2,2,0,0,0,.29-.48.53.53,0,0,0,0-.51c-.07-.14-.65-1.57-.89-2.15s-.47-.49-.65-.5-.36,0-.55,0a1.06,1.06,0,0,0-.77.36,3.22,3.22,0,0,0-1,2.4,5.59,5.59,0,0,0,1.17,2.97,12.82,12.82,0,0,0,4.9,4.33,16.17,16.17,0,0,0,1.64.61,3.94,3.94,0,0,0,1.81.11,2.96,2.96,0,0,0,1.94-1.37,2.4,2.4,0,0,0,.17-1.37C17.94,14.52,17.76,14.45,17.47,14.38Z" />
                  <path d="M20.52,3.48A11.93,11.93,0,0,0,12.05,0,11.82,11.82,0,0,0,1.75,17.69L0,24l6.47-1.7A11.83,11.83,0,0,0,12.05,24h0A11.82,11.82,0,0,0,20.52,3.48ZM12.05,21.64a9.82,9.82,0,0,1-5-1.37l-.36-.21-3.73.98,1-3.65-.24-.37a9.86,9.86,0,1,1,8.33,4.62Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-light pt-6 text-center text-bella-500 text-xs md:text-sm">
          <p>© 2024 Bella Bathwares. {t('allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  );
}
