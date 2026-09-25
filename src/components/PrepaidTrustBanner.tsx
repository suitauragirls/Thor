import React from 'react';
import { useShop } from '../context/ShopContext';
import { getCleanImageUrl } from '../utils/imageHelper';
import { Sparkles, ArrowRight } from 'lucide-react';

export const PrepaidTrustBanner: React.FC = () => {
  const { products = [], navigateToCategory } = useShop();

  const categories = [
    { name: 'Suits', label: 'Suits & Sets', tag: 'Royal Chanderi' },
    { name: 'Kurtis', label: 'Classic Kurtis', tag: 'Handblock Cambric' },
    { name: 'Anarkali', label: 'Kalidaar Anarkali', tag: 'Heritage Flares' },
    { name: 'Dresses', label: 'Festive Dresses', tag: 'Indo-Western drapes' },
    { name: 'Co-ord Sets', label: 'Co-ord Sets', tag: 'Sleek Fusion' },
    { name: 'Festive Wear', label: 'Festive Wear', tag: 'Jaipur Luminous' },
    { name: 'Sale', label: 'Sale Edition', tag: 'Special Offers', isSale: true }
  ];

  // Curated clean single-portrait model images from the catalog (CDN hosted to preserve 0 Supabase egress)
  const curatedCategoryImages: Record<string, string> = {
    'Suits': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    'Kurtis': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    'Anarkali': 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
    'Dresses': 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
    'Co-ord Sets': 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    'Festive Wear': 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    'Sale': 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80'
  };

  // Dynamic calculations: prioritize clean single model portrait image (images[1] or single image)
  const getCategoryImage = (categoryName: string) => {
    if (products && products.length > 0) {
      const activeProds = products.filter(p => p.inStock);
      let matchedProd;
      
      if (categoryName === 'Sale') {
        matchedProd = activeProds.find(p => (p.isSale || (p.discount && p.discount >= 30)) && p.images && p.images.length > 1);
      } else if (categoryName === 'Festive Wear') {
        matchedProd = activeProds.find(p => (p.category === 'Festive Wear' || p.isFestive) && p.images && p.images.length > 1);
      } else {
        matchedProd = activeProds.find(p => p.category === categoryName && p.images && p.images.length > 1);
      }

      // If matched with multiple images, images[1] is the clean single model portrait (images[0] is the collage card)
      if (matchedProd && matchedProd.images && matchedProd.images.length > 1) {
        return getCleanImageUrl(matchedProd.images[1]);
      }
    }

    return getCleanImageUrl(curatedCategoryImages[categoryName] || curatedCategoryImages['Suits']);
  };

  const getCategoryCount = (categoryName: string) => {
    if (!products) return 0;
    const activeProds = products.filter(p => p.inStock);
    if (categoryName === 'Sale') {
      return activeProds.filter(p => p.isSale || p.discount >= 36).length;
    }
    if (categoryName === 'Festive Wear') {
      return activeProds.filter(p => p.category === 'Festive Wear' || p.isFestive).length;
    }
    return activeProds.filter(p => p.category === categoryName).length;
  };

  return (
    <section 
      id="silhouette-curations-strip" 
      className="w-full bg-[#FDFBF7] py-3.5 sm:py-6 px-3 sm:px-6 border-b border-[#B8935A]/20 select-none"
    >
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-5">
        
        {/* Sleek Minimalist Luxury Section Header */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.22em] text-[#B8935A] font-black">
              <Sparkles className="w-3 h-3 text-[#DFBE65] fill-[#DFBE65]" />
              <span>Jaipur Craft Legacies</span>
            </div>
            <h3 className="font-serif text-base sm:text-xl font-bold text-[#3D0F1F] tracking-wide leading-tight">
              Shop By Silhouette
            </h3>
          </div>
          
          <button
            onClick={() => navigateToCategory('All')}
            className="text-[10px] sm:text-xs text-[#B8935A] hover:text-[#3D0F1F] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Categories Track: All circles fit on one screen without horizontal scroll */}
        <div className="flex flex-wrap justify-center sm:justify-between items-start gap-x-2 sm:gap-3 gap-y-2.5 pt-0.5">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.name);
            const coverImage = getCategoryImage(cat.name);

            return (
              <button
                key={cat.name}
                id={`silhouette-card-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => navigateToCategory(cat.name as any)}
                className="flex flex-col items-center text-center group cursor-pointer w-[72px] sm:w-[86px] md:w-[96px] transition-transform duration-200 active:scale-95"
              >
                {/* Circular Image Container with Royal Gold Border */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-[#B8935A]/35 p-0.5 bg-white group-hover:border-[#3D0F1F] group-hover:shadow-md transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-[#FAF5EB]">
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
                  <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider block leading-none ${cat.isSale ? 'text-red-600' : 'text-[#B8935A] group-hover:text-[#3D0F1F] transition-colors'}`}>
                    {cat.isSale ? 'OFFERS' : `${count}+ DESIGNS`}
                  </span>
                  
                  <h4 className="font-serif text-[10px] sm:text-xs font-bold text-[#3D0F1F] tracking-tight group-hover:text-[#B8935A] transition-colors leading-tight line-clamp-2">
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
