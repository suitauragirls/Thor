import React from 'react';
import { motion } from 'motion/react';
import { useShop } from '../context/ShopContext';
import { X, Tag, Check, Gift, Sparkles } from 'lucide-react';

export const CouponDrawer: React.FC = () => {
  const { 
    isCouponDrawerOpen, 
    setIsCouponDrawerOpen, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    coupons
  } = useShop();

  const handleApply = (code: string) => {
    applyCoupon(code);
    setIsCouponDrawerOpen(false);
  };

  return (
    <div 
      id="coupon-drawer-overlay" 
      onClick={() => setIsCouponDrawerOpen(false)} 
      className={`fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300 ${
        isCouponDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <motion.div 
        id="coupon-drawer"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: isCouponDrawerOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[#FDFBF7] w-full max-w-md h-full flex flex-col relative overflow-hidden border-l border-[#B8935A]/30"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#B8935A]/30 flex items-center justify-between bg-[#FAF5EB]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#3D0F1F] text-[#FAF5EB]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#3D0F1F]">Available Offers</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tap to apply instant savings</p>
            </div>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCouponDrawerOpen(false)}
            className="p-2 hover:bg-[#FDFBF7] text-[#3D0F1F]/55 hover:text-[#3D0F1F] transition-colors cursor-pointer"
            id="close-coupon-drawer"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Coupons List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {coupons.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Tag className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-500 font-bold">No active coupons available right now.</p>
              <p className="text-[11px] text-gray-400">Check back during upcoming festive sales!</p>
            </div>
          ) : (
            coupons.map((cp) => {
              const isApplied = appliedCoupon?.code === cp.code;
              const discountLabel = cp.discountType === 'percentage' 
                ? `${cp.discountValue}% Flat Discount`
                : `₹${cp.discountValue} Flat Discount`;
              
              const minOrderHint = cp.minOrderValue > 0 ? `Valid on orders above ₹${cp.minOrderValue}` : 'No minimum order required';

              return (
                <div 
                  key={cp.id} 
                  className={`relative border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                    isApplied 
                      ? 'border-[#3D0F1F] bg-[#FAF5EB]' 
                        : 'border-[#B8935A]/25 bg-[#FDFBF7] hover:border-[#B8935A] hover:bg-[#FAF5EB]'
                  }`}
                >
                  {/* Active Indicator Left Bar */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#B8935A]" />

                  <div className="p-5 pl-7 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-[#FAF7F2] text-gray-700 text-[9px] font-black uppercase tracking-widest rounded-full border border-gray-200/80 shadow-3xs">
                        Royal Special
                      </span>
                      {isApplied && (
                        <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-3xs animate-pulse">
                          <Check className="w-3 h-3 stroke-[3]" /> Applied
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-black" />
                          <span className="font-mono text-base font-extrabold tracking-wider text-[#211C1A]">
                            {cp.code}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-800">
                          {discountLabel}
                        </p>
                      </div>

                      {isApplied ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={removeCoupon}
                          className="px-4 py-2 bg-[#D8C8B8]/40 hover:bg-rose-200 text-rose-800 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
                        >
                          Remove
                        </motion.button>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApply(cp.code)}
                          className="px-4 py-2 bg-[#3D0F1F] text-[#FAF5EB] text-[10px] font-semibold uppercase tracking-wider transition-colors hover:bg-[#3D0F1F]/90 cursor-pointer"
                        >
                          Apply
                        </motion.button>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-500 leading-relaxed font-medium pt-2 border-t border-dashed border-gray-200/80 space-y-1">
                      <p>{minOrderHint}</p>
                      <p className="text-[10px] text-gray-400">Valid until: {new Date(cp.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Interactive Hint Footer */}
        <div className="p-4 border-t border-rose-100/50 bg-[#D8C8B8]/20 text-center space-y-1.5">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-black fill-black" /> Maximize Festive Savings!
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed max-w-xs mx-auto">
            You can copy or apply any coupon directly. Multiple coupon codes cannot be combined on a single order.
          </p>
        </div>
        </motion.div>
    </div>
  );
};
