'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/context';

export default function AboutPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-bella-50">
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80"
          alt="Bella Bathwares"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">{t('about')}</h1>
            <p className="text-white/80 max-w-2xl">{t('ourStory')}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-display text-3xl font-bold text-navy mb-6">{t('whyBella')}</h2>
            <p className="text-bella-600 leading-relaxed mb-6">
              {t('whyBellaSubtitle')}
            </p>
            <p className="text-bella-600 leading-relaxed mb-6">
              Founded with a vision to bring world-class bathroom solutions to the GCC region, Bella Bathwares has grown to become a trusted name in premium sanitaryware. Our commitment to quality, design, and customer satisfaction sets us apart.
            </p>
            <p className="text-bella-600 leading-relaxed">
              We source our products from the finest manufacturers in Italy and Europe, ensuring that every item in our collection meets the highest standards of craftsmanship and durability.
            </p>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80"
              alt="Our showroom"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="font-display text-3xl font-bold text-navy text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: t('premiumQuality'), desc: t('premiumQualityDesc') },
              { icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', title: t('expertInstallation'), desc: t('expertInstallationDesc') },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: t('warrantySupport'), desc: t('warrantySupportDesc') }
            ].map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={value.icon} />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-navy mb-3">{value.title}</h3>
                <p className="text-bella-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-navy to-navy-light rounded-2xl p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">{t('readyTransform')}</h2>
          <p className="text-bella-300 mb-8 max-w-2xl mx-auto">{t('browseCollection')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/shop" className="bg-gold hover:bg-gold-dark text-navy px-8 py-4 rounded-full font-semibold transition-all">
              {t('browseProducts')}
            </Link>
            <Link href="/contact" className="bg-white text-navy px-8 py-4 rounded-full font-semibold transition-all hover:bg-bella-100">
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
