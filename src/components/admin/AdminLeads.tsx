import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone,
  Trash2,
  Users,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Lead } from '../../types';

export const AdminLeads: React.FC = () => {
  const { leads, updateLeadOfferStatus, deleteLead } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState<'all' | 'newsletter' | 'contact' | 'direct'>('all');

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.name && lead.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm));
    
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    return matchesSearch && matchesSource;
  });

  const handleSendWhatsAppOffer = (lead: Lead) => {
    if (!lead.phone) {
      alert('This lead does not have a phone number.');
      return;
    }

    const cleanPhone = lead.phone.replace(/\D/g, '');
    const message = `Namaste ${lead.name || ''}! Thank you for showing interest in Suit Aura Girls. We have a special boutique offer just for you. Use code AURA10 for 10% OFF on your first designer suit set. Shop now: https://suitauragirls.com`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    updateLeadOfferStatus(lead.id, true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#2C1820]">Real-time Captured Leads</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and convert newsletter subscribers & contact inquiries.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-100 rounded-xl text-xs font-bold text-[#211C1A] hover:bg-rose-50 transition shadow-sm cursor-pointer"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," 
                + "Email,Name,Phone,Source,Date,Offer Sent\n"
                + leads.map(l => `${l.email},${l.name || ''},${l.phone || ''},${l.source},${l.createdAt},${l.offerSent ? 'Yes' : 'No'}`).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `sag_leads_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#211C1A] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-xl font-bold text-[#2C1820]">{leads.length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Offers Sent</p>
            <h3 className="text-xl font-bold text-[#2C1820]">{leads.filter(l => l.offerSent).length}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-black flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Conversion</p>
            <h3 className="text-xl font-bold text-[#2C1820]">{leads.filter(l => !l.offerSent).length}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search leads by name, email or phone..."
            className="w-full pl-10 pr-4 py-2 bg-rose-50/30 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#241D1B] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            className="flex-1 sm:flex-none px-3 py-2 bg-rose-50/30 border border-rose-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#241D1B]"
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value as any)}
          >
            <option value="all">All Sources</option>
            <option value="newsletter">Newsletter</option>
            <option value="contact">Contact Form</option>
            <option value="direct">Direct</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-rose-50/50 border-b border-rose-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Lead Info</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Source</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Captured At</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <motion.tr 
                    key={lead.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-rose-50/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{lead.name || 'Anonymous Lead'}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.source === 'newsletter' ? 'bg-blue-50 text-blue-700' :
                        lead.source === 'contact' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.offerSent ? (
                        <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Offer Sent
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-black text-[10px] font-bold uppercase">
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lead.phone && (
                          <button
                            onClick={() => handleSendWhatsAppOffer(lead)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                              lead.offerSent 
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{lead.offerSent ? 'Resend Offer' : 'Send WhatsApp Offer'}</span>
                          </button>
                        )}
                        <button 
                          onClick={() => { if(confirm('Delete lead?')) deleteLead(lead.id); }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <MessageSquare className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No leads found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
