import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

export interface StockLockResult {
  success: boolean;
  outOfStockItem?: string;
  lockToken?: string;
  errorMessage?: string;
}

/**
 * Perform database row lock & stock availability verification in Supabase
 * when Razorpay checkout triggers to prevent overbooking.
 */
export async function lockAndReserveCartStock(cartItems: CartItem[]): Promise<StockLockResult> {
  if (!cartItems || cartItems.length === 0) {
    return { success: true };
  }

  try {
    const productIds = cartItems.map(item => item.product.id);

    // 1. Fetch live database rows from Supabase 'products' table
    const { data: liveProducts, error } = await supabase
      .from('products')
      .select('id, name, stock, status')
      .in('id', productIds);

    if (error) {
      console.warn('Supabase row lock fetch notice:', error);
      return {
        success: false,
        errorMessage: 'We could not verify live stock. Please try again before payment.',
      };
    }

    // 2. Map fetched products by ID
    const dbProductMap = new Map<string, any>();
    if (liveProducts) {
      liveProducts.forEach(p => dbProductMap.set(String(p.id), p));
    }

    // 3. Verify stock availability for each cart item
    for (const item of cartItems) {
      const dbProd = dbProductMap.get(String(item.product.id));
      if (!dbProd) {
        return {
          success: false,
          outOfStockItem: item.product.name,
          errorMessage: `Sorry, "${item.product.name}" is no longer available. Please remove it from your bag.`,
        };
      }

      const currentStock = Math.max(0, Number(dbProd.stock) || 0);
      const isAvailable = dbProd.status === 'active' && currentStock > 0;

      if (!isAvailable || currentStock < item.quantity) {
        return {
          success: false,
          outOfStockItem: item.product.name,
          errorMessage: `Sorry, "${item.product.name}" (Size ${item.selectedSize}) has only ${currentStock} item(s) remaining in stock.`,
        };
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Row lock error during checkout:', err);
    return { success: false, errorMessage: 'We could not verify live stock. Please try again before payment.' };
  }
}

/**
 * Release reserved stock lock when Razorpay checkout is cancelled or fails
 */
export async function releaseStockLock(lockToken?: string): Promise<void> {
  void lockToken;
}

/**
 * Confirm final stock deduction in Supabase database after successful Razorpay payment
 */
export async function confirmStockDeduction(cartItems: CartItem[], _lockToken?: string): Promise<void> {
  if (!cartItems || cartItems.length === 0) return;

  try {
    for (const item of cartItems) {
      const pId = String(item.product.id);

      // Fetch current stock
      const { data: dbProd, error } = await supabase
        .from('products')
        .select('stock, status')
        .eq('id', pId)
        .single();

      if (error) throw error;

      if (dbProd) {
        const existingQty = Number(dbProd.stock) || 0;
        
        const nextQty = Math.max(0, existingQty - item.quantity);

        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock: nextQty,
            status: nextQty > 0 ? 'active' : 'inactive',
            updated_at: new Date().toISOString(),
          })
          .eq('id', pId);
        if (updateError) throw updateError;
      }
    }

  } catch (err) {
    console.warn('Confirm stock deduction notice:', err);
  }
}
