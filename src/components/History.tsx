import React, { useState } from 'react';
import { 
  FileText, Users, DollarSign, Calendar, ShieldCheck, 
  Search, Plus, UserPlus, ArrowUpRight, Percent, Award, AlertCircle, Edit, Save, MessageSquare, Clock, Check, User, Trash2, HelpCircle, Lock
} from 'lucide-react';
import { Transaction, Customer } from '../types';

interface HistoryProps {
  tenantId: string;
  theme: 'light' | 'dark';
  transactions: Transaction[];
  customers: Customer[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  permissionLevel: string;
  activeUser: string;
}

export default function History({ 
  tenantId, 
  theme, 
  transactions, 
  customers, 
  refreshData, 
  showToast,
  permissionLevel = 'Admin',
  activeUser = 'Staff'
}: HistoryProps) {

  // Selected Customer Record
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Customer form inputs (Adding new)
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custDob, setCustDob] = useState('');

  // Editing existing customer
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editCustData, setEditCustData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
  });

  // Customer Chatter comment
  const [customerComment, setCustomerComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Search filter
  const [txSearch, setTxSearch] = useState('');

  const isReadOnly = permissionLevel === 'Read Only';
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Save customer handler
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot create customers", "error");
      return;
    }

    if (!custName.trim() || !custDob) {
      showToast("Name and Date of Birth are mandatory to configure compliance records.", "error");
      return;
    }

    try {
      const payload = {
        name: custName.trim(),
        email: custEmail.trim(),
        phone: custPhone.trim(),
        dob: custDob
      };

      const res = await fetch(`/api/customers?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to register customer.");
      const data = await res.json();

      showToast(`Registered Customer: ${custName}`, 'success');
      setSelectedCustomerId(data.id); // auto-select newly created customer
      
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setCustDob('');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Start Edit Customer
  const handleStartEditCustomer = () => {
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot modify customer records", "error");
      return;
    }
    if (!selectedCustomer) return;
    setEditCustData({
      name: selectedCustomer.name,
      email: selectedCustomer.email || '',
      phone: selectedCustomer.phone || '',
      dob: selectedCustomer.dob || '',
    });
    setIsEditingCustomer(true);
  };

  // Save Edit Customer
  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return;

    try {
      const res = await fetch(`/api/customers/${selectedCustomerId}?tenant_id=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustData)
      });

      if (!res.ok) throw new Error("Failed to update customer.");
      const data = await res.json();

      showToast(`Success: Updated record for ${data.name}`, 'success');
      setIsEditingCustomer(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Post Customer Chatter Comment Note
  const handlePostCustomerComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !customerComment.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/records/customers/${selectedCustomerId}/chatter?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: activeUser,
          comment: customerComment.trim()
        })
      });

      if (!res.ok) throw new Error("Failed to post comment.");
      showToast("Customer chatter updated", "success");
      setCustomerComment('');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Filter transactions based on search query
  const filteredTxs = transactions.filter(t => {
    const q = txSearch.toLowerCase();
    return t.id.toLowerCase().includes(q) || 
           (t.customer_name && t.customer_name.toLowerCase().includes(q)) ||
           t.cashier_name.toLowerCase().includes(q) ||
           t.payment_method.toLowerCase().includes(q);
  });

  // Analytics Metrics
  const grossSales = transactions.reduce((sum, t) => sum + t.subtotal, 0);
  const discountTotal = transactions.reduce((sum, t) => sum + t.discount_total, 0);
  const taxCollected = transactions.reduce((sum, t) => sum + t.tax, 0);
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

  // Age verification success rate
  const ageRestrictedTxCount = transactions.filter(t => t.age_verified_at).length;
  const complianceScore = transactions.length > 0 ? (ageRestrictedTxCount / transactions.length) * 100 : 100;

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 h-full w-full bg-[#f8f7f4] dark:bg-[#121212] overflow-hidden">
      
      {/* COLUMN 1: Past Sales receipts with search (5 cols) */}
      <div className="lg:col-span-5 flex flex-col h-full bg-[#f8f7f4] dark:bg-[#121212] border-r border-[#1a1a1a]/10 dark:border-white/10 overflow-y-auto p-6 space-y-6">
        
        <div className="flex flex-col gap-4 justify-between border-b border-[#1a1a1a]/10 dark:border-white/10 pb-4 shrink-0">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#10b981] mb-0.5 block">Audit & Finance</span>
            <h3 className="font-serif italic font-medium text-2xl text-[#1a1a1a] dark:text-[#f8f7f4] tracking-tight">
              Transaction Receipts
            </h3>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
            <input 
              type="text"
              placeholder="Filter by Order #, client, payment..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-[#10b981] text-[#09090b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] transition-all"
            />
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-4 pr-1 flex-1">
          {filteredTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#71717a] dark:text-[#a1a1aa] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#18181b]">
              <FileText className="h-10 w-10 mb-2 stroke-[1.5] text-zinc-400" />
              <p className="text-xs font-bold uppercase tracking-wider">No transactions found</p>
            </div>
          ) : (
            filteredTxs.map((t) => (
              <div 
                key={t.id}
                className="border border-[#1a1a1a]/10 dark:border-white/10 bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 text-xs"
              >
                {/* Sale Header Row */}
                <div className="bg-[#fafafa] dark:bg-[#09090b]/40 p-4 flex justify-between items-center text-xs border-b border-[#1a1a1a]/10 dark:border-white/10">
                  <div>
                    <span className="font-bold text-emerald-600 font-mono text-sm">Order #{t.id}</span>
                    <span className="text-zinc-300 dark:text-zinc-800 mx-2">|</span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Cashier: {t.cashier_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#10b981]/15 border border-[#10b981]/10 text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                      {t.payment_method}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-[#a1a1aa] font-mono">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Receipt body */}
                <div className="p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between text-xs gap-2">
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Loyalty Customer:</span>{' '}
                      <span className="font-bold text-[#09090b] dark:text-white text-sm ml-1">{t.customer_name || 'Walk-in Customer'}</span>
                    </div>

                    {t.age_verified_at ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>ID Verified ({t.age_verified_dob})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-zinc-400 bg-[#fafafa] dark:bg-[#09090b] px-2 py-0.5 rounded text-[9px] font-mono border border-zinc-200 dark:border-zinc-800">
                        <span>General Purchase</span>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="border-t border-b border-[#f4f4f5] dark:border-zinc-850 py-3 space-y-2">
                    {t.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600 font-mono text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.product_name}</span>
                          {item.is_case_purchase && (
                            <span className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/10 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">CASE PACK</span>
                          )}
                        </div>

                        <div className="font-mono text-[11px] font-bold text-[#09090b] dark:text-white tabular-nums">
                          ${item.total_price.toFixed(2)}
                          {item.discount_applied > 0 && (
                            <span className="text-emerald-600 ml-1.5 text-[9px] font-semibold">
                              (-${(item.discount_applied * item.quantity).toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals line */}
                  <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 text-xs font-mono tabular-nums">
                    <div className="text-zinc-500">
                      Subtotal: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">${t.subtotal.toFixed(2)}</span>
                    </div>
                    {t.discount_total > 0 && (
                      <div className="text-emerald-600 font-bold">
                        Discounts: -${t.discount_total.toFixed(2)}
                      </div>
                    )}
                    <div className="text-zinc-500">
                      Tax: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">${t.tax.toFixed(2)}</span>
                    </div>
                    <div className="font-bold text-[#09090b] dark:text-white border-l border-zinc-200 dark:border-zinc-800 pl-4">
                      Total: <span className="text-emerald-600 text-sm font-extrabold">${t.total.toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* COLUMN 2: Customer Registry & Registering Panel (4 cols) */}
      <div className="lg:col-span-3 flex flex-col h-full bg-[#f8f7f4] dark:bg-[#121212] border-r border-[#1a1a1a]/10 dark:border-white/10 overflow-y-auto p-6 space-y-6">
        
        {/* Permission level lock alert */}
        {isReadOnly && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2 text-xs font-semibold">
            <Lock className="h-4 w-4 shrink-0" />
            <span>Read-Only: Customer edits locked.</span>
          </div>
        )}

        {/* Analytics Card */}
        <div className="bg-white dark:bg-[#18181b] border border-[#1a1a1a]/10 dark:border-white/10 p-5 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Performance Summary
          </h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">Gross Sales</div>
              <div className="text-base font-bold font-mono text-zinc-800 dark:text-white tabular-nums">${grossSales.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">Discounts</div>
              <div className="text-base font-bold font-mono text-emerald-600 tabular-nums">-${discountTotal.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">Tax Accrued</div>
              <div className="text-xs font-bold font-mono text-zinc-500 tabular-nums">${taxCollected.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono font-bold uppercase text-zinc-400">Compliance</div>
              <div className="text-xs font-bold font-mono text-[#d97706]">{complianceScore.toFixed(0)}% Pass</div>
            </div>
          </div>
        </div>

        {/* Add Customer card */}
        <div className="bg-white dark:bg-[#18181b] brutalist-card space-y-4">
          <div className="flex justify-between items-center border-b border-[#1a1a1a]/10 dark:border-white/10 pb-2">
            <h4 className="font-serif italic font-semibold text-base text-[#1a1a1a] dark:text-white flex items-center gap-1.5">
              <UserPlus className="h-4 w-4 text-[#d97706]" />
              New Loyalty Client
            </h4>
          </div>

          <form onSubmit={handleAddCustomerSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                Full Legal Name *
              </label>
              <input 
                type="text"
                required
                disabled={isReadOnly}
                placeholder="e.g. Elena Rostova"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full text-xs bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 focus:outline-none focus:border-[#d97706] text-[#1a1a1a] dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                Compliance DOB *
              </label>
              <input 
                type="date"
                required
                disabled={isReadOnly}
                value={custDob}
                onChange={(e) => setCustDob(e.target.value)}
                className="w-full text-xs bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono text-[#1a1a1a] dark:text-white focus:outline-none focus:border-[#d97706] disabled:opacity-50 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                Email Address
              </label>
              <input 
                type="email"
                disabled={isReadOnly}
                placeholder="elena.r@example.com"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                className="w-full text-xs bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 focus:outline-none focus:border-[#d97706] text-[#1a1a1a] dark:text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">
                Phone Number
              </label>
              <input 
                type="text"
                disabled={isReadOnly}
                placeholder="e.g. 555-0199"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full text-xs bg-zinc-100 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 focus:outline-none focus:border-[#d97706] text-[#1a1a1a] dark:text-white disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isReadOnly}
              className="w-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-[#d97706] hover:text-white font-mono font-bold py-3 border border-[#1a1a1a] shadow-[3px_3px_0px_#d97706] text-xs uppercase tracking-widest transition cursor-pointer disabled:opacity-40"
            >
              Add Client Profile
            </button>
          </form>
        </div>

        {/* Customer Directory Selector */}
        <div className="bg-white dark:bg-[#18181b] brutalist-card space-y-3.5">
          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            Registered Clients Directory ({customers.length})
          </h5>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {customers.map((c) => {
              const isSelected = c.id === selectedCustomerId;
              return (
                <div 
                  key={c.id} 
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setIsEditingCustomer(false);
                  }}
                  className={`text-xs p-3 rounded-xl flex justify-between items-center shadow-sm cursor-pointer border select-none transition-all ${
                    isSelected
                      ? 'bg-zinc-50 border-[#d97706] dark:bg-zinc-900/60 shadow-md font-bold'
                      : 'bg-zinc-50/50 dark:bg-[#121212]/40 border-[#1a1a1a]/5 dark:border-white/5 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <span className="font-bold text-[#09090b] dark:text-white">{c.name}</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block font-mono">DOB: {c.dob}</span>
                  </div>
                  <span className="text-[8px] bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 font-mono font-bold px-2 py-0.5 rounded uppercase">
                    LOYAL
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* COLUMN 3: Odoo-style Customer Active Record Sheet with Shopify Chatter (4 cols) */}
      <div className="lg:col-span-4 h-full bg-white dark:bg-[#141416] flex flex-col overflow-hidden">
        {selectedCustomer ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden text-xs">
            
            {/* Sheet Top details */}
            <div className="p-6 border-b border-[#1a1a1a]/10 dark:border-white/10 bg-[#faf9f6] dark:bg-[#18181b] flex items-start justify-between shrink-0">
              <div className="space-y-1.5 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20 px-2 py-0.5 rounded font-bold">
                    Customer Record
                  </span>
                  <span className="font-mono text-[9px] text-zinc-400 uppercase">
                    ID: {selectedCustomer.id}
                  </span>
                </div>
                
                <h3 className="font-serif italic font-semibold text-xl text-[#1a1a1a] dark:text-white leading-snug">
                  {selectedCustomer.name}
                </h3>
              </div>

              <div className="shrink-0">
                {!isEditingCustomer ? (
                  <button
                    onClick={handleStartEditCustomer}
                    disabled={isReadOnly}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 p-2 rounded-lg text-xs font-mono font-bold uppercase hover:border-[#1a1a1a] dark:hover:border-white transition cursor-pointer disabled:opacity-40"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingCustomer(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-mono uppercase font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable specs & comments */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1a1a1a]/10 dark:divide-white/10">
              
              {/* Customer Specs */}
              <div className="p-6 space-y-4">
                {!isEditingCustomer ? (
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs font-sans">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Customer Name</p>
                      <p className="font-bold text-zinc-800 dark:text-white mt-1">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Compliance DOB</p>
                      <p className="font-bold text-[#d97706] mt-1 font-mono">{selectedCustomer.dob}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Email Address</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1 font-mono">{selectedCustomer.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Phone Number</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1 font-mono">{selectedCustomer.phone || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Created Timestamp</p>
                      <p className="font-semibold text-zinc-500 mt-1 font-mono">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveCustomerEdit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Customer Full Name</label>
                      <input
                        type="text"
                        value={editCustData.name}
                        onChange={(e) => setEditCustData(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-zinc-50 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs text-[#1a1a1a] dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Compliance DOB</label>
                        <input
                          type="date"
                          value={editCustData.dob}
                          onChange={(e) => setEditCustData(p => ({ ...p, dob: e.target.value }))}
                          className="w-full bg-zinc-50 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono text-[#1a1a1a] dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editCustData.phone}
                          onChange={(e) => setEditCustData(p => ({ ...p, phone: e.target.value }))}
                          className="w-full bg-zinc-50 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs text-[#1a1a1a] dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editCustData.email}
                        onChange={(e) => setEditCustData(p => ({ ...p, email: e.target.value }))}
                        className="w-full bg-zinc-50 dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs text-[#1a1a1a] dark:text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] py-3 font-mono font-bold border border-[#1a1a1a] uppercase tracking-widest text-xs hover:bg-[#d97706] hover:text-white transition cursor-pointer"
                    >
                      Save Profile Specifications
                    </button>
                  </form>
                )}
              </div>

              {/* Shopify Chatter stream */}
              <div className="p-6 space-y-6">
                
                <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4.5 w-4.5 text-[#d97706]" />
                    <span className="font-serif italic font-semibold text-base text-[#1a1a1a] dark:text-white">Customer Record Chatter</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
                    {selectedCustomer.chatter?.length || 0} Events
                  </span>
                </div>

                {/* Note form */}
                <form onSubmit={handlePostCustomerComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Add an internal note or compliance comment..."
                    value={customerComment}
                    onChange={(e) => setCustomerComment(e.target.value)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-[#d97706] placeholder-zinc-400 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !customerComment.trim()}
                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-[#d97706] hover:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl font-mono text-[10px] font-bold uppercase transition shrink-0 cursor-pointer disabled:opacity-40"
                  >
                    Post Note
                  </button>
                </form>

                {/* Scollable chatter events list */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {(!selectedCustomer.chatter || selectedCustomer.chatter.length === 0) ? (
                    <div className="text-center py-6 text-zinc-400 text-[10px] font-mono uppercase tracking-widest bg-zinc-100/30 dark:bg-[#121212]/30 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                      No events logged on this record yet.
                    </div>
                  ) : (
                    [...selectedCustomer.chatter].reverse().map((cht) => {
                      let actionColor = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500';
                      let icon = <Clock className="h-3 w-3" />;

                      if (cht.action === 'created') {
                        actionColor = 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';
                        icon = <Check className="h-3 w-3" />;
                      } else if (cht.action === 'update') {
                        actionColor = 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400';
                        icon = <Save className="h-3 w-3" />;
                      } else if (cht.action === 'comment') {
                        actionColor = 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400';
                        icon = <MessageSquare className="h-3 w-3" />;
                      }

                      return (
                        <div key={cht.id} className="flex gap-3 text-xs leading-normal">
                          <div className={`h-6.5 w-6.5 rounded-full ${actionColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            {icon}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-[#1a1a1a] dark:text-white">{cht.user}</span>
                              <span className="text-zinc-400 font-mono" title={cht.timestamp}>
                                {new Date(cht.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px] font-sans">
                              {cht.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#fcfbf9] dark:bg-[#141416]">
            <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
              <Users className="h-6 w-6 stroke-[1.5]" />
            </div>
            <h4 className="font-serif italic font-medium text-base text-zinc-700 dark:text-zinc-300">
              No customer selected
            </h4>
            <p className="text-[10px] text-zinc-400 max-w-xs mt-1 leading-normal uppercase font-mono tracking-wider">
              Select a customer from the registry directory to view their demographic history and internal checkout compliance logs.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
