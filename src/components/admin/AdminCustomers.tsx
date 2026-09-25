import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { supabase } from '../../lib/supabase';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Eye, 
  X, 
  Calendar, 
  IndianRupee, 
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  RefreshCw,
  Clock,
  Filter,
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Customer, Order } from '../../types';

interface DetailedRealCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  pincode: string;
  city: string;
  state: string;
  streetAddress: string;
  hasPassword: boolean;
  authMethod: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Order[];
}

export const AdminCustomers: React.FC = () => {
  const { customers = [], orders = [], updateCustomerStatus } = useAdmin();
  const { showToast } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyers' | 'registered'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<DetailedRealCustomer | null>(null);
  const [combinedCustomers, setCombinedCustomers] = useState<DetailedRealCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load and combine all real registered accounts from LocalStorage + Supabase Customers + Supabase Profiles
  const refreshCustomerDirectory = async () => {
    setLoading(true);
    try {
      const customerMap = new Map<string, DetailedRealCustomer>();

      // 1. Load Firestore Customers & Users (Real-time Cloud Database shared across all devices)
      try {
        const fsCustSnap = await getDocs(collection(db, 'customers'));
        fsCustSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.email) {
            const normEmail = data.email.toLowerCase().trim();
            customerMap.set(normEmail, {
              id: `fs_${docSnap.id}`,
              name: data.name || normEmail.split('@')[0],
              email: normEmail,
              phone: data.phone || '',
              status: data.status || 'active',
              joinedDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              pincode: data.pincode || '',
              city: data.city || '',
              state: data.state || '',
              streetAddress: data.streetAddress || '',
              hasPassword: Boolean(data.passwordProtected),
              authMethod: data.authMethod || 'Brevo OTP Verified',
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: '',
              orders: []
            });
          }
        });

        const fsUsersSnap = await getDocs(collection(db, 'users'));
        fsUsersSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.email) {
            const normEmail = data.email.toLowerCase().trim();
            const existing = customerMap.get(normEmail);
            if (existing) {
              existing.name = existing.name || data.name || '';
              existing.phone = existing.phone || data.phone || '';
            } else {
              customerMap.set(normEmail, {
                id: `fsuser_${docSnap.id}`,
                name: data.name || normEmail.split('@')[0],
                email: normEmail,
                phone: data.phone || '',
                status: 'active',
                joinedDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                pincode: '',
                city: '',
                state: '',
                streetAddress: '',
                hasPassword: false,
                authMethod: 'Brevo OTP Verified',
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: '',
                orders: []
              });
            }
          }
        });
      } catch (fsErr) {
        console.warn('Firestore customers directory fetch warning:', fsErr);
      }

      // 2. Load LocalStorage Registered Accounts
      try {
        const stored = localStorage.getItem('sba_registered_accounts');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((usr: any) => {
              if (usr && usr.email) {
                const normEmail = usr.email.toLowerCase().trim();
                
                // Get additional profile details if available
                let profileData = {
                  pincode: '',
                  city: '',
                  state: '',
                  streetAddress: '',
                  phone: usr.phone || ''
                };
                try {
                  const pStr = localStorage.getItem(`sba_user_profile_${normEmail}`);
                  if (pStr) {
                    const pParsed = JSON.parse(pStr);
                    profileData = {
                      ...profileData,
                      ...pParsed,
                      phone: pParsed.phone || profileData.phone
                    };
                  }
                } catch {}

                customerMap.set(normEmail, {
                  id: `usr_${normEmail}`,
                  name: usr.name || normEmail.split('@')[0],
                  email: normEmail,
                  phone: profileData.phone || usr.phone || '',
                  status: 'active',
                  joinedDate: usr.createdAt ? new Date(usr.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  pincode: profileData.pincode || '',
                  city: profileData.city || '',
                  state: profileData.state || '',
                  streetAddress: profileData.streetAddress || '',
                  hasPassword: Boolean(usr.password && usr.password !== 'BrevoVerifiedUser'),
                  authMethod: usr.password && usr.password !== 'BrevoVerifiedUser' ? 'Password Protected' : 'Brevo OTP Verified',
                  totalOrders: 0,
                  totalSpent: 0,
                  lastOrderDate: '',
                  orders: []
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn('LocalStorage accounts parse warning:', err);
      }

      // 2. Fetch Supabase Profiles
      try {
        const { data: profiles } = await supabase.from('profiles').select('*');
        if (profiles && Array.isArray(profiles)) {
          profiles.forEach((p: any) => {
            if (p.email) {
              const normEmail = p.email.toLowerCase().trim();
              const existing = customerMap.get(normEmail);
              if (existing) {
                existing.name = existing.name || p.full_name || '';
                existing.phone = existing.phone || p.phone || '';
                existing.pincode = existing.pincode || p.pincode || '';
              } else {
                customerMap.set(normEmail, {
                  id: String(p.id || `prof_${normEmail}`),
                  name: p.full_name || normEmail.split('@')[0],
                  email: normEmail,
                  phone: p.phone || '',
                  status: 'active',
                  joinedDate: p.updated_at ? new Date(p.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  pincode: p.pincode || '',
                  city: '',
                  state: '',
                  streetAddress: '',
                  hasPassword: false,
                  authMethod: 'Brevo OTP Verified',
                  totalOrders: 0,
                  totalSpent: 0,
                  lastOrderDate: '',
                  orders: []
                });
              }
            }
          });
        }
      } catch (pErr) {
        console.warn('Supabase profiles fetch warning:', pErr);
      }

      // 3. Fetch Supabase Customers
      try {
        const { data: supaCusts } = await supabase.from('customers').select('*');
        if (supaCusts && Array.isArray(supaCusts)) {
          supaCusts.forEach((sc: any) => {
            if (sc.email) {
              const normEmail = sc.email.toLowerCase().trim();
              const existing = customerMap.get(normEmail);
              if (existing) {
                existing.name = existing.name || sc.name || '';
                existing.phone = existing.phone || sc.phone || '';
                existing.status = sc.status || existing.status;
              } else {
                customerMap.set(normEmail, {
                  id: String(sc.id || `sc_${normEmail}`),
                  name: sc.name || normEmail.split('@')[0],
                  email: normEmail,
                  phone: sc.phone || '',
                  status: sc.status || 'active',
                  joinedDate: sc.created_at ? new Date(sc.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  pincode: '',
                  city: '',
                  state: '',
                  streetAddress: '',
                  hasPassword: false,
                  authMethod: 'Brevo OTP Verified',
                  totalOrders: 0,
                  totalSpent: 0,
                  lastOrderDate: '',
                  orders: []
                });
              }
            }
          });
        }
      } catch (cErr) {
        console.warn('Supabase customers fetch warning:', cErr);
      }

      // 4. Enrich with orders placed across the store
      const allCustomersList = Array.from(customerMap.values());

      // Sync all discovered customer profiles to Firestore so they are visible on all devices
      (async () => {
        try {
          for (const cust of allCustomersList) {
            if (cust.email) {
              const custDocRef = doc(db, 'customers', cust.email);
              await setDoc(custDocRef, {
                name: cust.name,
                email: cust.email,
                phone: cust.phone,
                status: cust.status,
                passwordProtected: cust.hasPassword,
                authMethod: cust.authMethod,
                pincode: cust.pincode || '',
                city: cust.city || '',
                state: cust.state || '',
                streetAddress: cust.streetAddress || '',
                updatedAt: new Date().toISOString()
              }, { merge: true });
            }
          }
        } catch (e) {}
      })();

      allCustomersList.forEach((cust) => {
        const matchingOrders = orders.filter(
          (o) =>
            o.customerEmail?.toLowerCase().trim() === cust.email.toLowerCase() ||
            (cust.phone && o.customerMobile && o.customerMobile.replace(/\D/g, '') === cust.phone.replace(/\D/g, ''))
        );

        if (matchingOrders.length > 0) {
          cust.orders = matchingOrders;
          cust.totalOrders = matchingOrders.length;
          cust.totalSpent = matchingOrders.reduce((sum, ord) => sum + (Number(ord.finalTotal) || Number((ord as any).subtotal) || 0), 0);
          
          // Sort by latest order date
          const sorted = [...matchingOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const latest = sorted[0];
          cust.lastOrderDate = latest.date || '';

          // Pull shipping address if missing
          if (latest.deliveryAddress) {
            cust.city = cust.city || latest.deliveryAddress.city || '';
            cust.state = cust.state || latest.deliveryAddress.state || '';
            cust.pincode = cust.pincode || latest.deliveryAddress.pincode || '';
            cust.streetAddress = cust.streetAddress || latest.deliveryAddress.houseFlat || latest.deliveryAddress.street || '';
            cust.phone = cust.phone || latest.customerMobile || '';
          }
        }
      });

      // Include buyers who placed orders but haven't formally registered
      orders.forEach((ord) => {
        if (ord.customerEmail) {
          const normEmail = ord.customerEmail.toLowerCase().trim();
          if (!customerMap.has(normEmail)) {
            const custOrders = orders.filter((o) => o.customerEmail?.toLowerCase().trim() === normEmail);
            const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.finalTotal) || Number((o as any).subtotal) || 0), 0);
            
            customerMap.set(normEmail, {
              id: `guest_${normEmail}`,
              name: ord.customerName || normEmail.split('@')[0],
              email: normEmail,
              phone: ord.customerMobile || '',
              status: 'active',
              joinedDate: ord.date ? new Date(ord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              pincode: ord.deliveryAddress?.pincode || '',
              city: ord.deliveryAddress?.city || '',
              state: ord.deliveryAddress?.state || '',
              streetAddress: ord.deliveryAddress?.houseFlat || '',
              hasPassword: false,
              authMethod: 'Guest / Checkout',
              totalOrders: custOrders.length,
              totalSpent: totalSpent,
              lastOrderDate: ord.date || '',
              orders: custOrders
            });
          }
        }
      });

      setCombinedCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error('Error refreshing customer directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCustomerDirectory();

    const handleAuthChange = () => {
      refreshCustomerDirectory();
    };

    window.addEventListener('sba-auth-state-change', handleAuthChange);
    window.addEventListener('focus', handleAuthChange);
    const interval = setInterval(refreshCustomerDirectory, 10000); // Poll every 10 seconds for real-time customer updates

    return () => {
      window.removeEventListener('sba-auth-state-change', handleAuthChange);
      window.removeEventListener('focus', handleAuthChange);
      clearInterval(interval);
    };
  }, [orders, customers]);

  // Filtering Logic
  const filteredCustomers = combinedCustomers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.includes(searchQuery) ||
      cust.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.pincode.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterType === 'buyers') return cust.totalOrders > 0;
    if (filterType === 'registered') return cust.authMethod !== 'Guest / Checkout';
    return true;
  });

  const totalLifetimeValue = combinedCustomers.reduce((s, c) => s + c.totalSpent, 0);
  const totalVerifiedUsers = combinedCustomers.filter((c) => c.authMethod !== 'Guest / Checkout').length;

  return (
    <div id="admin-customers-directory" className="space-y-6 text-left font-sans">
      
      {/* Directory Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FDFBF7] p-6 rounded-2xl border-2 border-[#B8935A]/35 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFBE65] bg-[#3D0F1F] px-2.5 py-0.5 rounded-full border border-[#B8935A]/40">
              REAL USER ACCOUNTS &amp; CLIENTELE
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D0F1F]">
            Customer Directory
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Real registered users, Brevo OTP verified logins, saved addresses, and order history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#FAF5EB] px-4 py-2 rounded-xl border border-[#B8935A]/30 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              TOTAL REGISTERED MEMBERS
            </span>
            <span className="font-serif text-lg font-bold text-[#3D0F1F]">
              {totalVerifiedUsers} Accounts
            </span>
          </div>

          <div className="bg-[#3D0F1F] text-[#FAF5EB] px-4 py-2 rounded-xl border border-[#B8935A]/40 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFBE65] block">
              TOTAL CUSTOMER LTV
            </span>
            <span className="font-serif text-lg font-bold text-[#FAF5EB]">
              ₹{totalLifetimeValue.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={refreshCustomerDirectory}
            className="p-3 bg-[#FAF5EB] hover:bg-[#3D0F1F] text-[#3D0F1F] hover:text-[#FAF5EB] border border-[#B8935A]/30 rounded-xl transition cursor-pointer"
            title="Refresh Directory Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B8935A]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#B8935A]/25 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by name, email, phone, city, state, or pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-300 focus:border-[#3D0F1F] rounded-xl text-xs font-medium text-gray-900 focus:outline-none shadow-2xs"
          />
          <Search className="w-4 h-4 text-[#B8935A] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#3D0F1F] flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#B8935A]" />
            <span>Show:</span>
          </span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-[#3D0F1F] text-[#DFBE65]'
                : 'bg-[#FAF5EB] text-gray-700 hover:text-[#3D0F1F]'
            }`}
          >
            All Members ({combinedCustomers.length})
          </button>
          <button
            onClick={() => setFilterType('registered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterType === 'registered'
                ? 'bg-[#3D0F1F] text-[#DFBE65]'
                : 'bg-[#FAF5EB] text-gray-700 hover:text-[#3D0F1F]'
            }`}
          >
            Registered Users ({totalVerifiedUsers})
          </button>
          <button
            onClick={() => setFilterType('buyers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
              filterType === 'buyers'
                ? 'bg-[#3D0F1F] text-[#DFBE65]'
                : 'bg-[#FAF5EB] text-gray-700 hover:text-[#3D0F1F]'
            }`}
          >
            Verified Buyers ({combinedCustomers.filter(c => c.totalOrders > 0).length})
          </button>
        </div>

      </div>

      {/* Customer Directory Table */}
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#B8935A]/25 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#3D0F1F] text-[#DFBE65] font-serif font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-4">Member Name</th>
                <th className="py-4 px-4">Contact Details</th>
                <th className="py-4 px-4">Auth Type</th>
                <th className="py-4 px-4">Saved Location</th>
                <th className="py-4 px-4 text-center">Orders</th>
                <th className="py-4 px-4 font-bold">Total Spent</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 bg-white">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-medium">
                    No registered customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#FAF5EB]/80 transition">
                    
                    {/* Name & Joined */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#3D0F1F] text-[#DFBE65] font-serif font-bold flex items-center justify-center shrink-0 border border-[#B8935A]/40 shadow-2xs">
                          {cust.name ? cust.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#3D0F1F] text-sm">{cust.name || 'Unnamed Member'}</p>
                          <p className="text-[10px] text-gray-500 font-mono">
                            Joined {cust.joinedDate || 'Recently'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4 space-y-0.5">
                      <p className="text-gray-900 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#B8935A]" />
                        <span>{cust.email}</span>
                      </p>
                      <p className="text-gray-600 flex items-center gap-1.5 text-[11px] font-mono">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{cust.phone ? `+91 ${cust.phone}` : <span className="text-gray-400 italic">No phone provided</span>}</span>
                      </p>
                    </td>

                    {/* Auth Method */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        cust.hasPassword
                          ? 'bg-purple-50 text-purple-900 border-purple-200'
                          : cust.authMethod === 'Brevo OTP Verified'
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}>
                        <ShieldCheck className="w-3 h-3 text-[#B8935A]" />
                        <span>{cust.authMethod}</span>
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {cust.city || cust.state || cust.pincode ? (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-gray-900">{[cust.city, cust.state].filter(Boolean).join(', ')}</p>
                          {cust.pincode && <p className="text-[10px] text-gray-500 font-mono">PIN: {cust.pincode}</p>}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">No address saved</span>
                      )}
                    </td>

                    {/* Orders Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                        cust.totalOrders > 0
                          ? 'bg-[#3D0F1F] text-[#DFBE65]'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {cust.totalOrders} {cust.totalOrders === 1 ? 'Order' : 'Orders'}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-3.5 px-4 font-bold text-[#3D0F1F] text-sm">
                      ₹{cust.totalSpent.toLocaleString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="px-3.5 py-1.5 bg-[#3D0F1F] hover:bg-[#20050E] text-[#FAF5EB] rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#DFBE65]" />
                        <span>View Profile</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-[#B8935A]/40 my-8 space-y-6 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#B8935A]/25 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#3D0F1F] text-[#DFBE65] font-serif font-bold text-xl flex items-center justify-center border border-[#B8935A]/40 shadow-sm">
                  {selectedCustomer.name ? selectedCustomer.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3D0F1F]">
                    {selectedCustomer.name || 'Unnamed Customer'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Account ID: {selectedCustomer.id} • Registered {selectedCustomer.joinedDate || 'Recently'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-[#3D0F1F] rounded-xl hover:bg-[#FAF5EB] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#B8935A]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Total Orders</span>
                <span className="font-serif text-xl font-bold text-[#3D0F1F]">{selectedCustomer.totalOrders}</span>
              </div>
              <div className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#B8935A]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Total LTV Spent</span>
                <span className="font-serif text-xl font-bold text-[#3D0F1F]">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-4 bg-[#FAF5EB] rounded-2xl border border-[#B8935A]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">Auth Status</span>
                <span className="font-serif text-xs font-bold text-emerald-800 uppercase mt-1 block">{selectedCustomer.authMethod}</span>
              </div>
            </div>

            {/* Detailed Account Information */}
            <div className="p-5 bg-white rounded-2xl border border-[#B8935A]/25 space-y-3">
              <h4 className="font-serif font-bold text-[#3D0F1F] uppercase tracking-wider text-xs border-b border-gray-100 pb-2">
                Verified Account Details
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-800">
                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Email Address</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{selectedCustomer.email}</p>
                </div>

                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Phone Number</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedCustomer.phone ? `+91 ${selectedCustomer.phone}` : <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">City &amp; State</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {[selectedCustomer.city, selectedCustomer.state].filter(Boolean).join(', ') || <span className="text-gray-400 italic">Not saved</span>}
                  </p>
                </div>

                <div>
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Pincode</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedCustomer.pincode || <span className="text-gray-400 italic">Not saved</span>}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-gray-400 uppercase text-[10px] font-bold block">Street / House Address</span>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {selectedCustomer.streetAddress || <span className="text-gray-400 italic">No street address saved in profile</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Real Order History */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-[#3D0F1F] uppercase tracking-wider text-xs">
                Order History Records ({selectedCustomer.orders.length})
              </h4>

              {selectedCustomer.orders.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
                  No orders logged for this customer email address yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 border border-[#B8935A]/25 rounded-2xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                  {selectedCustomer.orders.map((ord) => (
                    <div key={ord.orderNumber} className="p-3.5 hover:bg-[#FAF5EB]/60 flex items-center justify-between gap-3 text-xs transition">
                      <div>
                        <span className="font-mono font-bold text-[#3D0F1F]">{ord.orderNumber}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {ord.date} • {ord.items.length} item(s)
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#3D0F1F] block text-sm">
                          ₹{(Number(ord.finalTotal) || Number((ord as any).subtotal) || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2 border-t border-[#B8935A]/25">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2.5 bg-[#3D0F1F] hover:bg-[#20050E] text-[#FAF5EB] rounded-xl text-xs font-serif font-bold uppercase tracking-wider cursor-pointer shadow-md"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
