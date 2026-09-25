import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { PRODUCTS_DATA } from '../data/products';

const LOCAL_STORAGE_KEY = 'sba_custom_products_v3';

export interface ProductContextType {
  isLoading: boolean;
  products: Product[];
  allProducts: Product[];
  activeProducts: Product[];
  addProduct: (productData: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | undefined>;
  toggleProductStatus: (id: string) => Promise<void>;
  getProductById: (id: string | null | undefined) => Product | undefined;
  resetToDefaultProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const ALL_STANDARD_SIZES: ProductSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

// Helper to retrieve any products saved in local storage across version keys
const getLocalStorageProducts = (): Product[] => {
  const keysToTry = [LOCAL_STORAGE_KEY, 'sba_products', 'sba_products_v1', 'sba_custom_products', 'suit_bliss_products'];
  for (const key of keysToTry) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .filter((p) => p && p.id != null && !String(p.id).startsWith('sba-0'))
            .map((p) => {
              let imgs = p.images;
              if (Array.isArray(imgs)) {
                imgs = imgs.filter(imgUrl => typeof imgUrl === 'string' && imgUrl.trim().length > 0);
              }
              return {
                ...p,
                images: Array.isArray(imgs) && imgs.length > 0 ? imgs : (p.image ? [p.image] : []),
                image: p.image || (Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : ''),
                sizes: ALL_STANDARD_SIZES,
                inStock: true,
                stockQuantity: Math.max(Number(p.stockQuantity) || 50, 50),
              };
            });
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      console.warn(`Error loading products from ${key}:`, e);
    }
  }
  return [];
};

const saveLocalStorageProducts = (prods: Product[]) => {
  try {
    const onlyReal = prods.filter(p => p && p.id != null && !String(p.id).startsWith('sba-0'));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(onlyReal));
  } catch (e) {
    console.error('Failed to save products to localStorage:', e);
  }
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const local = getLocalStorageProducts();
    return local;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper functions to map products to and from Supabase database schemas
  const mapProductToSupabase = (p: any, isInsert = false) => {
    const payload: any = {
      category: p.category || 'Suits',
      description: p.description || '',
      discount: Number(p.discount) || 0,
      fabric: p.fabric || '',
      sku: p.sku || `SBA-${Date.now().toString().slice(-6)}`,
      name: p.name || 'Untitled Product',
      subcategory: p.subcategory || '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice) || 0,
      rating: Number(p.rating) || 4.5,
      reviewCount: Number(p.reviewCount) || 0,
      stockQuantity: Number(p.stockQuantity) || 10,
      fit: p.fit || '',
      occasion: p.occasion || '',
      washCare: p.washCare || '',
      isNewArrival: p.isNewArrival ?? false,
      isBestSeller: p.isBestSeller ?? false,
      isTrending: p.isTrending ?? false,
      isFestive: p.isFestive ?? false,
      isSale: p.isSale ?? false,
      isFeatured: p.isFeatured ?? false,
      inStock: p.inStock ?? true,
      colors: Array.isArray(p.colors) ? JSON.stringify(p.colors) : p.colors || '[]',
      images: Array.isArray(p.images) ? JSON.stringify(p.images) : p.images || '[]',
      sizes: Array.isArray(p.sizes) ? JSON.stringify(p.sizes) : p.sizes || '[]',
      reviews: Array.isArray(p.reviews) ? JSON.stringify(p.reviews) : p.reviews || '[]',
    };
    if (!isInsert && p.id) {
      const numId = Number(p.id);
      if (!isNaN(numId)) {
        payload.id = numId;
      }
    }
    return payload;
  };

  const mapProductFromSupabase = (p: any): Product => {
    let images: string[] = [];
    if (typeof p.images === 'string') {
      try {
        const parsed = JSON.parse(p.images);
        if (Array.isArray(parsed)) {
          images = parsed;
        } else if (typeof parsed === 'string' && parsed.trim()) {
          images = [parsed.trim()];
        }
      } catch {
        if (p.images.trim()) {
          images = [p.images.trim()];
        }
      }
    } else if (Array.isArray(p.images)) {
      images = p.images;
    }

    let colors = p.colors;
    if (typeof colors === 'string') {
      try {
        colors = JSON.parse(colors);
      } catch {
        colors = [];
      }
    }
    if (!Array.isArray(colors)) colors = [];

    // If images array is empty, check if colors has imageUrl or image
    if (images.length === 0 && Array.isArray(colors)) {
      colors.forEach((c: any) => {
        if (c && typeof c === 'object') {
          if (c.imageUrl && typeof c.imageUrl === 'string' && c.imageUrl.trim()) {
            images.push(c.imageUrl.trim());
          } else if (c.image && typeof c.image === 'string' && c.image.trim()) {
            images.push(c.image.trim());
          }
        }
      });
    }

    // Check single image fields if still empty
    if (images.length === 0) {
      const single = p.image || p.image_url || p.imageUrl || p.photo;
      if (single && typeof single === 'string' && single.trim()) {
        images = [single.trim()];
      }
    }

    // Filter out invalid/empty strings
    images = images.filter((img) => typeof img === 'string' && img.trim().length > 0);

    let sizes = p.sizes;
    if (typeof sizes === 'string') {
      try {
        sizes = JSON.parse(sizes);
      } catch {
        sizes = [];
      }
    }
    // All sizes are permanently available across all 24 products
    sizes = ALL_STANDARD_SIZES;

    if (!Array.isArray(colors) || colors.length === 0) {
      colors = [{ name: 'Standard', hex: '#58152D' }];
    }

    let reviews = p.reviews;
    if (typeof reviews === 'string') {
      try {
        reviews = JSON.parse(reviews);
      } catch {
        reviews = [];
      }
    }

    return {
      id: String(p.id),
      name: p.name || '',
      category: p.category || '',
      subcategory: p.subcategory || '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.originalPrice) || 0,
      discount: Number(p.discount) || 0,
      description: p.description || '',
      images: Array.isArray(images) ? images : [],
      sizes: ALL_STANDARD_SIZES,
      colors: Array.isArray(colors) ? colors : [],
      inStock: true,
      sku: p.sku || '',
      stockQuantity: Math.max(Number(p.stockQuantity) || 50, 50),
      fabric: p.fabric || '',
      fit: p.fit || '',
      occasion: p.occasion || '',
      washCare: p.washCare || '',
      rating: Number(p.rating) || 4.5,
      reviewCount: Number(p.reviewCount) || 0,
      reviews: Array.isArray(reviews) ? reviews : [],
      isNewArrival: p.isNewArrival ?? false,
      isBestSeller: p.isBestSeller ?? false,
      isTrending: p.isTrending ?? false,
      isFestive: p.isFestive ?? false,
      isSale: p.isSale ?? false,
      isFeatured: p.isFeatured ?? false,
      videoUrl: p.video_url || p.videoUrl || '',
    };
  };

  const mergeProducts = (supaProds: Product[], localProds: Product[]): Product[] => {
    if (supaProds && supaProds.length > 0) {
      // Find any newly created unsynced local products (e.g. offline edits with sba-prod-)
      const unsyncedNewLocal = localProds.filter(
        (lp) => lp && lp.id != null && String(lp.id).startsWith('sba-prod-') && !supaProds.some((sp) => sp.name === lp.name || sp.sku === lp.sku)
      );
      return [...supaProds, ...unsyncedNewLocal];
    }

    // Only fallback to real local data if Supabase returned 0 items
    const nonDefaultLocal = localProds.filter((p) => p && p.id != null && !String(p.id).startsWith('sba-0'));
    if (nonDefaultLocal.length > 0) {
      return nonDefaultLocal;
    }
    return [];
  };

  const fetchProducts = async () => {
    const localCache = getLocalStorageProducts();

    // Immediately unblock UI with local cache if available
    if (localCache.length > 0) {
      setProducts(localCache);
    }

    // Background fetch from Supabase with 5s timeout protection
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase fetch timeout')), 5000)
      );

      const fetchPromise = supabase.from('products').select('*').order('id', { ascending: false });

      const res: any = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = res || {};

      if (!error && data && data.length > 0) {
        const supaNormalized = data.map(mapProductFromSupabase);
        const merged = mergeProducts(supaNormalized, localCache);
        setProducts(merged);
        saveLocalStorageProducts(merged);
      }
    } catch (err) {
      console.warn('Background Supabase fetch products notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Only show active, in-stock products that have real names, valid prices, and real images (never untitled/0-price)
  const activeProducts = products.filter(
    (p) =>
      p.inStock &&
      p.name &&
      p.name.trim() !== '' &&
      p.name !== 'Untitled Product' &&
      p.price > 0 &&
      Array.isArray(p.images) &&
      p.images.length > 0
  );

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    // Strict validation to avoid empty or corrupt database entries
    if (!productData.name || productData.name.trim() === '' || productData.name === 'Untitled Product') {
      throw new Error('Product name is required');
    }
    if (!productData.price || Number(productData.price) <= 0) {
      throw new Error('Valid product price is required');
    }
    if (!productData.images || productData.images.length === 0) {
      throw new Error('At least one product image is required');
    }

    const fallbackId = `sba-prod-${Date.now()}`;
    const newLocalProduct: Product = {
      id: fallbackId,
      ...productData,
      rating: productData.rating || 5.0,
      reviewCount: productData.reviewCount || 1,
      reviews: productData.reviews || [],
      inStock: productData.inStock ?? true,
    } as Product;

    // 1. Immediately update state and localStorage
    setProducts((prev) => {
      const updated = [newLocalProduct, ...prev];
      saveLocalStorageProducts(updated);
      return updated;
    });

    // 2. Try inserting into Supabase DB
    try {
      const payload = mapProductToSupabase(productData, true);
      const { data, error } = await supabase.from('products').insert([payload]).select();

      if (!error && data && data[0]) {
        const supaProduct = mapProductFromSupabase(data[0]);
        // Replace temporary fallback product with real Supabase assigned product
        setProducts((prev) => {
          const updated = prev.map((p) => (p.id === fallbackId ? supaProduct : p));
          saveLocalStorageProducts(updated);
          return updated;
        });
        return supaProduct;
      } else if (error) {
        console.warn('Supabase add product notice:', error.message);
      }
    } catch (error) {
      console.warn('Supabase add product notice:', error);
    }

    return newLocalProduct;
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    // 1. Optimistically update local state & local storage for instantaneous UI response
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      saveLocalStorageProducts(updatedList);
      return updatedList;
    });

    try {
      // Build targeted payload containing ONLY fields that are valid columns in Supabase
      const payload: Record<string, any> = {};
      if (updated.name !== undefined) payload.name = updated.name.trim();
      if (updated.category !== undefined) payload.category = updated.category;
      if (updated.subcategory !== undefined) payload.subcategory = updated.subcategory;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.price !== undefined) payload.price = Number(updated.price);
      if (updated.originalPrice !== undefined) payload.originalPrice = Number(updated.originalPrice);
      if (updated.discount !== undefined) payload.discount = Number(updated.discount);
      if (updated.sku !== undefined) payload.sku = updated.sku.trim();
      if (updated.stockQuantity !== undefined) payload.stockQuantity = Number(updated.stockQuantity);
      if (updated.fabric !== undefined) payload.fabric = updated.fabric;
      if (updated.fit !== undefined) payload.fit = updated.fit;
      if (updated.occasion !== undefined) payload.occasion = updated.occasion;
      if (updated.washCare !== undefined) payload.washCare = updated.washCare;
      if (updated.isNewArrival !== undefined) payload.isNewArrival = Boolean(updated.isNewArrival);
      if (updated.isBestSeller !== undefined) payload.isBestSeller = Boolean(updated.isBestSeller);
      if (updated.isTrending !== undefined) payload.isTrending = Boolean(updated.isTrending);
      if (updated.isFestive !== undefined) payload.isFestive = Boolean(updated.isFestive);
      if (updated.isSale !== undefined) payload.isSale = Boolean(updated.isSale);
      if (updated.isFeatured !== undefined) payload.isFeatured = Boolean(updated.isFeatured);
      if (updated.inStock !== undefined) payload.inStock = Boolean(updated.inStock);
      if (updated.rating !== undefined) payload.rating = Number(updated.rating);
      if (updated.reviewCount !== undefined) payload.reviewCount = Number(updated.reviewCount);
      if (updated.colors !== undefined) {
        payload.colors = Array.isArray(updated.colors) ? JSON.stringify(updated.colors) : updated.colors;
      }
      if (updated.images !== undefined) {
        payload.images = Array.isArray(updated.images) ? JSON.stringify(updated.images) : updated.images;
      }
      if (updated.sizes !== undefined) {
        payload.sizes = Array.isArray(updated.sizes) ? JSON.stringify(updated.sizes) : updated.sizes;
      }
      if (updated.reviews !== undefined) {
        payload.reviews = Array.isArray(updated.reviews) ? JSON.stringify(updated.reviews) : updated.reviews;
      }

      if (Object.keys(payload).length > 0) {
        const numId = Number(id);
        let updateRes: any;
        if (!isNaN(numId) && numId > 0) {
          updateRes = await supabase.from('products').update(payload).eq('id', numId).select();
        }

        // Fallback: match by SKU if not found by numeric ID
        if ((!updateRes?.data || updateRes.data.length === 0) && (updated.sku || id)) {
          updateRes = await supabase.from('products').update(payload).eq('sku', updated.sku || id).select();
        }

        if (updateRes?.error) {
          console.error('Supabase update product error:', updateRes.error);
          throw new Error(`Database error: ${updateRes.error.message}`);
        }

        // If updated row returned from Supabase, confirm synchronization into state and local storage
        if (updateRes?.data && updateRes.data[0]) {
          const freshProduct = mapProductFromSupabase(updateRes.data[0]);
          setProducts((prev) => {
            const synced = prev.map((p) => (p.id === id || p.id === String(freshProduct.id) ? freshProduct : p));
            saveLocalStorageProducts(synced);
            return synced;
          });
        }
      }
    } catch (error) {
      console.error('Supabase update product error:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => {
      const updatedList = prev.filter((p) => p.id !== id);
      saveLocalStorageProducts(updatedList);
      return updatedList;
    });

    try {
      const numId = Number(id);
      if (!isNaN(numId) && numId > 0) {
        await supabase.from('products').delete().eq('id', numId);
      } else {
        await supabase.from('products').delete().eq('sku', id);
      }
    } catch (error) {
      console.warn('Supabase delete product notice:', error);
    }
  };

  const duplicateProduct = async (id: string): Promise<Product | undefined> => {
    const target = products.find((p) => p.id === id);
    if (!target) return undefined;
    const { id: _, ...rest } = target;
    return await addProduct({ ...rest, name: `${target.name} (Copy)` });
  };

  const toggleProductStatus = async (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    await updateProduct(id, { inStock: !target.inStock });
  };

  const getProductById = (id: string | null | undefined): Product | undefined => {
    if (!id) return undefined;
    return products.find((p) => p.id === id);
  };

  const resetToDefaultProducts = async () => {
    setProducts(PRODUCTS_DATA);
    saveLocalStorageProducts(PRODUCTS_DATA);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        allProducts: products,
        activeProducts,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        toggleProductStatus,
        getProductById,
        resetToDefaultProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
