import React from 'react';
import { Instagram, Heart, ArrowUpRight } from 'lucide-react';

export const InstagramGallery: React.FC = () => {
  const galleryItems = [
    {
      id: 'ig-1',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      tag: '#FloralSuitDiaries',
      likes: '1.4k',
    },
    {
      id: 'ig-2',
      image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80',
      tag: '#AnarkaliRoyalty',
      likes: '2.8k',
    },
    {
      id: 'ig-3',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      tag: '#CottonElegance',
      likes: '980',
    },
    {
      id: 'ig-4',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
      tag: '#FestiveGlow',
      likes: '3.1k',
    },
    {
      id: 'ig-5',
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
      tag: '#CoordEnsemble',
      likes: '1.9k',
    },
    {
      id: 'ig-6',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
      tag: '#WineSuitLove',
      likes: '2.2k',
    },
  ];

  return (
    <section id="instagram-gallery-section" className="py-8 sm:py-12 bg-[#FFFDFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8C8B8]/20 border border-rose-100 text-[#211C1A] text-xs font-semibold uppercase tracking-widest mb-2">
            <Instagram className="w-3.5 h-3.5 text-[#C84B70]" />
            @suitauragirls
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1820] tracking-tight">
            FOLLOW THE AURA
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Discover our latest styles. Tag <span className="font-semibold text-[#211C1A]">#SuitAuraGirls</span> on Instagram to be featured on our official lookbook.
          </p>
        </div>

        {/* 6 Column Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden shadow-xs bg-[#D8C8B8]/20 border border-rose-100"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt="Suit Aura Girls Lookbook"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                <div className="self-end">
                  <Instagram className="w-4 h-4 text-white drop-shadow-md" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-black truncate">{item.tag}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-gray-200">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                      {item.likes}
                    </span>
                    <span className="underline flex items-center">
                      Shop <ArrowUpRight className="w-2.5 h-2.5 ml-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
