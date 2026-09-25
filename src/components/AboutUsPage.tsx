import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Heart, ShieldCheck, Award, Users, ChevronRight, ArrowRight } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  const { setActivePage, navigateToCategory } = useShop();

  return (
    <div id="about-us-page" className="py-12 sm:py-16 bg-[#FFFDFC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <button onClick={() => setActivePage('home')} className="hover:text-[#58152D]">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#58152D] font-bold">About Us</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B88E28]">
            Our Story & Craft
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1820]">
            Elegance That Feels Like You
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Suit Bliss Aura was born from a singular passion: celebrating modern Indian womanhood with ethnic silhouettes that harmonize regal heritage with supreme everyday comfort.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#E0BFB8]/40 border border-rose-100 rounded-2xl p-6 sm:p-10">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#58152D]">
              Handcrafted With Love in India
            </h2>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Every Suit Bliss Aura ensemble is meticulously tailored using breathable pure cottons, fluid Georgettes, lustrous Chanderi silks, and modal blends. We work directly with master artisans across Jaipur, Surat, and Lucknow to bring timeless zardozi, hand block prints, and gota patti craftsmanship directly to your doorstep.
            </p>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              We believe luxury should never be cumbersome. Our silhouettes are designed to flatter all Indian body shapes from sizes XS to XXL with graceful drapes that move effortlessly with you.
            </p>
          </div>

          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-\[#FAF7F5\] rounded-xl border border-rose-100 shadow-xs space-y-2.5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E0BFB8]/20 border border-rose-200 text-[#58152D] flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 text-[#C84B70]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C1820]">Premium Quality</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Non-bleeding azo-free dyes, pre-shrunk fabrics, and reinforced double-needle seam stitching.
            </p>
          </div>

          <div className="p-6 bg-\[#FAF7F5\] rounded-xl border border-rose-100 shadow-xs space-y-2.5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E0BFB8]/20 border border-rose-200 text-[#58152D] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6 text-[#C84B70]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C1820]">Feminine Comfort</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tailored for all-day ease from morning rituals and boardroom meetings to festive celebrations.
            </p>
          </div>

          <div className="p-6 bg-\[#FAF7F5\] rounded-xl border border-rose-100 shadow-xs space-y-2.5 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E0BFB8]/20 border border-rose-200 text-[#58152D] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-[#58152D]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C1820]">Ethical & Fair</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Proudly supporting traditional artisan communities with fair wages and sustainable textile practices.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <button
            onClick={() => navigateToCategory('All')}
            className="px-8 py-3.5 bg-[#58152D] hover:bg-[#7E1D3B] text-white rounded-lg text-xs sm:text-sm font-semibold tracking-widest uppercase transition shadow-md inline-flex items-center gap-2"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
