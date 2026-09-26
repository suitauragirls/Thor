import React, { useState, useEffect } from 'react';
import { Crown, Sparkles } from 'lucide-react';

const LUXURY_PHRASES = [
  'Weaving Pure Chanderi & Handloom Silks...',
  'Curating Handcrafted Artisan Gotapatti...',
  'Preparing Bespoke Festive Silhouettes...',
  'Unveiling Royal Boutique Collection...'
];

export const LuxuryLoadingScreen: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  // Cycle craftsmanship phrases smoothly
  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LUXURY_PHRASES.length);
    }, 1200);

    return () => clearInterval(phraseInterval);
  }, []);

  // Smooth realistic progress animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return 96;
        const jump = Math.floor(Math.random() * 14) + 6;
        return Math.min(prev + jump, 96);
      });
    }, 280);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div
      id="luxury-curtain-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading Suit Aura Girls luxury storefront"
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-between p-6 sm:p-12 select-none overflow-hidden bg-[#16030A]"
    >
      {/* 1. Deep Royal Wine Radial Ambient Lighting */}
      <div className="absolute inset-0 bg-[#241D1B] pointer-events-none" />

      {/* 2. Delicate Antique Gold Luxury Outer Hairline Frame with Corner Filigrees */}
      <div className="absolute inset-3 sm:inset-6 border border-[#9A6A3A]/25 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        {/* Top Corners */}
        <div className="flex justify-between items-center text-black/70 text-xs sm:text-sm font-serif">
          <span className="select-none">❖</span>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-black/80 font-medium hidden xs:inline">
            HAUTE ETHNIC ATELIER
          </span>
          <span className="select-none">❖</span>
        </div>

        {/* Bottom Corners */}
        <div className="flex justify-between items-center text-black/70 text-xs sm:text-sm font-serif">
          <span className="select-none">❖</span>
          <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.3em] text-black/70 font-medium hidden xs:inline">
            EST. IN ARTISAN, INDIA
          </span>
          <span className="select-none">❖</span>
        </div>
      </div>

      {/* Subtle floating ambient light dots */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#9A6A3A]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#C7A77A]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header Top Spacer */}
      <div className="relative z-10 pt-2 sm:pt-4 flex items-center justify-center gap-2 text-black">
        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-black animate-bounce" />
      </div>

      {/* Center Stage: Royal Brand Medallion & Title */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-md my-auto px-4">
        
        {/* Animated Royal Medallion */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-6 sm:mb-8 flex items-center justify-center">
          
          {/* Outer Pulsing Aura */}
          <div className="absolute inset-0 rounded-full bg-[#9A6A3A]/15 animate-ping opacity-75" />

          {/* Counter-rotating Outer Gold Ring */}
          <div className="absolute -inset-2.5 sm:-inset-3 rounded-full border border-dashed border-[#C7A77A]/40 animate-[spin_18s_linear_infinite]" />

          {/* Clockwise Fine Hairline Ring */}
          <div className="absolute -inset-1 sm:-inset-1.5 rounded-full border border-[#9A6A3A]/50 animate-[spin_10s_linear_infinite_reverse]" />

          {/* Soft Glow Behind Image */}
          <div className="absolute inset-1 rounded-full bg-[#C7A77A]/20 blur-md" />

          {/* Official Suit Aura Girls Medallion Image */}
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-b from-[#C7A77A] via-[#9A6A3A] to-[#241D1B] shadow-2xl">
            <img
              src="/cropped_circle_image.png"
              alt="Suit Aura Girls Royal Seal"
              className="w-full h-full object-cover rounded-full border border-[#16030A]"
            />
          </div>

          {/* Decorative Sparkle Accent */}
          <div className="absolute -top-1 -right-1 text-black animate-pulse">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F1E8DF] tracking-[0.22em] uppercase leading-tight mb-2 drop-shadow-md">
          Suit Aura Girls
        </h1>

        {/* Royal Tagline */}
        <p className="text-[10px] sm:text-xs tracking-[0.38em] uppercase text-black font-semibold mb-6 sm:mb-8">
          Pure Luxury Artisan Couture
        </p>

        {/* Golden Laser Loading Bar */}
        <div className="w-56 sm:w-72 flex flex-col items-center gap-2 mb-4">
          <div className="w-full h-[3px] bg-[#241D1B] rounded-full overflow-hidden border border-[#9A6A3A]/40 p-[0.5px]">
            <div
              className="h-full bg-gradient-to-r from-[#9A6A3A] via-[#C7A77A] to-[#9A6A3A] rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_#C7A77A]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Craftsmanship Status Text */}
          <div className="h-6 flex items-center justify-center overflow-hidden">
            <p
              key={phraseIndex}
              className="text-[11px] sm:text-xs text-[#F1E8DF]/90 font-medium tracking-wider italic animate-in fade-in slide-in-from-bottom-1 duration-500"
            >
              {LUXURY_PHRASES[phraseIndex]}
            </p>
          </div>
        </div>

      </div>

      {/* Footer Artisanal Guarantee */}
      <div className="relative z-10 pb-2 sm:pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241D1B]/60 border border-[#9A6A3A]/30 text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-[#211C1A] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7A77A] animate-ping" />
          <span>Handcrafted in Artisan • Express Air Dispatch</span>
        </div>
      </div>
    </div>
  );
};
