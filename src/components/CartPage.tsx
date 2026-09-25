import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { getCleanImageUrl } from '../utils/imageHelper';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Tag, 
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    cartSubtotal, 
    shippingFee, 
    cartTotal, 
    discountAmount, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon,
    coupons,
    setActivePage,
    navigateToCategory,
    navigateToProduct
  } = useShop();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const freeShippingThreshold = 0;
  const amountNeeded = 0;

  if (cart.length === 0) {
    return (
      <div id="cart-page-empty" className="py-20 bg-[#FFFDFC]">
        <div className="max-w-xl mx-auto px-4 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#E0BFB8]/20 border border-rose-100 flex items-center justify-center text-[#58152D] mx-auto shadow-xs">
            <ShoppingBag className="w-10 h-10 opacity-70" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#2C1820]">
            Your Shopping Bag Is Empty
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You haven't added any items to your bag yet. Explore our handcrafted suits, regal anarkalis, and pure cotton kurtis to find your blissful fit.
          </p>
          <div className="pt-2">
            <button
              id="empty-cart-page-shop-btn"
              onClick={() => navigateToCategory('All')}
              className="px-8 py-3.5 bg-[#58152D] hover:bg-[#7E1D3B] text-white rounded-lg text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all shadow-md"
            >
              EXPLORE OUR COLLECTION
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-page-container" className="py-10 sm:py-16 bg-[#FFFDFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <button onClick={() => setActivePage('home')} className="hover:text-[#58152D]">Home</button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#58152D] font-semibold">Shopping Bag</span>
        </nav>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C1820] mb-8">
          Shopping Bag ({cart.reduce((a, b) => a + b.quantity, 0)} Items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Item List */}
            <div className="bg-\[#FAF7F5\] border border-rose-100 rounded-xl divide-y divide-rose-50 shadow-xs">
               {cart.map((item) => {
                 const selectedColorName = item.selectedColor?.name;
                 const selectedColorHex = item.selectedColor?.hex;
                 const colorsList = item.product?.colors || [];
                 const colorIdx = colorsList.findIndex((c: any) => c.name === selectedColorName || c.hex === selectedColorHex);
                 const itemImg = item.selectedColor?.imageUrl 
                   || (colorIdx !== -1 && item.product?.images?.[colorIdx])
                   || item.product?.images?.[0] 
                   || '';

                 return (
                   <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                     <div className="flex gap-4 items-center">
                       <img
                         src={getCleanImageUrl(itemImg)}
                         alt={item.product.name}
                         onClick={() => navigateToProduct(item.product.id)}
                         className="w-20 h-24 object-cover rounded-lg border border-rose-100 cursor-pointer shrink-0"
                       />

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-[#B88E28]">
                        {item.product.category}
                      </span>
                      <h3 
                        onClick={() => navigateToProduct(item.product.id)}
                        className="font-serif text-base sm:text-lg font-bold text-[#2C1820] hover:text-[#58152D] cursor-pointer"
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Size: <strong className="text-gray-800">{item.selectedSize}</strong> | Color: <strong className="text-gray-800">{item.selectedColor.name}</strong>
                      </p>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="font-serif font-bold text-base text-[#58152D]">
                          ₹{item.product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs line-through text-gray-400">
                          ₹{item.product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg bg-\[#FAF7F5\]">
                      <button
                        id={`cart-page-minus-${item.id}`}
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-gray-600 hover:text-[#58152D] font-bold"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        id={`cart-page-plus-${item.id}`}
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-gray-600 hover:text-[#58152D] font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-serif font-bold text-base text-[#58152D]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button
                        id={`cart-page-remove-${item.id}`}
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-gray-400 hover:text-\[#800020\] transition"
                        title="Remove from bag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
               );
              })}
            </div>

            <div className="flex justify-between items-center">
              <button
                id="cart-continue-shopping-btn"
                onClick={() => navigateToCategory('All')}
                className="text-xs sm:text-sm font-semibold text-[#58152D] hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </button>
            </div>

          </div>

          
          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-[#FFFDFC] border border-[#B8935A]/30 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="font-serif text-xl font-bold text-[#3D0F1F] border-b border-[#B8935A]/20 pb-4 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-sans font-medium text-stone-500 bg-[#FAF5EB] px-2.5 py-0.5 rounded-full border border-[#B8935A]/20">{cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
              </h3>

              {/* Coupon Code Box */}
              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong className="font-mono text-emerald-950 underline">{appliedCoupon.code}</strong> Applied!</span>
                  </div>
                  <button
                    id="cart-page-remove-coupon"
                    onClick={removeCoupon}
                    className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-bold transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="cart-page-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="ENTER PROMO CODE"
                    className="flex-1 px-3 py-2 border border-[#B8935A]/30 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#3D0F1F]"
                  />
                  <button
                    id="cart-page-apply-coupon-btn"
                    type="submit"
                    className="px-4 py-2 bg-[#3D0F1F] text-[#DFBE65] hover:bg-[#2A0A15] border border-[#B8935A]/30 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Available Coupons List in Cart */}
              <div className="space-y-2 pt-1 border-t border-[#B8935A]/15">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B8935A]" /> Offers & Promo Coupons
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {coupons && coupons.map((cp) => {
                    const isApplied = appliedCoupon?.code === cp.code;
                    const isEligible = cartSubtotal >= cp.minOrderValue;
                    return (
                      <div key={cp.id} className="p-2 bg-[#FAF5EB] border border-[#B8935A]/20 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <span className="font-mono font-extrabold text-[#3D0F1F] text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#B8935A]/25">
                            {cp.code}
                          </span>
                          <span className="ml-1.5 text-[10px] text-emerald-800 font-bold">
                            {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                          </span>
                        </div>
                        {isApplied ? (
                          <span className="text-[10px] font-bold text-emerald-700">Applied ✓</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              applyCoupon(cp.code);
                              setCouponInput(cp.code);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                              isEligible ? 'bg-[#3D0F1F] text-[#DFBE65] hover:bg-[#2A0A15]' : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            APPLY
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Details */}
              <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-[#B8935A]/20">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-mono font-semibold text-stone-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium bg-emerald-50 p-1.5 rounded border border-emerald-200">
                    <span>Coupon ({appliedCoupon?.code}) Savings</span>
                    <span className="font-mono font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Express Dispatch Delivery</span>
                  <span className="text-emerald-800 font-bold uppercase tracking-wide">
                    FREE <span className="text-stone-400 line-through text-[10px] font-normal">₹199</span>
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#3D0F1F] pt-3 border-t border-[#B8935A]/25 items-baseline">
                  <div>
                    <span className="block text-[#3D0F1F]">Estimated Total</span>
                    <span className="text-[10px] text-stone-500 font-normal">Taxes & Shipping Included</span>
                  </div>
                  <span className="font-serif text-2xl text-[#3D0F1F] font-extrabold">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="pt-2">
                <button
                  id="cart-page-checkout-btn"
                  onClick={() => setActivePage('checkout')}
                  className="w-full py-4 bg-luxury-gradient hover:brightness-110 active:scale-95 text-white rounded-xl font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 text-[#DFBE65]" />
                </button>
              </div>

              {/* Trust Badge */}
              <div className="pt-3 border-t border-rose-50 flex items-center justify-center gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Prepaid Checkout</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
