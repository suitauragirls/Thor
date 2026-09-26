import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const NewArrivalsSection: React.FC = () => {
  const { products = [], navigateToCategory } = useShop();
  const [activeTab, setActiveTab] = useState('All');

  const activeProducts = products.filter((product) => product.inStock);
  const availableTabs = ['All', ...Array.from(
    new Set(activeProducts.map((product) => product.category).filter(Boolean))
  ).sort((first, second) => first.localeCompare(second))];
  const selectedTab = availableTabs.includes(activeTab) ? activeTab : 'All';

  const displayedProducts = selectedTab === 'All'
    ? activeProducts
    : activeProducts.filter((product) => product.category === selectedTab);

  return (
    <section id="new-arrivals-section" className="py-12 sm:py-16 bg-[#FDFBF7] border-b border-[#B8935A]/25">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-2.5 text-[#B8935A]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FRESH OFF THE LOOM</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#3D0F1F]">
              Shop All Styles
            </h2>
            <p className="text-sm sm:text-base text-[#3D0F1F]/75 mt-2 max-w-xl font-normal leading-relaxed">
              Explore every available style, organized by its collection.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter new arrivals by category">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                id={`tab-filter-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setActiveTab(tab)}
                aria-pressed={selectedTab === tab}
                className={`px-3.5 py-2 text-xs font-sans font-semibold transition-colors duration-200 cursor-pointer border ${
                  selectedTab === tab
                    ? 'bg-[#3D0F1F] text-[#FAF5EB] border-[#3D0F1F]'
                    : 'bg-transparent text-[#3D0F1F] border-[#B8935A]/35 hover:border-[#B8935A]'
                }`}
              >
                <span>{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[#3D0F1F]/70" role="status">
            No styles are currently available.
          </p>
        )}

        {/* View All CTA Button */}
        <div className="mt-8 sm:mt-12 text-center">
          <button
            id="view-all-new-arrivals-btn"
            onClick={() => navigateToCategory('All')}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-[#3D0F1F] text-[#FAF5EB] hover:bg-[#3D0F1F]/90 border border-[#3D0F1F] text-xs font-sans font-bold tracking-[0.14em] uppercase transition-colors cursor-pointer"
          >
            <span>SHOP ALL PRODUCTS</span>
            <ArrowRight className="w-4 h-4 text-[#211C1A]" />
          </button>
        </div>

      </div>
    </section>
  );
};
