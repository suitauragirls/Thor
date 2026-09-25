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
import { CATEGORIES_DATA, PRODUCTS_DATA } from '../data/products';

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
  adminUsername: 'muskan',
  adminPassword: 'Muskan@Aura2026#', // New hardened password, invalidating old compromised 'abhi'
  securityPin: '829146',             // 6-digit Secret Security PIN
  secretPathSlug: 'sba-vault',        // Secret administrative portal route e.g. /sba-vault
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
  updateSecurityConfig: (updated: Partial<AdminSecurityConfig>) => void;
  invalidateAllAdminSessions: () => void;

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
    '🌸 SUMMER GRACE JAIPUR',
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
  { id: 'sec-hero', title: '1. Hero Banner Showcase (1:1 Luxury Slider)', key: 'hero', enabled: true, order: 1 },
  { id: 'sec-deal', title: '2. Deal of the Day Spotlight', key: 'dealOfTheDay', enabled: true, order: 2 },
  { id: 'sec-combo', title: '3. Royal Festive Combo Offers (Buy 2 Get 15% OFF)', key: 'comboOffers', enabled: true, order: 3 },
  { id: 'sec-new-arrivals', title: '4. New Arrivals Showcase Grid', key: 'newArrivals', enabled: true, order: 4 },
  { id: 'sec-best-sellers', title: '5. Best Sellers Showcase', key: 'bestSellers', enabled: true, order: 5 },
  { id: 'sec-trending', title: '6. Trending Now Carousel', key: 'trending', enabled: true, order: 6 },
  { id: 'sec-festive', title: '7. Festive Collection Edit', key: 'festive', enabled: true, order: 7 },
  { id: 'sec-why-shop', title: '8. Why Shop With Us (Trust & Quality Pillars)', key: 'whyShop', enabled: true, order: 8 },
  { id: 'sec-reviews', title: '9. Customer Reviews & Ratings Showcase', key: 'reviews', enabled: true, order: 9 },
];

export const mergeHomepageSections = (parsed: any[]): HomepageSectionConfig[] => {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return INITIAL_SECTIONS;
  }

  // Filter out categoryGrid, specialOffer, instagram, newsletter completely from homepage layout
  const excludedKeys = new Set(['categoryGrid', 'specialOffer', 'instagram', 'newsletter']);
  const sanitized = parsed.filter(p => !excludedKeys.has(p.key));
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
  storeName: 'Suit Bliss Aura',
  tagline: 'Elegance That Feels Like You',
  logoText: 'Suit Bliss Aura',
  storeEmail: 'suitblissaura@gmail.com',
  phone: '+91 82384 51017',
  whatsapp: '+91 82384 51017',
  address: 'Jaipur, Rajasthan, India',
  instagramUrl: 'https://instagram.com/suitblissaura',
  facebookUrl: 'https://facebook.com/suitblissaura',
  twitterUrl: '',
  currency: 'INR',
  currencySymbol: '₹',
  shippingCharge: 0,
  freeShippingThreshold: 0,
  supabaseUrl: 'https://cgonpvpjvdqeycdbdyrh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnb25wdnBqdmRxZXljZGJkeXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODI3OTU5OCwiZXhwIjoyMTAzODU1NTk4fQ.mxWXJmymDovThgCWYGLWaUxUrhufNhQJYZsKnHDHrmo',
};
const INITIAL_PAYMENT_SETTINGS: PaymentGatewaySettings = {
  mode: 'test',
  prepaidOnly: true,
  allowCod: false,
  razorpayKeyIdPlaceholder: 'rzp_test_SuitBlissAuraKey2026',
  razorpayKeySecretPlaceholder: '••••••••••••••••••••••••••••',
  webhookSecretPlaceholder: '••••••••••••••••••••••••••••',
  enableUpi: true,
  enableCards: true,
  enableNetBanking: true,
};

const INITIAL_DEAL_OF_THE_DAY: DealOfTheDayConfig = {
  enabled: true,
  productId: 'sba-001',
  customTitle: 'Festive Flash Deal of the Day',
  customSubtitle: 'Floral Printed Cambric Suit Set with Kota Doria Dupatta',
  badgeText: '🔥 24-HOUR SPECIAL DEAL',
  dealPrice: 899,
  endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  durationHours: 24,
  stockText: '3 Left In Stock',
};

// Schema mappers to convert between frontend and Supabase formats
export const mapOrderFromSupabase = (o: any): Order => {
  let richData: any = {};
  let email = String(o.customerEmail || '');
  if (email.includes('||')) {
    const parts = email.split('||');
    email = parts[0];
    try {
      richData = JSON.parse(parts[1]);
    } catch {}
  }
  return {
    orderNumber: o.orderNumber,
    status: o.status as AdminOrderStatus,
    finalTotal: Number(o.finalTotal) || 0,
    customerEmail: email,
    customerName: richData.customerName || '',
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
    items: richData.items || [],
    subtotal: richData.subtotal || 0,
    shippingCharge: richData.shippingCharge || 0,
    couponCode: richData.couponCode || '',
    discountAmount: richData.discountAmount || 0,
    paymentStatus: richData.paymentStatus || 'Pending',
    paymentMethod: richData.paymentMethod || 'Prepaid',
    paymentRef: richData.paymentRef || '',
    date: richData.date || new Date().toISOString(),
    estimatedDeliveryDate: richData.estimatedDeliveryDate || '',
    trackingNumber: richData.trackingNumber || '',
    notes: richData.notes || '',
  };
};

export const mapOrderToSupabase = (o: any) => {
  const richData = {
    customerName: o.customerName,
    customerMobile: o.customerMobile,
    deliveryAddress: o.deliveryAddress,
    items: o.items,
    subtotal: o.subtotal,
    shippingCharge: o.shippingCharge,
    couponCode: o.couponCode,
    discountAmount: o.discountAmount,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    paymentRef: o.paymentRef,
    date: o.date,
    estimatedDeliveryDate: o.estimatedDeliveryDate,
    trackingNumber: o.trackingNumber,
    notes: o.notes,
  };
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    finalTotal: Number(o.finalTotal) || 0,
    customerEmail: `${o.customerEmail || ''}||${JSON.stringify(richData)}`,
  };
};

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
      const saved = localStorage.getItem('sba_admin_security_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SECURITY_CONFIG,
          ...parsed,
          sessionVersion: Math.max(parsed.sessionVersion || 0, DEFAULT_SECURITY_CONFIG.sessionVersion),
        };
      }
    } catch {}
    return DEFAULT_SECURITY_CONFIG;
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const isAuth = localStorage.getItem('sba_admin_auth') === 'true';
      const storedVer = Number(localStorage.getItem('sba_admin_session_version') || 0);
      let currentVer = DEFAULT_SECURITY_CONFIG.sessionVersion;
      try {
        const saved = localStorage.getItem('sba_admin_security_v2');
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
      localStorage.removeItem('sba_admin_auth');
      localStorage.removeItem('sba_admin_email');
      localStorage.removeItem('sba_admin_session_version');
      return false;
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return localStorage.getItem('sba_admin_email') || null;
  });
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Active session validation guard: boots out stale logins immediately if tab is reactivated
  useEffect(() => {
    const validateSession = () => {
      try {
        const isAuth = localStorage.getItem('sba_admin_auth') === 'true';
        const storedVer = Number(localStorage.getItem('sba_admin_session_version') || 0);
        const currentVer = securityConfig.sessionVersion || DEFAULT_SECURITY_CONFIG.sessionVersion;

        if (isAuth && (storedVer < currentVer || currentVer <= 1)) {
          // Stale session detected (e.g. friend's old phone session) - purge immediately
          setIsAdminLoggedIn(false);
          setAdminEmail(null);
          localStorage.removeItem('sba_admin_auth');
          localStorage.removeItem('sba_admin_email');
          localStorage.removeItem('sba_admin_session_version');
        }
      } catch {}
    };

    validateSession();
    window.addEventListener('focus', validateSession);
    window.addEventListener('storage', validateSession);
    return () => {
      window.removeEventListener('focus', validateSession);
      window.removeEventListener('storage', validateSession);
    };
  }, [securityConfig.sessionVersion]);

  // Datasets initialized from empty/defaults, fully controlled by Supabase single source of truth
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(() => {
    try {
      const saved = localStorage.getItem('sba_homepage_sections_local');
      if (saved) return mergeHomepageSections(JSON.parse(saved));
    } catch {}
    return INITIAL_SECTIONS;
  });
  const [heroConfig, setHeroConfig] = useState<HeroBannerConfig>(() => {
    try {
      const saved = localStorage.getItem('sba_hero_config_local');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_HERO_CONFIG;
  });
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('sba_store_settings_local');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          phone: '+91 82384 51017',
          whatsapp: '+91 82384 51017',
        };
      }
    } catch {}
    return INITIAL_STORE_SETTINGS;
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentGatewaySettings>(() => {
    try {
      const saved = localStorage.getItem('sba_payment_settings_local');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PAYMENT_SETTINGS;
  });
  const [dealOfTheDay, setDealOfTheDay] = useState<DealOfTheDayConfig>(() => {
    try {
      const saved = localStorage.getItem('suit_bliss_deal_of_the_day');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEAL_OF_THE_DAY;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    discountValue: Number(c.discountValue) || 0,
    isActive: c.isActive ?? true,
    usageCount: Number(c.usageCount) || 0,
    discountType: c.discountType || 'percentage',
    minOrderValue: Number(c.minOrderValue) || 0,
    maxDiscount: Number(c.maxDiscount) || 0,
    startDate: c.startDate || new Date().toISOString(),
    expiryDate: c.expiryDate || new Date().toISOString(),
    usageLimit: Number(c.usageLimit) || 100,
  });

  const mapCouponFromSupabase = (c: any): Coupon => ({
    id: String(c.id),
    code: c.code || '',
    discountType: (c.discountType === 'fixed' ? 'fixed' : 'percentage'),
    discountValue: Number(c.discountValue) || 0,
    minOrderValue: Number(c.minOrderValue) || 0,
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
    startDate: c.startDate || '',
    expiryDate: c.expiryDate || '',
    usageLimit: Number(c.usageLimit) || 100,
    usageCount: Number(c.usageCount) || 0,
    isActive: c.isActive ?? true,
  });

  const mapReviewFromSupabase = (r: any): Review => {
    let comment = String(r.comment || '');
    let status: 'approved' | 'pending' | 'hidden' = 'approved';
    let adminReply = '';
    let date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let sizePurchased: any = undefined;
    let location = 'Jaipur, India';
    let productName = '';
    let imageUrl = '';

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
      verifiedPurchase: true,
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

  // Helpers to save config JSONs into the banners table with special positions
  const saveHomepageSectionsToSupabase = async (nextSections: HomepageSectionConfig[]) => {
    try {
      localStorage.setItem('sba_homepage_sections_local', JSON.stringify(nextSections));
    } catch {}
    try {
      const { data, error: selectError } = await supabase.from('banners').select('id').eq('position', 'config_homepage_sections').limit(1);
      if (selectError) throw selectError;
      const existingId = data?.[0]?.id;
      const payload: any = {
        title: JSON.stringify(nextSections),
        image: '',
        isActive: true,
        position: 'config_homepage_sections'
      };
      if (existingId) {
        payload.id = existingId;
      } else {
        payload.id = Math.floor(Math.random() * 10000000) + 1;
      }
      const { error: upsertError } = await supabase.from('banners').upsert([payload]);
      if (upsertError) throw upsertError;
    } catch (e) {
      console.warn('Network notice: saved homepage sections locally. Supabase write bypassed:', e);
    }
  };

  const saveStoreSettingsToSupabase = async (nextStore: StoreSettings) => {
    try {
      localStorage.setItem('sba_store_settings_local', JSON.stringify(nextStore));
    } catch {}
    try {
      const { data, error: selectError } = await supabase.from('banners').select('id').eq('position', 'config_store_settings').limit(1);
      if (selectError) throw selectError;
      const existingId = data?.[0]?.id;
      const payload: any = {
        title: JSON.stringify(nextStore),
        image: '',
        isActive: true,
        position: 'config_store_settings'
      };
      if (existingId) {
        payload.id = existingId;
      } else {
        payload.id = Math.floor(Math.random() * 10000000) + 1;
      }
      const { error: upsertError } = await supabase.from('banners').upsert([payload]);
      if (upsertError) throw upsertError;
    } catch (e) {
      console.warn('Network notice: saved store settings locally. Supabase write bypassed:', e);
    }
  };

  const savePaymentSettingsToSupabase = async (nextPayment: PaymentGatewaySettings) => {
    try {
      localStorage.setItem('sba_payment_settings_local', JSON.stringify(nextPayment));
    } catch {}
    try {
      const { data, error: selectError } = await supabase.from('banners').select('id').eq('position', 'config_payment_settings').limit(1);
      if (selectError) throw selectError;
      const existingId = data?.[0]?.id;
      const payload: any = {
        title: JSON.stringify(nextPayment),
        image: '',
        isActive: true,
        position: 'config_payment_settings'
      };
      if (existingId) {
        payload.id = existingId;
      } else {
        payload.id = Math.floor(Math.random() * 10000000) + 1;
      }
      const { error: upsertError } = await supabase.from('banners').upsert([payload]);
      if (upsertError) throw upsertError;
    } catch (e) {
      console.warn('Network notice: saved payment settings locally. Supabase write bypassed:', e);
    }
  };

  const saveHeroConfigToSupabase = async (nextHero: HeroBannerConfig) => {
    try {
      localStorage.setItem('sba_hero_config_local', JSON.stringify(nextHero));
    } catch {}
    try {
      const { data, error: selectError } = await supabase.from('banners').select('id').eq('position', 'config_hero').limit(1);
      if (selectError) throw selectError;
      const existingId = data?.[0]?.id;
      const payload: any = {
        title: JSON.stringify(nextHero),
        image: '',
        isActive: true,
        position: 'config_hero'
      };
      if (existingId) {
        payload.id = existingId;
      } else {
        payload.id = Math.floor(Math.random() * 10000000) + 1;
      }
      const { error: upsertError } = await supabase.from('banners').upsert([payload]);
      if (upsertError) throw upsertError;
    } catch (e) {
      console.warn('Network notice: saved hero config locally. Supabase write bypassed:', e);
    }
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

      // 3. Fetch Customers & enrich with real order metrics (LTV, order count, mobile, last date)
      try {
        const { data: custData, error: custError } = await supabase.from('customers').select('*');
        if (custError) {
          console.warn('Supabase fetch customers notice:', custError.message || custError);
          // Enrich fallback local customers list with parsed orders if available
          setCustomers((prev) => {
            if (!prev || prev.length === 0) return INITIAL_CUSTOMERS;
            return prev.map((cust) => {
              const matchingOrders = parsedOrders.filter(
                (o) =>
                  o.customerEmail?.toLowerCase() === cust.email?.toLowerCase() ||
                  (cust.phone && o.customerMobile === cust.phone)
              );
              if (matchingOrders.length > 0) {
                const calculatedTotal = matchingOrders.reduce(
                  (sum, ord) => sum + (Number(ord.finalTotal) || 0),
                  0
                );
                const latestOrder = [...matchingOrders].sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];
                return {
                  ...cust,
                  totalOrders: matchingOrders.length,
                  totalSpent: calculatedTotal > 0 ? calculatedTotal : cust.totalSpent,
                  phone: cust.phone || latestOrder.customerMobile || '',
                  lastOrderDate: latestOrder.date || cust.lastOrderDate,
                  address: latestOrder.deliveryAddress?.city
                    ? `${latestOrder.deliveryAddress.city}, ${latestOrder.deliveryAddress.state}`
                    : cust.address,
                  city: latestOrder.deliveryAddress?.city || cust.city,
                  state: latestOrder.deliveryAddress?.state || cust.state,
                };
              }
              return cust;
            });
          });
        } else if (custData && custData.length > 0) {
          const mappedCustomers = custData.map(mapCustomerFromSupabase);
          const enriched = mappedCustomers.map((cust) => {
            const matchingOrders = parsedOrders.filter(
              (o) =>
                o.customerEmail?.toLowerCase() === cust.email?.toLowerCase() ||
                (cust.phone && o.customerMobile === cust.phone)
            );
            if (matchingOrders.length > 0) {
              const calculatedTotal = matchingOrders.reduce(
                (sum, ord) => sum + (Number(ord.finalTotal) || 0),
                0
              );
              const latestOrder = [...matchingOrders].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0];
              return {
                ...cust,
                totalOrders: matchingOrders.length,
                totalSpent: calculatedTotal > 0 ? calculatedTotal : cust.totalSpent,
                phone: cust.phone || latestOrder.customerMobile || '',
                lastOrderDate: latestOrder.date || cust.lastOrderDate,
                address: latestOrder.deliveryAddress?.city
                  ? `${latestOrder.deliveryAddress.city}, ${latestOrder.deliveryAddress.state}`
                  : cust.address,
                city: latestOrder.deliveryAddress?.city || cust.city,
                state: latestOrder.deliveryAddress?.state || cust.state,
              };
            }
            return cust;
          });
          setCustomers(enriched);
        }
      } catch (err) {
        console.warn('Customers fetch network notice:', err);
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

      // 6. Fetch Banners & Special configs stored in banners table
      const { data: banData, error: banError } = await supabase.from('banners').select('*');
      if (banError) {
        console.error('Supabase fetch banners error:', banError);
      } else if (banData) {
        const actualBanners: Banner[] = [];
        let parsedHero = INITIAL_HERO_CONFIG;
        let parsedSections = INITIAL_SECTIONS;
        let parsedStore = INITIAL_STORE_SETTINGS;
        let parsedPayment = INITIAL_PAYMENT_SETTINGS;
        let parsedDeal = INITIAL_DEAL_OF_THE_DAY;

        banData.forEach((b: any) => {
          if (b.position === 'config_hero') {
            try { parsedHero = JSON.parse(b.title); } catch {}
          } else if (b.position === 'config_homepage_sections') {
            try { parsedSections = JSON.parse(b.title); } catch {}
          } else if (b.position === 'config_store_settings') {
            try { 
              const parsed = JSON.parse(b.title); 
              parsedStore = {
                ...parsed,
                phone: '+91 82384 51017',
                whatsapp: '+91 82384 51017',
              };
            } catch {}
          } else if (b.position === 'config_payment_settings') {
            try { parsedPayment = JSON.parse(b.title); } catch {}
          } else if (b.position === 'config_deal_of_the_day') {
            try { 
              const d = JSON.parse(b.title);
              parsedDeal = { ...INITIAL_DEAL_OF_THE_DAY, ...d, enabled: d.enabled ?? true };
            } catch {}
          } else {
            actualBanners.push(mapBannerFromSupabase(b));
          }
        });

        setBanners(actualBanners);
        setHeroConfig(parsedHero);
        setHomepageSections(mergeHomepageSections(parsedSections));
        setStoreSettings(parsedStore);
        setPaymentSettings(parsedPayment);
        setDealOfTheDay(parsedDeal);
      }
    } catch (err) {
      console.error('General Supabase fetch data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time updates for automatic multi-device synchronization
    const tables = ['categories', 'orders', 'customers', 'coupons', 'banners', 'reviews'];
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
        setHeroConfig(newConfig);
        saveHeroConfigToSupabase(newConfig);
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
        setHeroConfig(newConfig);
        saveHeroConfigToSupabase(newConfig);
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

    const inputLower = usernameOrEmail.trim().toLowerCase();
    const configuredUser = (securityConfig.adminUsername || 'muskan').trim().toLowerCase();
    const isUsernameMatch = 
      inputLower === configuredUser || 
      inputLower === `${configuredUser}@suitblissaura.com` || 
      inputLower === 'muskan' || 
      inputLower === 'muskan@suitblissaura.com';

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
    localStorage.setItem('sba_admin_auth', 'true');
    localStorage.setItem('sba_admin_email', usernameOrEmail);
    localStorage.setItem('sba_admin_session_version', String(securityConfig.sessionVersion));
    return { success: true };
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    localStorage.removeItem('sba_admin_auth');
    localStorage.removeItem('sba_admin_email');
    localStorage.removeItem('sba_admin_session_version');
  };

  const updateSecurityConfig = (updated: Partial<AdminSecurityConfig>) => {
    setSecurityConfig((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('sba_admin_security_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const invalidateAllAdminSessions = () => {
    const nextVer = (securityConfig.sessionVersion || 2) + 1;
    updateSecurityConfig({ sessionVersion: nextVer });
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    localStorage.removeItem('sba_admin_auth');
    localStorage.removeItem('sba_admin_email');
    localStorage.removeItem('sba_admin_session_version');
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
      await supabase.from('orders').update(payload).eq('orderNumber', orderNumber);
      
      // Sync to Firestore if quota is available
      if (!isQuotaExhausted()) {
        try {
          await updateDoc(doc(db, 'orders', orderNumber), { status: status });
        } catch (err: any) {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
            markFirestoreQuotaExhausted();
          }
        }
      }
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
      await supabase.from('orders').update(payload).eq('orderNumber', orderNumber);
      
      if (!isQuotaExhausted()) {
        try {
          await updateDoc(doc(db, 'orders', orderNumber), { paymentStatus });
        } catch (err: any) {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
            markFirestoreQuotaExhausted();
          }
        }
      }
    } catch (error) {
      console.warn('Supabase update payment status notice:', error);
    }
  };

  const addOrder = async (order: Order) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.orderNumber !== order.orderNumber)]);
    try {
      const payload = mapOrderToSupabase(order);
      await supabase.from('orders').upsert([payload]);
      
      if (!isQuotaExhausted()) {
        try {
          await setDoc(doc(db, 'orders', order.orderNumber), order);
        } catch (err: any) {
          if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
            markFirestoreQuotaExhausted();
          }
        }
      }

      // Decrement inventory in Supabase / products state
      if (order.items && order.items.length > 0) {
        for (const itm of order.items) {
          const pId = itm.product.id;
          const targetProd = products.find((p) => p.id === pId);
          if (targetProd && typeof targetProd.stockQuantity === 'number') {
            const nextStock = Math.max(0, targetProd.stockQuantity - itm.quantity);
            await updateProduct(pId, { stockQuantity: nextStock });
          }
        }
      }

      // Upsert / sync customer in Supabase
      const custEmail = (order.customerEmail || '').trim().toLowerCase();
      if (custEmail) {
        const { data: existingCust } = await supabase
          .from('customers')
          .select('*')
          .eq('email', custEmail)
          .maybeSingle();

        if (existingCust) {
          const updatedSpent = (Number(existingCust.totalSpent) || 0) + Number(order.finalTotal || 0);
          await supabase.from('customers').update({
            totalSpent: updatedSpent,
            status: 'active',
          }).eq('id', existingCust.id);

          setCustomers((prev) =>
            prev.map((c) =>
              c.id === String(existingCust.id)
                ? {
                    ...c,
                    totalSpent: updatedSpent,
                    totalOrders: (c.totalOrders || 0) + 1,
                    phone: c.phone || order.customerMobile,
                    lastOrderDate: order.date,
                  }
                : c
            )
          );
        } else {
          const newCust = {
            name: order.customerName || 'Customer',
            email: custEmail,
            totalSpent: Number(order.finalTotal || 0),
            status: 'active',
          };
          const { data: insertedCust } = await supabase
            .from('customers')
            .insert([newCust])
            .select()
            .maybeSingle();

          if (insertedCust) {
            setCustomers((prev) => [
              {
                id: String(insertedCust.id),
                name: insertedCust.name,
                email: insertedCust.email,
                phone: order.customerMobile || '',
                totalOrders: 1,
                totalSpent: Number(insertedCust.totalSpent),
                lastOrderDate: order.date,
                status: 'active',
                joinedDate: new Date().toISOString().split('T')[0],
              },
              ...prev,
            ]);
          }
        }
      }
    } catch (err) {
      console.warn('addOrder notice:', err);
    }
  };

  const deleteOrder = async (orderNumber: string) => {
    setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
    try {
      await supabase.from('orders').delete().eq('orderNumber', orderNumber);
    } catch (error) {
      console.warn('Supabase delete order notice:', error);
    }
  };

  // Customer Operations
  const updateCustomerStatus = async (id: string, status: 'active' | 'inactive') => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    try {
      await supabase.from('customers').update({ status }).eq('id', id);
    } catch (error) {
      console.warn('Supabase update customer notice:', error);
    }
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
    setHomepageSections(nextSections);
    await saveHomepageSectionsToSupabase(nextSections);
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
    setHomepageSections(nextSections);
    await saveHomepageSectionsToSupabase(nextSections);
  };

  const reorderHomepageSections = async (newSections: HomepageSectionConfig[]) => {
    const formatted = newSections.map((sec, i) => ({ ...sec, order: i + 1 }));
    setHomepageSections(formatted);
    await saveHomepageSectionsToSupabase(formatted);
  };

  const resetHomepageSectionsToDefault = async () => {
    setHomepageSections(INITIAL_SECTIONS);
    await saveHomepageSectionsToSupabase(INITIAL_SECTIONS);
  };

  const updateHeroConfig = async (updated: Partial<HeroBannerConfig>) => {
    const nextHero = { ...heroConfig, ...updated };
    setHeroConfig(nextHero);
    try {
      localStorage.setItem('sba_hero_config_local', JSON.stringify(nextHero));
    } catch {}
    try {
      const { data, error: selectError } = await supabase.from('banners').select('id').eq('position', 'config_hero').limit(1);
      if (selectError) throw selectError;
      const existingId = data?.[0]?.id;
      const payload: any = {
        title: JSON.stringify(nextHero),
        image: '',
        isActive: true,
        position: 'config_hero'
      };
      if (existingId) {
        payload.id = existingId;
      } else {
        payload.id = Math.floor(Math.random() * 10000000) + 1;
      }
      const { error: upsertError } = await supabase.from('banners').upsert([payload]);
      if (upsertError) throw upsertError;
    } catch (error) {
      console.warn('Network notice: saved hero config locally. Supabase write bypassed:', error);
    }
  };

  const syncHeroWithLiveProducts = async () => {
    const freshSlides = generateHeroSlidesFromProducts(products.length > 0 ? products : PRODUCTS_DATA);
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
    setBanners((prev) => [newBan, ...prev]);
    try {
      const payload = mapBannerToSupabase(newBan);
      const { error } = await supabase.from('banners').insert([payload]);
      if (error) throw error;
    } catch (error) {
      console.error('Supabase add banner error:', error);
    }
  };

  const updateBanner = async (id: string, updated: Partial<Banner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    try {
      const payload = mapBannerToSupabase({ ...updated, id });
      await supabase.from('banners').update(payload).eq('id', Number(id));
    } catch (error) {
      console.warn('Supabase update banner notice:', error);
    }
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await supabase.from('banners').delete().eq('id', Number(id));
    } catch (error) {
      console.warn('Supabase delete banner notice:', error);
    }
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
    const nextStore = { ...storeSettings, ...updated };
    setStoreSettings(nextStore);
    await saveStoreSettingsToSupabase(nextStore);
  };

  const updateDealOfTheDay = async (updated: Partial<DealOfTheDayConfig>) => {
    const nextDeal = { ...dealOfTheDay, ...updated };
    setDealOfTheDay(nextDeal);
    try {
      localStorage.setItem('suit_bliss_deal_of_the_day', JSON.stringify(nextDeal));
    } catch {}

    try {
      const { data, error: selectError } = await supabase.from('banners').select('id').eq('position', 'config_deal_of_the_day').limit(1);
      const existingId = data?.[0]?.id;
      const payload: any = {
        title: JSON.stringify(nextDeal),
        image: '',
        isActive: nextDeal.enabled,
        position: 'config_deal_of_the_day'
      };
      if (existingId) {
        payload.id = existingId;
      } else {
        payload.id = Math.floor(Math.random() * 10000000) + 1;
      }
      await supabase.from('banners').upsert([payload]);
    } catch (e) {
      console.error('Error saving deal of the day to supabase:', e);
    }
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
