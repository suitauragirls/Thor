import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product, ProductSize } from '../types';

const LOCAL_STORAGE_KEY = 'sag_custom_products_v1';

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
  const keysToTry = [LOCAL_STORAGE_KEY];
  for (const key of keysToTry) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed
            .filter((p) => p && p.id != null)
            .map((p) => {
              let imgs = p.images ?? p.image_urls ?? p.imageUrls ?? p.product_images ?? p.photos;
              if (typeof imgs === 'string') {
                try {
                  const parsed = JSON.parse(imgs);
                  imgs = Array.isArray(parsed) ? parsed : [imgs];
                } catch {
                  imgs = [imgs];
                }
              }
              if (Array.isArray(imgs)) {
                imgs = imgs.filter(imgUrl => typeof imgUrl === 'string' && imgUrl.trim().length > 0);
              }
              const stockValue = Number(p.stockQuantity ?? p.stock);
              const stockQuantity = Number.isFinite(stockValue) && stockValue >= 0 ? stockValue : 0;
              const sizes = Array.isArray(p.sizes)
                ? p.sizes.filter((size: unknown): size is ProductSize => ALL_STANDARD_SIZES.includes(size as ProductSize))
                : [];
              return {
                ...p,
                images: Array.isArray(imgs) && imgs.length > 0 ? imgs : (p.image ? [p.image] : []),
                image: p.image || p.image_url || p.imageUrl || (Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : ''),
                sizes: sizes.length > 0 ? sizes : ALL_STANDARD_SIZES,
                inStock: p.inStock ?? (p.status ? p.status === 'active' && stockQuantity > 0 : stockQuantity > 0),
                stockQuantity,
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
    const onlyReal = prods.filter(p => p && p.id != null);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(onlyReal));
  } catch (e) {
    console.error('Failed to save products to localStorage:', e);
  }
};

const hasRealProductImage = (product: Product): boolean =>
  Array.isArray(product.images) && product.images.some(
    (image) => typeof image === 'string' && image.trim() !== '' && !image.startsWith('data:image/svg+xml') && !image.includes('placeholder.com')
  );

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const local = getLocalStorageProducts();
    return local;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper functions to map products to and from Supabase database schemas
  const mapProductToSupabase = (p: any, isInsert = false) => {
    const stockQuantity = Math.max(0, Number(p.stockQuantity ?? p.stock) || 0);
    const payload: any = {
      category: p.category || 'Suits',
      description: p.description || '',
      discount: Number(p.discount) || 0,
      fabric: p.fabric || '',
      sku: p.sku || `SAG-${Date.now().toString().slice(-6)}`,
      name: p.name || 'Untitled Product',
      price: Number(p.price) || 0,
      mrp: Number(p.originalPrice ?? p.mrp ?? p.price) || 0,
      stock: stockQuantity,
      status: p.inStock === false || stockQuantity === 0 ? 'inactive' : 'active',
      colors: Array.isArray(p.colors) ? JSON.stringify(p.colors) : p.colors || '[]',
      sizes: Array.isArray(p.sizes) ? JSON.stringify(p.sizes) : p.sizes || '[]',
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
    const rawImages = p.images ?? p.image_urls ?? p.imageUrls ?? p.product_images ?? p.photos;
    if (typeof rawImages === 'string') {
      try {
        const parsed = JSON.parse(rawImages);
        if (Array.isArray(parsed)) {
          images = parsed;
        } else if (typeof parsed === 'string' && parsed.trim()) {
          images = [parsed.trim()];
        }
      } catch {
        if (rawImages.trim()) {
          images = [rawImages.trim()];
        }
      }
    } else if (Array.isArray(rawImages)) {
      images = rawImages;
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
    colors = colors
      .map((color: any, index: number) => {
        if (typeof color === 'string' && color.trim()) {
          return {
            name: color.trim(),
            hex: ['#241D1B', '#9A6A3A', '#211C1A', '#D8C8B8'][index % 4],
          };
        }
        return color;
      })
      .filter((color: any) => color && typeof color === 'object' && typeof color.name === 'string');

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
    const availableSizes = Array.isArray(sizes)
      ? sizes.filter((size): size is ProductSize => ALL_STANDARD_SIZES.includes(size))
      : [];
    sizes = availableSizes.length > 0 ? availableSizes : ALL_STANDARD_SIZES;

    if (!Array.isArray(colors) || colors.length === 0) {
      colors = [{ name: 'Standard', hex: '#241D1B' }];
    }

    let reviews = p.reviews;
    if (typeof reviews === 'string') {
      try {
        reviews = JSON.parse(reviews);
      } catch {
        reviews = [];
      }
    }

    const stockValue = Number(p.stock ?? p.stockQuantity ?? p.stock_quantity);
    const stockQuantity = Number.isFinite(stockValue) && stockValue >= 0 ? stockValue : 0;
    const hasStatus = typeof p.status === 'string';
    const inStock = hasStatus
      ? p.status.toLowerCase() === 'active' && stockQuantity > 0
      : p.inStock !== false && stockQuantity > 0;

    return {
      id: String(p.id),
      name: p.name || '',
      category: p.category || 'Suits',
      subcategory: p.subcategory || '',
      price: Number(p.price) || 0,
      originalPrice: Number(p.mrp ?? p.originalPrice) || Number(p.price) || 0,
      discount: Number(p.discount) || 0,
      description: p.description || '',
      images: Array.isArray(images) ? images : [],
      sizes,
      colors: Array.isArray(colors) ? colors : [],
      inStock,
      sku: p.sku || '',
      stockQuantity,
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

  const syncProductImages = async (productId: string, imageUrls: string[]) => {
    const desiredUrls = Array.from(new Set(imageUrls.filter((url) => typeof url === 'string' && url.trim())));
    const { data: existingRows, error: readError } = await supabase
      .from('product_images')
      .select('image_url,storage_path')
      .eq('product_id', productId);
    if (readError) throw readError;

    const existingUrls = (existingRows || []).map((row) => String(row.image_url || row.storage_path || ''));

    for (const [sortOrder, imageUrl] of desiredUrls.entries()) {
      if (existingUrls.includes(imageUrl)) {
        const { error } = await supabase
          .from('product_images')
          .update({ is_primary: sortOrder === 0, sort_order: sortOrder })
          .eq('product_id', productId)
          .eq('image_url', imageUrl);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('product_images').insert([{
          product_id: productId,
          image_url: imageUrl,
          is_primary: sortOrder === 0,
          sort_order: sortOrder,
        }]);
        if (error) throw error;
      }
    }

    const removedUrls = existingUrls.filter((url) => url && !desiredUrls.includes(url));
    if (removedUrls.length > 0) {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)
        .in('image_url', removedUrls);
      if (error) throw error;
    }
  };

  const mergeProducts = (supaProds: Product[], localProds: Product[]): Product[] => {
    if (supaProds && supaProds.length > 0) {
      // Find any newly created unsynced local products.
      const unsyncedNewLocal = localProds.filter(
        (lp) => lp && lp.id != null && String(lp.id).startsWith('sag-prod-') && !supaProds.some((sp) => sp.name === lp.name || sp.sku === lp.sku)
      );
      return [...supaProds, ...unsyncedNewLocal];
    }

    // Only fallback to real local data if Supabase returned 0 items
    const nonDefaultLocal = localProds.filter((p) => p && p.id != null);
    if (nonDefaultLocal.length > 0) {
      return nonDefaultLocal;
    }
    return [];
  };

  const fetchProducts = async () => {
    const localCache = getLocalStorageProducts();
    const fallbackProducts = localCache;

    // Immediately unblock UI with local cache if available
    setProducts(fallbackProducts);

    // Background fetch from Supabase with 5s timeout protection
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase fetch timeout')), 5000)
      );

      const fetchPromise = Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('product_images').select('product_id,image_url,storage_path,is_primary,sort_order').order('sort_order', { ascending: true }),
      ]).then(([productResult, imageResult]) => ({ productResult, imageResult }));

      const res: any = await Promise.race([fetchPromise, timeoutPromise]);
      const { data, error } = res?.productResult || {};
      const imageRows = Array.isArray(res?.imageResult?.data) ? res.imageResult.data : [];

      if (!error && data && data.length > 0) {
        const imagesByProduct = new Map<string, string[]>();
        const imageRowsByProduct = new Map<string, any[]>();
        imageRows.forEach((image: any) => {
          const imageUrl = image?.image_url || image?.url || image?.storage_path;
          if (!imageUrl || image?.product_id == null) return;
          const productKey = String(image.product_id);
          const current = imagesByProduct.get(productKey) || [];
          const currentRows = imageRowsByProduct.get(productKey) || [];
          current.push(String(imageUrl));
          currentRows.push(image);
          imagesByProduct.set(productKey, current);
          imageRowsByProduct.set(productKey, currentRows);
        });

        const supaNormalized = data.map((rawProduct: any) => {
          const product = mapProductFromSupabase(rawProduct);
          const relatedImages = imagesByProduct.get(String(rawProduct.id)) || [];
          const relatedRows = imageRowsByProduct.get(String(rawProduct.id)) || [];
          const colorsWithImages = product.colors.map((color, index) => ({
            ...color,
            imageUrl: color.imageUrl || relatedRows[index]?.image_url || relatedRows[index]?.url || relatedRows[index]?.storage_path,
          }));
          const hasNamedColors = colorsWithImages.some((color) => color.name !== 'Standard');
          const derivedShadeNames = ['Original', 'Alternate', 'Detail View', 'Back View'];
          const derivedColors = relatedRows.map((image, index) => ({
            name: derivedShadeNames[index % derivedShadeNames.length],
            hex: ['#241D1B', '#9A6A3A', '#211C1A', '#D8C8B8'][index % 4],
            imageUrl: image.image_url || image.url || image.storage_path,
          }));
          return {
            ...product,
            images: product.images.length > 0 ? product.images : relatedImages,
            colors: hasNamedColors ? colorsWithImages : (derivedColors.length > 0 ? derivedColors : product.colors),
          };
        });
        const productsWithImages = supaNormalized.filter(hasRealProductImage);
        const merged = productsWithImages.length > 0
          ? mergeProducts(productsWithImages, localCache)
          : fallbackProducts;
        setProducts(merged);
        saveLocalStorageProducts(merged);
      } else if (error || !data || data.length === 0) {
        setProducts(fallbackProducts);
        saveLocalStorageProducts(fallbackProducts);
      }
    } catch (err) {
      console.warn('Background Supabase fetch products notice:', err);
      setProducts(fallbackProducts);
      saveLocalStorageProducts(fallbackProducts);
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

    const fallbackId = `sag-prod-${Date.now()}`;
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

    let createdProductId: string | undefined;
    try {
      const payload = mapProductToSupabase(productData, true);
      const { data, error } = await supabase.from('products').insert([payload]).select();

      if (error) throw error;
      if (!data?.[0]) {
        throw new Error('Product insert returned no row; check database write/read permissions.');
      }

      createdProductId = String(data[0].id);
      await syncProductImages(createdProductId, productData.images);
      const supaProduct = { ...mapProductFromSupabase(data[0]), images: productData.images };
      setProducts((prev) => {
        const updated = prev.map((p) => (p.id === fallbackId ? supaProduct : p));
        saveLocalStorageProducts(updated);
        return updated;
      });
      return supaProduct;
    } catch (error) {
      if (createdProductId) {
        try {
          await supabase.from('products').delete().eq('id', createdProductId);
        } catch {}
      }
      setProducts((prev) => {
        const updated = prev.filter((p) => p.id !== fallbackId);
        saveLocalStorageProducts(updated);
        return updated;
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    const existingProduct = products.find((product) => product.id === id);
    if (!existingProduct) throw new Error('Product not found in the active catalog.');
    const nextProduct = { ...existingProduct, ...updated };

    try {
      const payload = mapProductToSupabase(nextProduct);
      const { data, error } = await supabase.from('products').update(payload).eq('id', id).select();
      if (error) throw error;
      if (!data?.[0]) {
        throw new Error('Product update returned no row; check the product ID and database permissions.');
      }
      await syncProductImages(id, nextProduct.images);

      const freshProduct = {
        ...mapProductFromSupabase(data[0]),
        images: nextProduct.images,
      };
      setProducts((prev) => {
        const synced = prev.map((product) => product.id === id ? freshProduct : product);
        saveLocalStorageProducts(synced);
        return synced;
      });
    } catch (error) {
      setProducts((prev) => {
        const rolledBack = prev.map((product) => product.id === id ? existingProduct : product);
        saveLocalStorageProducts(rolledBack);
        return rolledBack;
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    if (id.startsWith('sag-prod-')) {
      setProducts((prev) => {
        const updatedList = prev.filter((product) => product.id !== id);
        saveLocalStorageProducts(updatedList);
        return updatedList;
      });
      return;
    }

    const { data, error } = await supabase.from('products').delete().eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('Product delete returned no row; check the product ID and database permissions.');

    setProducts((prev) => {
      const updatedList = prev.filter((product) => product.id !== id);
      saveLocalStorageProducts(updatedList);
      return updatedList;
    });
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
    setProducts([]);
    saveLocalStorageProducts([]);
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
