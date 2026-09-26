import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';
import { ActivePage } from '../types';
import { 
  Mail, 
  Phone, 
  Instagram,
  Facebook,
  Twitter,
  CreditCard,
  Lock,
  MessageSquare,
  MessageCircle,
  X,
  Truck,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Crown,
  Ruler,
  UserCheck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActivePage, navigateToCategory } = useShop();
  const { storeSettings } = useAdmin();

  // State to manage which interactive concierge modal is open
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Shipment Tracker States
  const [trackingId, setTrackingId] = useState('SAG-89240');
  const [hasTracked, setHasTracked] = useState(true);

  // Return Desk States
  const [returnOrderId, setReturnOrderId] = useState('SAG-87635');
  const [returnReason, setReturnReason] = useState('Size too small (Exchange for Larger)');
  const [isReturnSubmitted, setIsReturnSubmitted] = useState(false);

  // Sizing Calculator States
  const [userBust, setUserBust] = useState(36);

  const handleLinkClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenConciergeModal = (modalKey: string) => {
    setActiveModal(modalKey);
    // Reset temporary action states when modal opens
    if (modalKey === 'track-order') {
      setHasTracked(true);
    } else if (modalKey === 'return-policy') {
      setIsReturnSubmitted(false);
    }
  };

  // Sizing Assistant calculation
  const calculateGarmentSize = (bust: number) => {
    if (bust <= 32) return { size: 'XS (Garment Size 34)', bust: '34"', waist: '30"', hip: '36"', len: '44"' };
    if (bust <= 34) return { size: 'S (Garment Size 36)', bust: '36"', waist: '32"', hip: '38"', len: '44"' };
    if (bust <= 36) return { size: 'M (Garment Size 38)', bust: '38"', waist: '34"', hip: '40"', len: '44"' };
    if (bust <= 38) return { size: 'L (Garment Size 40)', bust: '40"', waist: '36"', hip: '42"', len: '45"' };
    if (bust <= 40) return { size: 'XL (Garment Size 42)', bust: '42"', waist: '38"', hip: '44"', len: '45"' };
    if (bust <= 42) return { size: 'XXL (Garment Size 44)', bust: '44"', waist: '40"', hip: '46"', len: '45"' };
    return { size: '3XL (Garment Size 46)', bust: '46"', waist: '42"', hip: '48"', len: '45"' };
  };

  const recommendedInfo = calculateGarmentSize(userBust);

  return (
    <footer 
      id="main-footer" 
      className="w-full bg-[#3D0F1F] text-[#FAF5EB] pt-10 pb-20 border-t border-[#B8935A]/35 relative overflow-hidden"
    >
      {/* Editorial Mughal Mandala Backdrop Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Grid Section for Curated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#B8935A]/25">
          
          {/* Card 1: Brand Heritage & Core Contact details */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="space-y-1">
                <span className="font-serif text-2xl sm:text-3xl font-semibold text-[#FAF5EB] block">
                  {storeSettings?.storeName || 'Suit Aura Girls'}
                </span>
                <p className="font-serif italic text-xs text-[#DFBE65] tracking-widest uppercase">
                  &ldquo;{storeSettings?.tagline || 'Elegance That Feels Like You'}&rdquo;
                </p>
              </div>
              <p className="text-xs text-[#FAF5EB]/75 leading-relaxed font-normal">
                Regal, handcrafted ethnic wear tailored to perfection. Experience pure Artisan cottons, Chanderi silks, and Banarasi drapes designed for every milestone.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#B8935A]/25 text-xs text-[#FAF5EB]/85 font-medium">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-[#DFBE65] shrink-0" />
                <a href={`mailto:${storeSettings?.storeEmail || 'suitauragirls@gmail.com'}`} className="hover:text-[#DFBE65] hover:underline transition truncate">
                  {storeSettings?.storeEmail || 'suitauragirls@gmail.com'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-[#DFBE65] shrink-0" />
                <a 
                  href="https://wa.me/918238451017?text=Hi%20Suit%20Bliss%20Aura!%20I%20have%20a%20question." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#DFBE65] font-semibold hover:underline transition"
                >
                  {storeSettings?.phone || '+91 82384 51017'} (WhatsApp Order Help)
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Support Concierge (Clickable Interactive Links) */}
          <div className="space-y-4 border-t border-[#B8935A]/25 pt-6 md:border-t-0 md:pt-0">
            <h4 className="font-serif font-semibold text-[#DFBE65] text-xs tracking-[0.2em] uppercase border-b border-[#B8935A]/20 pb-2.5">
              Concierge Desk
            </h4>
            
            <div className="flex flex-col space-y-2.5 text-xs font-normal">
              {[
                { label: 'Track Your Shipment', key: 'track-order' },
                { label: 'Initiate Easy Return (7 Days)', key: 'return-policy' },
                { label: 'Prepaid Payment Guarantees', key: 'privacy-policy' },
                { label: 'Size & Fit Assistant', key: 'about' },
                { label: 'Contact Styling Consultant', key: 'contact' }
              ].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOpenConciergeModal(item.key)}
                  className="text-left text-[#FAF5EB]/80 hover:text-[#DFBE65] transition-colors duration-200 flex items-center gap-2 group cursor-pointer py-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-[#B8935A]/50 group-hover:bg-[#DFBE65] transition"></span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Socials & Direct WhatsApp Chat */}
          <div className="space-y-5 flex flex-col justify-between border-t border-[#B8935A]/25 pt-6 md:border-t-0 md:pt-0">
            <div className="space-y-4">
              <h4 className="font-serif font-semibold text-[#DFBE65] text-xs tracking-[0.2em] uppercase border-b border-[#B8935A]/20 pb-2.5">
                Join Our Community
              </h4>
              <p className="text-xs text-[#FAF5EB]/75 leading-relaxed font-normal">
                Follow our dressmaking journey, Artisan loom stories, and real client diaries.
              </p>
              
              {/* Circular Social Icons */}
              <div className="flex items-center gap-3 pt-1">
                {[
                  { icon: Instagram, href: 'https://instagram.com' },
                  { icon: Facebook, href: 'https://facebook.com' },
                  { icon: Twitter, href: 'https://twitter.com' }
                ].map((soc, sIdx) => {
                  const IconComp = soc.icon;
                  return (
                    <a
                      key={sIdx}
                      href={soc.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 bg-transparent hover:bg-[#B8935A] text-[#DFBE65] hover:text-[#3D0F1F] border border-[#B8935A]/35 flex items-center justify-center transition-colors"
                    >
                      <IconComp className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Direct Instant Concierge Contact */}
            <button
              onClick={() => handleOpenConciergeModal('contact')}
              className="w-full bg-[#B8935A] hover:bg-[#DFBE65] text-[#3D0F1F] py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#B8935A]"
            >
              <MessageSquare className="w-4.5 h-4.5 text-[#211C1A]" />
              <span>Direct WhatsApp Concierge</span>
            </button>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Payment Security */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#F1E8DF]/70">
          <div className="space-y-1 text-center md:text-left font-normal">
            <p>© 2026 {storeSettings?.storeName || 'Suit Aura Girls'}. All Rights Reserved.</p>
            <p className="text-gray-400">Designed for Handcrafted Grace and Uncompromised Elegance.</p>
          </div>
          
          {/* Trust Payment Security Tag */}
          <div className="flex items-center gap-3 px-4 py-2 border border-[#B8935A]/30">
            <Lock className="w-3.5 h-3.5 text-[#DFBE65]" />
            <span className="uppercase tracking-widest text-[9px] font-black text-[#FDFBF7]">256-Bit SSL • 100% Prepaid</span>
            <div className="flex items-center gap-1 text-[#DFBE65]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5 CONCIERGE INTERACTIVE MODALS */}
      {/* ========================================================================= */}

      {/* 1. TRACK SHIPMENT MODAL */}
      {activeModal === 'track-order' && (
        <div className="fixed inset-0 bg-[#1C040C]/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-1 rounded-2xl max-w-md w-full border border-[#9A6A3A]/35 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-[#F1E8DF] rounded-xl p-5 sm:p-6 space-y-4 border border-[#9A6A3A]/25 relative text-[#211C1A]">
              
              <div className="flex items-start justify-between gap-3 border-b border-[#9A6A3A]/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#241D1B] text-[#211C1A] flex items-center justify-center border border-[#9A6A3A]/30">
                    <Truck className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-black tracking-[0.18em]">BlueDart Premium Air</span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#211C1A] leading-tight">Express Shipment Tracker</h3>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-black transition cursor-pointer"><X className="w-4.5 h-4.5" /></button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#211C1A]/80 leading-normal">Enter your unique Order ID or AWB Tracking Number to track your live Artisan Dispatch.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 bg-white border border-[#9A6A3A]/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
                    placeholder="e.g. SAG-89240"
                  />
                  <button 
                    onClick={() => setHasTracked(true)}
                    className="bg-[#241D1B] text-[#211C1A] font-black text-xs px-4 py-2.5 rounded-xl border border-[#241D1B] hover:bg-[#241D1B] transition cursor-pointer"
                  >
                    Track Info
                  </button>
                </div>
              </div>

              {hasTracked && (
                <div className="bg-white p-4 rounded-xl border border-[#9A6A3A]/25 space-y-4 shadow-3xs max-h-[220px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 text-[10px] sm:text-xs">
                    <span className="font-bold">ID: <span className="text-black">{trackingId}</span></span>
                    <span className="px-2 py-0.5 bg-amber-100 text-black rounded font-bold uppercase text-[9px]">In Transit</span>
                  </div>

                  {/* Vertical Milestones Timeline */}
                  <div className="space-y-4 relative pl-5 border-l border-emerald-600/30 ml-2">
                    {/* Milestone 1 */}
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center" />
                      <p className="text-xs font-black text-emerald-800">Order Insured & Approved</p>
                      <p className="text-[10px] text-gray-500">September 18 • 11:45 PM</p>
                    </div>
                    {/* Milestone 2 */}
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center" />
                      <p className="text-xs font-black text-emerald-800">Interlock Stitching Quality Checked</p>
                      <p className="text-[10px] text-gray-500">September 19 • 10:15 AM</p>
                    </div>
                    {/* Milestone 3 */}
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center" />
                      <p className="text-xs font-black text-emerald-800">Handed over to BlueDart (Artisan Hub)</p>
                      <p className="text-[10px] text-gray-500">September 19 • 02:30 PM</p>
                    </div>
                    {/* Milestone 4 (Active) */}
                    <div className="relative">
                      <div className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white animate-pulse" />
                      <p className="text-xs font-black text-black animate-pulse">In Transit via BlueDart Premium Air</p>
                      <p className="text-[10px] text-gray-500">In Transit to Regional Hub</p>
                    </div>
                    {/* Milestone 5 */}
                    <div className="relative opacity-50">
                      <div className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-gray-300 border-2 border-white" />
                      <p className="text-xs font-bold text-gray-500">Out for Doorstep Delivery</p>
                    </div>
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-[#9A6A3A]/30">Close Track Panel</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. INITIATE RETURN MODAL */}
      {activeModal === 'return-policy' && (
        <div className="fixed inset-0 bg-[#1C040C]/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-1 rounded-2xl max-w-md w-full border border-[#9A6A3A]/35 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-[#F1E8DF] rounded-xl p-5 sm:p-6 space-y-4 border border-[#9A6A3A]/25 relative text-[#211C1A]">
              
              <div className="flex items-start justify-between gap-3 border-b border-[#9A6A3A]/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#241D1B] text-[#211C1A] flex items-center justify-center border border-[#9A6A3A]/30">
                    <RotateCcw className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-black tracking-[0.18em]">7-Day Quality Guarantee</span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#211C1A] leading-tight">Self-Service Return Desk</h3>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-black transition cursor-pointer"><X className="w-4.5 h-4.5" /></button>
              </div>

              {!isReturnSubmitted ? (
                <div className="space-y-4">
                  <p className="text-xs text-[#211C1A]/80 leading-normal">Enter details to generate your doorstep reverse pickup label instantly.</p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Order Identification No.</label>
                      <input 
                        type="text" 
                        value={returnOrderId}
                        onChange={(e) => setReturnOrderId(e.target.value)}
                        className="w-full bg-white border border-[#9A6A3A]/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
                        placeholder="e.g. SAG-87635"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Select Exchange/Return Action</label>
                      <select 
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-white border border-[#9A6A3A]/40 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#241D1B]"
                      >
                        <option>Size too small (Exchange for L)</option>
                        <option>Size too large (Exchange for S)</option>
                        <option>Fabric texture not as expected (Refund)</option>
                        <option>Incorrect color received (Exchange)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsReturnSubmitted(true)}
                    className="w-full py-3 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-[#9A6A3A]/35 shadow-xs"
                  >
                    Generate Return Pick-up
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-emerald-800">Pickup Label Generated!</h4>
                    <p className="text-xs text-[#211C1A]/80 max-w-[280px] mx-auto">Our reverse cargo agent (Delhivery Courier) will pick up the parcel from your address tomorrow morning. Keep tags intact.</p>
                  </div>
                  <div className="p-3 bg-white border border-dashed border-[#9A6A3A]/40 rounded-xl text-left">
                    <p className="text-[10px] font-mono">Order ID: <span className="font-black">{returnOrderId}</span></p>
                    <p className="text-[10px] font-mono mt-0.5">Pickup Slot: <span className="font-black text-emerald-700">Tomorrow, 10:00 AM - 01:00 PM</span></p>
                  </div>
                </div>
              )}

              <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-gray-200">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PREPAID PAYMENT GUARANTEES MODAL */}
      {activeModal === 'privacy-policy' && (
        <div className="fixed inset-0 bg-[#1C040C]/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-1 rounded-2xl max-w-md w-full border border-[#9A6A3A]/35 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-[#F1E8DF] rounded-xl p-5 sm:p-6 space-y-4 border border-[#9A6A3A]/25 relative text-[#211C1A]">
              
              <div className="flex items-start justify-between gap-3 border-b border-[#9A6A3A]/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#241D1B] text-[#211C1A] flex items-center justify-center border border-[#9A6A3A]/30">
                    <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-black tracking-[0.18em]">Bank-Grade Escrow</span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#211C1A] leading-tight">Prepaid Payment Warranty</h3>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-black transition cursor-pointer"><X className="w-4.5 h-4.5" /></button>
              </div>

              <div className="space-y-4 max-h-[250px] overflow-y-auto">
                <div className="bg-white p-3.5 rounded-xl border border-[#9A6A3A]/20 shadow-3xs space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#211C1A]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p><strong>Instant 5% Cashback</strong> applied automatically at checkout when paying through any UPI application.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#211C1A]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p><strong>Razorpay Secure Protocols</strong>: Zero storage of card/UPI credentials inside our servers.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#211C1A]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p><strong>Failed-Payment Auto-Refund</strong>: If money is deducted but order is not placed, system triggers auto-reversal to source in 10 minutes.</p>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-[#211C1A]">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>Every shipment is packaged with high-durability tamper-evident seal and holographic void stickers.</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-[#9A6A3A]/30">Acknowledge Guarantee</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SIZE & FIT ASSISTANT MODAL */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 bg-[#1C040C]/75 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-1 rounded-2xl max-w-md w-full border border-[#9A6A3A]/35 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-[#F1E8DF] rounded-xl p-5 sm:p-6 space-y-4 border border-[#9A6A3A]/25 relative text-[#211C1A]">
              
              <div className="flex items-start justify-between gap-3 border-b border-[#9A6A3A]/20 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#241D1B] text-[#211C1A] flex items-center justify-center border border-[#9A6A3A]/30">
                    <Ruler className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-black tracking-[0.18em]">Artisan Tailor Precision</span>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#211C1A] leading-tight">Couture Fit Calculator</h3>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-black transition cursor-pointer"><X className="w-4.5 h-4.5" /></button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[#211C1A]/80 leading-normal">Drag the slider or input your actual bust size to calculate your ideal Heritage comfort fit.</p>

                {/* Sizing Slider */}
                <div className="bg-white p-4 rounded-xl border border-[#9A6A3A]/25 shadow-3xs space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                    <span>Your Bust Size (Inches)</span>
                    <span className="text-lg text-[#211C1A] font-serif font-black">{userBust}&rdquo;</span>
                  </div>
                  
                  <input 
                    type="range" 
                    min="32" 
                    max="44" 
                    value={userBust}
                    onChange={(e) => setUserBust(Number(e.target.value))}
                    className="w-full accent-[#211C1A]"
                  />

                  {/* Calculated outputs */}
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-gray-600">
                    <p>Garment Fit: <span className="font-bold text-[#211C1A] block text-xs">{recommendedInfo.size}</span></p>
                    <p>Garment Bust: <span className="font-bold text-[#211C1A] block text-xs">{recommendedInfo.bust}</span></p>
                    <p>Garment Waist: <span className="font-bold text-[#211C1A] block text-xs">{recommendedInfo.waist}</span></p>
                    <p>Garment Length: <span className="font-bold text-[#211C1A] block text-xs">{recommendedInfo.len}</span></p>
                  </div>
                </div>

                <div className="p-3 bg-[#241D1B]/5 text-[#211C1A] text-[10px] leading-relaxed rounded-xl border border-[#9A6A3A]/25">
                  <strong>💡 Sizing Hint:</strong> Our kurtis and suits include a built-in 2-inch safety margin (loosing) inside so you can easily customize or alter it down locally to your perfect silhouette!
                </div>
              </div>

              <button type="button" onClick={() => setActiveModal(null)} className="w-full py-3 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-[#9A6A3A]/30">Acknowledge Sizing</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL CHAT WITH US - SUIT AURA GIRLS MODAL */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 bg-[#1C040C]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white p-1 rounded-3xl max-w-md w-full border border-[#9A6A3A]/40 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="bg-[#F1E8DF] rounded-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 border border-[#9A6A3A]/25 relative text-[#211C1A]">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#9A6A3A]/25 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#241D1B] text-[#211C1A] flex items-center justify-center border border-[#9A6A3A]/40 shadow-sm shrink-0">
                    <MessageCircle className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-black tracking-[0.2em] block">Official Support Desk</span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#211C1A] leading-tight">Chat With Us - Suit Aura Girls</h3>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setActiveModal(null)} 
                  className="p-1.5 rounded-full hover:bg-white text-gray-500 hover:text-black transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4">
                <p className="text-xs text-[#211C1A]/80 leading-relaxed font-medium">
                  Have questions about <span className="font-bold text-[#211C1A]">fabric feel, dress sizing, custom fit, active UPI offers</span> or <span className="font-bold text-[#211C1A]">order tracking</span>? Our Suit Aura Girls boutique support desk is active on WhatsApp to assist you immediately!
                </p>

                {/* Main WhatsApp Card */}
                <div className="bg-white p-4 rounded-2xl border border-[#9A6A3A]/30 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#25D366]/15 border-2 border-[#25D366] flex items-center justify-center text-[#25D366] shrink-0 font-bold">
                      <MessageCircle className="w-6 h-6 fill-[#25D366]/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-[#211C1A]">Suit Aura Girls Support Desk</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Online Now" />
                      </div>
                      <p className="text-[11px] text-emerald-700 font-semibold">🟢 Online & Ready to Assist</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">+91 82384 51017 (Artisan, Rajasthan)</p>
                    </div>
                  </div>

                  <a 
                    href="https://wa.me/918238451017?text=Hi%20Suit%20Bliss%20Aura!%20I%20have%20a%20query%20about%20your%20Heritage%20Suit%20Collection."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer border border-[#20bd5a]"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>CHAT WITH US NOW ON WHATSAPP</span>
                  </a>
                </div>

                {/* Trust Badges Grid */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-[#211C1A]/90">
                  <div className="bg-white p-2.5 rounded-xl border border-[#9A6A3A]/20 flex items-center gap-2 shadow-2xs">
                    <span className="text-xs">⚡</span>
                    <span>Instant WhatsApp Reply</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#9A6A3A]/20 flex items-center gap-2 shadow-2xs">
                    <span className="text-xs">📏</span>
                    <span>Size & Fitting Help</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#9A6A3A]/20 flex items-center gap-2 shadow-2xs">
                    <span className="text-xs">🚚</span>
                    <span>Order & Courier Updates</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-[#9A6A3A]/20 flex items-center gap-2 shadow-2xs">
                    <span className="text-xs">🏷️</span>
                    <span>UPI Discount Code Help</span>
                  </div>
                </div>
              </div>

              {/* Close / Back Button */}
              <button 
                type="button" 
                onClick={() => setActiveModal(null)} 
                className="w-full py-3 bg-[#241D1B] hover:bg-[#241D1B] text-[#211C1A] font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer border border-[#9A6A3A]/30 shadow-xs"
              >
                BACK TO SHOPPING 🌸
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
