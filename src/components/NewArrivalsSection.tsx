import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const NewArrivalsSection: React.FC = () => {
  const { products = [], navigateToCategory } = useShop();
  const [activeTab, setActiveTab] = useState<'All' | 'Suits' | 'Kurtis' | 'Anarkali' | 'Co-ord Sets' | 'Dresses'>('All');

  // Filter active products marked as newArrival
  const activeProducts = products.filter((p) => p.inStock);
  const newArrivalsList = activeProducts.filter((p) => p.isNewArrival);
  const newArrivals = (newArrivalsList.length > 0 ? newArrivalsList : activeProducts).slice(0, 8);

  const displayedProducts = activeTab === 'All'
    ? newArrivals
    : newArrivals.filter((p) => p.category === activeTab);

  return (
    <section id="new-arrivals-section" className="py-8 sm:py-14 bg-[#F7F2EA] border-b border-[#B8935A]/25">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3D0F1F] text-[#DFBE65] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2.5 border border-[#B8935A]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#DFBE65]" />
              <span>FRESH OFF THE LOOM</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#3D0F1F] tracking-tight">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm text-[#211D1A]/80 mt-2 max-w-xl font-normal leading-relaxed">
              Handpicked Jaipur ethnic silhouettes crafted for timeless grace, comfortable drapes, and vibrant festive allure.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Suits', 'Kurtis', 'Anarkali', 'Co-ord Sets', 'Dresses'] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-filter-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#3D0F1F] text-[#F7F2EA] border border-[#B8935A]'
                    : 'bg-white/80 text-[#3D0F1F] border border-[#B8935A]/30 hover:border-[#B8935A]'
                }`}
              >
                {activeTab === tab && <Sparkles className="w-3 h-3 text-[#DFBE65]" />}
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <button
            id="view-all-new-arrivals-btn"
            onClick={() => navigateToCategory('New Arrivals')}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-[#F7F2EA] text-[#3D0F1F] hover:bg-[#3D0F1F]/10 border border-[#3D0F1F] rounded-xl text-xs font-sans font-bold tracking-[0.18em] uppercase transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <span>EXPLORE ALL NEW ARRIVALS</span>
            <ArrowRight className="w-4 h-4 text-[#3D0F1F]" />
          </button>
        </div>

      </div>
    </section>
  );
};
