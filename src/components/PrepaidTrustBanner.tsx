import React from 'react';
import { useShop } from '../context/ShopContext';
import { getCleanImageUrl, ELEGANT_PLACEHOLDER_SVG } from '../utils/imageHelper';
import { Sparkles, ArrowRight } from 'lucide-react';

export const PrepaidTrustBanner: React.FC = () => {
  const { products = [], navigateToCategory } = useShop();

  const categories = [
    { name: 'Suits', label: 'Suits & Sets', tag: 'Royal Chanderi' },
    { name: 'Kurtis', label: 'Classic Kurtis', tag: 'Handblock Cambric' },
    { name: 'Anarkali', label: 'Kalidaar Anarkali', tag: 'Heritage Flares' },
    { name: 'Dresses', label: 'Festive Dresses', tag: 'Indo-Western drapes' }
  ];
  const categoryAliases: Record<string, string[]> = {
    Suits: ['Suits', 'Suit Sets'],
    Kurtis: ['Kurtis'],
    Anarkali: ['Anarkali', 'Anarkalis'],
    Dresses: ['Dresses'],
  };
  const getCategoryProducts = (categoryName: string) => {
    const matchingCategories = categoryAliases[categoryName] || [categoryName];
    return products.filter((product) =>
      product.inStock &&
      matchingCategories.includes(product.category) &&
      (Array.isArray(product.images) && product.images.some((image) => Boolean(image)) || Boolean(product.image))
    );
  };

  const getCategoryImage = (categoryName: string) => {
    const matchedProduct = getCategoryProducts(categoryName)[0];
    const image = matchedProduct?.images?.find(Boolean) || matchedProduct?.image;
    return image ? getCleanImageUrl(image, 160) : ELEGANT_PLACEHOLDER_SVG;
  };

  const getCategoryCount = (categoryName: string) => {
    return getCategoryProducts(categoryName).length;
  };

  const visibleCategories = categories.filter((category) => getCategoryCount(category.name) > 0);

  return (
    <section 
      id="silhouette-curations-strip" 
      className="w-full bg-[#FDFBF7] py-5 sm:py-7 px-3 sm:px-6 border-b border-antique-gold/25 select-none"
    >
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-5">
        
        {/* Sleek Minimalist Luxury Section Header */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-antique-gold font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Artisan Craft Legacies</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#3D0F1F] leading-tight">
              Shop By Silhouette
            </h3>
          </div>
          
          <button
            onClick={() => navigateToCategory('All')}
            className="text-[10px] sm:text-xs text-bottle-maroon hover:text-antique-gold font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Categories Track: All circles fit on one screen without horizontal scroll */}
        <div className="flex flex-wrap justify-center sm:justify-between items-start gap-x-2 sm:gap-3 gap-y-2.5 pt-0.5">
          {visibleCategories.map((cat) => {
            const count = getCategoryCount(cat.name);
            const coverImage = getCategoryImage(cat.name);

            return (
              <button
                key={cat.name}
                id={`silhouette-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigateToCategory(cat.name as 'Suits' | 'Kurtis' | 'Anarkali' | 'Dresses')}
                className="flex flex-col items-center text-center group cursor-pointer w-18 sm:w-21.5 md:w-24 transition-transform duration-200 active:scale-95"
              >
                {/* Circular Image Container with Royal Gold Border */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-antique-gold/40 p-0.5 bg-ivory group-hover:border-bottle-maroon transition-colors duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-ivory">
                    <img 
                      src={coverImage} 
                      alt={cat.label} 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Typography metadata */}
                <div className="mt-1.5 space-y-0.5 max-w-full">
                  <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider block leading-none text-antique-gold group-hover:text-bottle-maroon transition-colors">
                    {count} DESIGNS
                  </span>
                  
                  <h4 className="font-serif text-[10px] sm:text-xs font-semibold text-bottle-maroon group-hover:text-antique-gold transition-colors leading-tight line-clamp-2">
                    {cat.label}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
