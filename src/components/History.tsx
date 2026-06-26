import React, { useState } from 'react';
import { 
  FileText, Users, DollarSign, Calendar, ShieldCheck, 
  Search, Plus, UserPlus, ArrowUpRight, Percent, Award, AlertCircle
} from 'lucide-react';
import { Transaction, Customer } from '../types';

interface HistoryProps {
  tenantId: string;
  theme: 'light' | 'dark';
  transactions: Transaction[];
  customers: Customer[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function History({ 
  tenantId, 
  theme, 
  transactions, 
  customers, 
  refreshData, 
  showToast 
}: HistoryProps) {

  // Customer form inputs
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custDob, setCustDob] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);

  // Search filter
  const [txSearch, setTxSearch] = useState('');

  // Save customer handler
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custDob) {
      showToast("Name and Date of Birth are mandatory to configure compliance records.", "error");
      return;
    }

    try {
      const payload = {
        name: custName,
        email: custEmail,
        phone: custPhone,
        dob: custDob
      };

      const res = await fetch(`/api/customers?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to register customer.");

      showToast(`Registered Customer: ${custName}`, 'success');
      setCustName('');
      setCustEmail('');
      setCustPhone('');
      setCustDob('');
      setIsAddingCustomer(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Filter transactions based on search query (Order ID, Cashier or customer name)
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full w-full bg-[#fafafa] dark:bg-[#09090b] overflow-hidden transition-colors duration-300">
      
      {/* LEFT SECTION: Past sales receipts with search (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-[#fafafa] dark:bg-[#09090b] border-r border-[#e4e4e7] dark:border-[#27272a] overflow-y-auto p-6 space-y-6">
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-[#e4e4e7] dark:border-zinc-850 pb-4 shrink-0">
          <div>
            <h3 className="font-bold text-sm text-[#09090b] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#10b981]" />
              Store Audit & Sales Records
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Complete invoice trail, compliance timestamps, and pricing modifications.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[#71717a] dark:text-[#a1a1aa]" />
            <input 
              type="text"
              placeholder="Filter by Order #, customer, or payment..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 text-xs bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] transition-all"
            />
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-4 pr-1 flex-1">
          {filteredTxs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#71717a] dark:text-[#a1a1aa] border border-dashed border-[#e4e4e7] dark:border-[#27272a] rounded-2xl bg-white dark:bg-[#18181b]">
              <FileText className="h-10 w-10 mb-2 stroke-1 text-zinc-400" />
              <p className="text-xs font-semibold">No transactions match current filters.</p>
            </div>
          ) : (
            filteredTxs.map((t) => (
              <div 
                key={t.id}
                className="border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Sale Header Row */}
                <div className="bg-[#fafafa] dark:bg-[#09090b]/40 p-4 flex justify-between items-center text-xs border-b border-[#e4e4e7] dark:border-[#27272a]">
                  <div>
                    <span className="font-bold text-[#10b981] font-mono text-sm">Order #{t.id}</span>
                    <span className="text-zinc-300 dark:text-zinc-800 mx-2">|</span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Cashier: {t.cashier_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#10b981]/15 border border-[#10b981]/10 text-[#10b981] text-[10px] font-bold px-2.5 py-1 rounded uppercase font-mono">
                      {t.payment_method}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-[#a1a1aa] font-mono">
                      {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Receipt body */}
                <div className="p-4 space-y-4">
                  
                  {/* Customers and ID checking */}
                  <div className="flex flex-col sm:flex-row justify-between text-xs gap-2">
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-[9px] font-bold">Loyalty Customer:</span>{' '}
                      <span className="font-bold text-[#09090b] dark:text-white text-sm ml-1">{t.customer_name || 'Walk-in Customer'}</span>
                    </div>

                    {/* AGE COMPLIANCE AUDIT LABELS */}
                    {t.age_verified_at ? (
                      <div className="flex items-center gap-1.5 text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>DOB {t.age_verified_dob} ID Checked at {new Date(t.age_verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-zinc-400 bg-[#fafafa] dark:bg-[#09090b] px-2.5 py-1 rounded text-[10px] font-mono border border-[#e4e4e7] dark:border-[#27272a]">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>General Purchase (No Restricted Items)</span>
                      </div>
                    )}
                  </div>

                  {/* Line Items */}
                  <div className="border-t border-b border-[#f4f4f5] dark:border-zinc-800/50 py-3 space-y-2">
                    {t.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#10b981] font-mono text-[11px] bg-[#10b981]/10 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.product_name}</span>
                          {item.is_case_purchase && (
                            <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/10 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">CASE PACK</span>
                          )}
                        </div>

                        <div className="font-mono text-[12px] font-bold text-[#09090b] dark:text-white tabular-nums">
                          ${item.total_price.toFixed(2)}
                          {item.discount_applied > 0 && (
                            <span className="text-[#10b981] ml-1.5 text-[10px] font-semibold">
                              (-${(item.discount_applied * item.quantity).toFixed(2)})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Subtotals line */}
                  <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 text-xs font-mono tabular-nums">
                    <div className="text-zinc-500 dark:text-zinc-400">
                      Subtotal: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">${t.subtotal.toFixed(2)}</span>
                    </div>
                    {t.discount_total > 0 && (
                      <div className="text-[#10b981]">
                        Discounts: <span className="font-bold">-${t.discount_total.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="text-zinc-500 dark:text-zinc-400">
                      Tax (8.5%): <span className="text-zinc-800 dark:text-zinc-200 font-semibold">${t.tax.toFixed(2)}</span>
                    </div>
                    <div className="font-bold text-[#09090b] dark:text-white border-l border-[#e4e4e7] dark:border-zinc-800 pl-6">
                      Total Paid: <span className="text-[#10b981] text-sm font-bold">${t.total.toFixed(2)}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* RIGHT SECTION: Metrics summaries and adding customers (4 cols) */}
      <div className="lg:col-span-4 h-full bg-[#fafafa] dark:bg-[#09090b] border-l border-[#e4e4e7] dark:border-[#27272a] overflow-y-auto p-6 space-y-6">

        {/* Dashboard Metrics summary card */}
        <div className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">
            Tenant Sales Performance Analytics
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">Gross Sales</div>
              <div className="text-lg font-bold font-mono text-[#09090b] dark:text-white tabular-nums">${grossSales.toFixed(2)}</div>
            </div>

            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">Applied Discounts</div>
              <div className="text-lg font-bold font-mono text-[#10b981] tabular-nums">-${discountTotal.toFixed(2)}</div>
            </div>

            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">State Tax Accrued</div>
              <div className="text-sm font-bold font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">${taxCollected.toFixed(2)}</div>
            </div>

            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa]">Net Revenue</div>
              <div className="text-sm font-bold font-mono text-[#10b981] tabular-nums">${totalRevenue.toFixed(2)}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e4e4e7] dark:border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-[#71717a] dark:text-[#a1a1aa] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#10b981]" />
              Regulatory Compliance:
            </span>
            <span className="font-bold text-[#10b981] font-mono text-sm">{complianceScore.toFixed(0)}% Passed</span>
          </div>
        </div>

        {/* Add Customer card */}
        <div className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#09090b] dark:text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[#10b981]" />
              Register Loyalty Account
            </h4>
          </div>

          <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Full Legal Name *
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Elena Rostova"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Date of Birth (Compliance DOB) *
              </label>
              <input 
                type="date"
                required
                value={custDob}
                onChange={(e) => setCustDob(e.target.value)}
                className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white font-mono transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input 
                type="email"
                placeholder="elena.r@example.com"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input 
                type="text"
                placeholder="555-0348"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition duration-200 cursor-pointer"
            >
              Add Client Profile
            </button>
          </form>

          {/* Customer Directory */}
          <div className="pt-4 border-t border-[#e4e4e7] dark:border-zinc-800/60">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] mb-2.5">
              Registered Clients Directory ({customers.length}):
            </h5>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
              {customers.map((c) => (
                <div key={c.id} className="text-xs p-3 bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl flex justify-between items-center shadow-sm">
                  <div>
                    <span className="font-bold text-[#09090b] dark:text-white">{c.name}</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-400 block">DOB: {c.dob}</span>
                  </div>
                  <span className="text-[9px] bg-[#f4f4f5] dark:bg-[#18181b] border border-[#e4e4e7] dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase">LOYAL-{c.id.split('_')[1] || c.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

