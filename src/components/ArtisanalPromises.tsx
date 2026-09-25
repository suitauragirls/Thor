import React from 'react';
import { Award, Heart, ShieldCheck, Truck } from 'lucide-react';

export const ArtisanalPromises: React.FC = () => {
  const promises = [
    {
      id: 'handlooms',
      icon: Award,
      title: 'Artisanal Handlooms',
      desc: 'Sanganer & Bagru Weavers',
    },
    {
      id: 'fabrics',
      icon: Heart,
      title: 'Breathable Pure Fabrics',
      desc: '100% Cotton & Chanderi Silk',
    },
    {
      id: 'fit',
      icon: ShieldCheck,
      title: 'Double-Locked Fit',
      desc: 'Flawless Interlocking Fit',
    },
    {
      id: 'dispatch',
      icon: Truck,
      title: 'Express Air Dispatch',
      desc: '24-48 Hours Shipping',
    },
  ];

  return (
    <section 
      id="artisanal-promises-strip" 
      className="w-full bg-[#3D0F1F] text-[#FAF5EB] py-2 sm:py-2.5 px-2 sm:px-4 border-y border-[#B8935A]/40 shadow-xs relative overflow-hidden z-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* DESKTOP VIEW: 4 Columns with vertical gold dividers, ultra slim height */}
        <div className="hidden md:grid md:grid-cols-4 divide-x divide-[#B8935A]/30 items-center">
          {promises.map((prom) => {
            const IconComp = prom.icon;
            return (
              <div 
                key={prom.id}
                className="flex items-center justify-center gap-2.5 px-3 py-1 group cursor-default"
              >
                <div className="w-7 h-7 rounded-full bg-[#FAF5EB]/10 text-[#DFBE65] flex items-center justify-center border border-[#B8935A]/40 shrink-0 group-hover:bg-[#DFBE65] group-hover:text-[#3D0F1F] transition-all duration-300">
                  <IconComp className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div className="text-left leading-tight min-w-0">
                  <h4 className="font-serif text-[11px] sm:text-xs font-bold text-[#FAF5EB] tracking-wide uppercase truncate">
                    {prom.title}
                  </h4>
                  <p className="text-[10px] text-[#DFBE65]/90 font-medium truncate">
                    {prom.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE VIEW: Ultra-compact Marquee Ticker, ~36px tall, scrolling smoothly */}
        <div className="md:hidden overflow-hidden relative w-full flex items-center py-0.5">
          <div className="animate-luxury-marquee flex items-center gap-6 whitespace-nowrap text-xs">
            {/* Duplicated list for seamless infinite loop */}
            {[...promises, ...promises, ...promises].map((prom, idx) => {
              const IconComp = prom.icon;
              return (
                <div key={idx} className="inline-flex items-center gap-2 shrink-0">
                  <div className="w-5.5 h-5.5 rounded-full bg-[#FAF5EB]/15 text-[#DFBE65] flex items-center justify-center border border-[#B8935A]/40 shrink-0">
                    <IconComp className="w-3 h-3 stroke-[2]" />
                  </div>
                  <span className="font-serif font-bold text-[#FAF5EB] text-[11px] tracking-wide uppercase">
                    {prom.title}
                  </span>
                  <span className="text-[10px] text-[#DFBE65] font-semibold">
                    ({prom.desc})
                  </span>
                  <span className="text-[#B8935A] ml-2 text-[8px]">◆</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
