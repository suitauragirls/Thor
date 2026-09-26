import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { useRouter } from '../../context/RouterContext';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  CreditCard, 
  User, 
  Phone, 
  Mail, 
  Printer, 
  Save, 
  ShieldCheck, 
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Order, AdminOrderStatus } from '../../types';

const ORDER_STATUSES: AdminOrderStatus[] = [
  'Pending',
  'Paid',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
];

interface AdminOrderDetailsProps {
  orderId: string;
}

export const AdminOrderDetails: React.FC<AdminOrderDetailsProps> = ({ orderId }) => {
  const { orders = [], updateOrderStatus } = useAdmin();
  const { showToast } = useShop();
  const { navigate } = useRouter();

  const order = orders.find((o) => o.orderNumber === orderId || o.orderNumber.endsWith(orderId));

  const [status, setStatus] = useState<AdminOrderStatus>('Processing');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('BlueDart Express');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
      setCourierPartner(order.courierPartner || 'BlueDart Express');
      setNotes(order.notes || '');
    }
  }, [order]);

  if (!order) {
    return (
      <div className="bg-[#FDFBF7] p-12 rounded-2xl border border-[#9A6A3A]/25 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-black mx-auto" />
        <h3 className="font-serif text-xl font-bold text-gray-900">Order #{orderId} Not Found</h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          The requested customer order does not exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-4 py-2 bg-[#241D1B] text-[#211C1A] text-xs font-bold rounded-xl"
        >
          Return to Orders List
        </button>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.orderNumber, status, trackingNumber, notes);
    showToast(`Order ${order.orderNumber} status saved as ${status}.`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="admin-order-details-page" className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FDFBF7] p-5 rounded-2xl border border-[#9A6A3A]/25 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="p-2 bg-[#F1E8DF] hover:bg-[#9A6A3A]/15 text-[#211C1A] rounded-xl transition cursor-pointer border border-[#9A6A3A]/20"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black">
              <span>Orders</span>
              <span>/</span>
              <span>{order.orderNumber}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#211C1A]">
              Order #{order.orderNumber}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 border border-[#9A6A3A]/25 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="px-4 py-2 bg-[#F1E8DF] hover:bg-[#9A6A3A]/10 text-[#211C1A] border border-[#9A6A3A]/25 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Back to Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Order Items & Customer Address */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items Table Card */}
          <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#9A6A3A]/25 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center justify-between pb-3 border-b border-[#9A6A3A]/15">
              <span className="flex items-center gap-2 text-[#211C1A]">
                <ShoppingBag className="w-4 h-4 text-black" />
                Purchased Items ({(order.items || []).length})
              </span>
              <span className="text-xs font-bold text-[#211C1A] font-mono">
                Placement: {order.date}
              </span>
            </h3>

            <div className="divide-y divide-[#9A6A3A]/10">
              {(order.items || []).map((item, idx) => {
                const selectedColorName = item.selectedColor?.name;
                const selectedColorHex = item.selectedColor?.hex;
                const colorsList = item.product?.colors || [];
                const colorIdx = colorsList.findIndex((c: any) => c.name === selectedColorName || c.hex === selectedColorHex);
                const itemImg = item.selectedColor?.imageUrl 
                  || (colorIdx !== -1 && item.product?.images?.[colorIdx])
                  || item.product?.images?.[0] 
                  || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';

                return (
                  <div key={idx} className="py-3 flex items-center gap-4">
                    <img
                      src={itemImg}
                      alt={item.product?.name || 'Item'}
                      className="w-16 h-20 object-cover rounded-lg border border-[#9A6A3A]/20 bg-gray-50"
                    />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Category: {item.product.category} • SKU: {item.product.sku || item.product.id}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-700">
                      <span className="bg-[#F1E8DF] border border-[#9A6A3A]/20 px-2 py-0.5 rounded font-semibold text-[#211C1A]">
                        Size: {item.selectedSize}
                      </span>
                      <span className="flex items-center gap-1">
                        <span 
                           className="w-2.5 h-2.5 rounded-full border border-black/20" 
                          style={{ backgroundColor: item.selectedColor.hex }} 
                        />
                        <span>{item.selectedColor.name}</span>
                      </span>
                      <span className="text-gray-500 font-medium">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#211C1A]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      ₹{item.product.price.toLocaleString('en-IN')} each
                    </p>
                  </div>
                </div>
               );
              })}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#9A6A3A]/15 space-y-2 text-xs text-gray-600 font-medium">
              <div className="flex justify-between">
                <span>Subtotal Items:</span>
                <span className="font-semibold text-gray-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Promo Discount ({order.couponCode || 'APPLIED'}):</span>
                  <span>- ₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-semibold text-gray-900">
                  {order.shippingCharge === 0 ? 'FREE (Prepaid Special)' : `₹${order.shippingCharge}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#9A6A3A]/15 text-sm font-bold text-gray-900">
                <span>Final Captured Total:</span>
                <span className="text-base text-[#211C1A]">₹{order.finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Address Card */}
          <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#9A6A3A]/25 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-[#9A6A3A]/15">
              <MapPin className="w-4 h-4 text-black" />
              Shipping Destination & Customer Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
              <div className="space-y-1.5 p-3.5 bg-[#F1E8DF] rounded-xl border border-[#9A6A3A]/20">
                <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-black" />
                  {order.customerName}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {order.customerEmail}
                </p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  +91 {order.customerMobile}
                </p>
              </div>

              <div className="space-y-1 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900 uppercase text-[11px] tracking-wider text-gray-500">
                  Delivery Address
                </p>
                <p className="font-medium text-gray-900">
                  {order.deliveryAddress.houseFlat}, {order.deliveryAddress.street}
                </p>
                <p className="text-gray-600">
                  {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                </p>
                <p className="text-gray-600">
                  {order.deliveryAddress.state}, India
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Status Workflow & Payment Details */}
        <div className="space-y-6">
          
          {/* Fulfillment Status Card */}
          <form onSubmit={handleSave} className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#9A6A3A]/25 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-[#9A6A3A]/15">
              <Truck className="w-4 h-4 text-black" />
              Fulfillment Workflow
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Current Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminOrderStatus)}
                className="w-full px-3 py-2.5 border border-[#9A6A3A]/25 rounded-xl text-xs font-bold bg-[#F1E8DF] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#241D1B]"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Courier Partner
              </label>
              <input
                type="text"
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                placeholder="e.g. BlueDart, Delhivery, DTDC"
                className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Courier AWB / Tracking #
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. BLUEDART-882910"
                className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Internal Operational Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dispatched via express air lane..."
                className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#241D1B] hover:bg-[#241D1B]/90 text-[#211C1A] text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-black" />
              <span>Update Fulfillment State</span>
            </button>
          </form>

          {/* Payment Card */}
          <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#9A6A3A]/25 shadow-xs space-y-3">
            <h3 className="font-serif text-base font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-[#9A6A3A]/15">
              <CreditCard className="w-4 h-4 text-black" />
              Prepaid Payment Capture
            </h3>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Status: 100% Captured (Prepaid)</span>
              </div>

              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-semibold uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gateway Ref:</span>
                  <span className="font-mono text-[11px] font-bold text-gray-800">{order.paymentRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Delivery:</span>
                  <span className="font-semibold text-gray-800">{order.estimatedDeliveryDate}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
