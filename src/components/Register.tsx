import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, Wine, Beer, ShieldCheck, 
  AlertTriangle, RefreshCw, CreditCard, QrCode, ShoppingBag, Percent,
  Check, ChevronRight, User, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Customer, Transaction, TransactionItem, DiscountRule } from '../types';

interface RegisterProps {
  tenantId: string;
  theme: 'light' | 'dark';
  products: Product[];
  customers: Customer[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  discountRules?: DiscountRule[];
  activeUserId?: string;
  activeUser?: string;
}

export default function Register({ 
  tenantId, 
  theme, 
  products, 
  customers, 
  refreshData,
  showToast,
  discountRules = [],
  activeUserId = 'user_cashier_1',
  activeUser = 'Elena Rostova'
}: RegisterProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [mockScanCode, setMockScanCode] = useState('');

  // Cart state
  const [cart, setCart] = useState<Array<{
    product: Product;
    quantity: number;
    isCase: boolean;
  }>>([]);

  // Checkout and Age Verification state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [verifiedDob, setVerifiedDob] = useState('');
  const [scannedIdCustomer, setScannedIdCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Tap-to-Pay'>('Card');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<DiscountRule | null>(null);

  // Auto reset verification when cart changes or restricted items are cleared
  const hasAgeRestrictedItems = cart.some(item => item.product.age_restricted);

  useEffect(() => {
    if (!hasAgeRestrictedItems) {
      setIsAgeVerified(false);
      setVerifiedDob('');
      setScannedIdCustomer('');
    }
  }, [hasAgeRestrictedItems]);

  // Filter products based on search & category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(search));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Rapid Barcode scanner simulation handler
  const handleBarcodeScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockScanCode.trim()) return;

    const found = products.find(p => p.barcode === mockScanCode.trim());
    if (found) {
      addToCart(found, false);
      showToast(`Scanned product successfully: ${found.name}`, 'success');
      setMockScanCode('');
    } else {
      showToast(`SKU/Barcode ${mockScanCode} not found in current store database.`, 'error');
    }
  };

  // Add to cart
  const addToCart = (product: Product, isCase: boolean = false) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id && item.isCase === isCase);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + 1
        };
        return next;
      } else {
        return [...prev, { product, quantity: 1, isCase }];
      }
    });
  };

  // Update cart quantity
  const updateCartQuantity = (idx: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], quantity: newQty };
      }
      return next;
    });
  };

  // Toggle case purchase
  const toggleCartItemCase = (idx: number) => {
    setCart(prev => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        isCase: !next[idx].isCase
      };
      return next;
    });
  };

  // Remove from cart
  const removeCartItem = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  // CALCULATE DISCOUNTS & TOTALS
  // Group counts by category
  const categoryCounts = cart.reduce((acc, item) => {
    const cat = item.product.category;
    const qty = item.isCase ? item.quantity * item.product.bottles_per_case : item.quantity;
    acc[cat] = (acc[cat] || 0) + qty;
    return acc;
  }, {} as Record<string, number>);

  const calculatedItems = cart.map(item => {
    const { product, quantity, isCase } = item;
    let unitPrice = product.price_per_bottle;
    let discountApplied = 0;
    let isCasePurchase = isCase;

    if (isCase) {
      unitPrice = product.price_per_case || (product.price_per_bottle * product.bottles_per_case * 0.9);
    } else {
      const activeRule = discountRules.find(rule => 
        rule.isActive && 
        rule.type === 'category' && 
        rule.category === product.category && 
        (categoryCounts[product.category] || 0) >= (rule.minQuantity || 1)
      );
      if (activeRule) {
        if (activeRule.discountPercent) {
          discountApplied = product.price_per_bottle * (activeRule.discountPercent / 100);
        } else if (activeRule.discountAmount) {
          discountApplied = activeRule.discountAmount;
        }
      }
    }

    const itemSubtotal = isCase 
      ? (unitPrice * quantity)
      : (unitPrice * quantity) - (discountApplied * quantity);

    const basePriceNoDiscount = isCase 
      ? (product.price_per_bottle * product.bottles_per_case * quantity)
      : (product.price_per_bottle * quantity);

    const calculatedDiscount = Math.max(0, basePriceNoDiscount - itemSubtotal);

    return {
      product,
      quantity,
      isCasePurchase,
      unitPrice: isCase ? unitPrice / product.bottles_per_case : unitPrice,
      discount_applied: calculatedDiscount / (isCase ? (quantity * product.bottles_per_case) : quantity),
      total_price: itemSubtotal,
      basePriceNoDiscount
    };
  });

  const subtotal = calculatedItems.reduce((sum, item) => sum + item.basePriceNoDiscount, 0);
  const category_discount_total = calculatedItems.reduce((sum, item) => sum + (item.basePriceNoDiscount - item.total_price), 0);
  const subtotalAfterCategoryDiscounts = subtotal - category_discount_total;

  // Apply Coupon promo discount if active
  let couponDiscount = 0;
  if (appliedPromo && appliedPromo.isActive) {
    if (appliedPromo.discountPercent) {
      couponDiscount = subtotalAfterCategoryDiscounts * (appliedPromo.discountPercent / 100);
    } else if (appliedPromo.discountAmount) {
      couponDiscount = Math.min(subtotalAfterCategoryDiscounts, appliedPromo.discountAmount);
    }
  }

  const discount_total = category_discount_total + couponDiscount;
  const netSubtotal = Math.max(0, subtotal - discount_total);
  
  const taxRate = 0.085;
  const tax = netSubtotal * taxRate;
  const total = netSubtotal + tax;

  // DOB Age Calculation
  const handleDobVerify = (dobString: string) => {
    if (!dobString) {
      showToast("Please enter or select a valid Date of Birth.", "error");
      return;
    }

    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) {
      showToast("Invalid date format.", "error");
      return;
    }

    // Must be 21+ on current local time: 2026-06-26
    const today = new Date("2026-06-26T11:18:36-07:00");
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 21) {
      setIsAgeVerified(true);
      setVerifiedDob(dobString);
      showToast(`Age Verification Passed: Customer is ${age} years old.`, 'success');
    } else {
      setIsAgeVerified(false);
      showToast(`Verification Failed: Customer is only ${age} (Must be 21+).`, 'error');
    }
  };

  const handleIdScanChange = (custId: string) => {
    setScannedIdCustomer(custId);
    const selected = customers.find(c => c.id === custId);
    if (selected && selected.dob) {
      setCustomer(selected);
      handleDobVerify(selected.dob);
    }
  };

  // Final checkout post to API
  const executeCheckout = async () => {
    if (hasAgeRestrictedItems && !isAgeVerified) {
      showToast("Compliance Alert: Age verification is required for alcoholic beverages.", "error");
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const items: TransactionItem[] = calculatedItems.map((item, i) => ({
        id: `txi_${i}_${Date.now()}`,
        product_id: item.product.id,
        product_name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unit_price: item.isCasePurchase ? (item.product.price_per_case || item.product.price_per_bottle * item.product.bottles_per_case) : item.product.price_per_bottle,
        discount_applied: item.discount_applied,
        total_price: item.total_price,
        is_case_purchase: item.isCasePurchase
      }));

      const payload = {
        customer_id: customer?.id || undefined,
        customer_name: customer?.name || 'Walk-in Customer',
        items,
        subtotal,
        discount_total,
        tax,
        total,
        payment_method: paymentMethod,
        age_verified_at: hasAgeRestrictedItems ? new Date().toISOString() : undefined,
        age_verified_dob: verifiedDob || undefined,
        cashier_id: activeUserId,
        cashier_name: activeUser
      };

      const response = await fetch(`/api/transactions?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Checkout transaction failed.");

      const resTx = await response.json();
      showToast(`Transaction successful! Receipt Order #${resTx.id} printed.`, 'success');
      
      // Reset state
      setCart([]);
      setCustomer(null);
      setVerifiedDob('');
      setScannedIdCustomer('');
      setIsAgeVerified(false);
      setAppliedPromo(null);
      setPromoCodeInput('');
      refreshData();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 h-full w-full bg-[#f8f7f4] dark:bg-[#121212] overflow-hidden transition-all duration-300 ${hasAgeRestrictedItems && !isAgeVerified ? 'ambient-amber-glow' : ''}`}>
      
      {/* 3.1 PRODUCT INTERACTION FIELD (65% Widescreen permanent panel) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-[#f8f7f4] dark:bg-[#121212] border-r border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 overflow-hidden p-8 space-y-6">
        
        {/* TOP INTERACTIVE CONTROL PANEL: Search and Simulator Laser Scan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 shrink-0">
          {/* Quick Search */}
          <div className="relative md:col-span-7">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717a] dark:text-[#a1a1aa]" />
            <input 
              type="text"
              placeholder="Search by brand name, SKU, or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white pl-10 pr-4 py-3 text-xs focus:outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all duration-200"
            />
          </div>

          {/* Barcode Simulator Laser Scan */}
          <form onSubmit={handleBarcodeScanSubmit} className="md:col-span-5 flex gap-2">
            <div className="relative flex-1">
              <QrCode className="absolute left-3 top-3.5 h-4 w-4 text-[#71717a] dark:text-[#a1a1aa]" />
              <input 
                type="text"
                placeholder="Simulate laser scan..."
                value={mockScanCode}
                onChange={(e) => setMockScanCode(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white pl-9 pr-3 py-3 text-xs focus:outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border border-[#1a1a1a] dark:border-white hover:bg-[#d97706] hover:text-white text-xs px-4 py-3 font-mono font-bold transition-all duration-200 shadow-[2px_2px_0px_#d97706] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Scan
            </button>
          </form>
        </div>

        {/* CATEGORY SELECTOR PILLS */}
        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {['All', 'Liquor', 'Wine', 'Beer', 'Extras'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2.5 text-xs font-mono whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_rgba(248,247,244,1)]'
                  : 'bg-white dark:bg-[#1c1c1c] border-[#1a1a1a]/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:hover:shadow-[2px_2px_0px_rgba(248,247,244,1)]'
              }`}
            >
              {cat === 'All' && 'All Products'}
              {cat === 'Wine' && '🍷 Fine Wine'}
              {cat === 'Beer' && '🍺 Craft Beer'}
              {cat === 'Liquor' && '🥃 Premium Spirits'}
              {cat === 'Extras' && '🧊 Accessories & Ice'}
            </button>
          ))}
        </div>

        {/* ACTIVE CATEGORY DISCOUNTS BANNER LIST */}
        {discountRules.filter(rule => 
          rule.isActive && 
          rule.type === 'category' && 
          rule.category &&
          (categoryCounts[rule.category] || 0) >= (rule.minQuantity || 1)
        ).length > 0 && (
          <div className="space-y-2 shrink-0 animate-pulse">
            {discountRules.filter(rule => 
              rule.isActive && 
              rule.type === 'category' && 
              rule.category &&
              (categoryCounts[rule.category] || 0) >= (rule.minQuantity || 1)
            ).map(rule => (
              <div 
                key={rule.id}
                className="bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs py-3 px-4 rounded-xl flex items-center justify-between font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Wine className="h-4 w-4 text-[#10b981]" />
                  Promo Unlocked: {rule.name}!
                </span>
                <span className="bg-[#10b981] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {rule.discountPercent ? `${rule.discountPercent}% Off` : `$${rule.discountAmount?.toFixed(2)} Off`} Applied
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCT GRID-LIST HYBRID VIEWPORT */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#71717a] dark:text-[#a1a1aa]">
              <ShoppingBag className="h-10 w-10 mb-2 stroke-1 text-zinc-400" />
              <p className="text-sm font-semibold">No catalog items match current category or search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((p) => {
                const stockLeft = p.inventory_bottles;
                const lowStock = stockLeft <= 12;
                
                return (
                  <div 
                    key={p.id}
                    className="group brutalist-card p-4 flex flex-col justify-between hover:border-[#1a1a1a] dark:hover:border-white transition-all duration-200 relative bg-white dark:bg-[#1c1c1c]"
                  >
                    <div className="flex gap-4">
                      {/* Premium Miniature Bottle Cutout Placeholders */}
                      <div className="h-20 w-14 rounded-lg bg-[#f4f4f5] dark:bg-[#09090b] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#1a1a1a]/10 dark:border-white/10 relative">
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            referrerPolicy="no-referrer" 
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Wine className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
                        )}
                        
                        {p.age_restricted && (
                          <span className="absolute top-1 left-1 bg-[#d97706] text-white text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded uppercase">
                            21+
                          </span>
                        )}
                      </div>

                      {/* Brand name, core description & ratios */}
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono font-bold text-[#d97706] dark:text-amber-400 uppercase tracking-wider">
                            {p.category}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                            {p.barcode || 'NO BARCODE'}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-[#1a1a1a] dark:text-white leading-snug group-hover:text-[#d97706] dark:group-hover:text-amber-400 transition-colors">
                          {p.name}
                        </h3>

                        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                          Ratio: {p.bottles_per_case} bts / case
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-sm font-bold text-[#1a1a1a] dark:text-white font-mono tabular-nums">
                            ${p.price_per_bottle.toFixed(2)} <span className="text-[10px] font-normal text-zinc-400">/bt</span>
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-800">|</span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            Case: ${p.price_per_case?.toFixed(2) || (p.price_per_bottle * p.bottles_per_case * 0.9).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CORE VARIANTS AS SMALL PILL LAUNCHERS & INLINE STOCK */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1a1a1a]/10 dark:border-white/10">
                      
                      {/* Inline Stock badge */}
                      <span className={`text-[10px] font-semibold font-mono px-2 py-1 rounded-md ${
                        stockLeft === 0
                          ? 'bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                          : lowStock 
                          ? 'bg-amber-100 text-[#f59e0b] dark:bg-amber-950/20 dark:text-[#f59e0b]' 
                          : 'bg-[#1a1a1a]/5 text-zinc-700 dark:bg-white/5 dark:text-zinc-300'
                      }`}>
                        {stockLeft > 0 ? `${stockLeft} in stock` : 'Out of Stock'}
                      </span>

                      {/* Variant Adders */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => addToCart(p, false)}
                          disabled={stockLeft <= 0}
                          className="bg-white dark:bg-[#1c1c1c] hover:bg-[#f8f7f4] dark:hover:bg-black text-[#1a1a1a] dark:text-white text-[10px] font-mono font-bold px-3 py-1.5 border border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_rgba(248,247,244,1)] transition-all disabled:opacity-40 cursor-pointer"
                        >
                          + Bottle
                        </button>
                        <button
                          onClick={() => addToCart(p, true)}
                          disabled={stockLeft < p.bottles_per_case}
                          className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-[#d97706] hover:text-white text-[10px] font-mono font-bold px-3 py-1.5 border border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_#d97706] transition-all disabled:opacity-40 cursor-pointer"
                        >
                          + Case
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3.2 PERSISTENT CART & ACTION CENTER (35% Column Layout) */}
      <div className="lg:col-span-4 flex flex-col h-full bg-[#f8f7f4] dark:bg-[#121212] border-l border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 overflow-hidden">
        
        {/* Header segment with transactional details */}
        <div className="p-6 border-b border-[#1a1a1a]/10 dark:border-white/10 flex justify-between items-center bg-[#f8f7f4] dark:bg-[#121212] shrink-0">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Checkout</h2>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Terminal ID: #01-A42</p>
          </div>
          <span className="bg-[#1a1a1a]/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 border border-[#1a1a1a]/10 dark:border-white/20 font-mono text-[10px] font-semibold">
            Order #1042
          </span>
        </div>

        {/* Cart Item Row List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 py-12">
                <ShoppingBag className="h-12 w-12 mb-3 stroke-1 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#71717a] dark:text-[#a1a1aa]">Cart is Empty</p>
                <p className="text-[11px] text-zinc-400 text-center mt-1 max-w-[200px] font-sans">
                  Select products or scan barcodes to begin transaction.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const { product, quantity, isCase } = item;
                const calcItem = calculatedItems[idx];
                const originalPrice = isCase 
                  ? (product.price_per_bottle * product.bottles_per_case)
                  : product.price_per_bottle;
                const finalPrice = calcItem ? (calcItem.total_price / quantity) : originalPrice;
                const isDiscounted = calcItem ? (calcItem.total_price < calcItem.basePriceNoDiscount) : false;

                return (
                  <motion.div 
                    key={`${product.id}-${isCase ? 'case' : 'bottle'}`}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="flex flex-col p-4 border border-[#1a1a1a]/10 dark:border-white/10 bg-white dark:bg-[#1c1c1c]/40 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 border rounded uppercase ${
                            isCase 
                              ? 'bg-amber-150 text-[#d97706] border-amber-500/20' 
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-transparent'
                          }`}>
                            {isCase ? `Case Pack` : 'Single'}
                          </span>
                          {product.age_restricted && (
                            <span className="text-[8px] bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 border border-red-500/20 rounded font-mono">
                              21+ RESTRICTED
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#1a1a1a] dark:text-white leading-snug">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {quantity} × ${finalPrice.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs font-bold font-mono text-[#1a1a1a] dark:text-white tabular-nums">
                          ${(finalPrice * quantity).toFixed(2)}
                        </p>
                        {isDiscounted && (
                          <p className="text-[9px] text-[#d97706] font-medium font-mono">
                            Saved ${Math.max(0, (originalPrice - finalPrice) * quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Cart operations and toggles */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]/10 dark:border-white/10">
                      <button 
                        onClick={() => toggleCartItemCase(idx)}
                        className="text-[9px] font-mono font-bold text-[#d97706] dark:text-amber-400 uppercase tracking-wider hover:underline cursor-pointer"
                      >
                        Convert to {isCase ? "Bottle" : "Case Pack"}
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[#1a1a1a]/15 dark:border-white/15 bg-white dark:bg-[#121212] rounded">
                          <button 
                            onClick={() => updateCartQuantity(idx, -1)}
                            className="p-1 px-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          >
                            <Minus className="h-2.5 w-2.5" />
                          </button>
                          <span className="px-2.5 text-[10px] font-bold font-mono text-[#1a1a1a] dark:text-white tabular-nums">
                            {quantity}
                          </span>
                          <button 
                            onClick={() => updateCartQuantity(idx, 1)}
                            className="p-1 px-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                          >
                            <Plus className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeCartItem(idx)}
                          className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* CUSTOMER LOYALTY SELECTOR */}
        <div className="p-4 border-t border-[#1a1a1a]/10 dark:border-white/10 bg-[#f8f7f4] dark:bg-[#121212] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-mono">
            <User className="h-3.5 w-3.5 text-[#d97706]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Client Account</span>
          </div>
          <select 
            value={customer?.id || ''} 
            onChange={(e) => {
              const selected = customers.find(c => c.id === e.target.value);
              setCustomer(selected || null);
              if (selected) {
                showToast(`Customer account linked: ${selected.name}`, 'info');
                // Auto scan ID date if DOB matches
                if (hasAgeRestrictedItems && selected.dob) {
                  handleDobVerify(selected.dob);
                }
              }
            }}
            className="text-xs bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-1 px-2 text-[#1a1a1a] dark:text-white focus:outline-none transition-all cursor-pointer font-mono"
          >
            <option value="" className="bg-[#f8f7f4] text-[#1a1a1a]">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id} className="bg-[#f8f7f4] text-[#1a1a1a]">{c.name}</option>
            ))}
          </select>
        </div>

        {/* NON-BLOCKING INLINE ID VERIFICATION PORT */}
        <AnimatePresence>
          {hasAgeRestrictedItems && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4 bg-[#d97706]/10 border-t border-b border-[#d97706]/20 flex flex-col gap-3 shrink-0 font-mono"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-[#d97706]" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#d97706] uppercase tracking-wider">COMPLIANCE ID VERIFICATION</p>
                  <p className="text-[9px] text-zinc-600 dark:text-zinc-400">Alcohol detected in basket. Customer DOB must be on/before June 26, 2005</p>
                </div>
                {isAgeVerified && (
                  <span className="bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Check className="h-2 w-2" /> PASSED
                  </span>
                )}
              </div>

              {!isAgeVerified ? (
                <div className="space-y-2">
                  <select
                    value={scannedIdCustomer}
                    onChange={(e) => handleIdScanChange(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-[#1c1c1c] border border-[#d97706]/30 p-2 focus:outline-none text-zinc-700 dark:text-zinc-200 transition-all font-mono"
                  >
                    <option value="" className="bg-[#f8f7f4] text-[#1a1a1a]">-- Choose registered customer to simulate ID Scan --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#f8f7f4] text-[#1a1a1a]">
                        {c.name} (DOB: {c.dob})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-2">
                    <input 
                      type="date"
                      value={verifiedDob}
                      onChange={(e) => handleDobVerify(e.target.value)}
                      placeholder="Or manual birth date..."
                      className="flex-1 bg-white dark:bg-[#1c1c1c] border border-[#d97706]/30 p-2 text-xs font-mono text-zinc-700 dark:text-zinc-200 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleDobVerify(verifiedDob)}
                      className="bg-[#d97706] hover:bg-amber-700 text-white font-bold text-[10px] px-3.5 py-2 cursor-pointer border border-[#1a1a1a]/10 font-mono transition"
                    >
                      Verify DOB
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20 font-bold flex items-center justify-between font-mono">
                  <span>DOB Approved ({verifiedDob}) — Sale unlocked.</span>
                  <button 
                    onClick={() => {
                      setIsAgeVerified(false);
                      setVerifiedDob('');
                      setScannedIdCustomer('');
                    }}
                    className="text-[9px] underline uppercase font-bold tracking-wider hover:text-red-500 text-zinc-500 cursor-pointer"
                  >
                    Reset Check
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* THUMB-ZONE CHECKOUT (Absolute bottom-right layout cluster) */}
        <div className="p-6 bg-[#f8f7f4] dark:bg-[#121212] border-t border-[#1a1a1a]/10 dark:border-white/10 space-y-4 shrink-0 font-sans">
          
          {/* Coupon Code Entry */}
          <div className="py-2.5 px-3 bg-white dark:bg-[#1c1c1c]/40 border border-[#1a1a1a]/10 dark:border-white/10 rounded flex flex-col gap-2">
            <div className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>Promo Code / Coupon</span>
              <Percent className="h-3.5 w-3.5 text-[#d97706]" />
            </div>
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-emerald-500/10 px-2.5 py-1.5 rounded border border-emerald-500/20 text-[11px] font-mono">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center">
                  <span className="font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-xs mr-1.5 font-bold">{appliedPromo.code}</span>
                  {appliedPromo.discountPercent ? `${appliedPromo.discountPercent}% Off` : `$${appliedPromo.discountAmount?.toFixed(2)} Off`}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setAppliedPromo(null);
                    showToast("Promo code removed.", "info");
                  }}
                  className="text-red-500 font-bold hover:underline text-[10px] uppercase cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code e.g. SAVE5"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 min-w-0 bg-[#f8f7f4] dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white px-2.5 py-1.5 text-xs focus:outline-none text-[#1a1a1a] dark:text-white uppercase font-mono placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const code = promoCodeInput.trim().toUpperCase();
                    if (!code) return;
                    const rule = discountRules.find(r => r.isActive && r.type === 'coupon' && r.code === code);
                    if (rule) {
                      setAppliedPromo(rule);
                      setPromoCodeInput('');
                      showToast(`Applied coupon: ${rule.name}`, 'success');
                    } else {
                      showToast(`Invalid or inactive coupon code: ${code}`, 'error');
                    }
                  }}
                  className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border border-[#1a1a1a] dark:border-white hover:bg-[#d97706] hover:text-white px-3.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Subtotals & Taxes with tight tabular-nums */}
          <div className="space-y-1.5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums font-semibold">${subtotal.toFixed(2)}</span>
            </div>

            {category_discount_total > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Category Promotions</span>
                <span className="tabular-nums font-bold">-${category_discount_total.toFixed(2)}</span>
              </div>
            )}

            {couponDiscount > 0 && appliedPromo && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Promo Coupon ({appliedPromo.code})</span>
                <span className="tabular-nums">-${couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Sales Tax (8.5%)</span>
              <span className="tabular-nums font-semibold">${tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a1a1a]/10 dark:border-white/10 flex justify-between items-end font-mono">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Due</span>
            <span className="text-3xl font-bold tracking-tight tabular-nums text-[#1a1a1a] dark:text-white font-serif">${total.toFixed(2)}</span>
          </div>

          {/* Payment Method selector */}
          <div className="grid grid-cols-3 gap-1.5 pt-1.5 text-[10px] font-mono">
            {['Card', 'Cash', 'Tap-to-Pay'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method as any)}
                className={`py-2 rounded border text-center font-bold cursor-pointer transition-all duration-200 ${
                  paymentMethod === method
                    ? 'bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_rgba(26,26,26,1)]'
                    : 'bg-white dark:bg-[#1c1c1c] border-transparent text-[#71717a] dark:text-[#a1a1aa] hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[2px_2px_0px_rgba(26,26,26,1)]'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Big high-contrast tap checkout button */}
          <button
            onClick={executeCheckout}
            disabled={cart.length === 0 || isProcessingCheckout || (hasAgeRestrictedItems && !isAgeVerified)}
            className={`w-full py-4 uppercase tracking-widest text-xs font-mono font-bold transition-all duration-200 border border-[#1a1a1a] dark:border-white shadow-[4px_4px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_rgba(248,247,244,1)] flex items-center justify-center gap-2 cursor-pointer ${
              hasAgeRestrictedItems && !isAgeVerified
                ? 'bg-[#d97706] hover:bg-[#b45309] text-white'
                : 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white'
            } disabled:opacity-45 disabled:pointer-events-none`}
          >
            {isProcessingCheckout ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing Transaction...
              </>
            ) : hasAgeRestrictedItems && !isAgeVerified ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Awaiting ID Verification
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Complete Sale ({paymentMethod})
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
