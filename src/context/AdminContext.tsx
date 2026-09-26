import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { markFirestoreQuotaExhausted, isQuotaExhausted } from '../utils/visitorTracker';
import { 
  Product, 
  CategoryItem, 
  Order, 
  Customer, 
  Coupon, 
  HomepageSectionConfig, 
  HeroBannerConfig, 
  Banner, 
  Review, 
  StoreSettings, 
  PaymentGatewaySettings,
  AdminTab,
  AdminOrderStatus,
  DealOfTheDayConfig,
  Lead
} from '../types';
import { useProducts } from './ProductContext';
import { CATEGORIES_DATA } from '../data/categories';

import { ELEGANT_PLACEHOLDER_SVG, getCleanImageUrl } from '../utils/imageHelper';

export interface AdminSecurityConfig {
  adminUsername: string;
  adminPassword: string;
  securityPin: string;
  secretPathSlug: string;
  allowDirectAdminRoute: boolean;
  requirePin: boolean;
  sessionVersion: number;
}

export const DEFAULT_SECURITY_CONFIG: AdminSecurityConfig = {
  adminUsername: '',
  adminPassword: '',
  securityPin: '',
  secretPathSlug: 'sag-vault',        // Secret administrative portal route e.g. /sag-vault
  allowDirectAdminRoute: false,      // When false, typing /admin returns 404 to protect route secrecy
  requirePin: true,                  // 2-Step PIN authentication
  sessionVersion: 2,                 // Incremented from 1: instantly invalidates old sessions
};

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  loginAdmin: (email: string, pass: string, pin?: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  securityConfig: AdminSecurityConfig;
  updateSecurityConfig: (updated: Partial<AdminSecurityConfig>) => Promise<void>;
  invalidateAllAdminSessions: () => Promise<void>;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | undefined>;
  toggleProductStatus: (id: string) => Promise<void>;

  // Categories
  categories: CategoryItem[];
  addCategory: (cat: Omit<CategoryItem, 'id'>) => void;
  updateCategory: (id: string, updated: Partial<CategoryItem>) => void;
  deleteCategory: (id: string) => void;

  // Orders
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderNumber: string, status: AdminOrderStatus, trackingNumber?: string, notes?: string) => void;
  updateOrderPaymentStatus: (orderNumber: string, paymentStatus: 'Paid' | 'Pending Verification' | 'Unpaid') => void;
  deleteOrder: (orderNumber: string) => void;

  // Customers
  customers: Customer[];
  updateCustomerStatus: (id: string, status: 'active' | 'inactive') => void;

  // Leads
  leads: Lead[];
  updateLeadOfferStatus: (id: string, status: boolean) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  // Coupons
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (id: string, updated: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponStatus: (id: string) => void;

  // Visitor Analytics
  visitorStats: {
    liveActiveCount: number;
    todayUniqueCount: number;
    totalUniqueCount: number;
    checkoutInitiatedCount: number;
    cartAddedCount: number;
  };

  // Homepage Config
  homepageSections: HomepageSectionConfig[];
  toggleHomepageSection: (id: string) => Promise<void>;
  moveHomepageSection: (id: string, direction: 'up' | 'down') => Promise<void>;
  reorderHomepageSections: (newSections: HomepageSectionConfig[]) => Promise<void>;
  resetHomepageSectionsToDefault: () => Promise<void>;
  heroConfig: HeroBannerConfig;
  updateHeroConfig: (updated: Partial<HeroBannerConfig>) => Promise<void>;
  syncHeroWithLiveProducts: () => Promise<void>;

  // Deal of the Day
  dealOfTheDay: DealOfTheDayConfig;
  updateDealOfTheDay: (updated: Partial<DealOfTheDayConfig>) => Promise<void>;

  // Banners
  banners: Banner[];
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, updated: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;

  // Reviews
  reviewsList: Review[];
  reviews: Review[];
  addReview: (review: Omit<Review, 'id'> & { id?: string }) => Promise<void>;
  updateReviewStatus: (id: string, status: 'approved' | 'pending' | 'hidden') => void;
  updateReview: (id: string, updatedData: Partial<Review>) => Promise<void>;
  replyToReview: (id: string, reply: string) => void;
  deleteReview: (id: string) => void;

  // Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (updated: Partial<StoreSettings>) => void;
  paymentSettings: PaymentGatewaySettings;
  updatePaymentSettings: (updated: Partial<PaymentGatewaySettings>) => void;

  // Reset to sample defaults
  resetStoreDataToDefaults: () => Promise<void>;

  // Global loading state for initial fetch from Supabase
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Initial States
export const generateHeroSlidesFromProducts = (productsList: Product[]): HeroBannerConfig['slides'] => {
  const pool = (productsList && productsList.length > 0) ? productsList : [];
  if (pool.length === 0) return [];
  const picked = pool.slice(0, 6);

  const badges = [
    '👑 ROYAL FESTIVE EDIT',
    '🌸 SUMMER GRACE ARTISAN',
    '✨ LUXURY REGAL ANARKALI',
    '🔥 BESTSELLER OF THE WEEK',
    '🌿 PURE SILK HANDBLOCK',
    '💎 EXCLUSIVE DESIGNER SUIT'
  ];

  return picked.map((prod, idx) => {
    let rawImg = (prod.images && prod.images.length > 0) 
      ? prod.images[0] 
      : ((prod as any).image || ELEGANT_PLACEHOLDER_SVG);
    rawImg = getCleanImageUrl(rawImg);
    const originalPrice = prod.originalPrice || Math.round(prod.price * 1.85);

    return {
      id: `slide-prod-${prod.id || idx + 1}`,
      productId: prod.id,
      title: prod.name,
      subtitle: prod.fabric || (prod.description ? prod.description.slice(0, 65) + '...' : 'Handcrafted luxury artisan ethnic ensemble'),
      badge: badges[idx % badges.length],
      image: rawImg,
      price: prod.price,
      originalPrice: originalPrice,
      linkText: 'BUY NOW',
      link: prod.id,
    };
  });
};

const INITIAL_CATEGORIES: CategoryItem[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_ORDERS: Order[] = [];
const INITIAL_COUPONS: Coupon[] = [];
export const INITIAL_SECTIONS: HomepageSectionConfig[] = [
  { id: 'sec-brand-header', title: 'Announcement Marquee', key: 'brandHeader', enabled: true, order: 1 },
  { id: 'sec-categories', title: 'Shop By Silhouette', key: 'categoryGrid', enabled: true, order: 2 },
  { id: 'sec-hero', title: 'Hero Banner Showcase', key: 'hero', enabled: true, order: 3 },
  { id: 'sec-promises', title: 'Artisanal Promises', key: 'artisanalPromises', enabled: true, order: 4 },
  { id: 'sec-combo', title: 'Festive Combo Offers', key: 'comboOffers', enabled: true, order: 5 },
  { id: 'sec-deal', title: 'Deal of the Day', key: 'dealOfTheDay', enabled: true, order: 6 },
  { id: 'sec-new-arrivals', title: 'All Products & Categories', key: 'newArrivals', enabled: true, order: 7 },
  { id: 'sec-best-sellers', title: 'Best Sellers', key: 'bestSellers', enabled: true, order: 8 },
  { id: 'sec-trending', title: 'Trending Now', key: 'trending', enabled: true, order: 9 },
  { id: 'sec-festive', title: 'Festive Collection', key: 'festive', enabled: true, order: 10 },
  { id: 'sec-special-offer', title: 'Special Offer Banner', key: 'specialOffer', enabled: true, order: 11 },
  { id: 'sec-why-shop', title: 'Why Shop With Us', key: 'whyShop', enabled: true, order: 12 },
  { id: 'sec-reviews', title: 'Customer Reviews', key: 'reviews', enabled: true, order: 13 },
  { id: 'sec-instagram', title: 'Instagram Gallery', key: 'instagram', enabled: true, order: 14 },
  { id: 'sec-newsletter', title: 'Newsletter Signup', key: 'newsletter', enabled: true, order: 15 },
];

export const mergeHomepageSections = (parsed: any[]): HomepageSectionConfig[] => {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return INITIAL_SECTIONS;
  }

  const sanitized = parsed;
  const existingKeys = new Set(sanitized.map(p => p.key));
  const merged = [...sanitized];

  INITIAL_SECTIONS.forEach((defaultSec) => {
    if (!existingKeys.has(defaultSec.key)) {
      merged.push({
        ...defaultSec,
        order: merged.length + 1,
      });
    }
  });

  return merged.map((s, idx) => ({
    ...s,
    order: idx + 1,
    title: INITIAL_SECTIONS.find(d => d.key === s.key)?.title || s.title
  }));
};
const INITIAL_HERO_CONFIG: HeroBannerConfig = {
  slides: [],
};
const INITIAL_BANNERS: Banner[] = [];
const INITIAL_REVIEWS: Review[] = [];
const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'Suit Aura Girls',
  tagline: 'Elegance That Feels Like You',
  logoText: 'Suit Aura Girls',
  storeEmail: 'suitauragirls@gmail.com',
  phone: '+91 87398 35310',
  whatsapp: '+91 87398 35310',
  address: 'Shop No. 23, Asansol Junction Railway Station, Station Road, Asansol, Paschim Bardhaman, West Bengal - 713301, India.',
  instagramUrl: 'https://www.instagram.com/suit_aura_girls/',
  facebookUrl: 'https://www.facebook.com/suitauragirls',
  twitterUrl: '',
  currency: 'INR',
  currencySymbol: '₹',
  shippingCharge: 0,
  freeShippingThreshold: 0,
  supabaseUrl: 'https://pgocqnrjzjaiicrljdvk.supabase.co',
  supabaseAnonKey: 'sb_publishable_6_iQnD9HWdPxGYSLAIIuWQ_R2Fr4bi_',
};
const normalizeStoreBrand = (settings: StoreSettings): StoreSettings => ({
  ...settings,
  storeName: settings.storeName?.trim() || INITIAL_STORE_SETTINGS.storeName,
  logoText: settings.logoText?.trim() || INITIAL_STORE_SETTINGS.logoText,
});
const toPublicStoreSettings = (settings: Partial<StoreSettings>): StoreSettings => ({
  storeName: settings.storeName?.trim() || INITIAL_STORE_SETTINGS.storeName,
  tagline: settings.tagline?.trim() || INITIAL_STORE_SETTINGS.tagline,
  logoText: settings.logoText?.trim() || INITIAL_STORE_SETTINGS.logoText,
  storeEmail: settings.storeEmail?.trim() || INITIAL_STORE_SETTINGS.storeEmail,
  phone: settings.phone?.trim() || INITIAL_STORE_SETTINGS.phone,
  whatsapp: settings.whatsapp?.trim() || INITIAL_STORE_SETTINGS.whatsapp,
  address: settings.address?.trim() || INITIAL_STORE_SETTINGS.address,
  instagramUrl: settings.instagramUrl?.trim() || '',
  facebookUrl: settings.facebookUrl?.trim() || '',
  twitterUrl: settings.twitterUrl?.trim() || '',
  currency: 'INR',
  currencySymbol: '₹',
  shippingCharge: Math.max(0, Number(settings.shippingCharge) || 0),
  freeShippingThreshold: Math.max(0, Number(settings.freeShippingThreshold) || 0),
  announcementText: settings.announcementText?.trim().slice(0, 500),
  announcementActive: settings.announcementActive ?? true,
});
const INITIAL_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  mode: 'test',
  prepaidOnly: true,
  allowCod: false,
  razorpayKeyIdPlaceholder: '',
  razorpayKeySecretPlaceholder: '••••••••••••••••••••••••••••',
  webhookSecretPlaceholder: '••••••••••••••••••••••••••••',
  enableUpi: true,
  enableCards: true,
  enableNetBanking: true,
};

const toPublicPaymentSettings = (settings: Partial<PaymentGatewaySettings>): PaymentGatewaySettings => ({
  mode: settings.mode === 'live' ? 'live' : 'test',
  prepaidOnly: true,
  allowCod: false,
  razorpayKeyIdPlaceholder: typeof settings.razorpayKeyIdPlaceholder === 'string'
    ? (settings.razorpayKeyIdPlaceholder.trim().includes('SuitAuraGirlsKey') ? '' : settings.razorpayKeyIdPlaceholder.trim().slice(0, 160))
    : '',
  razorpayKeySecretPlaceholder: '',
  webhookSecretPlaceholder: '',
  enableUpi: Boolean(settings.enableUpi),
  enableCards: Boolean(settings.enableCards),
  enableNetBanking: Boolean(settings.enableNetBanking),
});

const INITIAL_DEAL_OF_THE_DAY: DealOfTheDayConfig = {
  enabled: true,
  productId: 'ae986604-cb06-4bbf-99b6-59d58fea0263',
  customTitle: 'Full Combo Set – Kurti, Palazzo, Bag & Heels',
  customSubtitle: 'Complete coordinated look at a limited-time price.',
  badgeText: '🔥 24-HOUR SPECIAL DEAL',
  dealPrice: 850,
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  durationHours: 24,
  stockText: '30 Left In Stock',
};

// Schema mappers to convert between frontend and Supabase formats
export const mapOrderFromSupabase = (o: any): Order => {
  let richData: any = {};
  let email = String(o.customer_email ?? o.customerEmail ?? '');
  if (email.includes('||')) {
    const parts = email.split('||');
    email = parts[0];
    try {
      richData = JSON.parse(parts[1]);
    } catch {}
  }
  const items = richData.items ?? o.items ?? [];
  const subtotal = Number(richData.subtotal ?? o.subtotal) || 0;
  const discountAmount = Number(richData.discountAmount) || 0;
  const shippingCharge = Number(richData.shippingCharge) || 0;
  const paymentStatus = richData.paymentStatus ?? o.payment_status ?? 'Pending';

  return {
    orderNumber: String(o.order_number ?? o.orderNumber ?? ''),
    status: (richData.status ?? o.status ?? (paymentStatus === 'Paid' ? 'Processing' : 'Pending')) as AdminOrderStatus,
    finalTotal: Number(richData.finalTotal ?? o.final_total) || Math.max(0, subtotal - discountAmount + shippingCharge),
    customerEmail: email,
    customerName: richData.customerName ?? o.customer_name ?? '',
    customerMobile: richData.customerMobile || '',
    deliveryAddress: richData.deliveryAddress || {
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    items: Array.isArray(items) ? items : [],
    subtotal,
    shippingCharge,
    couponCode: richData.couponCode || '',
    discountAmount,
    paymentStatus,
    paymentMethod: richData.paymentMethod ?? o.payment_method ?? 'razorpay',
    paymentRef: richData.paymentRef || '',
    date: richData.date ?? o.created_at ?? new Date().toISOString(),
    estimatedDeliveryDate: richData.estimatedDeliveryDate || '',
    trackingNumber: richData.trackingNumber || '',
    notes: richData.notes || '',
  };
};

export const mapOrderToSupabase = (o: any) => {
  const richData = {
    status: o.status,
    customerMobile: o.customerMobile,
    deliveryAddress: o.deliveryAddress,
    shippingCharge: o.shippingCharge,
    couponCode: o.couponCode,
    discountAmount: o.discountAmount,
    paymentRef: o.paymentRef,
    estimatedDeliveryDate: o.estimatedDeliveryDate,
    trackingNumber: o.trackingNumber,
    courierPartner: o.courierPartner,
    notes: o.notes,
    finalTotal: Number(o.finalTotal) || 0,
  };
  return {
    order_number: o.orderNumber,
    customer_email: `${o.customerEmail || ''}||${JSON.stringify(richData)}`,
    customer_name: o.customerName || '',
    items: Array.isArray(o.items) ? o.items : [],
    subtotal: Number(o.subtotal) || 0,
    payment_method: o.paymentMethod || 'razorpay',
    payment_status: o.paymentStatus || 'Pending',
    created_at: o.date || new Date().toISOString(),
  };
};

export const mapCouponFromSupabase = (c: any): Coupon => ({
  id: String(c.id),
  code: c.code || '',
  discountType: (c.discount_type ?? c.discountType) === 'fixed' ? 'fixed' : 'percentage',
  discountValue: Number(c.discount_value ?? c.discountValue) || 0,
  minOrderValue: Number(c.min_order_amount ?? c.minOrderValue) || 0,
  maxDiscount: (c.max_discount ?? c.maxDiscount) != null ? Number(c.max_discount ?? c.maxDiscount) : undefined,
  startDate: c.valid_from ?? c.startDate ?? '',
  expiryDate: c.valid_to ?? c.expiryDate ?? '',
  usageLimit: Number(c.usage_limit ?? c.usageLimit) || 100,
  usageCount: Number(c.used_count ?? c.usageCount) || 0,
  isActive: c.is_active ?? c.isActive ?? true,
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    toggleProductStatus,
    resetToDefaultProducts,
  } = useProducts();

  const [securityConfig, setSecurityConfig] = useState<AdminSecurityConfig>(() => {
    try {
      const saved = localStorage.getItem('sag_admin_security_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const config = {
          ...DEFAULT_SECURITY_CONFIG,
          ...parsed,
          sessionVersion: Math.max(parsed.sessionVersion || 0, DEFAULT_SECURITY_CONFIG.sessionVersion),
        };
        const isProductionHost = typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (isProductionHost) {
          config.adminPassword = '';
          config.securityPin = '';
          localStorage.setItem('sag_admin_security_v2', JSON.stringify(config));
        }
        return config;
      }
    } catch {}
    return DEFAULT_SECURITY_CONFIG;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        localStorage.removeItem('sag_admin_auth');
        localStorage.removeItem('sag_admin_session_version');
        return false;
      }
      const isAuth = localStorage.getItem('sag_admin_auth') === 'true';
      const storedVer = Number(localStorage.getItem('sag_admin_session_version') || 0);
      let currentVer = DEFAULT_SECURITY_CONFIG.sessionVersion;
      try {
        const saved = localStorage.getItem('sag_admin_security_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.sessionVersion) currentVer = parsed.sessionVersion;
        }
      } catch {}

      // If version matches current active session version, allow
      if (isAuth && storedVer >= currentVer && currentVer > 1) {
        return true;
      }
      // Stale or older session (e.g. friend's previously saved login): purge immediately
      localStorage.removeItem('sag_admin_auth');
      localStorage.removeItem('sag_admin_email');
      localStorage.removeItem('sag_admin_session_version');
      return false;
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) return null;
    return localStorage.getItem('sag_admin_email') || null;
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Active session validation guard: boots out stale logins immediately if tab is reactivated
  useEffect(() => {
    let active = true;
    const isProductionHost = !['localhost', '127.0.0.1'].includes(window.location.hostname);
    const validateSession = async () => {
      if (isProductionHost) {
        try {
          const response = await fetch('/api/admin-config?action=session', { credentials: 'same-origin' });
          if (!active) return;
          if (!response.ok) {
            setIsAdminLoggedIn(false);
            setAdminEmail(null);
            localStorage.removeItem('sag_admin_email');
            return;
          }
          const session = await response.json();
          setIsAdminLoggedIn(true);
          setAdminEmail(session.username || null);
          const securityResponse = await fetch('/api/admin-config?action=security', { credentials: 'same-origin' });
          if (securityResponse.ok && active) {
            const result = await securityResponse.json();
            const safeConfig = { ...DEFAULT_SECURITY_CONFIG, ...result.securityConfig, adminPassword: '', securityPin: '' };
            setSecurityConfig(safeConfig);
            localStorage.setItem('sag_admin_security_v2', JSON.stringify(safeConfig));
          }
        } catch {
          if (active) {
            setIsAdminLoggedIn(false);
            setAdminEmail(null);
          }
        }
        return;
      }

      try {
        const isAuth = localStorage.getItem('sag_admin_auth') === 'true';
        const storedVer = Number(localStorage.getItem('sag_admin_session_version') || 0);
        const currentVer = securityConfig.sessionVersion || DEFAULT_SECURITY_CONFIG.sessionVersion;

        if (isAuth && (storedVer < currentVer || currentVer <= 1)) {
          // Stale session detected (e.g. friend's old phone session) - purge immediately
          setIsAdminLoggedIn(false);
          setAdminEmail(null);
          localStorage.removeItem('sag_admin_auth');
          localStorage.removeItem('sag_admin_email');
          localStorage.removeItem('sag_admin_session_version');
        }
      } catch {}
    };

    validateSession();
    window.addEventListener('focus', validateSession);
    window.addEventListener('storage', validateSession);
    return () => {
      active = false;
      window.removeEventListener('focus', validateSession);
      window.removeEventListener('storage', validateSession);
    };
  }, [securityConfig.sessionVersion]);

  // Datasets initialized from empty/defaults, fully controlled by Supabase single source of truth
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('sag_customers_local');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(() => {
    try {
      const saved = localStorage.getItem('sag_homepage_sections_local');
      if (saved) return mergeHomepageSections(JSON.parse(saved));
    } catch {}
    return INITIAL_SECTIONS;
  });
  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>(() => {
    try {
      const saved = localStorage.getItem('sag_hero_config_local');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_HERO_CONFIG;
  });
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('sag_banners_local');
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('sag_store_settings_local');
      if (saved) {
        const normalized = normalizeStoreBrand(toPublicStoreSettings(JSON.parse(saved)));
        localStorage.setItem('sag_store_settings_local', JSON.stringify(normalized));
        return normalized;
      }
    } catch {}
    return INITIAL_STORE_SETTINGS;
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>(() => {
    try {
      const saved = localStorage.getItem('sag_payment_settings_local');
      if (saved) {
        const safeSettings = toPublicPaymentSettings(JSON.parse(saved));
        localStorage.setItem('sag_payment_settings_local', JSON.stringify(safeSettings));
        return safeSettings;
      }
    } catch {}
    return toPublicPaymentSettings(INITIAL_PAYMENT_SETTINGS);
  });
  const [dealOfTheDay, setDealOfTheDay] = useState<DealOfTheDayConfig>(() => {
    try {
      const saved = localStorage.getItem('sag_deal_of_the_day');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEAL_OF_THE_DAY;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const persistStorefrontSetting = async (key: string, value: unknown, localKey: string) => {
    const isLocalHost = typeof window === 'undefined' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalHost) {
      try {
        localStorage.setItem(localKey, JSON.stringify(value));
      } catch {}
      return;
    }

    const response = await fetch('/api/admin-config', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { [key]: value } }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'Unable to sync storefront setting.');
    }
    try {
      localStorage.setItem(localKey, JSON.stringify(value));
    } catch {}
  };

  const loadSharedStorefrontSettings = async () => {
    if (typeof window === 'undefined' || ['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
    try {
      const response = await fetch('/api/admin-config', { credentials: 'same-origin' });
      if (!response.ok) return;
      const { settings = {} } = await response.json();

      if (settings.homepageSections) {
        const value = mergeHomepageSections(settings.homepageSections);
        setHomepageSections(value);
        localStorage.setItem('sag_homepage_sections_local', JSON.stringify(value));
      }
      if (settings.heroConfig) {
        setHeroConfig(settings.heroConfig);
        localStorage.setItem('sag_hero_config_local', JSON.stringify(settings.heroConfig));
      }
      if (settings.storeSettings) {
        const value = normalizeStoreBrand(settings.storeSettings);
        setStoreSettings(value);
        localStorage.setItem('sag_store_settings_local', JSON.stringify(value));
      }
      if (settings.banners) {
        setBanners(settings.banners);
        localStorage.setItem('sag_banners_local', JSON.stringify(settings.banners));
      }
      if (settings.dealOfTheDay) {
        setDealOfTheDay(settings.dealOfTheDay);
        localStorage.setItem('sag_deal_of_the_day', JSON.stringify(settings.dealOfTheDay));
      }
      if (settings.paymentSettings) {
        const value = toPublicPaymentSettings(settings.paymentSettings);
        setPaymentSettings(value);
        localStorage.setItem('sag_payment_settings_local', JSON.stringify(value));
      }
    } catch (error) {
      console.warn('Shared storefront settings unavailable:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || ['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
    let settingsConnected = false;
    let paymentConnected = false;
    const refreshSharedSettings = () => {
      void loadSharedStorefrontSettings();
    };
    refreshSharedSettings();
    const settingsChannel = supabase
      .channel('storefront-settings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'storefront_settings' }, () => {
        refreshSharedSettings();
      })
      .subscribe((status) => { settingsConnected = status === 'SUBSCRIBED'; });
    const paymentChannel = supabase
      .channel('storefront-payment-settings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'storefront_payment_settings' }, () => {
        refreshSharedSettings();
      })
      .subscribe((status) => { paymentConnected = status === 'SUBSCRIBED'; });
    const fallbackSync = window.setInterval(() => {
      if (!settingsConnected || !paymentConnected) refreshSharedSettings();
    }, 15000);
    window.addEventListener('focus', refreshSharedSettings);
    return () => {
      window.clearInterval(fallbackSync);
      window.removeEventListener('focus', refreshSharedSettings);
      supabase.removeChannel(settingsChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('sag_customers_local', JSON.stringify(customers));
      localStorage.setItem('sag_banners_local', JSON.stringify(banners));
    } catch {}
  }, [customers, banners]);

  const mapBannerToSupabase = (b: any) => {
    const titleData = {
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge,
      buttonText: b.buttonText,
      buttonLink: b.buttonLink,
    };
    const payload: any = {
      title: JSON.stringify(titleData),
      image: b.image,
      isActive: b.isActive,
      position: b.position,
    };
    if (b.id && !String(b.id).startsWith('ban-')) {
      payload.id = Number(b.id);
    }
    return payload;
  };

  const mapBannerFromSupabase = (b: any): Banner => {
    let parsedTitle = { title: b.title, subtitle: '', badge: '', buttonText: '', buttonLink: '' };
    try {
      if (b.title && (String(b.title).startsWith('{') || String(b.title).startsWith('['))) {
        parsedTitle = { ...parsedTitle, ...JSON.parse(b.title) };
      }
    } catch {}

    return {
      id: String(b.id),
      title: parsedTitle.title || b.title || '',
      subtitle: parsedTitle.subtitle || '',
      badge: parsedTitle.badge || '',
      buttonText: parsedTitle.buttonText || '',
      buttonLink: parsedTitle.buttonLink || '',
      image: b.image || '',
      isActive: b.isActive ?? true,
      position: b.position || 'midpage',
    };
  };

  const mapCategoryToSupabase = (c: any) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    image: c.image,
    isActive: c.isActive ?? true,
    itemCount: c.itemCount || '0 Designs',
    tagline: c.tagline || '',
  });

  const mapCouponToSupabase = (c: any) => ({
    id: c.id,
    code: c.code,
      discount_value: Number(c.discountValue) || 0,
      is_active: c.isActive ?? true,
      used_count: Number(c.usageCount) || 0,
      discount_type: c.discountType || 'percentage',
      min_order_amount: Number(c.minOrderValue) || 0,
      valid_from: c.startDate || new Date().toISOString(),
      valid_to: c.expiryDate || new Date().toISOString(),
      usage_limit: Number(c.usageLimit) || 100,
  });

  const mapReviewFromSupabase = (r: any): Review => {
    let comment = String(r.comment || '');
    let status: 'approved' | 'pending' | 'hidden' = 'approved';
    let adminReply = '';
    let date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let sizePurchased: any = undefined;
    let location = 'Artisan, India';
    let productName = '';
    let imageUrl = '';
    let verifiedPurchase = false;

    if (comment.includes('||')) {
      const parts = comment.split('||');
      comment = parts[0];
      try {
        const rich = JSON.parse(parts[1]);
        status = rich.status || 'approved';
        adminReply = rich.adminReply || '';
        date = rich.date || date;
        sizePurchased = rich.sizePurchased;
        location = rich.location || location;
        productName = rich.productName || '';
        imageUrl = rich.imageUrl || '';
        verifiedPurchase = Boolean(rich.verifiedPurchase);
      } catch {}
    }

    return {
      id: String(r.id),
      productId: String(r.productId || '0'),
      productName: productName || r.productName || '',
      userName: r.userName || 'Anonymous',
      rating: Number(r.rating) || 5,
      comment,
      status,
      adminReply,
      date,
      verifiedPurchase: Boolean(r.verified_purchase ?? verifiedPurchase),
      sizePurchased,
      location,
      imageUrl,
    };
  };

  const mapReviewToSupabase = (r: any) => {
    const richData = {
      status: r.status || 'pending',
      adminReply: r.adminReply || '',
      date: r.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      sizePurchased: r.sizePurchased,
      location: r.location,
      productName: r.productName,
      imageUrl: r.imageUrl,
      verifiedPurchase: Boolean(r.verifiedPurchase),
    };
    const payload: any = {
      productId: r.productId ? (isNaN(Number(r.productId)) ? 0 : Number(r.productId)) : 0,
      userName: r.userName,
      rating: r.rating,
      comment: `${r.comment}||${JSON.stringify(richData)}`,
    };
    if (r.id && !isNaN(Number(r.id))) {
      payload.id = Number(r.id);
    }
    return payload;
  };

  const mapCustomerFromSupabase = (c: any): Customer => ({
    id: String(c.id),
    name: c.name || '',
    email: c.email || '',
    status: c.status || 'active',
    totalSpent: Number(c.totalSpent) || 0,
    phone: '',
    totalOrders: 0,
    lastOrderDate: '',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  const mapCustomerToSupabase = (c: any) => ({
    name: c.name,
    email: c.email,
    status: c.status,
    totalSpent: Number(c.totalSpent) || 0,
  });

  // Public storefront settings are persisted through the protected server API.
  const saveHomepageSectionsToSupabase = async (nextSections: HomepageSectionConfig[]) => {
    await persistStorefrontSetting('homepageSections', nextSections, 'sag_homepage_sections_local');
  };

  const saveStoreSettingsToSupabase = async (nextStore: StoreSettings) => {
    await persistStorefrontSetting('storeSettings', toPublicStoreSettings(nextStore), 'sag_store_settings_local');
  };

  const savePaymentSettingsToSupabase = async (nextPayment: PaymentGatewaySettings) => {
    await persistStorefrontSetting(
      'paymentSettings',
      toPublicPaymentSettings(nextPayment),
      'sag_payment_settings_local'
    );
  };

  const saveHeroConfigToSupabase = async (nextHero: HeroBannerConfig) => {
    await persistStorefrontSetting('heroConfig', nextHero, 'sag_hero_config_local');
  };

  // Fetch store data from Supabase, loading tables independently to prevent single-table failures from blocking others
  const fetchData = async () => {
    try {
      // 1. Fetch Categories & Live Product Counts from Supabase 'products'
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      const { data: prodCatData } = await supabase.from('products').select('category');

      const liveCountsMap: Record<string, number> = {};
      if (prodCatData) {
        prodCatData.forEach((p: any) => {
          if (p.category) {
            liveCountsMap[p.category] = (liveCountsMap[p.category] || 0) + 1;
          }
        });
      }

      if (catError) {
        console.error('Supabase fetch categories error:', catError);
      } else if (catData) {
        setCategories(catData.map((c: any) => {
          const liveCount = liveCountsMap[c.name] ?? 0;
          return {
            id: String(c.id),
            name: c.name || '',
            title: c.title || '',
            image: c.image || '',
            isActive: c.isActive ?? true,
            itemCount: liveCount > 0 ? `${liveCount}+ Designs` : `${liveCount} Designs`,
            tagline: c.tagline || '',
          };
        }));
      }

      // 2. Fetch Orders
      let parsedOrders: Order[] = [];
      try {
        const { data: ordData, error: ordError } = await supabase.from('orders').select('*');
        if (ordError) {
          console.warn('Supabase fetch orders notice:', ordError.message || ordError);
        } else if (ordData) {
          parsedOrders = ordData.map(mapOrderFromSupabase);
          setOrders(parsedOrders);
        }
      } catch (err) {
        console.warn('Orders fetch network notice:', err);
      }

      // 4. Fetch Coupons
      try {
        const { data: coupData, error: coupError } = await supabase.from('coupons').select('*');
        if (coupError) {
          console.warn('Supabase fetch coupons notice:', coupError.message || coupError);
        } else if (coupData) {
          setCoupons(coupData.map(mapCouponFromSupabase));
        }
      } catch (err) {
        console.warn('Coupons fetch network notice:', err);
      }

      // 5. Fetch Reviews
      try {
        const { data: revData, error: revError } = await supabase.from('reviews').select('*');
        if (revError) {
          console.warn('Supabase fetch reviews notice:', revError.message || revError);
        } else if (revData) {
          setReviewsList(revData.map(mapReviewFromSupabase));
        }
      } catch (err) {
        console.warn('Reviews fetch network notice:', err);
      }

      // Store settings and promotional banners use localStorage until a protected API exists.
    } catch (err) {
      console.error('General Supabase fetch data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time updates for automatic multi-device synchronization
    const tables = ['categories', 'orders', 'coupons', 'reviews'];
    const channels = tables.map(table => {
      return supabase
        .channel(`${table}-channel`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            fetchData();
          }
        )
        .subscribe();
    });

    // Real-time leads from Firestore with quota protection
    let unsubscribeLeads: () => void = () => {};
    if (!isQuotaExhausted()) {
      try {
        const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
        unsubscribeLeads = onSnapshot(
          leadsQuery,
          (snapshot) => {
            const leadsData: Lead[] = [];
            snapshot.forEach((doc) => {
              leadsData.push({ id: doc.id, ...doc.data() } as Lead);
            });
            setLeads(leadsData);
          },
          (err) => {
            if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
              markFirestoreQuotaExhausted();
            }
          }
        );
      } catch (err: any) {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
          markFirestoreQuotaExhausted();
        }
      }
    }

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
      unsubscribeLeads();
    };
  }, []);

  // Auto-sync hero slides when real products are available or updated from Supabase
  useEffect(() => {
    if (products && products.length > 0) {
      if (!heroConfig?.slides || heroConfig.slides.length === 0) {
        const freshSlides = generateHeroSlidesFromProducts(products);
        const newConfig: HeroBannerConfig = { slides: freshSlides };
        void saveHeroConfigToSupabase(newConfig)
          .then(() => setHeroConfig(newConfig))
          .catch((error) => console.warn('Hero live sync notice:', error));
        return;
      }

      // Check if any existing hero slide needs price/title/image sync with updated products
      let updatedSome = false;
      const updatedSlides = heroConfig.slides.map((slide) => {
        const matched = products.find(
          (p) =>
            (slide.productId && String(p.id) === String(slide.productId)) ||
            (slide.link && String(p.id) === String(slide.link)) ||
            p.name === slide.title
        );

        if (matched) {
          const freshPrice = Number(matched.price) || slide.price;
          const freshOrigPrice = Number(matched.originalPrice) || Math.round(freshPrice * 1.85);
          const freshImg = (matched.images && matched.images.length > 0) ? matched.images[0] : ((matched as any).image || slide.image);
          const freshTitle = matched.name || slide.title;

          if (
            slide.price !== freshPrice ||
            slide.originalPrice !== freshOrigPrice ||
            slide.title !== freshTitle ||
            slide.image !== freshImg ||
            slide.productId !== matched.id
          ) {
            updatedSome = true;
            return {
              ...slide,
              productId: matched.id,
              price: freshPrice,
              originalPrice: freshOrigPrice,
              title: freshTitle,
              image: freshImg,
            };
          }
        }
        return slide;
      });

      if (updatedSome) {
        const newConfig: HeroBannerConfig = { slides: updatedSlides };
        void saveHeroConfigToSupabase(newConfig)
          .then(() => setHeroConfig(newConfig))
          .catch((error) => console.warn('Hero live sync notice:', error));
      }
    }
  }, [products]);

  // Auth Handler with hardened security & PIN check
  const loginAdmin = async (
    usernameOrEmail: string, 
    pass: string, 
    pin?: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!usernameOrEmail || !pass) {
      return { success: false, message: 'Please provide both username and password.' };
    }

    if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      try {
        const response = await fetch('/api/admin-config?action=login', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameOrEmail, password: pass, pin }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) return { success: false, message: result.error || 'Admin authentication failed.' };
        const securityResponse = await fetch('/api/admin-config?action=security', { credentials: 'same-origin' });
        if (securityResponse.ok) {
          const securityResult = await securityResponse.json();
          setSecurityConfig((previous) => ({ ...previous, ...securityResult.securityConfig }));
        }
        setIsAdminLoggedIn(true);
        setAdminEmail(usernameOrEmail);
        localStorage.setItem('sag_admin_auth', 'true');
        localStorage.setItem('sag_admin_email', usernameOrEmail);
        localStorage.setItem('sag_admin_session_version', String(result.sessionVersion || 1));
        return { success: true };
      } catch {
        return { success: false, message: 'Admin authentication service unavailable.' };
      }
    }

    const inputLower = usernameOrEmail.trim().toLowerCase();
    const configuredUser = (securityConfig.adminUsername || 'muskan').trim().toLowerCase();
    const isUsernameMatch = 
      inputLower === configuredUser || 
      inputLower === `${configuredUser}@suitauragirls.com` ||
      inputLower === 'muskan' || 
      inputLower === 'muskan@suitauragirls.com';

    // Strictly check configured admin password (old 'abhi' is permanently rejected)
    const isPasswordMatch = pass === securityConfig.adminPassword;

    if (!isUsernameMatch || !isPasswordMatch) {
      return { success: false, message: 'Invalid admin username or password.' };
    }

    // Check PIN if required
    if (securityConfig.requirePin) {
      if (!pin || pin.trim() !== securityConfig.securityPin.trim()) {
        return { success: false, message: 'Invalid 6-digit Security PIN.' };
      }
    }

    setIsAdminLoggedIn(true);
    setAdminEmail(usernameOrEmail);
    localStorage.setItem('sag_admin_auth', 'true');
    localStorage.setItem('sag_admin_email', usernameOrEmail);
    localStorage.setItem('sag_admin_session_version', String(securityConfig.sessionVersion));
    return { success: true };
  };

  const logoutAdmin = () => {
    if (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      void fetch('/api/admin-config?action=logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    }
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    localStorage.removeItem('sag_admin_auth');
    localStorage.removeItem('sag_admin_email');
    localStorage.removeItem('sag_admin_session_version');
  };

  const updateSecurityConfig = async (updated: Partial<AdminSecurityConfig>) => {
    const next = { ...securityConfig, ...updated };
    const isProductionHost = typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isProductionHost) {
      const response = await fetch('/api/admin-config', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ securityConfig: next }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to update admin security settings.');
      next.sessionVersion = result.sessionVersion || next.sessionVersion + 1;
    }
    const savedConfig = isProductionHost ? { ...next, adminPassword: '', securityPin: '' } : next;
    setSecurityConfig(savedConfig);
    try {
      localStorage.setItem('sag_admin_security_v2', JSON.stringify(savedConfig));
    } catch {}
  };

  const invalidateAllAdminSessions = async () => {
    const nextVer = (securityConfig.sessionVersion || 2) + 1;
    await updateSecurityConfig({ sessionVersion: nextVer });
    logoutAdmin();
  };

  // Category Operations
  const addCategory = async (cat: Omit<CategoryItem, 'id'>) => {
    const newId = `cat-${Date.now().toString().slice(-6)}`;
    const newCat = { id: newId, ...cat };
    setCategories((prev) => [...prev, newCat]);
    try {
      const payload = mapCategoryToSupabase(newCat);
      await supabase.from('categories').insert([payload]);
    } catch (error) {
      console.warn('Supabase add category notice:', error);
    }
  };

  const updateCategory = async (id: string, updated: Partial<CategoryItem>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    try {
      const payload = mapCategoryToSupabase({ ...updated, id });
      await supabase.from('categories').update(payload).eq('id', id);
    } catch (error) {
      console.warn('Supabase update category notice:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (error) {
      console.warn('Supabase delete category notice:', error);
    }
  };

  // Order Operations
  const updateOrderStatus = async (
    orderNumber: string,
    status: AdminOrderStatus,
    trackingNumber?: string,
    notes?: string
  ) => {
    const originalOrder = orders.find(o => o.orderNumber === orderNumber);
    if (!originalOrder) return;

    const updatedOrder = {
      ...originalOrder,
      status,
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(notes ? { notes } : {}),
    };

    setOrders((prev) =>
      prev.map((ord) => (ord.orderNumber === orderNumber ? updatedOrder : ord))
    );

    try {
      const payload = mapOrderToSupabase(updatedOrder);
      const { error } = await supabase.from('orders').update(payload).eq('order_number', orderNumber);
      if (error) throw error;
      
    } catch (error) {
      console.warn('Supabase update order notice:', error);
    }
  };

  const updateOrderPaymentStatus = async (
    orderNumber: string,
    paymentStatus: 'Paid' | 'Pending Verification' | 'Unpaid'
  ) => {
    const originalOrder = orders.find(o => o.orderNumber === orderNumber);
    if (!originalOrder) return;

    const updatedOrder = {
      ...originalOrder,
      paymentStatus,
    };

    setOrders((prev) =>
      prev.map((ord) => (ord.orderNumber === orderNumber ? updatedOrder : ord))
    );

    try {
      const payload = mapOrderToSupabase(updatedOrder);
      const { error } = await supabase.from('orders').update(payload).eq('order_number', orderNumber);
      if (error) throw error;
      
    } catch (error) {
      console.warn('Supabase update payment status notice:', error);
    }
  };

  const addOrder = async (order: Order) => {
    const payload = mapOrderToSupabase(order);
    const { error } = await supabase.from('orders').upsert([payload], { onConflict: 'order_number' });
    if (error) throw new Error(`Order could not be saved: ${error.message}`);

    setOrders((prev) => [order, ...prev.filter((existing) => existing.orderNumber !== order.orderNumber)]);

    const custEmail = (order.customerEmail || '').trim().toLowerCase();
    if (custEmail) {
      const existing = customers.find((customer) => customer.email.toLowerCase() === custEmail);
      const nextCustomers = existing
        ? customers.map((customer) => customer.email.toLowerCase() === custEmail
            ? {
                ...customer,
                totalOrders: (customer.totalOrders || 0) + 1,
                totalSpent: (Number(customer.totalSpent) || 0) + Number(order.finalTotal || 0),
                phone: customer.phone || order.customerMobile || '',
                lastOrderDate: order.date,
              }
            : customer)
        : [{
            id: `order_${custEmail}`,
            name: order.customerName || 'Customer',
            email: custEmail,
            phone: order.customerMobile || '',
            totalOrders: 1,
            totalSpent: Number(order.finalTotal || 0),
            lastOrderDate: order.date,
            status: 'active' as const,
            joinedDate: new Date().toISOString().split('T')[0],
          }, ...customers];
      setCustomers(nextCustomers);
    }
  };

  const deleteOrder = async (orderNumber: string) => {
    setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
    try {
      const { error } = await supabase.from('orders').delete().eq('order_number', orderNumber);
      if (error) throw error;
    } catch (error) {
      console.warn('Supabase delete order notice:', error);
    }
  };

  // Customer Operations
  const updateCustomerStatus = async (id: string, status: 'active' | 'inactive') => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  // Coupon Operations
  const addCoupon = async (coupon: Omit<Coupon, 'id' | 'usageCount'>) => {
    const newId = `coup-${Date.now().toString().slice(-6)}`;
    const newCoup = { id: newId, usageCount: 0, ...coupon };
    setCoupons((prev) => [newCoup, ...prev]);
    try {
      const payload = mapCouponToSupabase(newCoup);
      await supabase.from('coupons').insert([payload]);
    } catch (error) {
      console.warn('Supabase add coupon notice:', error);
    }
  };

  const updateCoupon = async (id: string, updated: Partial<Coupon>) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    try {
      const payload = mapCouponToSupabase({ ...updated, id });
      await supabase.from('coupons').update(payload).eq('id', id);
    } catch (error) {
      console.warn('Supabase update coupon notice:', error);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await supabase.from('coupons').delete().eq('id', id);
    } catch (error) {
      console.warn('Supabase delete coupon notice:', error);
    }
  };

  const toggleCouponStatus = (id: string) => {
    const target = coupons.find(c => c.id === id);
    if (!target) return;
    updateCoupon(id, { isActive: !target.isActive });
  };

  // Homepage Operations
  const toggleHomepageSection = async (id: string) => {
    const nextSections = homepageSections.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec));
    await saveHomepageSectionsToSupabase(nextSections);
    setHomepageSections(nextSections);
  };

  const moveHomepageSection = async (id: string, direction: 'up' | 'down') => {
    const idx = homepageSections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= homepageSections.length) return;

    const updated = [...homepageSections];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    const nextSections = updated.map((sec, i) => ({ ...sec, order: i + 1 }));
    await saveHomepageSectionsToSupabase(nextSections);
    setHomepageSections(nextSections);
  };

  const reorderHomepageSections = async (newSections: HomepageSectionConfig[]) => {
    const formatted = newSections.map((sec, i) => ({ ...sec, order: i + 1 }));
    await saveHomepageSectionsToSupabase(formatted);
    setHomepageSections(formatted);
  };

  const resetHomepageSectionsToDefault = async () => {
    await saveHomepageSectionsToSupabase(INITIAL_SECTIONS);
    setHomepageSections(INITIAL_SECTIONS);
  };

  const updateHeroConfig = async (updated: Partial<HeroBannerConfig>) => {
    const nextHero = { ...heroConfig, ...updated };
    await saveHeroConfigToSupabase(nextHero);
    setHeroConfig(nextHero);
  };

  const syncHeroWithLiveProducts = async () => {
    const freshSlides = generateHeroSlidesFromProducts(products);
    const newConfig: HeroBannerConfig = { slides: freshSlides };
    setHeroConfig(newConfig);
    try {
      await updateHeroConfig(newConfig);
    } catch (e) {
      console.warn('Hero live sync notice:', e);
    }
  };

  // Banner Operations
  const addBanner = async (banner: Omit<Banner, 'id'>) => {
    const newId = String(Math.floor(Math.random() * 10000000) + 1);
    const newBan = { id: newId, ...banner };
    const nextBanners = [newBan, ...banners];
    await persistStorefrontSetting('banners', nextBanners, 'sag_banners_local');
    setBanners(nextBanners);
  };

  const updateBanner = async (id: string, updated: Partial<Banner>) => {
    const nextBanners = banners.map((banner) => (banner.id === id ? { ...banner, ...updated } : banner));
    await persistStorefrontSetting('banners', nextBanners, 'sag_banners_local');
    setBanners(nextBanners);
  };

  const deleteBanner = async (id: string) => {
    const nextBanners = banners.filter((banner) => banner.id !== id);
    await persistStorefrontSetting('banners', nextBanners, 'sag_banners_local');
    setBanners(nextBanners);
  };

  const toggleBannerStatus = (id: string) => {
    const target = banners.find(b => b.id === id);
    if (!target) return;
    updateBanner(id, { isActive: !target.isActive });
  };

  // Review Operations
  const addReview = async (reviewData: Omit<Review, 'id'> & { id?: string }) => {
    const numericId = Date.now();
    const newId = reviewData.id || String(numericId);
    const newReview: Review = {
      id: newId,
      date: reviewData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: reviewData.status || 'pending',
      verifiedPurchase: reviewData.verifiedPurchase ?? true,
      ...reviewData,
    };

    setReviewsList((prev) => [newReview, ...prev]);

    try {
      const payload = {
        id: numericId,
        productId: reviewData.productId ? (isNaN(Number(reviewData.productId)) ? 0 : Number(reviewData.productId)) : 0,
        userName: reviewData.userName,
        rating: Number(reviewData.rating) || 5,
        comment: `${reviewData.comment}||${JSON.stringify({
          status: reviewData.status || 'pending',
          adminReply: reviewData.adminReply || '',
          date: newReview.date,
          sizePurchased: reviewData.sizePurchased,
          location: reviewData.location || 'India',
          productName: reviewData.productName || '',
          imageUrl: reviewData.imageUrl || '',
        })}`
      };
      await supabase.from('reviews').insert([payload]);
    } catch (error) {
      console.warn('Supabase add review notice:', error);
    }
  };

  const updateReview = async (id: string, updatedData: Partial<Review>) => {
    const target = reviewsList.find(r => r.id === id);
    if (!target) return;
    const updatedReview = { ...target, ...updatedData };
    setReviewsList((prev) => prev.map((r) => (r.id === id ? updatedReview : r)));
    try {
      const payload = mapReviewToSupabase(updatedReview);
      await supabase.from('reviews').update(payload).eq('id', id);
    } catch (error) {
      console.warn('Supabase update review notice:', error);
    }
  };

  const updateReviewStatus = async (id: string, status: 'approved' | 'pending' | 'hidden') => {
    const target = reviewsList.find(r => r.id === id);
    if (!target) return;
    const updatedReview = { ...target, status };
    setReviewsList((prev) => prev.map((r) => (r.id === id ? updatedReview : r)));
    try {
      const payload = mapReviewToSupabase(updatedReview);
      await supabase.from('reviews').update(payload).eq('id', id);
    } catch (error) {
      console.warn('Supabase update review notice:', error);
    }
  };

  const replyToReview = async (id: string, reply: string) => {
    const target = reviewsList.find(r => r.id === id);
    if (!target) return;
    const updatedReview = { ...target, adminReply: reply };
    setReviewsList((prev) => prev.map((r) => (r.id === id ? updatedReview : r)));
    try {
      const payload = mapReviewToSupabase(updatedReview);
      await supabase.from('reviews').update(payload).eq('id', id);
    } catch (error) {
      console.warn('Supabase update review notice:', error);
    }
  };

  const deleteReview = async (id: string) => {
    setReviewsList((prev) => prev.filter((r) => r.id !== id));
    try {
      await supabase.from('reviews').delete().eq('id', id);
    } catch (error) {
      console.warn('Supabase delete review notice:', error);
    }
  };

  // Store & Payment Settings
  const updateStoreSettings = async (updated: Partial<StoreSettings>) => {
    const nextStore = normalizeStoreBrand({ ...storeSettings, ...updated });
    await saveStoreSettingsToSupabase(nextStore);
    setStoreSettings(nextStore);
  };

  const updateDealOfTheDay = async (updated: Partial<DealOfTheDayConfig>) => {
    const nextDeal = { ...dealOfTheDay, ...updated };
    await persistStorefrontSetting('dealOfTheDay', nextDeal, 'sag_deal_of_the_day');
    setDealOfTheDay(nextDeal);
  };

  const updatePaymentSettings = async (updated: Partial<PaymentGatewaySettings>) => {
    // Keep allowCod permanently false
    const nextPayment = { ...paymentSettings, ...updated, allowCod: false, prepaidOnly: true };
    setPaymentSettings(nextPayment);
    await savePaymentSettingsToSupabase(nextPayment);
  };

  const resetStoreDataToDefaults = async () => {
    await resetToDefaultProducts();
    setCategories(INITIAL_CATEGORIES);
    setOrders(INITIAL_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setCoupons(INITIAL_COUPONS);
    setHomepageSections(INITIAL_SECTIONS);
    setHeroConfig(INITIAL_HERO_CONFIG);
    setBanners(INITIAL_BANNERS);
    setReviewsList(INITIAL_REVIEWS);
    setStoreSettings(INITIAL_STORE_SETTINGS);
    setPaymentSettings(INITIAL_PAYMENT_SETTINGS);
    await Promise.all([
      saveHomepageSectionsToSupabase(INITIAL_SECTIONS),
      saveHeroConfigToSupabase(INITIAL_HERO_CONFIG),
      saveStoreSettingsToSupabase(INITIAL_STORE_SETTINGS),
      persistStorefrontSetting('banners', INITIAL_BANNERS, 'sag_banners_local'),
      persistStorefrontSetting('dealOfTheDay', INITIAL_DEAL_OF_THE_DAY, 'sag_deal_of_the_day'),
    ]);
  };

  // Lead Operations
  const updateLeadOfferStatus = async (id: string, status: boolean) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, offerSent: status } : l)));
    if (!isQuotaExhausted()) {
      try {
        await updateDoc(doc(db, 'leads', id), { offerSent: status });
      } catch (error: any) {
        if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota')) {
          markFirestoreQuotaExhausted();
        }
      }
    }
  };

  const deleteLead = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (!isQuotaExhausted()) {
      try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'leads', id));
      } catch (error: any) {
        if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota')) {
          markFirestoreQuotaExhausted();
        }
      }
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminLoggedIn,
        adminEmail,
        adminTab,
        setAdminTab,
        loginAdmin,
        logoutAdmin,
        securityConfig,
        updateSecurityConfig,
        invalidateAllAdminSessions,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductStatus,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        orders,
        addOrder,
        updateOrderStatus,
        updateOrderPaymentStatus,
        deleteOrder,
        customers,
        updateCustomerStatus,
        leads,
        updateLeadOfferStatus,
        deleteLead,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        visitorStats: {
          liveActiveCount: 0, // Placeholder, usually handled by visitorTracker
          todayUniqueCount: 0,
          totalUniqueCount: 0,
          checkoutInitiatedCount: 0,
          cartAddedCount: 0,
        },
        homepageSections,
        toggleHomepageSection,
        moveHomepageSection,
        reorderHomepageSections,
        resetHomepageSectionsToDefault,
        heroConfig,
        updateHeroConfig,
        syncHeroWithLiveProducts,
        dealOfTheDay,
        updateDealOfTheDay,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerStatus,
        reviewsList,
        reviews: reviewsList,
        addReview,
        updateReview,
        updateReviewStatus,
        replyToReview,
        deleteReview,
        storeSettings,
        updateStoreSettings,
        paymentSettings,
        updatePaymentSettings,
        resetStoreDataToDefaults,
        isLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
