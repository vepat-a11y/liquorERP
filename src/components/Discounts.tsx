import React, { useState } from 'react';
import { 
  Percent, Plus, Check, Trash2, ToggleLeft, ToggleRight, Sparkles, Tag, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { DiscountRule } from '../types';

interface DiscountsProps {
  theme: 'light' | 'dark';
  discountRules: DiscountRule[];
  onUpdateRules: (rules: DiscountRule[]) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Discounts({
  theme,
  discountRules,
  onUpdateRules,
  showToast
}: DiscountsProps) {
  
  // Rule form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'category' | 'coupon'>('category');
  const [category, setCategory] = useState<'Wine' | 'Beer' | 'Liquor' | 'Extras'>('Wine');
  const [minQuantity, setMinQuantity] = useState('6');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [discountAmount, setDiscountAmount] = useState('');
  const [code, setCode] = useState('');

  const handleToggleRule = (id: string) => {
    const updated = discountRules.map(r => {
      if (r.id === id) {
        const nextState = !r.isActive;
        showToast(`Rule "${r.name}" is now ${nextState ? 'ACTIVE' : 'INACTIVE'}`, 'info');
        return { ...r, isActive: nextState };
      }
      return r;
    });
    onUpdateRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = discountRules.filter(r => r.id !== id);
    showToast(`Deleted discount rule`, 'success');
    onUpdateRules(updated);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a descriptive name for the discount rule.', 'error');
      return;
    }

    if (type === 'coupon' && !code.trim()) {
      showToast('Please specify a promo/coupon code.', 'error');
      return;
    }

    const newRule: DiscountRule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      type,
      isActive: true,
      category: type === 'category' ? category : undefined,
      minQuantity: type === 'category' ? Number(minQuantity || 1) : undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      discountAmount: discountAmount ? Number(discountAmount) : undefined,
      code: type === 'coupon' ? code.trim().toUpperCase() : undefined,
    };

    onUpdateRules([...discountRules, newRule]);
    showToast(`Created promotion: ${newRule.name}`, 'success');

    // Reset fields
    setName('');
    setCode('');
    setDiscountAmount('');
    setDiscountPercent('10');
    setMinQuantity('6');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full w-full bg-[#fafafa] dark:bg-[#09090b] overflow-hidden transition-colors duration-300">
      
      {/* LEFT COLUMN: Manage active promo rules (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-[#fafafa] dark:bg-[#09090b] border-r border-[#e4e4e7] dark:border-[#27272a] overflow-y-auto p-6 space-y-6">
        
        <div>
          <h3 className="font-bold text-sm text-[#09090b] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Percent className="h-5 w-5 text-[#10b981]" />
            Liquor Store Discount & Promo Engine
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure automated mix & match rules, case breakdown discounts, and custom register promo codes.
          </p>
        </div>

        {/* Existing Promo Rules list */}
        <div className="space-y-4">
          {discountRules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#71717a] dark:text-[#a1a1aa] border border-dashed border-[#e4e4e7] dark:border-[#27272a] rounded-2xl bg-white dark:bg-[#18181b]">
              <Tag className="h-10 w-10 mb-2 stroke-1 text-zinc-400 animate-pulse" />
              <p className="text-xs font-semibold">No active discount rules configured.</p>
            </div>
          ) : (
            discountRules.map((rule) => (
              <div 
                key={rule.id}
                className={`border rounded-2xl p-4 transition-all duration-200 bg-white dark:bg-[#18181b] shadow-sm ${
                  rule.isActive 
                    ? 'border-[#10b981]/30 hover:shadow-md' 
                    : 'border-[#e4e4e7] dark:border-[#27272a] opacity-75'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${
                      rule.isActive 
                        ? 'bg-[#10b981]/10 text-[#10b981]' 
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'
                    }`}>
                      {rule.type === 'coupon' ? <Tag className="h-4.5 w-4.5" /> : <Percent className="h-4.5 w-4.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#09090b] dark:text-white flex items-center gap-2">
                        {rule.name}
                        {rule.isActive ? (
                          <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Active
                          </span>
                        ) : (
                          <span className="bg-zinc-100 dark:bg-[#27272a] text-zinc-500 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Disabled
                          </span>
                        )}
                      </h4>
                      
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 space-y-0.5 font-medium">
                        {rule.type === 'category' ? (
                          <p>
                            Auto-discount applied on buying <b className="text-zinc-800 dark:text-white">{rule.minQuantity}+ bottles</b> of <b className="text-zinc-800 dark:text-white">{rule.category}</b>.
                          </p>
                        ) : (
                          <p>
                            Promo code <b className="text-[#10b981] font-mono select-all bg-[#10b981]/10 px-1.5 py-0.5 rounded text-xs">{rule.code}</b> required at register checkout.
                          </p>
                        )}
                        
                        <p className="flex items-center gap-1">
                          Benefit:{' '}
                          <span className="font-bold text-[#10b981]">
                            {rule.discountPercent ? `${rule.discountPercent}% Off` : `$${rule.discountAmount?.toFixed(2)} Off`}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400 transition cursor-pointer"
                      title={rule.isActive ? "Deactivate Rule" : "Activate Rule"}
                    >
                      {rule.isActive ? (
                        <ToggleRight className="h-6 w-6 text-[#10b981]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-zinc-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-zinc-400 dark:text-zinc-500 transition cursor-pointer"
                      title="Delete Rule"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Insert Promo Rules form (5 cols) */}
      <div className="lg:col-span-5 h-full bg-[#fafafa] dark:bg-[#09090b] border-l border-[#e4e4e7] dark:border-[#27272a] overflow-y-auto p-6 space-y-6">
        
        <div className="bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#09090b] dark:text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#10b981]" />
            Create Promotional Rule
          </h3>

          <form onSubmit={handleCreateRule} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                Promotion Name *
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Wine Case Break 15% Off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white placeholder-[#71717a] dark:placeholder-[#a1a1aa] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                  Rule Trigger Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white cursor-pointer"
                >
                  <option value="category">Category-Based</option>
                  <option value="coupon">Register Promo Code</option>
                </select>
              </div>

              {type === 'category' ? (
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Target Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white cursor-pointer"
                  >
                    <option value="Wine">Wine 🍷</option>
                    <option value="Beer">Beer 🍺</option>
                    <option value="Liquor">Spirits/Liquor 🥃</option>
                    <option value="Extras">Extras 🧊</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Promo Code *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. TAPPY20"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white font-mono placeholder-[#71717a] dark:placeholder-[#a1a1aa] uppercase"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {type === 'category' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                    Min Quantity (Bottles)
                  </label>
                  <input 
                    type="number"
                    min="1"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white font-mono"
                  />
                </div>
              )}

              <div className={type !== 'category' ? 'col-span-2' : ''}>
                <label className="block text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                  Discount Value Option
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input 
                      type="number"
                      step="1"
                      placeholder="Percent %"
                      disabled={!!discountAmount}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 pr-8 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white font-mono disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa]">%</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      step="0.01"
                      placeholder="Amount $"
                      disabled={!!discountPercent}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 pr-8 focus:outline-none focus:ring-1 focus:ring-[#10b981] text-[#09090b] dark:text-white font-mono disabled:opacity-50"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-bold text-[#71717a] dark:text-[#a1a1aa]">$</span>
                  </div>
                </div>
                <p className="text-[9px] text-[#71717a] dark:text-[#a1a1aa] mt-1">Specify either a percentage or direct flat dollar discount value.</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm"
            >
              Add Promotion Rule
            </button>
          </form>
        </div>

        {/* Integration guidelines block */}
        <div className="bg-[#fafafa] dark:bg-[#18181b]/40 border border-[#e4e4e7] dark:border-[#27272a] p-6 rounded-2xl space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#71717a] dark:text-[#a1a1aa] flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#10b981]" />
            Regulatory Liquor Store POS Policy
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            Automated discount rules will evaluate live inside the <b>Register subview</b> checkout. When coupon codes are scanned/entered, the discount total dynamically scales subtotal tallies safely, maintaining compliance.
          </p>
        </div>

      </div>

    </div>
  );
}
