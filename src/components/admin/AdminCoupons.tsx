import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Percent, 
  IndianRupee, 
  Calendar, 
  Users, 
  X, 
  Save, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { Coupon } from '../../types';

export const AdminCoupons: React.FC = () => {
  const { coupons = [], addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useAdmin();
  const { showToast } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'expired' | 'disabled'>('all');

  const [formData, setFormData] = useState<Omit<Coupon, 'id' | 'usageCount'>>({
    code: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 999,
    maxDiscount: 500,
    startDate: '2026-08-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    isActive: true,
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const checkIfExpired = (coupon: Coupon) => {
    if (!coupon.expiryDate) return false;
    return coupon.expiryDate < todayStr;
  };

  const handleOpenAdd = () => {
    setEditingCouponId(null);
    setFormData({
      code: 'AURA25',
      discountType: 'percentage',
      discountValue: 25,
      minOrderValue: 1499,
      maxDiscount: 750,
      startDate: todayStr,
      expiryDate: '2026-12-31',
      usageLimit: 500,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      maxDiscount: coupon.maxDiscount,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('Coupon code is required.', 'error');
      return;
    }

    const cleanedCode = formData.code.trim().toUpperCase().replace(/\s+/g, '');

    if (editingCouponId) {
      updateCoupon(editingCouponId, { ...formData, code: cleanedCode });
      showToast(`Coupon ${cleanedCode} updated.`, 'success');
    } else {
      addCoupon({ ...formData, code: cleanedCode });
      showToast(`Coupon ${cleanedCode} created successfully.`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (coupon: Coupon) => {
    deleteCoupon(coupon.id);
    showToast(`Coupon ${coupon.code} deleted.`, 'info');
  };

  // Filter logic
  const filteredCoupons = coupons.filter(coupon => {
    const isExpired = checkIfExpired(coupon);
    if (filterTab === 'active') {
      return coupon.isActive && !isExpired;
    }
    if (filterTab === 'expired') {
      return isExpired;
    }
    if (filterTab === 'disabled') {
      return !coupon.isActive && !isExpired;
    }
    return true; // 'all'
  });

  return (
    <div id="admin-coupons-page" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FDFBF7] p-5 rounded-2xl border border-[#9A6A3A]/25 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-black">
            Marketing & Offers
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#211C1A]">
            Coupons & Promo Codes
          </h2>
          <p className="text-xs text-gray-500">Configure client checkout discounts, validity dates, and usage caps</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#241D1B] hover:bg-[#241D1B]/90 text-[#211C1A] rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-sm flex items-center gap-1.5 cursor-pointer border border-[#9A6A3A]/30"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#9A6A3A]/15 pb-2">
        {(['all', 'active', 'expired', 'disabled'] as const).map((tab) => {
          const count = coupons.filter(c => {
            const exp = checkIfExpired(c);
            if (tab === 'active') return c.isActive && !exp;
            if (tab === 'expired') return exp;
            if (tab === 'disabled') return !c.isActive && !exp;
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterTab === tab
                  ? 'bg-[#241D1B] text-[#211C1A] shadow-xs'
                  : 'text-gray-500 hover:bg-[#9A6A3A]/10 hover:text-[#211C1A]'
              }`}
            >
              <span className="capitalize">{tab}</span> Coupons
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filterTab === tab ? 'bg-white/20 text-white' : 'bg-[#9A6A3A]/15 text-[#211C1A]'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Coupons Grid */}
      {filteredCoupons.length === 0 ? (
        <div className="p-8 text-center bg-[#FDFBF7] rounded-2xl border border-[#9A6A3A]/25 space-y-2">
          <Tag className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">No coupons found</p>
          <p className="text-xs text-gray-500">There are no coupons matching the "{filterTab}" category at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((coupon) => {
            const isExpired = checkIfExpired(coupon);
            return (
              <div
                key={coupon.id}
                className={`bg-[#FDFBF7] rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between space-y-4 relative ${
                  isExpired 
                    ? 'border-red-200/50 opacity-80' 
                    : coupon.isActive 
                      ? 'border-[#9A6A3A]/25 hover:border-[#9A6A3A]/45' 
                      : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Top Row: Code & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className={`font-mono text-lg font-bold tracking-wider px-2.5 py-1 border rounded-lg inline-block ${
                      isExpired
                        ? 'text-gray-400 bg-gray-50 border-gray-200 line-through'
                        : 'text-[#211C1A] bg-[#F1E8DF] border-[#9A6A3A]/30'
                    }`}>
                      {coupon.code}
                    </span>
                    <p className="text-xs text-gray-600 font-medium">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF (Max ₹${coupon.maxDiscount || 'Unlimited'})`
                        : `Flat ₹${coupon.discountValue} OFF`}
                    </p>
                  </div>

                  {isExpired ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                      Expired
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        toggleCouponStatus(coupon.id);
                        showToast(`Coupon ${coupon.code} is now ${!coupon.isActive ? 'Active' : 'Disabled'}.`, 'info');
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                        coupon.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Disabled'}
                    </button>
                  )}
                </div>

                {/* Conditions & Thresholds */}
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  isExpired
                    ? 'bg-red-50/20 border-red-100 text-gray-500'
                    : 'bg-[#F1E8DF]/50 border-[#9A6A3A]/15 text-gray-600'
                }`}>
                  <div className="flex justify-between">
                    <span>Min Order Value:</span>
                    <strong className="text-gray-900">₹{coupon.minOrderValue}</strong>
                  </div>
                  <div className="flex justify-between items-center gap-1">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-black" />
                      Validity Window:
                    </span>
                    <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
                      {coupon.startDate} to {coupon.expiryDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Redemptions:</span>
                    <strong className="text-[#211C1A]">
                      {coupon.usageCount} / {coupon.usageLimit}
                    </strong>
                  </div>
                </div>

                {/* Progress Bar of usage */}
                <div className="space-y-1">
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isExpired ? 'bg-gray-400' : 'bg-[#241D1B]'}`}
                      style={{ width: `${Math.min(100, (coupon.usageCount / coupon.usageLimit) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <span className="text-[10px] text-gray-400">Coupon ID: {coupon.id}</span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(coupon)}
                      className="p-1.5 hover:bg-[#9A6A3A]/15 rounded-lg text-gray-600 hover:text-[#211C1A] cursor-pointer"
                      title="Edit Coupon"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-700 cursor-pointer"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F1E8DF] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#9A6A3A]/25 space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-[#9A6A3A]/15 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#211C1A]">
                {editingCouponId ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-[#211C1A] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. FIRST15 or AURA20"
                  className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg font-mono uppercase font-bold text-[#211C1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] text-[#211C1A] rounded-lg focus:ring-1 focus:ring-[#241D1B]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    {formData.discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Max Cap Discount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) || undefined })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Total Usage Limit (Total Redemptions)</label>
                <input
                  type="number"
                  min={1}
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#9A6A3A]/25 bg-[#FDFBF7] rounded-lg"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-[#9A6A3A]/25 text-[#211C1A] focus:ring-[#241D1B]"
                  />
                  <span>Enable and activate this coupon immediately</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#9A6A3A]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#241D1B] hover:bg-[#241D1B]/90 text-[#211C1A] rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-black" /> Save Coupon
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
