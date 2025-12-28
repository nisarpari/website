'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    wishlist: 'Wishlist',
    // Top Bar
    freeDelivery: 'Free Delivery on Orders Above',
    trackOrder: 'Track Order',
    support: 'Support',
    // Hero
    heroTitle1: 'Luxury Bathroom',
    heroTitle2: 'Solutions',
    heroSubtitle: 'Premium Italian-designed sanitaryware. Jacuzzis, faucets, basins & more.',
    shopNow: 'Shop Now',
    contactUs: 'Contact Us',
    // Stats
    customers: 'Customers',
    products: 'Products',
    countries: 'Countries',
    years: 'Years',
    // Trust
    genuineProducts: 'Genuine Products',
    fastDelivery: 'Fast Delivery',
    warranty: '2 Year Warranty',
    expertSupport: 'Expert Support',
    // Why Bella
    whyBella: 'Why Bella Bathwares?',
    whyBellaSubtitle: 'We bring together Italian design excellence with affordable luxury for your home.',
    premiumQuality: 'Premium Quality',
    premiumQualityDesc: 'Italian-designed sanitaryware crafted to perfection',
    expertInstallation: 'Expert Installation',
    expertInstallationDesc: 'Professional installation support across the region',
    warrantySupport: 'Warranty Support',
    warrantySupportDesc: 'Comprehensive 2-year warranty on all products',
    // Categories
    collections: 'Collections',
    shopByCategory: 'Shop by Category',
    exploreCollections: 'Explore our premium bathroom collections',
    viewAll: 'View All',
    viewAllProducts: 'View All Products',
    allProducts: 'All Products',
    categories: 'Categories',
    // Product
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart!',
    quantity: 'Quantity',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    sku: 'SKU',
    description: 'Description',
    searchProducts: 'Search products...',
    featured: 'Featured',
    nameAZ: 'Name (A-Z)',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    priceRange: 'Price Range',
    noProductsFound: 'No products found.',
    clearFilters: 'Clear filters',
    productsFound: 'products found',
    // Footer
    servingIn: 'Serving customers in',
    quickLinks: 'Quick Links',
    customerService: 'Customer Service',
    stayConnected: 'Stay Connected',
    subscribeNewsletter: 'Subscribe to our newsletter for exclusive offers',
    enterEmail: 'Enter your email',
    subscribe: 'Subscribe',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    shippingInfo: 'Shipping Info',
    returns: 'Returns',
    faq: 'FAQ',
    allRightsReserved: 'All rights reserved',
    // Common
    ourStory: 'Our Story',
    learnMore: 'Learn More',
    browseProducts: 'Browse Products',
    findShowroom: 'Find Showroom',
    readyTransform: 'Ready to Transform Your Space?',
    browseCollection: 'Browse our collection or visit a showroom near you.',
    currency: 'OMR',
    loading: 'Loading...',
    error: 'Error',
    backToHome: 'Back to Home',
    productsCount: 'Products',
    subcategoriesCount: 'subcategories'
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    shop: 'المتجر',
    about: 'من نحن',
    contact: 'اتصل بنا',
    cart: 'السلة',
    wishlist: 'المفضلة',
    // Top Bar
    freeDelivery: 'توصيل مجاني للطلبات فوق',
    trackOrder: 'تتبع الطلب',
    support: 'الدعم',
    // Hero
    heroTitle1: 'حلول الحمامات',
    heroTitle2: 'الفاخرة',
    heroSubtitle: 'أدوات صحية إيطالية التصميم. جاكوزي، صنابير، أحواض والمزيد.',
    shopNow: 'تسوق الآن',
    contactUs: 'اتصل بنا',
    // Stats
    customers: 'عملاء',
    products: 'منتجات',
    countries: 'دول',
    years: 'سنوات',
    // Trust
    genuineProducts: 'منتجات أصلية',
    fastDelivery: 'توصيل سريع',
    warranty: 'ضمان سنتين',
    expertSupport: 'دعم متخصص',
    // Why Bella
    whyBella: 'لماذا بيلا باثويرز؟',
    whyBellaSubtitle: 'نجمع بين التميز الإيطالي في التصميم والفخامة بأسعار معقولة لمنزلك.',
    premiumQuality: 'جودة ممتازة',
    premiumQualityDesc: 'أدوات صحية إيطالية التصميم مصنوعة بإتقان',
    expertInstallation: 'تركيب احترافي',
    expertInstallationDesc: 'دعم تركيب احترافي في جميع أنحاء المنطقة',
    warrantySupport: 'دعم الضمان',
    warrantySupportDesc: 'ضمان شامل لمدة سنتين على جميع المنتجات',
    // Categories
    collections: 'المجموعات',
    shopByCategory: 'تسوق حسب الفئة',
    exploreCollections: 'استكشف مجموعاتنا الفاخرة للحمامات',
    viewAll: 'عرض الكل',
    viewAllProducts: 'عرض جميع المنتجات',
    allProducts: 'جميع المنتجات',
    categories: 'الفئات',
    // Product
    addToCart: 'أضف إلى السلة',
    addedToCart: 'تمت الإضافة!',
    quantity: 'الكمية',
    inStock: 'متوفر',
    outOfStock: 'غير متوفر',
    sku: 'رمز المنتج',
    description: 'الوصف',
    searchProducts: 'البحث عن منتجات...',
    featured: 'مميز',
    nameAZ: 'الاسم (أ-ي)',
    priceLowHigh: 'السعر: من الأقل للأعلى',
    priceHighLow: 'السعر: من الأعلى للأقل',
    priceRange: 'نطاق السعر',
    noProductsFound: 'لم يتم العثور على منتجات.',
    clearFilters: 'مسح الفلاتر',
    productsFound: 'منتجات',
    // Footer
    servingIn: 'نخدم العملاء في',
    quickLinks: 'روابط سريعة',
    customerService: 'خدمة العملاء',
    stayConnected: 'ابقَ على تواصل',
    subscribeNewsletter: 'اشترك في نشرتنا الإخبارية للعروض الحصرية',
    enterEmail: 'أدخل بريدك الإلكتروني',
    subscribe: 'اشترك',
    privacyPolicy: 'سياسة الخصوصية',
    termsConditions: 'الشروط والأحكام',
    shippingInfo: 'معلومات الشحن',
    returns: 'الإرجاع',
    faq: 'الأسئلة الشائعة',
    allRightsReserved: 'جميع الحقوق محفوظة',
    // Common
    ourStory: 'قصتنا',
    learnMore: 'اعرف المزيد',
    browseProducts: 'تصفح المنتجات',
    findShowroom: 'ابحث عن معرض',
    readyTransform: 'مستعد لتحويل مساحتك؟',
    browseCollection: 'تصفح مجموعتنا أو قم بزيارة أحد معارضنا.',
    currency: 'ر.ع',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    backToHome: 'العودة للرئيسية',
    productsCount: 'منتج',
    subcategoriesCount: 'فئات فرعية'
  },
  es: {
    // Navigation
    home: 'Inicio',
    shop: 'Tienda',
    about: 'Nosotros',
    contact: 'Contacto',
    cart: 'Carrito',
    wishlist: 'Favoritos',
    // Top Bar
    freeDelivery: 'Envío gratis en pedidos superiores a',
    trackOrder: 'Seguir Pedido',
    support: 'Soporte',
    // Hero
    heroTitle1: 'Soluciones de Baño',
    heroTitle2: 'de Lujo',
    heroSubtitle: 'Sanitarios de diseño italiano. Jacuzzis, grifos, lavabos y más.',
    shopNow: 'Comprar Ahora',
    contactUs: 'Contáctenos',
    // Stats
    customers: 'Clientes',
    products: 'Productos',
    countries: 'Países',
    years: 'Años',
    // Trust
    genuineProducts: 'Productos Genuinos',
    fastDelivery: 'Entrega Rápida',
    warranty: '2 Años de Garantía',
    expertSupport: 'Soporte Experto',
    // Why Bella
    whyBella: '¿Por qué Bella Bathwares?',
    whyBellaSubtitle: 'Combinamos la excelencia del diseño italiano con el lujo accesible para tu hogar.',
    premiumQuality: 'Calidad Premium',
    premiumQualityDesc: 'Sanitarios de diseño italiano fabricados a la perfección',
    expertInstallation: 'Instalación Experta',
    expertInstallationDesc: 'Soporte de instalación profesional en toda la región',
    warrantySupport: 'Soporte de Garantía',
    warrantySupportDesc: 'Garantía completa de 2 años en todos los productos',
    // Categories
    collections: 'Colecciones',
    shopByCategory: 'Comprar por Categoría',
    exploreCollections: 'Explora nuestras colecciones premium de baño',
    viewAll: 'Ver Todo',
    viewAllProducts: 'Ver Todos los Productos',
    allProducts: 'Todos los Productos',
    categories: 'Categorías',
    // Product
    addToCart: 'Añadir al Carrito',
    addedToCart: '¡Añadido!',
    quantity: 'Cantidad',
    inStock: 'En Stock',
    outOfStock: 'Agotado',
    sku: 'SKU',
    description: 'Descripción',
    searchProducts: 'Buscar productos...',
    featured: 'Destacado',
    nameAZ: 'Nombre (A-Z)',
    priceLowHigh: 'Precio: Menor a Mayor',
    priceHighLow: 'Precio: Mayor a Menor',
    priceRange: 'Rango de Precio',
    noProductsFound: 'No se encontraron productos.',
    clearFilters: 'Limpiar filtros',
    productsFound: 'productos encontrados',
    // Footer
    servingIn: 'Sirviendo a clientes en',
    quickLinks: 'Enlaces Rápidos',
    customerService: 'Servicio al Cliente',
    stayConnected: 'Mantente Conectado',
    subscribeNewsletter: 'Suscríbete a nuestro boletín para ofertas exclusivas',
    enterEmail: 'Ingresa tu email',
    subscribe: 'Suscribirse',
    privacyPolicy: 'Política de Privacidad',
    termsConditions: 'Términos y Condiciones',
    shippingInfo: 'Info de Envío',
    returns: 'Devoluciones',
    faq: 'FAQ',
    allRightsReserved: 'Todos los derechos reservados',
    // Common
    ourStory: 'Nuestra Historia',
    learnMore: 'Saber Más',
    browseProducts: 'Ver Productos',
    findShowroom: 'Encontrar Tienda',
    readyTransform: '¿Listo para Transformar tu Espacio?',
    browseCollection: 'Explora nuestra colección o visita una tienda.',
    currency: 'OMR',
    loading: 'Cargando...',
    error: 'Error',
    backToHome: 'Volver al Inicio',
    productsCount: 'productos',
    subcategoriesCount: 'subcategorías'
  }
};

// Country configurations with price multipliers
export interface CountryConfig {
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  priceMultiplier: number;
  freeDeliveryThreshold: number;
}

export const countryConfigs: Record<string, CountryConfig> = {
  OM: { name: 'Oman', flag: '🇴🇲', currency: 'OMR', currencySymbol: 'ر.ع', priceMultiplier: 1, freeDeliveryThreshold: 50 },
  AE: { name: 'UAE', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ', priceMultiplier: 10, freeDeliveryThreshold: 500 },
  QA: { name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'ر.ق', priceMultiplier: 12, freeDeliveryThreshold: 600 },
  IN: { name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', priceMultiplier: 250, freeDeliveryThreshold: 12500 }
};

// Helper function to format price based on country
export const formatPriceWithConfig = (basePrice: number, countryConfig: CountryConfig): string => {
  const convertedPrice = basePrice * countryConfig.priceMultiplier;
  // Round to 3 decimal places for OMR, whole numbers for others
  if (countryConfig.currency === 'OMR') {
    return convertedPrice.toFixed(3);
  }
  return Math.round(convertedPrice).toLocaleString();
};

interface LocaleContextType {
  language: string;
  setLanguage: (lang: string) => void;
  country: string;
  setCountry: (country: string) => void;
  t: (key: string) => string;
  countryConfig: CountryConfig;
  countryConfigs: Record<string, CountryConfig>;
  formatPrice: (basePrice: number) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider = ({ children }: LocaleProviderProps) => {
  const [language, setLanguageState] = useState('en');
  const [country, setCountryState] = useState('OM');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLanguage = localStorage.getItem('bella_language') || 'en';
    const savedCountry = localStorage.getItem('bella_country') || 'OM';
    setLanguageState(savedLanguage);
    setCountryState(savedCountry);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('bella_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('bella_country', country);
  }, [country, isClient]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  const setCountry = (c: string) => {
    setCountryState(c);
  };

  const t = (key: string): string => translations[language]?.[key] || translations.en[key] || key;
  const countryConfig = countryConfigs[country] || countryConfigs.OM;

  // Price formatter bound to current country
  const formatPrice = (basePrice: number): string => formatPriceWithConfig(basePrice, countryConfig);

  const value = useMemo(() => ({
    language, setLanguage, country, setCountry, t, countryConfig, countryConfigs, formatPrice
  }), [language, country]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
