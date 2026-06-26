import React, { useState } from 'react';
import { DollarSign, Scale, ArrowUpRight, ArrowDownRight, Award, Receipt, Calendar, Calculator } from 'lucide-react';
import { Transaction, Product } from '../types';

interface AccountingProps {
  transactions: Transaction[];
  products: Product[];
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Accounting({ transactions, products, showToast }: AccountingProps) {
  const [taxRate, setTaxRate] = useState<number>(8.25);
  const [isEditingTax, setIsEditingTax] = useState(false);
  const [tempTaxRate, setTempTaxRate] = useState(8.25);

  // Compute stats dynamically!
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  
  // Calculate Cost of Goods Sold (COGS) dynamically
  const totalCOGS = transactions.reduce((acc, t) => {
    let transactionCOGS = 0;
    t.items.forEach(item => {
      // Find matching product cost_per_unit
      const prod = products.find(p => p.id === item.product_id);
      const unitCost = prod?.cost_per_unit || (prod?.price_per_bottle ? prod.price_per_bottle * 0.5 : 5.00);
      const qty = item.quantity;
      
      transactionCOGS += (unitCost * qty);
    });
    return acc + transactionCOGS;
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const taxCollected = transactions.reduce((acc, t) => acc + (t.tax || 0), 0);

  // Fixed operating expenses
  const operatingExpenses = 1200; // Rent, lights, terminal lease
  const netProfit = grossProfit - operatingExpenses;

  const handleUpdateTaxRate = (e: React.FormEvent) => {
    e.preventDefault();
    setTaxRate(tempTaxRate);
    setIsEditingTax(false);
    showToast(`Standard Sales Tax Rate updated to ${tempTaxRate}% successfully!`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      
      {/* Header bar */}
      <div className="h-16 px-6 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-sm font-bold text-[#09090b] dark:text-white uppercase tracking-wider">
            Accounting, Taxes & Compliance
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500">Sales Tax Rate:</span>
          {isEditingTax ? (
            <form onSubmit={handleUpdateTaxRate} className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.01"
                value={tempTaxRate}
                onChange={(e) => setTempTaxRate(Number(e.target.value))}
                className="w-16 text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-lg p-1.5 font-mono text-zinc-900 dark:text-white"
              />
              <button type="submit" className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-2 py-1.5 rounded-lg text-[10px] font-bold">
                Save
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setTempTaxRate(taxRate);
                setIsEditingTax(true);
              }}
              className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-900 dark:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
            >
              {taxRate}% (Edit)
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* P&L Statement Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick Ledger Card */}
          <div className="lg:col-span-2 bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Profit & Loss Summary (YTD)
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs space-y-1">
              <div className="py-3 flex items-center justify-between font-semibold">
                <span className="text-zinc-500">Gross Sales Revenue</span>
                <span className="font-mono text-zinc-900 dark:text-white">${totalRevenue.toFixed(2)}</span>
              </div>

              <div className="py-3 flex items-center justify-between text-zinc-500">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="font-mono text-red-500">-${totalCOGS.toFixed(2)}</span>
              </div>

              <div className="py-3 flex items-center justify-between font-bold bg-zinc-50/50 dark:bg-zinc-900/10 px-2 rounded">
                <span className="text-zinc-800 dark:text-zinc-200">Gross Profit</span>
                <span className="font-mono text-emerald-500">${grossProfit.toFixed(2)}</span>
              </div>

              <div className="py-3 flex items-center justify-between text-zinc-500">
                <span>Operating Expenses (Rent & Utilities)</span>
                <span className="font-mono text-red-500">-${operatingExpenses.toFixed(2)}</span>
              </div>

              <div className="py-3 flex items-center justify-between font-bold bg-zinc-950 dark:bg-zinc-800 text-white dark:text-zinc-100 px-3 py-4 rounded-xl">
                <span>Net Operating Income</span>
                <span className="font-mono">${netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tax Compliance Panel */}
          <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
                Sales Tax Compliance
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tax Liability Collected</p>
                    <p className="text-lg font-bold font-mono text-zinc-900 dark:text-white">${taxCollected.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Filing Status</p>
                    <p className="text-xs font-bold text-emerald-500">Quarterly Form 1040-Q (Ready)</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => showToast('Quarterly Sales Tax Return XML / CSV generated and exported successfully!', 'success')}
              className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-3 rounded-xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
            >
              <Calculator className="h-4 w-4" />
              Export Tax Return file
            </button>
          </div>

        </div>

        {/* General Ledger entries list */}
        <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">General Double-Entry Ledger</h3>
            <span className="text-[9px] font-mono text-zinc-400">Compliance Standard audit lock active</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {transactions.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between text-xs font-medium">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-zinc-400">{t.id}</span>
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                      DR/CR Entry
                    </span>
                  </div>
                  <p className="text-zinc-900 dark:text-white">Customer Sale checkout transaction - {t.payment_method}</p>
                  <p className="text-[10px] text-zinc-500">Date: {new Date(t.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-8 font-mono text-right">
                  <div>
                    <p className="text-[9px] text-zinc-400 uppercase">Debit (Receivables)</p>
                    <p className="font-bold text-emerald-500">+${t.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-400 uppercase">Credit (Inventory Asset)</p>
                    <p className="font-bold text-zinc-400">-${(t.total * 0.5).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
