// Server-side configuration utilities
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

const CONFIG_PATH = path.join(process.cwd(), 'site-config.json');
const KV_CONFIG_KEY = 'site-config';

// Check if running in Vercel production (KV available)
const isVercelProduction = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin125!09*#';

export const COUNTRY_NAMES: Record<string, string> = {
  'OM': 'Oman',
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'IN': 'India',
  'SA': 'Saudi Arabia',
  'KW': 'Kuwait',
  'BH': 'Bahrain'
};

export const GCC_COUNTRIES: Record<string, { name: string; code: string; flag: string }> = {
  'OM': { name: 'Oman', code: '+968', flag: '🇴🇲' },
  'AE': { name: 'UAE', code: '+971', flag: '🇦🇪' },
  'SA': { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  'QA': { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  'KW': { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  'BH': { name: 'Bahrain', code: '+973', flag: '🇧🇭' }
};

export const DEFAULT_HERO_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80', alt: 'Modern Freestanding Bathtub' },
  { url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=1200&q=80', alt: 'Luxury Jacuzzi Spa' },
  { url: 'https://images.unsplash.com/photo-1629774631753-88f827bf6447?w=1200&q=80', alt: 'Modern Rain Shower' },
  { url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80', alt: 'Elegant Soaking Tub' },
  { url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80', alt: 'Contemporary Walk-in Shower' }
];

export interface CategoryFeature {
  icon: string;
  title: string;
  description: string;
}

export interface CategoryLandingContent {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  description?: string;
  features?: CategoryFeature[];
  productSectionTitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface SiteConfig {
  heroImages?: Array<{ url: string; alt: string; link?: string; variants?: Record<string, string> }>;
  categoryImages?: Record<string, string>;
  categoryImageVariants?: Record<string, Record<string, string>>;
  categoryLandingContent?: Record<string, CategoryLandingContent>;
  visibleCategories?: string[];
  categoryGridCount?: 6 | 8;
  lastUpdated?: string;
  [key: string]: unknown;
}

// Default config from file (used as fallback)
function getDefaultConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading default config file:', error);
  }
  return {};
}

// Synchronous read for local development
export function readSiteConfig(): SiteConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading site config:', error);
  }
  return {};
}

// Async read that uses KV in production
export async function readSiteConfigAsync(): Promise<SiteConfig> {
  if (isVercelProduction) {
    try {
      const config = await kv.get<SiteConfig>(KV_CONFIG_KEY);
      if (config) {
        return config;
      }
      // If KV is empty, return default config from file
      return getDefaultConfig();
    } catch (error) {
      console.error('Error reading from KV:', error);
      return getDefaultConfig();
    }
  }
  return readSiteConfig();
}

// Synchronous write for local development
export function writeSiteConfig(config: SiteConfig): void {
  config.lastUpdated = new Date().toISOString();
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing site config to file:', error);
  }
}

// Async write that uses KV in production
export async function writeSiteConfigAsync(config: SiteConfig): Promise<void> {
  config.lastUpdated = new Date().toISOString();

  if (isVercelProduction) {
    try {
      await kv.set(KV_CONFIG_KEY, config);
    } catch (error) {
      console.error('Error writing to KV:', error);
      throw error;
    }
  } else {
    writeSiteConfig(config);
  }
}

export function checkAdminAuth(authHeader: string | null): boolean {
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_PASSWORD;
}

// In-memory OTP store (for serverless, this resets on cold start)
// In production, use a database or Redis
const otpStore = new Map<string, {
  otp: string;
  expiresAt: number;
  countryCode: string;
  attempts: number;
}>();

export { otpStore };
