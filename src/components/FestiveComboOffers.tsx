import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, Gift, Check, ShoppingBag, Zap, ShieldCheck, Flame } from 'lucide-react';
import { getCleanImageUrl } from '../utils/imageHelper';

export const FestiveComboOffers: React.FC = () => {
  const { products, addToCart, buyNow, showToast, navigateToProduct } = useShop();

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    return products.slice(0, 2).map(p => p.id);
  });
  const [isComboAdded, setIsComboAdded] = useState(false);

  if (!products || products.length < 2) return null;

  // Combo calculation logic (15% discount when 2 or more selected)
  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
  const rawTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const comboDiscountAmount = Math.round(rawTotal * 0.15); // 15% OFF
  const finalComboPrice = rawTotal - comboDiscountAmount;

  const toggleProductInCombo = (id: string) => {
    if (selectedProductIds.includes(id)) {
      if (selectedProductIds.length <= 2) {
        showToast('Select at least 2 suits to build your Festive Combo!', 'info');
        return;
      }
      setSelectedProductIds(prev => prev.filter(pId => pId !== id));
    } else {
      if (selectedProductIds.length >= 3) {
        showToast('Max 3 suits allowed per Combo Set for maximum 15% savings!', 'info');
        return;
      }
      setSelectedProductIds(prev => [...prev, id]);
    }
  };

  const handleAddComboToBag = () => {
    selectedProducts.forEach(prod => {
      const sizeToUse = prod.sizes?.[0] || 'M';
      const colorToUse = prod.colors?.[0] || { name: 'Jaipur Gold', hex: '#B8935A' };
      addToCart({
        ...prod,
        price: Math.round(prod.price * 0.85) // Apply 15% discount
      }, sizeToUse, colorToUse, 1, false);
    });

    setIsComboAdded(true);
    setTimeout(() => setIsComboAdded(false), 2500);
    showToast(`Added ${selectedProducts.length} Jaipur Suits Combo to Bag at ₹${finalComboPrice.toLocaleString('en-IN')}!`, 'success');
  };

  const handleBuyComboNow = () => {
    // Add first item, navigate to cart/checkout with discount
    if (selectedProducts[0]) {
      const sizeToUse = selectedProducts[0].sizes?.[0] || 'M';
      const colorToUse = selectedProducts[0].colors?.[0] || { name: 'Jaipur Gold', hex: '#B8935A' };
      buyNow({
        ...selectedProducts[0],
        price: Math.round(selectedProducts[0].price * 0.85)
      }, sizeToUse, colorToUse, 1);
    }
  };

  return (
    <section id="festive-combo-offers-section" className="w-full py-8 sm:py-12 bg-[#F7F2EA] border-b border-[#B8935A]/30">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 space-y-6">
        
        {/* Section Header */}
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3D0F1F] text-[#DFBE65] rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border border-[#B8935A]/40 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#DFBE65] animate-pulse" />
            <span>ROYAL FESTIVE COMBO SAVINGS</span>
          </div>
          <h2 className="font-serif font-bold text-xl sm:text-3xl text-[#3D0F1F]">
            Buy 2 Suits & Save Extra 15% OFF
          </h2>
          <p className="text-xs sm:text-sm text-[#211D1A]/80 font-sans">
            Mix & match any handcrafted Jaipur kurti or suit sets. Get instant 15% bundle discount + Free Jaipur Silk Gift Tote!
          </p>
        </div>

        {/* Combo Builder Main Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-7 border border-[#B8935A]/40 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Product Selection Pickers (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#3D0F1F] pb-2 border-b border-[#B8935A]/20">
              <span className="uppercase tracking-wider">Tap Suits To Add To Your Combo Box:</span>
              <span className="text-[#B8935A]">{selectedProducts.length} Selected</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.slice(0, 6).map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleProductInCombo(prod.id)}
                    className={`relative rounded-2xl p-2.5 border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-1.5 ${
                      isSelected 
                        ? 'border-[#3D0F1F] bg-[#3D0F1F]/5 shadow-sm scale-102 ring-2 ring-[#B8935A]/40' 
                        : 'border-[#B8935A]/25 bg-white hover:border-[#B8935A]'
                    }`}
                  >
                    {/* Checkmark Ribbon */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#3D0F1F] text-[#DFBE65] p-1 rounded-full shadow-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#F7F2EA]">
                      <img 
                        src={getCleanImageUrl(prod.images?.[0] || prod.image)} 
                        alt={prod.name} 
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <h4 className="font-serif font-bold text-[11px] text-[#3D0F1F] line-clamp-1">{prod.name}</h4>
                    <span className="font-serif font-black text-xs text-[#3D0F1F]">₹{prod.price.toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Bundle Savings Calculator (5 Cols) */}
          <div className="lg:col-span-5 bg-[#3D0F1F] text-[#F7F2EA] p-5 sm:p-6 rounded-2xl border border-[#B8935A]/50 space-y-4 shadow-lg">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#B8935A]/30">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#DFBE65]" />
                <h3 className="font-serif font-bold text-base text-[#DFBE65]">Combo Summary</h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#DFBE65] text-[#3D0F1F] rounded">
                15% OFF SAVINGS
              </span>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between text-[#F7F2EA]/80">
                <span>Combined Price ({selectedProducts.length} Items):</span>
                <span>₹{rawTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-[#DFBE65] font-bold">
                <span>15% Festive Combo Discount:</span>
                <span>-₹{comboDiscountAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Free Silk Gift Tote:</span>
                <span>FREE (Valued ₹499)</span>
              </div>

              <div className="pt-2 border-t border-[#B8935A]/30 flex justify-between items-baseline">
                <span className="font-serif font-extrabold text-sm text-white">Final Bundle Total:</span>
                <span className="font-serif font-black text-2xl text-[#DFBE65]">₹{finalComboPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAddComboToBag}
                className={`w-full py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  isComboAdded 
                    ? 'bg-emerald-700 text-white border-emerald-500' 
                    : 'bg-white text-[#3D0F1F] border-[#3D0F1F] hover:bg-[#F7F2EA]'
                }`}
              >
                {isComboAdded ? <Check className="w-4 h-4 text-emerald-300" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{isComboAdded ? 'ADDED COMBO TO BAG!' : 'ADD FESTIVE COMBO TO BAG'}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyComboNow}
                className="w-full py-3 px-3 bg-gradient-to-r from-[#B8935A] via-[#DFBE65] to-[#B8935A] text-[#3D0F1F] font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#DFBE65]"
              >
                <Zap className="w-4 h-4 text-[#3D0F1F] fill-[#3D0F1F]" />
                <span>INSTANT BUY COMBO NOW</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#DFBE65]/80 font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Guaranteed Fit & 7-Day Easy Exchange</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
