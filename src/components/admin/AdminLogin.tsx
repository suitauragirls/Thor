import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { useRouter } from '../../context/RouterContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Store,
  KeyRound,
  Info
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin, setAdminTab, securityConfig } = useAdmin();
  const { showToast, setActivePage } = useShop();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await loginAdmin(email, password, pin);
      if (res.success) {
        showToast('Authorized: Welcome to Suit Bliss Aura Vault.', 'success');
        setAdminTab('dashboard');
        setActivePage('admin');
        navigate('/admin/dashboard');
      } else {
        setErrorMessage(res.message || 'Invalid administrative credentials.');
      }
    } catch {
      setErrorMessage('Authentication service error.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToStorefront = () => {
    setActivePage('home');
    navigate('/');
  };

  return (
    <div id="admin-login-page" className="min-h-screen bg-[#FAF5EB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8935A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3D0F1F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Return to storefront button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          id="admin-login-back-to-store-btn"
          onClick={handleReturnToStorefront}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FDFBF7] border border-[#B8935A]/25 rounded-xl text-xs font-semibold text-[#3D0F1F] hover:bg-[#3D0F1F] hover:text-[#FAF5EB] transition shadow-xs cursor-pointer"
        >
          <Store className="w-4 h-4" />
          <span>View Storefront</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3D0F1F] text-[#DFBE65] border border-[#B8935A]/30 shadow-md mb-2">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#3D0F1F]">
            Suit Bliss Aura Admin
          </h2>
          <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B8935A]">
            Store Operations & Catalog Control
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#FDFBF7] py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-[#B8935A]/20 space-y-6">
          
          <div className="border-b border-[#B8935A]/15 pb-4">
            <h3 className="text-base font-semibold text-[#3D0F1F] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#B8935A]" />
              Staff Authentication
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Sign in to manage catalog items, categories, order fulfillment, customers, and store configurations.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin username"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-[#B8935A]/25 bg-[#FAF5EB]/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D0F1F] focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Admin Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-[#B8935A]/25 bg-[#FAF5EB]/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D0F1F] focus:border-transparent text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#3D0F1F] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 6-Digit Security PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  6-Digit Security PIN (2FA)
                </label>
                <span className="text-[10px] font-bold text-[#3D0F1F] bg-[#FAF5EB] px-2 py-0.5 rounded-full border border-[#B8935A]/30">
                  Required
                </span>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="admin-pin-input"
                  type="password"
                  maxLength={6}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 border border-[#B8935A]/25 bg-[#FAF5EB]/50 rounded-lg text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#3D0F1F] focus:border-transparent text-gray-900"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                2-Factor PIN configured in Admin Settings. Even with the password, this PIN is required.
              </p>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-[#3D0F1F] hover:bg-[#3D0F1F]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3D0F1F] transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Unlock Admin Vault</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
