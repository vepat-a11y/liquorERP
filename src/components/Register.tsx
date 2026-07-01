import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Minus, Trash2, Wine, Beer, ShieldCheck, 
  AlertTriangle, RefreshCw, CreditCard, QrCode, ShoppingBag, Percent,
  Check, ChevronRight, User, Sparkles, DollarSign, Printer, X, FileText, Scale
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
    priceOverride?: number;             // custom unit price override
    discountPercentOverride?: number;   // custom manual discount percent override
  }>>([]);

  // Adjustments & Quick Custom Item
  const [editingCartIdx, setEditingCartIdx] = useState<number | null>(null);
  const [manualPriceInput, setManualPriceInput] = useState('');
  const [manualDiscountPercentInput, setManualDiscountPercentInput] = useState('');
  const [activeKeypadField, setActiveKeypadField] = useState<'price' | 'discount'>('price');

  const handleKeypadInput = (val: string) => {
    if (activeKeypadField === 'price') {
      if (val === '.' && manualPriceInput.includes('.')) return;
      setManualPriceInput(prev => {
        if ((prev === '0' || prev === '0.00' || prev === '') && val !== '.') {
          return val;
        }
        return prev + val;
      });
    } else {
      if (val === '.' && manualDiscountPercentInput.includes('.')) return;
      setManualDiscountPercentInput(prev => {
        if ((prev === '0' || prev === '') && val !== '.') {
          return val;
        }
        const next = prev + val;
        const parsed = parseFloat(next);
        if (!isNaN(parsed) && parsed > 100) {
          return '100';
        }
        return next;
      });
    }
  };

  const handleKeypadClear = () => {
    if (activeKeypadField === 'price') {
      setManualPriceInput('');
    } else {
      setManualDiscountPercentInput('');
    }
  };

  const handleKeypadBackspace = () => {
    if (activeKeypadField === 'price') {
      setManualPriceInput(prev => prev.slice(0, -1));
    } else {
      setManualDiscountPercentInput(prev => prev.slice(0, -1));
    }
  };
  
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customItem, setCustomItem] = useState({
    name: '',
    price: '',
    category: 'Extras' as 'Wine' | 'Beer' | 'Liquor' | 'Extras',
    age_restricted: false,
    quantity: 1
  });

  // Checkout, Payment, and Age Verification state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [verifiedDob, setVerifiedDob] = useState('');
  const [scannedIdCustomer, setScannedIdCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Split' | 'House Account'>('Card');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<DiscountRule | null>(null);

  // Cash payment calculator states
  const [cashReceived, setCashReceived] = useState<string>('');
  
  // Split payment states
  const [splitCardAmount, setSplitCardAmount] = useState<string>('');
  const [splitCashAmount, setSplitCashAmount] = useState<string>('');

  // Post checkout receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);
  const [receiptChangeDue, setReceiptChangeDue] = useState<number>(0);

  // Auto reset verification when cart changes or restricted items are cleared
  const hasAgeRestrictedItems = cart.some(item => item.product.age_restricted);

  useEffect(() => {
    if (!hasAgeRestrictedItems) {
      setIsAgeVerified(false);
      setVerifiedDob('');
      setScannedIdCustomer('');
    }
  }, [hasAgeRestrictedItems]);

  // Global USB Keyboard Barcode Scanner Listener
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // In inputs, don't hijack standard typing unless it's Enter and buffer already has scanned characters
      if (isInput && e.key !== 'Enter') {
        buffer = '';
        return;
      }

      // Fast typing typical of laser barcode scanners (usually < 50ms per key)
      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          e.stopPropagation();
          const scanValue = buffer.trim();
          buffer = '';
          
          const found = products.find(p => p.barcode === scanValue || p.upc_barcode === scanValue);
          if (found) {
            addToCart(found, false);
            showToast(`Scanned product successfully: ${found.name}`, 'success');
          } else {
            showToast(`Scanned code "${scanValue}" not found in current database.`, 'error');
          }
        } else {
          buffer = '';
        }
      } else if (e.key.length === 1) {
        if (timeDiff < 55 || buffer.length > 0) {
          buffer += e.key;
        } else {
          // If it's a slow keystroke and we are NOT in an input, buffer it tentatively anyway
          if (!isInput) {
            buffer = e.key;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [products]);

  // Filter products based on search & category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(search)) ||
                          (p.upc_barcode && p.upc_barcode.includes(search));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Rapid Barcode scanner simulation handler
  const handleBarcodeScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockScanCode.trim()) return;

    const found = products.find(p => p.barcode === mockScanCode.trim() || p.upc_barcode === mockScanCode.trim());
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
        if (editingCartIdx === idx) setEditingCartIdx(null);
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
        isCase: !next[idx].isCase,
        // Reset manual overrides when swapping bottle vs case
        priceOverride: undefined,
        discountPercentOverride: undefined
      };
      return next;
    });
    if (editingCartIdx === idx) setEditingCartIdx(null);
  };

  // Remove from cart
  const removeCartItem = (idx: number) => {
    if (editingCartIdx === idx) setEditingCartIdx(null);
    setCart(prev => prev.filter((_, i) => i !== idx));
  };

  // Open inline item override form
  const handleEditCartItemClick = (idx: number) => {
    setEditingCartIdx(idx);
    const item = cart[idx];
    const defaultPrice = item.isCase 
      ? (item.product.price_per_case || item.product.price_per_bottle * item.product.bottles_per_case * 0.9)
      : item.product.price_per_bottle;

    setManualPriceInput(item.priceOverride !== undefined ? item.priceOverride.toString() : defaultPrice.toFixed(2));
    setManualDiscountPercentInput(item.discountPercentOverride !== undefined ? item.discountPercentOverride.toString() : '');
    setActiveKeypadField('price');
  };

  // Save manual overrides
  const handleApplyOverrides = () => {
    if (editingCartIdx === null) return;
    
    const priceVal = parseFloat(manualPriceInput);
    const discVal = parseFloat(manualDiscountPercentInput);

    setCart(prev => {
      const next = [...prev];
      next[editingCartIdx] = {
        ...next[editingCartIdx],
        priceOverride: isNaN(priceVal) ? undefined : priceVal,
        discountPercentOverride: isNaN(discVal) ? undefined : discVal
      };
      return next;
    });

    setEditingCartIdx(null);
    showToast("Line items adjustments applied.", "success");
  };

  // Add custom manual item
  const handleAddCustomSale = () => {
    const priceNum = parseFloat(customItem.price);
    if (!customItem.name.trim()) {
      showToast("Please enter a custom product name.", "error");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      showToast("Please enter a valid non-negative price.", "error");
      return;
    }

    const mockProduct: Product = {
      id: `custom_${Date.now()}`,
      tenant_id: tenantId,
      name: customItem.name.trim(),
      category: customItem.category,
      liquor_category: customItem.category === 'Liquor' ? 'Spirits' : customItem.category,
      age_restricted: customItem.age_restricted,
      cost_per_case: 0,
      cost_per_unit: 0,
      margin_percentage: 100,
      case_count: 0,
      bottles_per_case: 1,
      loose_bottle_count: 9999,
      total_bottles_calculated: 9999,
      retail_price: priceNum,
      abv_percentage: 0,
      vintage_year: null,
      deposit_fee: 0,
      upc_barcode: `MISC-${Date.now().toString().slice(-4)}`,
      inventory_cases: 999,
      inventory_bottles: 9999,
      price_per_bottle: priceNum,
      createdAt: new Date().toISOString()
    };

    // Add to cart with designated quantities
    setCart(prev => [
      ...prev,
      {
        product: mockProduct,
        quantity: customItem.quantity,
        isCase: false
      }
    ]);

    setShowCustomModal(false);
    showToast(`Added Custom Item: ${mockProduct.name}`, 'success');
    
    // Reset form
    setCustomItem({
      name: '',
      price: '',
      category: 'Extras',
      age_restricted: false,
      quantity: 1
    });
  };

  // Group counts by category for automated category promotions
  const categoryCounts = cart.reduce((acc, item) => {
    const cat = item.product.category;
    const qty = item.isCase ? item.quantity * item.product.bottles_per_case : item.quantity;
    acc[cat] = (acc[cat] || 0) + qty;
    return acc;
  }, {} as Record<string, number>);

  // CALCULATE DISCOUNTS & TOTALS
  const calculatedItems = cart.map(item => {
    const { product, quantity, isCase, priceOverride, discountPercentOverride } = item;
    
    // Default base price
    let baseUnitPrice = product.price_per_bottle;
    if (isCase) {
      baseUnitPrice = product.price_per_case || (product.price_per_bottle * product.bottles_per_case * 0.9);
    }

    // Apply custom manual unit price override
    if (priceOverride !== undefined) {
      baseUnitPrice = priceOverride;
    }

    let discountApplied = 0;

    // Apply custom manual percentage discount if present, else check for automated category rules
    if (discountPercentOverride !== undefined && discountPercentOverride > 0) {
      discountApplied = baseUnitPrice * (discountPercentOverride / 100);
    } else if (!isCase) {
      const activeRule = discountRules.find(rule => 
        rule.isActive && 
        rule.type === 'category' && 
        rule.category === product.category && 
        (categoryCounts[product.category] || 0) >= (rule.minQuantity || 1)
      );
      if (activeRule) {
        if (activeRule.discountPercent) {
          discountApplied = baseUnitPrice * (activeRule.discountPercent / 100);
        } else if (activeRule.discountAmount) {
          discountApplied = activeRule.discountAmount;
        }
      }
    }

    const itemSubtotal = (baseUnitPrice - discountApplied) * quantity;
    
    // Original undiscounted price reference
    const basePriceNoDiscount = isCase 
      ? ((product.price_per_case || product.price_per_bottle * product.bottles_per_case * 0.9) * quantity)
      : (product.price_per_bottle * quantity);

    const calculatedDiscount = Math.max(0, basePriceNoDiscount - itemSubtotal);

    return {
      product,
      quantity,
      isCasePurchase: isCase,
      unitPrice: isCase ? baseUnitPrice : baseUnitPrice,
      discount_applied: calculatedDiscount / quantity,
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

  // Auto split calculation helper
  useEffect(() => {
    if (paymentMethod === 'Split') {
      const half = (total / 2).toFixed(2);
      setSplitCardAmount(half);
      setSplitCashAmount((total - parseFloat(half)).toFixed(2));
    } else {
      setSplitCardAmount('');
      setSplitCashAmount('');
    }
  }, [paymentMethod, total]);

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

    // Must be 21+ on current local time: June 30, 2026
    const today = new Date("2026-06-30");
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
    if (selected && (selected.date_of_birth || selected.dob)) {
      setCustomer(selected);
      handleDobVerify(selected.date_of_birth || selected.dob || '');
    }
  };

  // Final checkout post to API
  const executeCheckout = async () => {
    if (hasAgeRestrictedItems && !isAgeVerified) {
      showToast("Compliance Alert: Age verification is required for alcoholic beverages.", "error");
      return;
    }

    if (paymentMethod === 'House Account' && !customer) {
      showToast("Error: House Account charge requires a linked customer profile.", "error");
      return;
    }

    // Validate cash received
    let changeValue = 0;
    if (paymentMethod === 'Cash') {
      const cashVal = parseFloat(cashReceived);
      if (isNaN(cashVal) || cashVal < total) {
        showToast(`Please enter at least the total due: $${total.toFixed(2)}`, "error");
        return;
      }
      changeValue = cashVal - total;
    }

    // Validate split payment
    if (paymentMethod === 'Split') {
      const cardPart = parseFloat(splitCardAmount) || 0;
      const cashPart = parseFloat(splitCashAmount) || 0;
      if (Math.abs((cardPart + cashPart) - total) > 0.05) {
        showToast(`Split amounts ($${(cardPart + cashPart).toFixed(2)}) must sum up to the total ($${total.toFixed(2)}).`, "error");
        return;
      }
    }

    setIsProcessingCheckout(true);
    try {
      const items: TransactionItem[] = calculatedItems.map((item, i) => ({
        id: `txi_${i}_${Date.now()}`,
        product_id: item.product.id,
        product_name: item.product.name,
        category: item.product.category,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_applied: item.discount_applied,
        total_price: item.total_price,
        is_case_purchase: item.isCasePurchase
      }));

      // Map Split payment labels
      const finalPaymentMethod = paymentMethod === 'Split' ? 'Split' : paymentMethod;

      const payload = {
        customer_id: customer?.id || undefined,
        customer_name: customer?.name || 'Walk-in Customer',
        items,
        subtotal,
        discount_total,
        tax,
        total,
        payment_method: finalPaymentMethod,
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
      
      // Store checkout result for receipt display
      setLastCompletedTransaction(resTx);
      setReceiptChangeDue(changeValue);
      setShowReceiptModal(true);

      showToast(`Transaction successful! Order #${resTx.order_number} completed.`, 'success');
      
      // Reset state
      setCart([]);
      setCustomer(null);
      setVerifiedDob('');
      setScannedIdCustomer('');
      setIsAgeVerified(false);
      setAppliedPromo(null);
      setPromoCodeInput('');
      setCashReceived('');
      refreshData();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Quick cash triggers
  const totalRoundedUp = Math.ceil(total);
  const totalPlusFive = Math.ceil(total / 5) * 5;
  const totalPlusTen = Math.ceil(total / 10) * 10;
  const quickCashOptions = Array.from(new Set([
    total,
    totalRoundedUp,
    totalPlusFive,
    totalPlusTen,
    20, 50, 100
  ])).filter(amt => amt >= total).slice(0, 5);

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 h-full w-full bg-[#f8f7f4] dark:bg-[#121212] overflow-hidden transition-all duration-300 ${hasAgeRestrictedItems && !isAgeVerified ? 'ambient-amber-glow' : ''}`}>
      
      {/* 3.1 PRODUCT INTERACTION FIELD (65% Widescreen permanent panel) */}
      <div className="lg:col-span-8 flex flex-col h-full bg-[#f8f7f4] dark:bg-[#121212] border-r border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 overflow-hidden p-6 space-y-4">
        
        {/* TOP INTERACTIVE CONTROL PANEL: Search, Simulator Laser Scan, & Custom Sale */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center shrink-0">
          
          {/* Quick Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#71717a] dark:text-[#a1a1aa]" />
            <input 
              type="text"
              placeholder="Search by brand name, SKU, or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-850 focus:border-[#1a1a1a] dark:focus:border-white pl-9 pr-4 py-2 text-xs focus:outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all duration-200"
            />
          </div>

          {/* Barcode Simulator Laser Scan */}
          <form onSubmit={handleBarcodeScanSubmit} className="flex gap-2 shrink-0">
            <div className="relative w-44">
              <QrCode className="absolute left-2.5 top-3 h-4 w-4 text-[#71717a] dark:text-[#a1a1aa]" />
              <input 
                type="text"
                placeholder="Simulate laser scan..."
                value={mockScanCode}
                onChange={(e) => setMockScanCode(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-850 focus:border-[#1a1a1a] dark:focus:border-white pl-8 pr-2 py-2 text-xs focus:outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border border-[#1a1a1a] dark:border-white hover:bg-[#d97706] hover:text-white text-[11px] px-3.5 py-2 font-mono font-bold transition-all duration-200 shadow-[2px_2px_0px_#d97706] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Scan
            </button>
          </form>

          {/* Quick Misc Sale Button */}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-[11px] px-3.5 py-2 font-mono font-bold transition-all duration-200 shadow-[2px_2px_0px_#10b981] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Misc Item
          </button>
        </div>

        {/* CATEGORY SELECTOR PILLS */}
        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          {['All', 'Liquor', 'Wine', 'Beer', 'Extras'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 text-xs font-mono whitespace-nowrap transition-all duration-200 border cursor-pointer ${
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
          <div className="space-y-1.5 shrink-0 animate-pulse">
            {discountRules.filter(rule => 
              rule.isActive && 
              rule.type === 'category' && 
              rule.category &&
              (categoryCounts[rule.category] || 0) >= (rule.minQuantity || 1)
            ).map(rule => (
              <div 
                key={rule.id}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs py-2.5 px-3.5 rounded-lg flex items-center justify-between font-semibold"
              >
                <span className="flex items-center gap-2">
                  <Wine className="h-4 w-4 text-emerald-500" />
                  Promo Unlocked: {rule.name}!
                </span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase">
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
                            {p.upc_barcode || p.barcode || 'NO BARCODE'}
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-[#1a1a1a] dark:text-white leading-snug group-hover:text-[#d97706] dark:group-hover:text-amber-400 transition-colors">
                          {p.name}
                        </h3>

                        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-450">
                          Ratio: {p.bottles_per_case} bts / case
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs font-bold text-[#1a1a1a] dark:text-white font-mono tabular-nums">
                            ${p.price_per_bottle.toFixed(2)} <span className="text-[9px] font-normal text-zinc-400">/bt</span>
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-800">|</span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                            Case: ${p.price_per_case?.toFixed(2) || (p.price_per_bottle * p.bottles_per_case * 0.9).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CORE VARIANTS AS SMALL PILL LAUNCHERS & INLINE STOCK */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#1a1a1a]/5 dark:border-white/5">
                      
                      {/* Inline Stock badge */}
                      <span className={`text-[9px] font-semibold font-mono px-2 py-0.5 rounded-md ${
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
                          disabled={stockLeft <= 0 && !p.id.startsWith('custom_')}
                          className="bg-white dark:bg-[#1c1c1c] hover:bg-[#f8f7f4] dark:hover:bg-black text-[#1a1a1a] dark:text-white text-[10px] font-mono font-bold px-2.5 py-1 border border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_rgba(248,247,244,1)] transition-all disabled:opacity-40 cursor-pointer"
                        >
                          + Bottle
                        </button>
                        <button
                          onClick={() => addToCart(p, true)}
                          disabled={stockLeft < p.bottles_per_case && !p.id.startsWith('custom_')}
                          className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-[#d97706] hover:text-white text-[10px] font-mono font-bold px-2.5 py-1 border border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_#d97706] transition-all disabled:opacity-40 cursor-pointer"
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
        <div className="p-4 border-b border-[#1a1a1a]/10 dark:border-white/10 flex justify-between items-center bg-[#f8f7f4] dark:bg-[#121212] shrink-0">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Active Checkout</h2>
            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Terminal ID: #01-A42</p>
          </div>
          <span className="bg-[#1a1a1a]/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 px-2 py-0.5 border border-[#1a1a1a]/10 dark:border-white/20 font-mono text-[10px] font-semibold">
            Order #1042
          </span>
        </div>

        {/* Cart Item Row List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-600 py-12">
                <ShoppingBag className="h-10 w-10 mb-2 stroke-1 text-zinc-300 dark:text-zinc-750" />
                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#71717a] dark:text-[#a1a1aa]">Cart is Empty</p>
                <p className="text-[11px] text-zinc-450 text-center mt-1 max-w-[180px] font-sans">
                  Select products or scan barcodes to begin transaction.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const { product, quantity, isCase, priceOverride, discountPercentOverride } = item;
                const calcItem = calculatedItems[idx];
                const originalPrice = isCase 
                  ? (product.price_per_case || product.price_per_bottle * product.bottles_per_case * 0.9)
                  : product.price_per_bottle;
                
                const currentUnitPrice = priceOverride !== undefined ? priceOverride : originalPrice;
                const isDiscounted = calcItem ? (calcItem.total_price < calcItem.basePriceNoDiscount) : false;

                const isCurrentlyEditing = editingCartIdx === idx;

                return (
                  <motion.div 
                    key={`${product.id}-${isCase ? 'case' : 'bottle'}-${idx}`}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="flex flex-col p-3 border border-[#1a1a1a]/10 dark:border-white/10 bg-white dark:bg-[#1c1c1c]/40 space-y-2 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 pr-2 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 border rounded uppercase ${
                            isCase 
                              ? 'bg-amber-100 text-[#d97706] border-amber-500/20' 
                              : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-350 border-transparent'
                          }`}>
                            {isCase ? `Case Pack` : 'Single'}
                          </span>
                          {product.age_restricted && (
                            <span className="text-[8px] bg-red-500/10 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 border border-red-500/20 rounded font-mono">
                              21+ REQUIRED
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#1a1a1a] dark:text-white leading-snug">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {quantity} × ${currentUnitPrice.toFixed(2)}
                          {(priceOverride !== undefined || (discountPercentOverride !== undefined && discountPercentOverride > 0)) && (
                            <span className="text-emerald-600 font-bold ml-1">(Adjusted)</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold font-mono text-[#1a1a1a] dark:text-white tabular-nums">
                          ${(calcItem?.total_price || 0).toFixed(2)}
                        </p>
                        {isDiscounted && (
                          <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                            Saved ${Math.max(0, calcItem.basePriceNoDiscount - calcItem.total_price).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Inline Editor Form */}
                    {isCurrentlyEditing && (
                      <div className="bg-zinc-50 dark:bg-[#121212] p-2.5 border border-zinc-200 dark:border-zinc-800 rounded space-y-2 mt-1 animate-fadeIn">
                        <div className="flex justify-between items-center pb-1 border-b border-zinc-100 dark:border-zinc-850">
                          <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-500">Line Override Adjuster</span>
                          <button type="button" onClick={() => setEditingCartIdx(null)} className="text-zinc-400 hover:text-red-500 cursor-pointer">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                          <div>
                            <label className="text-[9px] block text-zinc-500 mb-0.5 font-bold uppercase">Unit Price ($)</label>
                            <input
                              type="text"
                              value={manualPriceInput}
                              onFocus={() => setActiveKeypadField('price')}
                              onChange={(e) => setManualPriceInput(e.target.value)}
                              className={`w-full bg-white dark:bg-[#1c1c1c] p-1.5 border outline-none rounded font-mono transition-all ${
                                activeKeypadField === 'price' ? 'border-[#d97706] ring-2 ring-[#d97706]/10' : 'border-zinc-200 dark:border-zinc-800'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] block text-zinc-500 mb-0.5 font-bold uppercase">Discount (%)</label>
                            <input
                              type="text"
                              placeholder="0 - 100"
                              value={manualDiscountPercentInput}
                              onFocus={() => setActiveKeypadField('discount')}
                              onChange={(e) => setManualDiscountPercentInput(e.target.value)}
                              className={`w-full bg-white dark:bg-[#1c1c1c] p-1.5 border outline-none rounded font-mono transition-all ${
                                activeKeypadField === 'discount' ? 'border-[#d97706] ring-2 ring-[#d97706]/10' : 'border-zinc-200 dark:border-zinc-800'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Tactical POS Numerical Keypad */}
                        <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                            <span>POS Tactile Keypad</span>
                            <span className="text-[#d97706] dark:text-amber-400 font-extrabold uppercase">
                              {activeKeypadField === 'price' ? 'Edit Price ($)' : 'Edit Discount (%)'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => handleKeypadInput(num.toString())}
                                className="bg-white dark:bg-[#1c1c1c] hover:bg-zinc-50 dark:hover:bg-zinc-850 py-1.5 rounded text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-800 shadow-sm transition-all duration-100 active:scale-95 cursor-pointer"
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={handleKeypadClear}
                              className="bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 py-1.5 rounded text-xs font-bold font-mono border border-red-200/30 dark:border-red-900/30 transition-all duration-100 active:scale-95 cursor-pointer"
                            >
                              C
                            </button>
                            <button
                              type="button"
                              onClick={() => handleKeypadInput('0')}
                              className="bg-white dark:bg-[#1c1c1c] hover:bg-zinc-50 dark:hover:bg-zinc-850 py-1.5 rounded text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-800 shadow-sm transition-all duration-100 active:scale-95 cursor-pointer"
                            >
                              0
                            </button>
                            <button
                              type="button"
                              onClick={() => handleKeypadInput('.')}
                              className="bg-white dark:bg-[#1c1c1c] hover:bg-zinc-50 dark:hover:bg-zinc-850 py-1.5 rounded text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-250 dark:border-zinc-800 shadow-sm transition-all duration-100 active:scale-95 cursor-pointer"
                            >
                              .
                            </button>
                          </div>
                          
                          <div className="flex gap-1 justify-end">
                            <button
                              type="button"
                              onClick={handleKeypadBackspace}
                              className="w-full bg-zinc-250 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 py-1 rounded text-[9px] font-bold font-mono transition-all duration-100 active:scale-95 cursor-pointer uppercase"
                            >
                              ⌫ Backspace
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleApplyOverrides}
                            className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] text-[10px] font-bold py-1.5 px-3 border border-transparent hover:border-[#1a1a1a] hover:bg-[#d97706] rounded font-mono transition"
                          >
                            Apply Adjust
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCart(prev => {
                                const next = [...prev];
                                next[idx] = { ...next[idx], priceOverride: undefined, discountPercentOverride: undefined };
                                return next;
                              });
                              setEditingCartIdx(null);
                              showToast("Line items adjustments reset.", "info");
                            }}
                            className="text-[9px] text-zinc-450 uppercase underline hover:text-red-500 font-mono"
                          >
                            Reset Line Price
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cart operations and toggles */}
                    {!isCurrentlyEditing && (
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#1a1a1a]/5 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => toggleCartItemCase(idx)}
                            className="text-[9px] font-mono font-bold text-[#d97706] dark:text-amber-400 uppercase tracking-wider hover:underline cursor-pointer"
                          >
                            To {isCase ? "Bottle" : "Case"}
                          </button>
                          
                          <button 
                            type="button"
                            onClick={() => handleEditCartItemClick(idx)}
                            className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider hover:underline cursor-pointer flex items-center gap-0.5"
                          >
                            <Percent className="h-2.5 w-2.5" /> Adjust Price
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#1a1a1a]/15 dark:border-white/15 bg-white dark:bg-[#121212] rounded">
                            <button 
                              onClick={() => updateCartQuantity(idx, -1)}
                              className="p-1 px-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="px-2 text-[10px] font-bold font-mono text-[#1a1a1a] dark:text-white tabular-nums">
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
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* CUSTOMER LOYALTY SELECTOR */}
        <div className="p-3 border-t border-[#1a1a1a]/10 dark:border-white/10 bg-[#f8f7f4] dark:bg-[#121212] flex items-center justify-between gap-4 shrink-0">
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
                if (hasAgeRestrictedItems && (selected.date_of_birth || selected.dob)) {
                  handleDobVerify(selected.date_of_birth || selected.dob || '');
                }
              }
            }}
            className="text-xs bg-transparent border-b-2 border-zinc-200 dark:border-zinc-850 focus:border-[#1a1a1a] dark:focus:border-white py-1 px-2 text-[#1a1a1a] dark:text-white focus:outline-none transition-all cursor-pointer font-mono"
          >
            <option value="" className="bg-[#f8f7f4] text-[#1a1a1a]">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id} className="bg-[#f8f7f4] text-[#1a1a1a]">
                {c.name} ({c.wholesale_tier?.split(' ')[0] || 'Standard'})
              </option>
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
              className="px-4 py-3 bg-[#d97706]/10 border-t border-b border-[#d97706]/20 flex flex-col gap-2.5 shrink-0 font-mono"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#d97706]" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#d97706] uppercase tracking-wider">COMPLIANCE ID VERIFICATION</p>
                  <p className="text-[9px] text-zinc-600 dark:text-zinc-400">Alcohol detected in basket. Customer DOB must be on/before June 30, 2005</p>
                </div>
                {isAgeVerified && (
                  <span className="bg-emerald-650 text-white text-[8px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Check className="h-2 w-2" /> PASSED
                  </span>
                )}
              </div>

              {!isAgeVerified ? (
                <div className="space-y-2">
                  <select
                    value={scannedIdCustomer}
                    onChange={(e) => handleIdScanChange(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-[#1c1c1c] border border-[#d97706]/30 p-2 focus:outline-none text-zinc-750 dark:text-zinc-200 transition-all font-mono"
                  >
                    <option value="" className="bg-[#f8f7f4] text-[#1a1a1a]">-- Choose registered customer to simulate ID Scan --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id} className="bg-[#f8f7f4] text-[#1a1a1a]">
                        {c.name} (DOB: {c.date_of_birth || c.dob})
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
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 font-bold flex items-center justify-between font-mono">
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
        <div className="p-4 bg-[#f8f7f4] dark:bg-[#121212] border-t border-[#1a1a1a]/10 dark:border-white/10 space-y-3 shrink-0 font-sans">
          
          {/* Coupon Code Entry */}
          <div className="py-2 px-3 bg-white dark:bg-[#1c1c1c]/40 border border-[#1a1a1a]/10 dark:border-white/10 rounded flex flex-col gap-1.5">
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
                  className="flex-1 min-w-0 bg-[#f8f7f4] dark:bg-[#121212] border-b border-zinc-200 dark:border-zinc-850 px-2.5 py-1 text-xs focus:outline-none text-[#1a1a1a] dark:text-white uppercase font-mono placeholder:text-zinc-400"
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
                  className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border border-[#1a1a1a] dark:border-white hover:bg-[#d97706] hover:text-white px-3.5 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Subtotals & Taxes with tight tabular-nums */}
          <div className="space-y-1 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
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

          <div className="pt-2 border-t border-[#1a1a1a]/10 dark:border-white/10 flex justify-between items-end font-mono">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Due</span>
            <span className="text-2xl font-bold tracking-tight tabular-nums text-[#1a1a1a] dark:text-white font-serif">${total.toFixed(2)}</span>
          </div>

          {/* Payment Method Selector Grid */}
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
              {[
                { label: 'Card', val: 'Card' },
                { label: 'Cash', val: 'Cash' },
                { label: 'Split', val: 'Split' },
                { label: 'House', val: 'House Account' }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setPaymentMethod(m.val as any)}
                  className={`py-2 rounded border text-center font-bold cursor-pointer transition-all duration-150 ${
                    paymentMethod === m.val
                      ? 'bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] border-[#1a1a1a] dark:border-white shadow-[2px_2px_0px_rgba(26,26,26,1)]'
                      : 'bg-white dark:bg-[#1c1c1c] border-transparent text-[#71717a] dark:text-[#a1a1aa] hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[2px_2px_0px_rgba(26,26,26,1)]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Dynamic Payment Details Panel */}
            {paymentMethod === 'Cash' && (
              <div className="bg-zinc-50 dark:bg-[#101010] p-2.5 rounded border border-zinc-200 dark:border-zinc-850 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Cash Paid Amount:</span>
                  <div className="relative w-28">
                    <span className="absolute left-1.5 top-1 text-zinc-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full bg-white dark:bg-[#1a1a1a] py-0.5 pl-4 pr-1 text-right border border-zinc-200 dark:border-zinc-800 rounded font-bold"
                    />
                  </div>
                </div>

                {/* Quick Cash Suggestions */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {quickCashOptions.map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashReceived(amt.toFixed(2))}
                      className="bg-white dark:bg-[#1a1a1a] hover:bg-zinc-100 dark:hover:bg-zinc-850 px-2 py-1 text-[10px] font-bold border border-zinc-200 dark:border-zinc-800 rounded whitespace-nowrap"
                    >
                      ${amt.toFixed(2)}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCashReceived(total.toFixed(2))}
                    className="bg-emerald-650 text-white px-2 py-1 text-[10px] font-bold rounded whitespace-nowrap"
                  >
                    Exact
                  </button>
                </div>

                {/* Live Change calculation display */}
                {parseFloat(cashReceived) >= total && (
                  <div className="pt-1.5 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-emerald-600 dark:text-emerald-450 font-bold">
                    <span>Change Due:</span>
                    <span className="text-lg tabular-nums font-serif">${(parseFloat(cashReceived) - total).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'Split' && (
              <div className="bg-zinc-50 dark:bg-[#101010] p-2.5 rounded border border-zinc-200 dark:border-zinc-850 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-bold uppercase">Card Payment:</span>
                  <div className="relative w-28">
                    <span className="absolute left-1.5 top-0.5 text-zinc-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={splitCardAmount}
                      onChange={(e) => {
                        setSplitCardAmount(e.target.value);
                        const num = parseFloat(e.target.value) || 0;
                        setSplitCashAmount(Math.max(0, total - num).toFixed(2));
                      }}
                      className="w-full bg-white dark:bg-[#1a1a1a] py-0.5 pl-4 pr-1 text-right border border-zinc-200 dark:border-zinc-800 rounded font-bold"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-bold uppercase">Cash Payment:</span>
                  <div className="relative w-28">
                    <span className="absolute left-1.5 top-0.5 text-zinc-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={splitCashAmount}
                      onChange={(e) => {
                        setSplitCashAmount(e.target.value);
                        const num = parseFloat(e.target.value) || 0;
                        setSplitCardAmount(Math.max(0, total - num).toFixed(2));
                      }}
                      className="w-full bg-white dark:bg-[#1a1a1a] py-0.5 pl-4 pr-1 text-right border border-zinc-200 dark:border-zinc-800 rounded font-bold"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const half = (total / 2).toFixed(2);
                    setSplitCardAmount(half);
                    setSplitCashAmount((total - parseFloat(half)).toFixed(2));
                  }}
                  className="w-full py-1 text-[9px] font-bold text-center bg-zinc-200 dark:bg-zinc-800 hover:bg-[#d97706] hover:text-white rounded"
                >
                  Reset to 50/50 Split Due
                </button>
              </div>
            )}

            {paymentMethod === 'House Account' && (
              <div className="bg-zinc-50 dark:bg-[#101010] p-2.5 rounded border border-zinc-200 dark:border-zinc-855 font-mono text-[11px] text-zinc-650 dark:text-zinc-350 space-y-1.5">
                {customer ? (
                  <>
                    <div className="flex justify-between">
                      <span>Account Holder:</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-white">{customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credit Balance:</span>
                      <span className="font-bold text-emerald-600">${customer.store_credit_balance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wholesale Tier:</span>
                      <span className="font-bold text-[#d97706]">{customer.wholesale_tier || 'Retail Standard'}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-red-500 font-bold text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Warning: Link customer profile to charge.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Big high-contrast checkout submit button */}
          <button
            onClick={executeCheckout}
            disabled={cart.length === 0 || isProcessingCheckout || (hasAgeRestrictedItems && !isAgeVerified) || (paymentMethod === 'House Account' && !customer)}
            className={`w-full py-3.5 uppercase tracking-widest text-[11px] font-mono font-bold transition-all duration-200 border border-[#1a1a1a] dark:border-white shadow-[4px_4px_0px_rgba(26,26,26,1)] dark:shadow-[4px_4px_0px_rgba(248,247,244,1)] flex items-center justify-center gap-2 cursor-pointer ${
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
                Complete Sale (${total.toFixed(2)})
              </>
            )}
          </button>
        </div>

      </div>

      {/* RECEPT MODAL / SIMULATION ON SUCCESS */}
      <AnimatePresence>
        {showReceiptModal && lastCompletedTransaction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm overflow-hidden flex flex-col rounded-xl shadow-2xl p-6 relative font-mono text-xs text-zinc-800 dark:text-zinc-200"
            >
              {/* Receipts Top Graphic */}
              <div className="flex flex-col items-center justify-center border-b border-dashed border-zinc-300 dark:border-zinc-750 pb-4 text-center">
                <div className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 p-2.5 rounded-full mb-2">
                  <Check className="h-6 w-6 stroke-2" />
                </div>
                <h3 className="font-bold text-sm tracking-widest uppercase">Obsidian Liquor & Wine</h3>
                <p className="text-[10px] text-zinc-450 mt-0.5">Chicago Enterprises LLC</p>
                <p className="text-[9px] text-zinc-400">100 Grand Ave, Suite 400</p>
                <p className="text-[9px] text-zinc-450 mt-1 font-bold">RETAIL LIC: LIC-LIQ-2026-89472</p>
              </div>

              {/* Invoice Specs */}
              <div className="py-3 border-b border-dashed border-zinc-300 dark:border-zinc-750 space-y-1 text-[10px] text-zinc-500">
                <div className="flex justify-between">
                  <span>ORDER NUMBER:</span>
                  <span className="font-bold text-zinc-800 dark:text-white">{lastCompletedTransaction.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span>{lastCompletedTransaction.cashier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span>{lastCompletedTransaction.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE / TIME:</span>
                  <span>{new Date(lastCompletedTransaction.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Receipt Items Scrollbox */}
              <div className="py-3 border-b border-dashed border-zinc-300 dark:border-zinc-750 max-h-48 overflow-y-auto space-y-2 text-[11px]">
                {lastCompletedTransaction.items.map((item, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between font-bold text-zinc-800 dark:text-white">
                      <span>{item.product_name}</span>
                      <span>${item.total_price?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-450 font-mono pl-2">
                      <span>{item.quantity} x ${item.unit_price?.toFixed(2)} {item.is_case_purchase ? '(Case)' : ''}</span>
                      {item.discount_applied > 0 && (
                        <span className="text-emerald-600">-(${item.discount_applied * item.quantity}) Off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Table */}
              <div className="py-3 border-b border-dashed border-zinc-300 dark:border-zinc-750 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>${lastCompletedTransaction.subtotal?.toFixed(2)}</span>
                </div>
                {lastCompletedTransaction.discount_total > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>TOTAL DISCOUNTS</span>
                    <span>-${lastCompletedTransaction.discount_total?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TAX ACCRUED (8.5%)</span>
                  <span>${lastCompletedTransaction.tax_accrued?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-zinc-150 dark:border-zinc-800 text-zinc-900 dark:text-white">
                  <span>GRAND TOTAL</span>
                  <span>${lastCompletedTransaction.grand_total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment details / Change Due */}
              <div className="py-3 border-b border-dashed border-zinc-300 dark:border-zinc-750 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>PAYMENT METHOD:</span>
                  <span className="font-bold">{lastCompletedTransaction.payment_method}</span>
                </div>
                {lastCompletedTransaction.payment_method === 'Cash' && receiptChangeDue > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold text-xs pt-1">
                    <span>CHANGE HANDED BACK:</span>
                    <span className="text-sm font-serif">${receiptChangeDue.toFixed(2)}</span>
                  </div>
                )}
                {lastCompletedTransaction.age_verified && (
                  <div className="text-[9px] bg-emerald-550/10 text-emerald-600 dark:text-emerald-450 p-1.5 rounded flex items-center justify-center gap-1 mt-1 font-bold">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    COMPLIANCE APPROVED: 21+ ID VERIFIED ({lastCompletedTransaction.birth_date_logged})
                  </div>
                )}
              </div>

              {/* Bottom Print / Dismiss */}
              <div className="pt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast("Sending thermal print command to receipt printer COM3.", "info");
                  }}
                  className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white py-2 w-full text-xs font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer shadow border border-transparent hover:border-zinc-400"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt Copy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiptModal(false);
                    setLastCompletedTransaction(null);
                    setReceiptChangeDue(0);
                  }}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 w-full text-xs font-bold rounded text-center cursor-pointer"
                >
                  Next Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM SCALE / MISCELLANEOUS SALE MODAL */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-100 dark:border-zinc-850">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-white">
                  <Scale className="h-4.5 w-4.5 text-[#d97706]" />
                  <h3 className="text-sm font-bold uppercase font-mono">Custom Sale Item</h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowCustomModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] block text-zinc-500 font-bold uppercase">Item Name / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Corkscrew Opener or Large Ice"
                    value={customItem.name}
                    onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 rounded outline-none focus:border-[#d97706]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] block text-zinc-500 font-bold uppercase">Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={customItem.price}
                      onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 rounded outline-none focus:border-[#d97706]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] block text-zinc-500 font-bold uppercase">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={customItem.quantity}
                      onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 rounded outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] block text-zinc-500 font-bold uppercase">Item Category Class</label>
                  <select
                    value={customItem.category}
                    onChange={(e) => setCustomItem({ ...customItem, category: e.target.value as any })}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 p-2 border border-zinc-200 dark:border-zinc-800 rounded outline-none focus:border-[#d97706]"
                  >
                    <option value="Extras">Extras (Ice/Opener/Glassware)</option>
                    <option value="Beer">Beer</option>
                    <option value="Wine">Wine</option>
                    <option value="Liquor">Liquor</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded border border-zinc-150 dark:border-zinc-850">
                  <div className="space-y-0.5">
                    <span className="text-[10px] block text-zinc-500 font-bold uppercase">Age Restriction</span>
                    <span className="text-[9px] text-zinc-400">Requires 21+ ID check</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={customItem.age_restricted}
                    onChange={(e) => setCustomItem({ ...customItem, age_restricted: e.target.checked })}
                    className="h-4.5 w-4.5 text-[#d97706] focus:ring-[#d97706] border-zinc-300 dark:border-zinc-700 rounded accent-[#d97706] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={handleAddCustomSale}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 text-xs font-bold rounded shadow-md transition-all cursor-pointer"
                >
                  Add Custom Sale
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 w-full py-2.5 text-xs font-bold rounded transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
