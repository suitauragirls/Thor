import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Download,
  CreditCard
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { confirmedOrder, setActivePage, navigateToCategory } = useShop();

  if (!confirmedOrder) {
    return (
      <div className="py-20 text-center bg-[#FFFDFC]">
        <div className="max-w-md mx-auto px-4 space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#2C1820]">No Active Order</h2>
          <p className="text-xs text-gray-500">You haven't placed an order in this active session.</p>
          <button
            onClick={() => setActivePage('shop')}
            className="px-6 py-2.5 bg-[#241D1B] text-[#211C1A] rounded-lg text-xs font-semibold uppercase tracking-wider"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="order-confirmation-page" className="py-12 sm:py-16 bg-[#FFFDFC]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Success Header Banner */}
        <div className="text-center space-y-3 pb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B88E28] block">
            Payment & Order Verified
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1820]">
            ORDER CONFIRMED
          </h1>

          <p className="text-sm sm:text-base text-gray-600 font-medium">
            Thank you for shopping with <strong className="text-[#211C1A]">Suit Aura Girls</strong>.
          </p>

          <p className="text-xs text-gray-500">
            A confirmation receipt has been sent to <strong>{confirmedOrder.customerEmail}</strong>.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-\[#FAF7F2\] border border-rose-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Summary Header Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#D8C8B8]/50 rounded-xl border border-rose-100/70 text-xs">
            <div>
              <span className="text-gray-500 block">Order Number</span>
              <strong className="font-mono text-sm text-[#211C1A]">{confirmedOrder.orderNumber}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Customer Name</span>
              <strong className="text-gray-900">{confirmedOrder.customerName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Payment Method</span>
              <strong className="text-gray-900 uppercase">{confirmedOrder.paymentMethod} (Prepaid)</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Estimated Delivery</span>
              <strong className="text-emerald-800">{confirmedOrder.estimatedDeliveryDate}</strong>
            </div>
          </div>

          {/* Delivery Address Block */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <MapPin className="w-4 h-4 text-[#211C1A]" />
              <span>Delivery Address</span>
            </div>
            <div className="p-4 bg-[#FFF9FA] rounded-xl border border-rose-100 text-xs sm:text-sm text-gray-700 leading-relaxed">
              <p className="font-bold text-[#2C1820]">{confirmedOrder.deliveryAddress.fullName}</p>
              <p>{confirmedOrder.deliveryAddress.houseFlat}, {confirmedOrder.deliveryAddress.street}</p>
              <p>{confirmedOrder.deliveryAddress.area}, {confirmedOrder.deliveryAddress.city}</p>
              <p>{confirmedOrder.deliveryAddress.state} - <span className="font-mono font-bold">{confirmedOrder.deliveryAddress.pincode}</span></p>
              <p className="mt-1 text-gray-500">Phone: +91 {confirmedOrder.deliveryAddress.mobile}</p>
            </div>
          </div>

          {/* Items Purchased List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Package className="w-4 h-4 text-[#211C1A]" />
              <span>Items in this Order ({confirmedOrder.items.reduce((a, b) => a + b.quantity, 0)})</span>
            </div>

            <div className="divide-y divide-rose-50 border border-rose-100 rounded-xl overflow-hidden">
              {confirmedOrder.items.map((item) => {
                const selectedColorName = item.selectedColor?.name;
                const selectedColorHex = item.selectedColor?.hex;
                const colorsList = item.product?.colors || [];
                const colorIdx = colorsList.findIndex((c: any) => c.name === selectedColorName || c.hex === selectedColorHex);
                const itemImg = item.selectedColor?.imageUrl 
                  || (colorIdx !== -1 && item.product?.images?.[colorIdx])
                  || item.product?.images?.[0] 
                  || '';

                return (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-\[#FAF7F2\]">
                    <div className="flex items-center gap-3">
                      {itemImg ? (
                        <img src={itemImg} alt={item.product.name} className="w-14 h-16 object-cover rounded-lg border border-rose-100 shrink-0" />
                      ) : (
                        <div className="w-14 h-16 bg-black rounded-lg border border-rose-100 shrink-0" />
                      )}
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#2C1820]">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">
                        Size: <strong>{item.selectedSize}</strong> • Color: <strong>{item.selectedColor.name}</strong> • Qty: <strong>{item.quantity}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-[#211C1A] text-sm shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
               );
              })}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="p-4 bg-[#D8C8B8]/40 rounded-xl border border-rose-100 space-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{confirmedOrder.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {confirmedOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount ({confirmedOrder.couponCode})</span>
                <span>-₹{confirmedOrder.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>{confirmedOrder.shippingCharge === 0 ? 'FREE' : `₹${confirmedOrder.shippingCharge}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2C1820] pt-2 border-t border-rose-100">
              <span>Total Paid (Prepaid)</span>
              <span className="font-serif text-xl text-[#211C1A]">₹{confirmedOrder.finalTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-rose-100">
            <button
              id="confirm-continue-shopping-btn"
              onClick={() => navigateToCategory('All')}
              className="flex-1 py-3.5 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] rounded-lg text-xs sm:text-sm font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="confirm-track-order-btn"
              onClick={() => setActivePage('track-order')}
              className="px-6 py-3.5 bg-\[#FAF7F2\] border border-rose-200 text-[#211C1A] hover:bg-[#D8C8B8]/20 rounded-lg text-xs sm:text-sm font-semibold tracking-wider uppercase transition"
            >
              Track Order Live
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
