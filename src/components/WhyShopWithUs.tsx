import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Truck, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Lock, 
  Crown,
  Award
} from 'lucide-react';

interface FeatureItem {
  id: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  details: {
    heading: string;
    points: string[];
    note: string;
  };
}

export const WhyShopWithUs: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  const features: FeatureItem[] = [
    {
      id: 'why-secure-payments',
      shortTitle: '100% Safe Payments',
      subtitle: 'Instant UPI & Cards',
      badge: '256-Bit Encrypted',
      icon: ShieldCheck,
      details: {
        heading: 'Safe & Secure Prepaid Payments',
        points: [
          'Direct integration with Verified Payment Gateways',
          'Supports Google Pay, PhonePe, Paytm, BHIM & all UPI apps',
          'Debit & Credit Cards (Visa, Mastercard, RuPay) & Net Banking',
          'Zero hidden charges with instant SMS & WhatsApp receipt'
        ],
        note: 'All transactions are protected by bank-grade 256-bit SSL encryption.'
      }
    },
    {
      id: 'why-quality-fashion',
      shortTitle: 'Artisanal Quality',
      subtitle: 'Pure Artisan Fabrics',
      badge: 'Certified Pure',
      icon: Sparkles,
      details: {
        heading: 'Premium Handcrafted Ethnic Wear',
        points: [
          '100% Breathable Cambric Cotton, Organza & Chanderi Silk',
          'Authentic Sanganeri & Bagru Handblock heritage printing',
          'Double-stitched interlocking with generous seam allowances',
          'Color-fast and pre-shrunk lab-tested premium standards'
        ],
        note: 'Designed by master artisans to keep you stylish and comfortable all day.'
      }
    },
    {
      id: 'why-easy-returns',
      shortTitle: '7-Day Easy Return',
      subtitle: 'Hassle-Free Exchange',
      badge: 'Doorstep Pickup',
      icon: RotateCcw,
      details: {
        heading: 'Hassle-Free 7-Day Returns & Exchanges',
        points: [
          'Wrong size or fitting? Instant size exchange with zero hassle',
          'Doorstep pickup arranged from your home or office address',
          '1-Click return initiation via WhatsApp or Support Ticket',
          'Instant replacement dispatch or prepaid refund process'
        ],
        note: 'Items must be unused with original tags and packaging intact.'
      }
    },
    {
      id: 'why-fast-delivery',
      shortTitle: 'Express Dispatch',
      subtitle: '24-48h Hub Shipping',
      badge: 'Live Tracking',
      icon: Truck,
      details: {
        heading: 'Fast Pan-India Express Shipping',
        points: [
          'All orders dispatched within 24–48 hours from Artisan Hub',
          'Partnered with BlueDart, Delhivery & DTDC premium air cargo',
          'Real-time live SMS & WhatsApp tracking link sent instantly',
          'Safe tamper-proof multi-layer luxury packaging'
        ],
        note: 'Delivers in 3–5 business days across major metro cities & towns.'
      }
    },
  ];

  return (
    <section 
      id="why-shop-with-us-section" 
      className="py-12 sm:py-16 bg-[#FDFBF7] border-t border-[#9A6A3A]/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Sleek Editorial Header */}
        <div className="text-center max-w-lg mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#241D1B] text-[#211C1A] border border-[#9A6A3A]/40 shadow-sm text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-black" />
            <span>THE SUIT AURA GIRLS PROMISE</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211C1A] tracking-wide leading-none">
            Why Shop With Us
          </h2>
          <p className="text-xs sm:text-sm text-[#211C1A]/75 mt-2.5 font-medium">
            Tap any guarantee below to view our verified quality commitments
          </p>
        </div>

        {/* Responsive Grid Layout - 2x2 on Mobile, 4-Cols on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feat) => {
            const IconComp = feat.icon;
            return (
              <div
                key={feat.id}
                id={feat.id}
                onClick={() => setSelectedFeature(feat)}
                className="bg-[#F1E8DF]/40 rounded-2xl p-4 sm:p-5 border border-[#9A6A3A]/25 hover:border-[#241D1B] hover:bg-[#F1E8DF]/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group active:scale-98 relative overflow-hidden"
              >
                <div>
                  {/* Top Row: Delicate Gold Outline Icon & No-Clip Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#9A6A3A]/40 bg-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-300 text-black group-hover:text-[#211C1A]">
                      <IconComp className="w-5 h-5 stroke-[1.5]" />
                    </div>

                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#211C1A] bg-[#9A6A3A]/15 border border-[#9A6A3A]/30 px-2.5 py-0.5 rounded-full whitespace-nowrap self-start sm:self-center shadow-3xs">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Elegant Typography */}
                  <h3 className="font-serif text-xs sm:text-base font-bold text-[#211C1A] group-hover:text-black transition-colors leading-tight truncate">
                    {feat.shortTitle}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-[#211C1A]/75 font-medium mt-1 leading-normal line-clamp-2">
                    {feat.subtitle}
                  </p>
                </div>

                {/* Micro CTA Action at Bottom */}
                <div className="pt-3.5 mt-4 border-t border-[#9A6A3A]/15 flex items-center justify-between text-[10px] sm:text-[11px] font-black text-black group-hover:text-[#211C1A] transition-colors tracking-widest">
                  <span>VERIFY PROOF</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300 text-black" />
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ROYAL GUARANTEE CERTIFICATE MODAL */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-[#1C040C]/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          
          {/* Double Hairline Frame Outer Layer */}
          <div className="bg-white p-1 rounded-2xl max-w-md w-full border border-[#9A6A3A]/35 shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            {/* Elegant Inner Card Container */}
            <div className="bg-[#F1E8DF] rounded-xl p-5 sm:p-6 space-y-4 border border-[#9A6A3A]/25 relative text-[#211C1A]">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#9A6A3A]/20 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#241D1B] text-[#211C1A] flex items-center justify-center shrink-0 shadow-md border border-[#9A6A3A]/45">
                    <selectedFeature.icon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-black tracking-[0.18em]">
                      {selectedFeature.badge}
                    </span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#211C1A] leading-tight">
                      {selectedFeature.details.heading}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedFeature(null)}
                  className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#9A6A3A]/35 text-gray-500 hover:text-[#211C1A] transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Checklist Frame (Scroll Panel) */}
              <div className="space-y-3.5 bg-white p-4 rounded-xl border border-[#9A6A3A]/20 shadow-2xs">
                {selectedFeature.details.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#211C1A] font-medium leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Quality Seal Graphic (Royal Authenticity Seal) */}
              <div className="p-3.5 bg-[#241D1B] text-[#211C1A] rounded-xl border border-[#9A6A3A]/35 space-y-1">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-black" />
                  <span className="text-[10px] font-black uppercase text-black tracking-widest">
                    ARTISAN GUILD VERIFIED
                  </span>
                </div>
                <p className="text-[10px] text-gray-300 font-sans font-medium leading-normal">
                  {selectedFeature.details.note} Batch Certificate No: <span className="font-mono text-black font-black">SAG-2026-REGAL</span>.
                </p>
              </div>

              {/* Clean Solid Royal Close Button */}
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="w-full py-3 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition cursor-pointer border border-[#9A6A3A]/40"
              >
                Acknowledge Guarantee
              </button>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
