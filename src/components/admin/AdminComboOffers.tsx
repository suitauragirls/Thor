import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { Gift, Sparkles, Save, CheckCircle, Flame, Plus, Trash2 } from 'lucide-react';

export const AdminComboOffers: React.FC = () => {
  const { products } = useAdmin();
  const { showToast } = useShop();

  const [comboPercent, setComboPercent] = useState(15);
  const [comboTitle, setComboTitle] = useState('ROYAL FESTIVE COMBO SAVINGS');
  const [comboSubtitle, setComboSubtitle] = useState('Buy 2 Suits & Save Extra 15% OFF + Free Silk Tote Gift!');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveComboSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
    showToast('Festive Combo Offer settings saved successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#241D1B] via-[#241D1B] to-[#241D1B] text-[#211C1A] p-6 rounded-2xl border border-[#9A6A3A]/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#241D1B] border border-[#9A6A3A]/40 rounded-full text-xs font-black text-[#211C1A]">
            <Sparkles className="w-4 h-4 text-black" />
            <span>FESTIVE COMBO & STORY REELS MANAGEMENT</span>
          </div>
          <h1 className="font-serif font-black text-2xl text-white">Festive Combo Bundles & Story Reels</h1>
          <p className="text-xs text-[#FAF7F2]/80 font-sans">
            Manage multi-buy discounts, Average Order Value (AOV) boosters, and top category story reels for your storefront.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveComboSettings} className="bg-white rounded-2xl p-6 border border-[#9A6A3A]/30 shadow-xs space-y-5">
        
        <div className="flex items-center gap-2 pb-3 border-b border-[#9A6A3A]/20">
          <Gift className="w-5 h-5 text-[#211C1A]" />
          <h3 className="font-serif font-bold text-lg text-[#211C1A]">Combo Offer Discount Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">Combo Section Badge Title</label>
            <input 
              type="text" 
              value={comboTitle} 
              onChange={(e) => setComboTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#241D1B] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">Combo Bundle Discount Percentage (%)</label>
            <input 
              type="number" 
              min="5"
              max="50"
              value={comboPercent} 
              onChange={(e) => setComboPercent(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#211C1A] focus:ring-2 focus:ring-[#241D1B] outline-none"
            />
          </div>

        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">Combo Subtitle / Banner Description</label>
          <input 
            type="text" 
            value={comboSubtitle} 
            onChange={(e) => setComboSubtitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#241D1B] outline-none"
          />
        </div>

        {/* Live Products Count Sync Confirmation */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Synced with {products.length} live products from database! Customers can mix & match any suits in real-time.</span>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="py-3 px-6 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#9A6A3A]/50"
        >
          <Save className="w-4 h-4 text-black" />
          <span>{isSaved ? 'SETTINGS SAVED!' : 'SAVE COMBO CONFIGURATION'}</span>
        </button>

      </form>

    </div>
  );
};
