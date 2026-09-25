import React, { useState } from 'react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingBag, Check, X } from 'lucide-react';
import { getCleanImageUrl, ELEGANT_PLACEHOLDER_SVG } from '../utils/imageHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    isInWishlist, 
    toggleWishlist, 
    navigateToProduct, 
    addToCart,
  } = useShop();

  const [isJustAdded, setIsJustAdded] = useState(false);
  const [isHeartPopping, setIsHeartPopping] = useState(false);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);

  const colorsList = Array.isArray(product.colors) && product.colors.length > 0 
    ? product.colors 
    : [];

  const currentImage = (colorsList[selectedColorIdx]?.imageUrl) 
    || (product.images[selectedColorIdx]) 
    || product.images[0];

  const secondaryImage = (product.images.length > 1)
    ? (product.images[(selectedColorIdx + 1) % product.images.length])
    : null;

  const isFav = isInWishlist(product.id);

  const handleColorSelect = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSelectedColorIdx(idx);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartPopping(true);
    setTimeout(() => setIsHeartPopping(false), 400);
    toggleWishlist(product);
  };

  const cardPrice = Number(product.price) || 0;
  const cardOrigPrice = Number(product.originalPrice) || 0;
  const cardDiscount = Number(product.discount) || 0;

  const calculatedDiscount = cardDiscount > 0 
    ? cardDiscount 
    : (cardOrigPrice > cardPrice && cardOrigPrice > 0 
        ? Math.round(((cardOrigPrice - cardPrice) / cardOrigPrice) * 100) 
        : 0);

  // Bulletproof Add To Bag Logic
  const isOutOfStock = product.inStock === false || (product.sizes && product.sizes.length === 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    // Resolve default sizing (fallback to 'M' if none specified)
    const sizeToUse = product.sizes?.[0] || 'M';
    
    // Resolve dynamic active color option chosen by user
    const colorToUse = colorsList[selectedColorIdx] || { name: 'Standard', hex: '#3D0F1F' };
    
    // Perform robust add to cart context action with openDrawer set to false for professional seamless flow
    addToCart(product, sizeToUse, colorToUse, 1, false);
    
    // Trigger success feedback animations
    setIsJustAdded(true);
    setTimeout(() => {
      setIsJustAdded(false);
    }, 2000);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-[#FAF5EB] rounded-3xl overflow-hidden border border-[#B8935A]/25 hover:border-[#B8935A]/50 shadow-xs hover:shadow-md transition-all duration-300 h-full justify-between cursor-pointer"
      onClick={() => navigateToProduct(product.id)}
    >
      {/* 1. PRODUCT IMAGE CONTAINER (100% Unmasked & Beautiful Model Portraits) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF5EB] rounded-t-3xl">
        {/* Subtle Luxury Shimmer pulse while downloading image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5EB] via-[#F3EAD8] to-[#FAF5EB] animate-pulse pointer-events-none" />

        {/* Primary Product Image */}
        <img
          src={getCleanImageUrl(currentImage, 600)}
          alt={product.name}
          className="relative z-10 w-full h-full object-cover object-top group-hover:scale-101 transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.includes('data:image/svg+xml')) {
              target.src = ELEGANT_PLACEHOLDER_SVG;
            }
          }}
        />

        {/* Secondary Detail Photo on Hover */}
        {secondaryImage && (
          <img
            src={getCleanImageUrl(secondaryImage, 600)}
            alt={`${product.name} Detail`}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out hidden sm:block"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('data:image/svg+xml')) {
                target.src = ELEGANT_PLACEHOLDER_SVG;
              }
            }}
          />
        )}
      </div>

      {/* 2. DETAILS CONTENT BLOCK - Compact & Elegant (Matches IMG_20260919_153826.jpg but with single optimized Add To Bag) */}
      <div className="p-3 sm:p-4 bg-[#FAF5EB] flex flex-col flex-grow justify-between gap-3">
        
        <div className="space-y-2.5">
          {/* Row 1: Bestseller / Save discount badge on Left, elegant wishlist Heart on Right */}
          <div className="flex items-center justify-between gap-2">
            <div className="bg-[#3D0F1F] text-[#FAF5EB] text-[10px] font-black tracking-wider px-3.5 py-1.5 rounded-full uppercase shadow-3xs">
              {product.isBestSeller 
                ? 'BESTSELLER' 
                : calculatedDiscount > 0 
                ? `SAVE ${calculatedDiscount}%` 
                : product.isNewArrival 
                ? 'NEW ARRIVAL' 
                : 'EXCLUSIVE'}
            </div>

            <button
              id={`wishlist-btn-${product.id}`}
              type="button"
              onClick={handleWishlistToggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-3xs border border-[#B8935A]/20 cursor-pointer ${
                isFav
                  ? 'bg-[#3D0F1F] text-white'
                  : 'bg-white text-[#3D0F1F] hover:bg-gray-50'
              }`}
              aria-label={isFav ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart 
                className={`w-4 h-4 transition-transform duration-200 ${
                  isFav ? 'fill-white text-white' : 'text-[#3D0F1F]'
                } ${isHeartPopping ? 'scale-125' : 'scale-100'}`} 
              />
            </button>
          </div>

          {/* Row 2: Category and Shades Counter */}
          <div className="flex items-center justify-between gap-1 flex-wrap pt-0.5">
            <span className="font-extrabold text-[#B8935A] tracking-[0.15em] uppercase text-[10px] sm:text-[11px] font-sans">
              {product.category}
            </span>
            {colorsList.length > 0 && (
              <span className="text-[10px] text-gray-500 font-bold tracking-wide">
                {colorsList.length} {colorsList.length === 1 ? 'Shade' : 'Shades'}
              </span>
            )}
          </div>

          {/* Row 3: Product Title wraps beautifully to show full name */}
          <h3 
            className="font-serif text-sm font-bold text-[#3D0F1F] leading-snug line-clamp-2 min-h-[38px] sm:min-h-[44px]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Row 4: Color Swatches with precise active ring outline */}
          {colorsList.length > 0 && (
            <div className="flex items-center gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
              {colorsList.slice(0, 5).map((col, idx) => {
                const isSelected = selectedColorIdx === idx;
                return (
                  <button
                    key={`card-col-${product.id}-${idx}`}
                    type="button"
                    onClick={(e) => handleColorSelect(e, idx)}
                    className={`w-5.5 h-5.5 rounded-full border transition-all duration-200 cursor-pointer p-0.5 ${
                      isSelected 
                        ? 'ring-2 ring-[#B8935A] border-white scale-110 shadow-3xs' 
                        : 'border-gray-200 hover:border-[#3D0F1F]'
                    }`}
                    title={col.name}
                  >
                    <span
                      className="block w-full h-full rounded-full"
                      style={{ backgroundColor: col.hex || '#3D0F1F' }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Fine golden hairline divider */}
          <div className="border-t border-[#B8935A]/15 my-2" />

          {/* Row 5: Pricing block (Force Single Line Side-by-Side without wrapping) */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-nowrap overflow-hidden">
            <span className="font-serif text-sm sm:text-base font-black text-[#3D0F1F] shrink-0">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs line-through text-gray-400 font-medium shrink-0">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {calculatedDiscount > 0 && (
              <span className="text-[9px] font-extrabold text-[#B8935A] bg-[#FAF5EB] border border-[#B8935A]/35 px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-tight">
                {calculatedDiscount}% OFF
              </span>
            )}
          </div>

          {/* Single Optimized ADD TO BAG Button with precise logic and states */}
          <div className="pt-1.5">
            <button
              id={`add-to-bag-${product.id}`}
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full py-3 px-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border ${
                isOutOfStock
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : isJustAdded
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-[#FAF5EB] border-[#3D0F1F] text-[#3D0F1F] hover:bg-[#3D0F1F] hover:text-[#FAF5EB]'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <X className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>OUT OF STOCK</span>
                </>
              ) : isJustAdded ? (
                <>
                  <Check className="w-4 h-4 text-white shrink-0 animate-bounce" />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>ADD TO BAG</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
