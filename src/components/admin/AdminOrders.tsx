import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { useRouter } from '../../context/RouterContext';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  User, 
  MapPin, 
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  FileText
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

export const AdminOrders: React.FC = () => {
  const { orders = [], updateOrderStatus, updateOrderPaymentStatus } = useAdmin();
  const { showToast } = useShop();
  const { openAdminOrderDetails } = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const getStatusBadge = (status: AdminOrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Packed':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Processing':
        return 'bg-amber-50 text-black border-amber-200';
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'Pending':
        return 'bg-amber-50 text-black border-amber-300';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerMobile.includes(searchQuery);

    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="admin-orders-page" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FDFBF7] p-5 rounded-2xl border border-[#9A6A3A]/25 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">
            Fulfillment & Shipments
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#211C1A]">
            Order Management ({orders.length})
          </h2>
          <p className="text-xs text-gray-500">Track purchase transactions, shipment packages, and prepaid status updates</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Prepaid Captured (No COD)</span>
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#9A6A3A]/25 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            placeholder="Search by order ID (SAG-...), customer name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#9A6A3A]/25 bg-[#F1E8DF]/50 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#241D1B] text-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-[#9A6A3A]/25 rounded-xl text-xs bg-[#FDFBF7] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
          >
            <option value="All">All Order Statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#9A6A3A]/25 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1E8DF] border-b border-[#9A6A3A]/20 text-gray-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.orderNumber} 
                    className="hover:bg-[#F1E8DF]/50 transition cursor-pointer"
                    onClick={() => openAdminOrderDetails(order.orderNumber)}
                  >
                    
                    {/* 1. Order ID */}
                    <td className="py-3 px-4 font-mono font-bold text-[#211C1A]">
                      <span className="hover:underline">{order.orderNumber}</span>
                    </td>

                    {/* 2. Date */}
                    <td className="py-3 px-4 text-gray-600 text-[11px]">
                      {order.date}
                    </td>

                    {/* 3. Customer */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{order.customerName}</p>
                      <p className="text-[10px] text-gray-500">{order.customerEmail}</p>
                      <p className="text-[10px] text-gray-400">+91 {order.customerMobile}</p>
                    </td>

                    {/* 4. Amount */}
                    <td className="py-3 px-4 font-bold text-gray-900 text-sm">
                      ₹{order.finalTotal.toLocaleString('en-IN')}
                      <span className="block text-[10px] font-normal text-gray-400">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    {/* 5. Payment Status */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      {order.paymentStatus === 'Paid' ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Paid (Verified)
                        </span>
                      ) : order.paymentStatus === 'Pending Verification' ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 bg-amber-50 text-black border border-amber-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending UTR Verification
                          </span>
                          <button
                            onClick={() => {
                              updateOrderPaymentStatus(order.orderNumber, 'Paid');
                              showToast(`Order ${order.orderNumber} payment verified & marked Paid! 🎉`, 'success');
                            }}
                            className="block px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Verify & Mark Paid
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Unpaid / COD
                          </span>
                          <button
                            onClick={() => {
                              updateOrderPaymentStatus(order.orderNumber, 'Paid');
                              showToast(`Order ${order.orderNumber} marked as Paid!`, 'success');
                            }}
                            className="block px-2 py-0.5 bg-gray-800 hover:bg-black text-white rounded text-[9px] font-bold uppercase cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        </div>
                      )}
                      <span className="block text-[10px] text-gray-500 font-mono mt-1 uppercase">
                        {order.paymentMethod} {order.paymentRef ? `• ${order.paymentRef}` : ''}
                      </span>
                    </td>

                    {/* 6. Order Status */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          updateOrderStatus(order.orderNumber, e.target.value as AdminOrderStatus);
                          showToast(`Order ${order.orderNumber} updated to ${e.target.value}`, 'success');
                        }}
                        className={`text-xs font-bold border rounded-lg px-2.5 py-1 transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#241D1B] ${getStatusBadge(order.status)}`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>

                    {/* 7. Action */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openAdminOrderDetails(order.orderNumber)}
                        className="px-3 py-1.5 bg-[#9A6A3A]/10 hover:bg-[#241D1B] hover:text-[#211C1A] text-[#211C1A] border border-[#9A6A3A]/25 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                        title="View Full Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
