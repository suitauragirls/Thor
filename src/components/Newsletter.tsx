import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, Sparkles, CheckCircle2 } from 'lucide-react';

import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { markFirestoreQuotaExhausted, isQuotaExhausted } from '../utils/visitorTracker';

export const Newsletter: React.FC = () => {
  const { showToast } = useShop();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      if (!isQuotaExhausted()) {
        await addDoc(collection(db, 'leads'), {
          email,
          phone: phone || null,
          source: 'newsletter',
          createdAt: new Date().toISOString(),
          offerSent: false
        });
      }
      setIsSubscribed(true);
      showToast('Welcome to the Suit Bliss Aura family! Use coupon FIRST15 for 15% off.', 'success');
    } catch (error: any) {
      if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota')) {
        markFirestoreQuotaExhausted();
      }
      // Still show success to user
      setIsSubscribed(true);
      showToast('Welcome to the Suit Bliss Aura family! Use coupon FIRST15 for 15% off.', 'success');
    }
  };

  return (
    <section id="newsletter-section" className="py-8 sm:py-12 bg-[#FDF4F6] border-t border-rose-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="w-12 h-12 rounded-full bg-\[#FAF7F5\] border border-rose-200 text-[#58152D] flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Mail className="w-6 h-6 text-[#C84B70]" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2C1820] tracking-tight">
          JOIN THE SUIT BLISS AURA FAMILY
        </h2>

        <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-lg mx-auto leading-relaxed">
          Get first access to new collections and special offers.
        </p>

        {isSubscribed ? (
          <div className="mt-8 bg-\[#FAF7F5\] border border-emerald-200 p-6 rounded-xl shadow-xs max-w-md mx-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm mb-1">
              <CheckCircle2 className="w-5 h-5" />
              <span>You're On The VIP List!</span>
            </div>
            <p className="text-xs text-gray-600">
              Your welcome voucher <span className="font-mono font-bold text-[#58152D]">FIRST15</span> is ready to use at checkout for 15% off your entire order.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-8 max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="newsletter-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3.5 bg-[#FAF7F5] border border-rose-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58152D] shadow-xs"
              />
              <input
                id="newsletter-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Phone (for WhatsApp offers)"
                className="flex-1 px-4 py-3.5 bg-[#FAF7F5] border border-rose-200 rounded-lg text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#58152D] shadow-xs"
              />
            </div>
            <button
              id="newsletter-subscribe-btn"
              type="submit"
              className="w-full px-6 py-3.5 bg-[#58152D] hover:bg-[#7E1D3B] text-white rounded-lg text-xs sm:text-sm font-semibold tracking-widest uppercase transition-colors shadow-md hover:shadow-lg shrink-0"
            >
              SUBSCRIBE & GET 15% OFF
            </button>
            <p className="text-[11px] text-gray-400 mt-2">
              By subscribing you agree to receive promotional emails. Unsubscribe anytime.
            </p>
          </form>
        )}

      </div>
    </section>
  );
};
