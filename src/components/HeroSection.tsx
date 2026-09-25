import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useAdmin, generateHeroSlidesFromProducts } from '../context/AdminContext';
import { 
  Sparkles, 
  Zap, 
  ShoppingBag,
  Crown,
  Heart,
  Check,
  Star
} from 'lucide-react';
import { getCleanImageUrl, ELEGANT_PLACEHOLDER_SVG } from '../utils/imageHelper';

export const HeroSection: React.FC = () => {
  const { navigateToCategory, navigateToProduct, products, addToCart, buyNow, showToast, toggleWishlist, isInWishlist } = useShop();
  const { heroConfig, isLoading } = useAdmin();

  const liveProductSlides = React.useMemo(() => {
    // 1. If live products are synced from Supabase, ALWAYS generate slides from real synced products!
    if (products && products.length > 0) {
      // Check if admin has explicitly customized hero slides that match real products or have real uploaded images
      const customMatchingSlides = (heroConfig?.slides || []).filter((slide) => {
        if (!slide.image || slide.image.includes('images.unsplash.com')) return false;
        return products.some(
          (p) =>
            (slide.productId && String(p.id) === String(slide.productId)) ||
            (slide.link && String(p.id) === String(slide.link)) ||
            p.name === slide.title
        );
      });

      if (customMatchingSlides.length > 0) {
        return customMatchingSlides.slice(0, 6).map((slide) => {
          const matchedProd = products.find(
            (p) =>
              (slide.productId && String(p.id) === String(slide.productId)) ||
              (slide.link && String(p.id) === String(slide.link)) ||
              p.name === slide.title
          );
          if (matchedProd) {
            const livePrice = Number(matchedProd.price) || slide.price;
            const liveOrigPrice = Number(matchedProd.originalPrice) || Math.round(livePrice * 1.85);
            const liveImg = matchedProd.images && matchedProd.images.length > 0
              ? matchedProd.images[0]
              : ((matchedProd as any).image || slide.image);
            return {
              ...slide,
              productId: matchedProd.id,
              title: matchedProd.name || slide.title,
              price: livePrice,
              originalPrice: liveOrigPrice,
              image: liveImg || slide.image,
              subtitle: matchedProd.fabric || (matchedProd.description ? matchedProd.description.slice(0, 65) + '...' : slide.subtitle),
              rawProduct: matchedProd,
            };
          }
          return slide;
        });
      }

      // Automatically generate live hero slides from real Supabase products
      return generateHeroSlidesFromProducts(products).slice(0, 6);
    }

    // Fallback if products not loaded yet
    if (heroConfig?.slides && heroConfig.slides.length > 0) {
      const nonStockSlides = heroConfig.slides.filter(s => s.image && !s.image.includes('images.unsplash.com'));
      return nonStockSlides.slice(0, 6);
    }

    return [];
  }, [heroConfig, products]);

  const slides = liveProductSlides;
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAddedToBag, setIsAddedToBag] = useState(false);

  useEffect(() => {
    if (!slides || slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides, isPaused]);

  useEffect(() => {
    if (currentSlideIdx >= slides.length) {
      setCurrentSlideIdx(0);
    }
  }, [slides.length, currentSlideIdx]);

  const handlePrev = () => {
    setCurrentSlideIdx((prev) => (prev - 1 + (slides?.length || 1)) % (slides?.length || 1));
  };

  const handleNext = () => {
    setCurrentSlideIdx((prev) => (prev + 1) % (slides?.length || 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const handleSlideClick = (slide: any) => {
    if (slide.productId) {
      navigateToProduct(slide.productId);
      return;
    }
    const targetLink = slide.link || 'All';
    const matchedProduct = products.find(p => p.id === targetLink);
    if (matchedProduct) {
      navigateToProduct(matchedProduct.id);
    } else {
      navigateToCategory(targetLink);
    }
  };

  const handleQuickAddToBag = (e: React.MouseEvent, slide: any) => {
    e.stopPropagation();
    let targetProd = slide.rawProduct;
    if (!targetProd && slide.productId) {
      targetProd = products.find(p => p.id === slide.productId);
    }
    if (!targetProd) {
      targetProd = products.find(p => p.id === slide.link || p.category === slide.link || p.name === slide.title);
    }
    if (targetProd) {
      addToCart(targetProd, targetProd.sizes?.[0] || 'M', targetProd.colors?.[0] || { name: 'Standard', hex: '#3D0F1F' }, 1, false);
      setIsAddedToBag(true);
      showToast(`Added ${targetProd.name} to Bag!`, 'success');
      setTimeout(() => setIsAddedToBag(false), 2000);
      return;
    }
    handleSlideClick(slide);
  };

  const handleQuickBuy = (e: React.MouseEvent, slide: any) => {
    e.stopPropagation();
    let targetProd = slide.rawProduct;
    if (!targetProd && slide.productId) {
      targetProd = products.find(p => p.id === slide.productId);
    }
    if (!targetProd) {
      targetProd = products.find(p => p.id === slide.link || p.category === slide.link || p.name === slide.title);
    }
    if (targetProd) {
      buyNow(targetProd, targetProd.sizes?.[0] || 'M');
      return;
    }
    handleSlideClick(slide);
  };

  if (isLoading && (!slides || slides.length === 0)) {
    return (
      <div className="w-full max-w-3xl mx-auto px-3 py-4 bg-[#FAF5EB]">
        <div className="w-full h-[360px] rounded-2xl bg-[#3D0F1F]/5 border border-[#B8935A]/25 animate-pulse flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-[#B8935A] animate-spin" />
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIdx] || slides[0];
  if (!currentSlide) return null;

  const slidePrice = Number(currentSlide.price) || 1150;
  const originalPrice = Number(currentSlide.originalPrice) || Math.round(slidePrice * 1.95);
  const discountPercent = (originalPrice > 0 && !isNaN(originalPrice) && !isNaN(slidePrice))
    ? Math.max(0, Math.round(((originalPrice - slidePrice) / originalPrice) * 100))
    : 0;
  const isWishlisted = currentSlide.productId ? isInWishlist(currentSlide.productId) : false;

  return (
    <section 
      id="haute-couture-hero" 
      className="w-full bg-[#FAF5EB] py-3 sm:py-6 px-3 sm:px-6 relative overflow-hidden border-b border-[#B8935A]/20"
    >
      <div className="max-w-3xl mx-auto relative z-10">

        {/* ============================================================ */}
        {/* 1. SECTION HEADER                                            */}
        {/* ============================================================ */}
        <div className="flex flex-col items-start text-left mb-3 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D0F1F] text-[#DFBE65] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2 border border-[#B8935A]/40 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#DFBE65]" />
            <span>SPOTLIGHT SELECTIONS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3D0F1F] tracking-tight">
            Editor’s Pick
          </h2>
          <p className="text-xs sm:text-sm text-[#211D1A]/80 mt-1 max-w-xl font-normal leading-relaxed">
            Exclusive designer sets curated specially to elevate your wardrobe.
          </p>
        </div>

        {/* ============================================================ */}
        {/* 2. EXPANDED FULL-WIDTH HERO SLIDE CARD (NO ARROWS, ZERO GAPS)*/}
        {/* ============================================================ */}
        <div 
          className="relative w-full bg-white rounded-2xl sm:rounded-3xl border-2 border-[#B8935A]/40 shadow-xl overflow-hidden group flex flex-col"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
          {/* Top Royal Banner Tag */}
          <div className="bg-[#3D0F1F] text-[#FAF5EB] px-3.5 sm:px-5 py-2 flex items-center justify-between border-b border-[#B8935A]/35">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Crown className="w-4 h-4 text-[#DFBE65] shrink-0 animate-pulse" />
              <span className="font-serif font-bold text-[11px] sm:text-xs tracking-wider uppercase text-[#DFBE65] truncate">
                {currentSlide.badge || 'ROYAL FESTIVE EDIT'}
              </span>
            </div>
            
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF5EB]/10 border border-[#DFBE65]/40 text-[#DFBE65] text-[9px] sm:text-[10px] font-black uppercase tracking-widest shrink-0">
              {discountPercent}% OFF
            </span>
          </div>

          {/* FULL-BLEED UNMASKED CATALOG IMAGE AREA (0% GAPS, 0% CROPPING) */}
          <div 
            className="relative w-full aspect-[4/5] sm:aspect-[16/10] bg-[#FAF5EB] overflow-hidden cursor-pointer flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => handleSlideClick(currentSlide)}
          >
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlideIdx;
              const cleanImg = getCleanImageUrl(slide.image, 1000);

              return (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center bg-[#FAF5EB] ${
                    isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAF5EB] via-[#F3EAD8] to-[#FAF5EB] animate-pulse pointer-events-none" />
                  {cleanImg && (
                    <img
                      src={cleanImg}
                      alt={slide.title || 'Suit Bliss Aura'}
                      className="relative z-10 w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('data:image/svg+xml')) {
                          target.src = ELEGANT_PLACEHOLDER_SVG;
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}

            {/* Wishlist Button Overlay */}
            {currentSlide.rawProduct && (
              <button
                type="button"
                id="hero-wishlist-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(currentSlide.rawProduct);
                }}
                className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full border shadow-md transition cursor-pointer ${
                  isWishlisted 
                    ? 'bg-rose-50 border-rose-300 text-rose-600' 
                    : 'bg-white/90 border-[#B8935A]/40 text-gray-700 hover:text-[#3D0F1F] backdrop-blur-xs'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            )}

            {/* Elegant Slide Bullet Indicators */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlideIdx(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentSlideIdx 
                        ? 'w-6 bg-[#3D0F1F] shadow-xs' 
                        : 'w-2 bg-gray-400/70 hover:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Luxury Action & Details Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-100 space-y-2">
            
            <div className="flex items-center justify-between gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#FAF5EB] text-[#3D0F1F] font-mono font-bold text-[9px] sm:text-[10px] uppercase tracking-wider border border-[#B8935A]/30">
                JAIPUR HANDCRAFTED
              </span>

              <div className="flex items-center gap-1 text-amber-800 text-[10px] sm:text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9 (High Rating)</span>
              </div>
            </div>

            <h3 
              onClick={() => handleSlideClick(currentSlide)}
              className="font-serif text-sm sm:text-lg font-bold text-[#3D0F1F] leading-tight truncate hover:text-[#B8935A] transition cursor-pointer"
            >
              {currentSlide.title}
            </h3>

            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-lg sm:text-2xl font-black text-[#3D0F1F]">
                  ₹{slidePrice.toLocaleString('en-IN')}
                </span>
                {originalPrice > slidePrice && (
                  <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                READY TO SHIP
              </span>
            </div>

            {/* Redesigned Luxury Dual Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="hero-add-to-bag-btn"
                onClick={(e) => handleQuickAddToBag(e, currentSlide)}
                className="py-2 sm:py-2.5 px-3 bg-[#FAF5EB] hover:bg-[#F2E8D5] text-[#3D0F1F] font-serif font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-[#B8935A]/60 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer transition"
              >
                {isAddedToBag ? <Check className="w-4 h-4 text-emerald-600" /> : <ShoppingBag className="w-4 h-4 text-[#B8935A]" />}
                <span>{isAddedToBag ? 'ADDED TO BAG' : 'ADD TO BAG'}</span>
              </button>

              <button
                type="button"
                id="hero-buy-now-btn"
                onClick={(e) => handleQuickBuy(e, currentSlide)}
                className="py-2 sm:py-2.5 px-3 bg-[#3D0F1F] hover:bg-[#20050E] text-[#FAF5EB] font-serif font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl border border-[#B8935A] flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer transition"
              >
                <Zap className="w-4 h-4 text-[#DFBE65] fill-[#DFBE65]" />
                <span>BUY NOW</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
