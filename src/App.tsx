import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Package, FileText, Sun, Moon, 
  Layers, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2, ChevronRight, Store, Percent,
  Menu, ChevronLeft, Truck, Megaphone, DollarSign, Printer, Globe, User, Users, Tag, Lock, Laptop, Key, Fingerprint, Check, Search, Home, Activity, X, Settings as SettingsIcon
} from 'lucide-react';
import Register from './components/Register';
import Inventory from './components/Inventory';
import History from './components/History';
import Discounts from './components/Discounts';
import Purchases from './components/Purchases';
import Marketing from './components/Marketing';
import PrintMaterial from './components/PrintMaterial';
import Integrations from './components/Integrations';
import Settings from './components/Settings';
import WebsiteBuilder from './components/WebsiteBuilder';
import { Tenant, Product, Customer, Transaction, DiscountRule, DeliveryOrder } from './types';

const INITIAL_DISCOUNT_RULES: DiscountRule[] = [
  {
    id: 'rule_1',
    name: 'Wine Mix & Match (6+ bottles)',
    type: 'category',
    category: 'Wine',
    minQuantity: 6,
    discountPercent: 10,
    isActive: true,
  },
  {
    id: 'rule_2',
    name: 'Spirits Bulk Buy (3+ bottles)',
    type: 'category',
    category: 'Liquor',
    minQuantity: 3,
    discountPercent: 5,
    isActive: true,
  },
  {
    id: 'rule_3',
    name: 'VIP Customer Discount (Code: VIP15)',
    type: 'coupon',
    code: 'VIP15',
    discountPercent: 15,
    isActive: true,
  },
  {
    id: 'rule_4',
    name: '$5.00 Store Opening Discount (Code: SAVE5)',
    type: 'coupon',
    code: 'SAVE5',
    discountAmount: 5.00,
    isActive: true,
  }
];

interface SettingsUser {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  pin: string;
}

const DEFAULT_USERS: SettingsUser[] = [
  { id: 'usr_1', name: 'Elena Rostova (Store Owner)', role: 'Admin', pin: '1111' },
  { id: 'usr_2', name: 'Marcus Brody (Floor Manager)', role: 'Manager', pin: '2222' },
  { id: 'usr_3', name: 'Sarah Jenkins (POS Cashier)', role: 'Cashier', pin: '3333' }
];

const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, string>> = {
  Admin: {
    register: 'Admin',
    inventory: 'Admin',
    history: 'Admin',
    discounts: 'Admin',
    purchases: 'Admin',
    marketing: 'Admin',
    print: 'Admin',
    integrations: 'Admin',
    website: 'Admin',
    settings: 'Admin',
  },
  Manager: {
    register: 'Admin',
    inventory: 'Write',
    history: 'Write',
    discounts: 'Write',
    purchases: 'Write',
    marketing: 'Write',
    print: 'Write',
    integrations: 'Write',
    website: 'Write',
    settings: 'Read Only',
  },
  Cashier: {
    register: 'Write',
    inventory: 'No Access',
    history: 'Read Only',
    discounts: 'No Access',
    purchases: 'No Access',
    marketing: 'No Access',
    print: 'Read Only',
    integrations: 'No Access',
    website: 'No Access',
    settings: 'No Access',
  }
};

export default function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [activeTab, setActiveTab] = useState<
    'register' | 'inventory' | 'history' | 'discounts' | 'purchases' | 'marketing' | 'print' | 'integrations' | 'settings' | 'website'
  >('register');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'Admin' | 'Manager' | 'Cashier'>('Admin');

  // Shopify Navigation & Search States
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState<boolean>(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState<string>('');

  // Employee Governance States
  const [users, setUsers] = useState<SettingsUser[]>(() => {
    const saved = localStorage.getItem('aura_pos_users_list');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<SettingsUser>(() => {
    const saved = localStorage.getItem('aura_pos_active_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const usersListStr = localStorage.getItem('aura_pos_users_list');
        const usersList = usersListStr ? JSON.parse(usersListStr) : DEFAULT_USERS;
        const matched = usersList.find((u: any) => u.id === parsed.id);
        if (matched) return matched;
      } catch (err) {}
    }
    return DEFAULT_USERS[0]; // Default Elena Rostova (Admin)
  });

  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem('aura_pos_role_permissions');
    return saved ? JSON.parse(saved) : DEFAULT_ROLE_PERMISSIONS;
  });

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [selectedLockUser, setSelectedLockUser] = useState<SettingsUser>(currentUser || DEFAULT_USERS[0]);
  const [lockPin, setLockPin] = useState<string>('');

  // Keypad press handler for lock screen
  const handleKeypadPress = (val: string) => {
    if (lockPin.length >= 4) return;
    const nextPin = lockPin + val;
    setLockPin(nextPin);
    
    if (nextPin.length === 4) {
      if (nextPin === selectedLockUser.pin) {
        setCurrentUser(selectedLockUser);
        setActiveRole(selectedLockUser.role);
        setIsLocked(false);
        setLockPin('');
        showToast(`Welcome back, ${selectedLockUser.name}! Console unlocked.`, 'success');
      } else {
        showToast('Invalid Security PIN key. Access Denied.', 'error');
        setTimeout(() => setLockPin(''), 400);
      }
    }
  };

  const handleBackspace = () => {
    setLockPin(prev => prev.slice(0, -1));
  };

  // Keep lock user in sync with currentUser when changed outside lock screen
  useEffect(() => {
    if (currentUser) {
      setSelectedLockUser(currentUser);
    }
  }, [currentUser]);

  // Global Keybind Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        setIsLocked(true);
        showToast('Console Lock activated via shortcut.', 'info');
      }
      if (e.key === 'F10') {
        e.preventDefault();
        showToast('[F10] CASH DRAWER TRIPPED: Solenoid fired [USB-PORT3]', 'success');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_pos_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('aura_pos_active_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role || 'Admin');
    } else {
      setActiveRole('Admin');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aura_pos_role_permissions', JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // Dynamic system clock state
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setCurrentTime(`${dateStr} ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Omnichannel active orders feed state
  const [incomingOrders, setIncomingOrders] = useState<DeliveryOrder[]>(() => {
    const saved = localStorage.getItem('aura_pos_incoming_orders');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'DEL-8821',
        platform: 'UberEats',
        customer: 'Robert J. (0.8 mi away)',
        items: [
          { 
            productName: 'Jameson Irish Whiskey', 
            productId: 'prod_1', 
            qty: 2 
          }
        ],
        total: 65.98,
        status: 'Pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 'DEL-9014',
        platform: 'DoorDash',
        customer: 'Sarah M. (1.4 mi away)',
        items: [
          { 
            productName: 'Veuve Clicquot Yellow Label Champagne', 
            productId: 'prod_2', 
            qty: 1 
          }
        ],
        total: 59.99,
        status: 'Pending',
        createdAt: new Date().toISOString()
      },
      {
        id: 'DEL-9204',
        platform: 'Instacart',
        customer: 'Timothy K. (Pickup)',
        items: [
          { 
            productName: 'Heineken Premium Lager', 
            productId: 'prod_4', 
            qty: 12 
          }
        ],
        total: 33.00,
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aura_pos_incoming_orders', JSON.stringify(incomingOrders));
  }, [incomingOrders]);

  // Discount rules state
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(() => {
    const saved = localStorage.getItem('aura_pos_discount_rules');
    return saved ? JSON.parse(saved) : INITIAL_DISCOUNT_RULES;
  });

  const saveDiscountRules = (rules: DiscountRule[]) => {
    setDiscountRules(rules);
    localStorage.setItem('aura_pos_discount_rules', JSON.stringify(rules));
  };

  // SaaS Tenant States
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant_1');
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);

  // Database lists
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Custom toast notification system
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'error';
  }>>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // 1. Fetch Tenants on mount
  useEffect(() => {
    async function loadTenants() {
      try {
        const res = await fetch('/api/tenants');
        if (!res.ok) throw new Error("Could not load SaaS tenants");
        const data = await res.json();
        setTenants(data);
        if (data.length > 0) {
          // Default to first tenant
          setActiveTenantId(data[0].id);
          setActiveTenant(data[0]);
        }
      } catch (e: any) {
        showToast(e.message, 'error');
      }
    }
    loadTenants();
  }, []);

  // 2. Fetch products, customers, transactions whenever activeTenantId changes
  const fetchTenantData = async (tid: string) => {
    setIsLoading(true);
    try {
      const [pRes, cRes, tRes] = await Promise.all([
        fetch(`/api/products?tenant_id=${tid}`),
        fetch(`/api/customers?tenant_id=${tid}`),
        fetch(`/api/transactions?tenant_id=${tid}`)
      ]);

      if (!pRes.ok || !cRes.ok || !tRes.ok) {
        throw new Error("Failed to load database files for current tenant context.");
      }

      const pData = await pRes.json();
      const cData = await cRes.json();
      const tData = await tRes.json();

      setProducts(pData);
      setCustomers(cData);
      setTransactions(tData);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTenantId) {
      const selected = tenants.find(t => t.id === activeTenantId);
      if (selected) setActiveTenant(selected);
      fetchTenantData(activeTenantId);
    }
  }, [activeTenantId, tenants]);

  // Sync index.html root body dark/light class with support for system mode
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: 'light' | 'dark') => {
      if (t === 'dark') {
        root.classList.add('dark');
        root.style.backgroundColor = '#121212'; // dark ink
      } else {
        root.classList.remove('dark');
        root.style.backgroundColor = '#f8f7f4'; // warm bg
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Computed states for Shopify Omnipresent Search Bar
  const query = commandSearchQuery.toLowerCase().trim();
  
  // Filter products matching query
  const matchedProducts = query.length >= 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.distributor_sku && p.distributor_sku.toLowerCase().includes(query)) ||
        (p.barcode && p.barcode.toLowerCase().includes(query)) ||
        (p.vendor && p.vendor.toLowerCase().includes(query))
      ).slice(0, 5)
    : [];

  // Filter Transactions/Customers matching query
  const matchedTransactions = query.length >= 1
    ? transactions.filter(t =>
        (t.customer_name && t.customer_name.toLowerCase().includes(query)) ||
        t.id.toLowerCase().includes(query) ||
        t.payment_method.toLowerCase().includes(query) ||
        t.items.some(item => item.product_name.toLowerCase().includes(query))
      ).slice(0, 3)
    : [];

  // System navigation triggers & actions
  const systemActions = [
    { label: "SaaS POS Cashier Register", tab: "register" as const, desc: "Open retail Point of Sale register screen", icon: <ShoppingBag className="h-4 w-4" /> },
    { label: "Products Inventory Catalog", tab: "inventory" as const, desc: "Check stock levels, categories, pricing, specs", icon: <Package className="h-4 w-4" /> },
    { label: "Transactions & Sales database", tab: "history" as const, desc: "Review receipts, customer records, global database", icon: <FileText className="h-4 w-4" /> },
    { label: "Promotions & Automatic Discounts", tab: "discounts" as const, desc: "Manage bulk wine/spirits and coupon rules", icon: <Percent className="h-4 w-4" /> },
    { label: "Purchases & Reorder Logs", tab: "purchases" as const, desc: "View wholesale purchases and supplier orders", icon: <Truck className="h-4 w-4" /> },
    { label: "Marketing Campaigns", tab: "marketing" as const, desc: "E-blast discounts and customer messaging feeds", icon: <Megaphone className="h-4 w-4" /> },
    { label: "Print Label Designer", tab: "print" as const, desc: "Generate print layouts and barcoded hangtags", icon: <Printer className="h-4 w-4" /> },
    { label: "Omnichannel Integrations", tab: "integrations" as const, desc: "Check UberEats, DoorDash, and delivery settings", icon: <Globe className="h-4 w-4" /> },
    { label: "Online Store Website Builder", tab: "website" as const, desc: "Build store templates, themes, blogs, and settings", icon: <Laptop className="h-4 w-4" /> },
    { label: "Settings & System Governance", tab: "settings" as const, desc: "Manage employee logins, role rights, security PINs", icon: <Users className="h-4 w-4" /> },
  ];

  const matchedActions = query.length >= 1
    ? systemActions.filter(a => 
        a.label.toLowerCase().includes(query) || 
        a.desc.toLowerCase().includes(query)
      )
    : systemActions.slice(0, 4); // default actions

  const handleSelectSearchProduct = (pId: string) => {
    setSelectedProductId(pId);
    setActiveTab('inventory');
    setIsCommandSearchOpen(false);
    setCommandSearchQuery('');
    showToast(`Navigated to catalog details for: ${products.find(p => p.id === pId)?.name || 'Product'}`, 'success');
  };

  const handleSelectSearchAction = (tabName: any) => {
    setActiveTab(tabName);
    setIsCommandSearchOpen(false);
    setCommandSearchQuery('');
    showToast(`Navigated to: ${tabName.toUpperCase()} screen`, 'info');
  };

  const handleSelectSearchTransaction = (tId: string) => {
    setActiveTab('history');
    setIsCommandSearchOpen(false);
    setCommandSearchQuery('');
    showToast(`Loaded transaction: ${tId}`, 'success');
  };

  return (
    <div className="h-screen w-screen bg-[#f4f4f5] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 font-sans select-none flex flex-row overflow-hidden transition-colors duration-300">
      
      {/* 1. SHOPIFY-STYLE LEFT FIXED SIDEBAR */}
      <aside className={`${isSidebarCollapsed ? 'w-16 px-2.5' : 'w-60 px-4'} border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] flex flex-col shrink-0 transition-all duration-300 justify-between h-full py-4 select-none`}>
        <div className="space-y-5 flex-1 flex flex-col overflow-hidden">
          
          {/* Top Branding Section */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3.5 shrink-0">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-xl flex items-center justify-center font-serif italic font-bold text-lg shadow-sm shrink-0 border border-zinc-200 dark:border-zinc-800">
                A
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col text-left leading-tight truncate">
                  <span className="font-sans font-black text-[11px] uppercase tracking-wider text-zinc-900 dark:text-white">
                    Aura Commerce
                  </span>
                  <span className="text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                    SaaS Suite Admin
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Quick Search trigger button (Visible on collapse state) */}
          {isSidebarCollapsed && (
            <button
              onClick={() => setIsCommandSearchOpen(true)}
              className="w-full p-2.5 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-[#d97706] dark:hover:border-[#d97706] text-zinc-400 hover:text-[#d97706] flex items-center justify-center transition cursor-pointer"
              title="Search console (Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Navigation links grouped in standard Shopify groups */}
          <nav className="flex-1 overflow-y-auto pr-1 space-y-6">
            
            {/* Group 1: Administration core */}
            <div className="space-y-1.5">
              {!isSidebarCollapsed && (
                <h4 className="text-[9px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-3 select-none">
                  Core Admin
                </h4>
              )}
              
              {/* Products Catalog */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['inventory'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'inventory' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Package className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'inventory' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Products</span>}
                </button>
              )}

              {/* Transactions & Analytics */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['history'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'history' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'history' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Transactions</span>}
                </button>
              )}

              {/* Purchases & Logistics */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['purchases'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('purchases')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'purchases' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Truck className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'purchases' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Purchases</span>}
                </button>
              )}

              {/* Promotions & Deals */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['discounts'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('discounts')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'discounts' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Percent className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'discounts' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Promotions</span>}
                </button>
              )}

              {/* Marketing Campaigns */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['marketing'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('marketing')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'marketing' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Megaphone className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'marketing' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Marketing</span>}
                </button>
              )}

            </div>

            {/* Group 2: Sales Channels */}
            <div className="space-y-1.5">
              {!isSidebarCollapsed && (
                <h4 className="text-[9px] font-mono font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest pl-3 select-none">
                  Sales Channels
                </h4>
              )}

              {/* POS Register */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['register'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('register')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'register' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'register' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">POS Register</span>}
                </button>
              )}

              {/* Website Builder / Online Store */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['website'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('website')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'website' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Laptop className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'website' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Online Store</span>}
                </button>
              )}

              {/* Print Labels */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['print'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('print')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'print' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Printer className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'print' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Print Designer</span>}
                </button>
              )}

              {/* Integrations */}
              {(rolePermissions[currentUser?.role || 'Admin']?.['integrations'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                    activeTab === 'integrations' 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'integrations' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  {!isSidebarCollapsed && <span className="font-sans text-[11px] font-semibold tracking-tight">Integrations</span>}
                </button>
              )}

            </div>

          </nav>
        </div>

        {/* Group 3: Isolated Settings button at the bottom exactly as Shopify does */}
        <div className="pt-3 border-t border-zinc-150 dark:border-zinc-850 shrink-0 space-y-3.5">
          {(rolePermissions[currentUser?.role || 'Admin']?.['settings'] || 'Admin') !== 'No Access' && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full py-2.5 px-3 rounded-lg transition-all duration-150 cursor-pointer text-left flex items-center gap-3 ${
                activeTab === 'settings' 
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
              title="Aura System Settings"
            >
              <SettingsIcon className={`h-4.5 w-4.5 shrink-0 ${activeTab === 'settings' ? 'text-[#d97706]' : 'text-zinc-400 dark:text-zinc-500'}`} />
              {!isSidebarCollapsed && <span className="font-sans text-[11px] font-bold tracking-tight">Settings</span>}
            </button>
          )}

          {/* Theme Switcher */}
          <div className="flex items-center gap-1.5 w-full">
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light')}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer text-xs font-semibold"
              title="Change Theme preset"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-zinc-400" />
                  {!isSidebarCollapsed && <span className="text-[10px] font-mono uppercase tracking-wider">Dark Mode</span>}
                </>
              ) : theme === 'light' ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  {!isSidebarCollapsed && <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600">Light Mode</span>}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-indigo-500 animate-spin-slow" />
                  {!isSidebarCollapsed && <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500">Auto Mode</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE AREA (TOPBAR + CONTENT PANEL + LOWER FOOTER) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
        
        {/* 1.5 OMNIPRESENT SHOPIFY TOP HEADER BAR */}
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111113] flex items-center justify-between px-6 shrink-0 select-none z-10">
          
          {/* Left Portion: Tenant / Workspace Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-[#d97706]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hidden md:inline">
                Workspace:
              </span>
            </div>
            
            {/* Tenant Select Custom Dropdown */}
            <div className="relative">
              <select
                value={activeTenantId}
                onChange={(e) => setActiveTenantId(e.target.value)}
                className="appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 rounded-xl px-3.5 py-1.5 pr-9 text-xs font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#d97706] cursor-pointer shadow-xs min-w-[150px] sm:min-w-[190px] transition-colors"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                <ChevronRight className="h-3 w-3 rotate-90" />
              </div>
            </div>
          </div>

          {/* Middle Portion: Universal Shopify Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden sm:block">
            <button
              onClick={() => setIsCommandSearchOpen(true)}
              className="w-full flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 px-3.5 py-2 rounded-xl text-zinc-400 cursor-pointer shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                <span className="text-[11px] font-sans text-zinc-400 dark:text-zinc-500 font-medium">Search products, receipts, settings...</span>
              </div>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 rounded border border-zinc-300/30">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right Portion: Active Employee Card & Clock */}
          <div className="flex items-center gap-4">
            
            {/* Employee Info Card */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-850 px-2.5 py-1 rounded-xl">
              <div className="h-5.5 w-5.5 bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 font-serif italic">
                {currentUser?.name?.[0] || 'A'}
              </div>
              <div className="text-left leading-none hidden lg:block select-none">
                <p className="text-[10px] font-bold text-zinc-850 dark:text-zinc-100">{currentUser?.name?.split(' (')?.[0] || 'Active User'}</p>
                <span className="text-[8px] font-mono text-[#d97706] uppercase tracking-wider font-extrabold">{currentUser?.role || 'Admin'}</span>
              </div>
            </div>

            {/* Quick Screen Lock Padlock */}
            <button
              onClick={() => setIsLocked(true)}
              className="p-1.5 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-[#18181b] hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500/20 hover:text-red-500 dark:hover:text-red-500 text-zinc-400 rounded-lg transition-all cursor-pointer shadow-xs"
              title="Lock Console (F12)"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>

            {/* Dynamic System Time clock */}
            <div className="hidden xl:flex flex-col items-end leading-none font-mono text-[9px] text-zinc-400 dark:text-zinc-500 gap-0.5 select-none pr-1">
              <span className="font-bold">{currentTime.split(' ')[0]}</span>
              <span className="text-zinc-500">{currentTime.split(' ')[1]}</span>
            </div>

          </div>

        </header>

        {/* 2. MAIN ACTIVE COMPONENT VIEWPORT */}
        <main className="flex-1 flex overflow-hidden">
          
          {isLoading ? (
            /* High-Fidelity Skeleton layout for loading state */
            <div className="flex-1 p-6 space-y-6 bg-[#fafafa] dark:bg-[#09090b]">
              <div className="grid grid-cols-3 gap-6">
                <div className="h-24 bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl animate-pulse" />
                <div className="h-24 bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl animate-pulse" />
                <div className="h-24 bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl animate-pulse" />
              </div>
              <div className="h-[450px] bg-white dark:bg-[#18181b] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl animate-pulse" />
            </div>
          ) : (
            /* Render Active Subview */
            <div className="flex-1 flex overflow-hidden">
              
              {/* Cashier Guard for restricted views */}
              {activeRole === 'Cashier' && ['inventory', 'purchases', 'settings'].includes(activeTab) ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#09090b] text-center p-8 space-y-4">
                  <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/15">
                    <Lock className="h-8 w-8 stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      Security Clearance Required
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                      Cashier profiles do not have access to manage inventory, purchase operations, compliance audit logs, or settings. Please log in as a Manager or Admin.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="bg-zinc-950 dark:bg-white hover:bg-[#d97706] dark:hover:bg-[#d97706] text-white dark:text-zinc-950 hover:text-white py-2.5 px-5 transition cursor-pointer rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-sm border border-transparent"
                  >
                    Go to User Settings
                  </button>
                </div>
              ) : (
                <>
                  {activeTab === 'register' && (
                    <Register 
                      tenantId={activeTenantId} 
                      theme={theme} 
                      products={products}
                      customers={customers}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
                      discountRules={discountRules}
                      activeUserId={currentUser?.id || 'usr_1'}
                      activeUser={currentUser?.name || 'Elena Rostova'}
                    />
                  )}
 
                  {activeTab === 'inventory' && (
                    <Inventory 
                      tenantId={activeTenantId} 
                      theme={theme} 
                      products={products}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
                      permissionLevel={rolePermissions[currentUser?.role || 'Admin']?.['inventory'] || 'Admin'}
                      activeUser={currentUser?.name || 'Elena Rostova'}
                      selectedProductId={selectedProductId}
                      setSelectedProductId={setSelectedProductId}
                    />
                  )}
 
                  {activeTab === 'history' && (
                    <History 
                      tenantId={activeTenantId} 
                      theme={theme} 
                      transactions={transactions}
                      customers={customers}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
                      permissionLevel={rolePermissions[currentUser?.role || 'Admin']?.['history'] || 'Admin'}
                      activeUser={currentUser?.name || 'Elena Rostova'}
                    />
                  )}
 
                  {activeTab === 'discounts' && (
                    <Discounts 
                      theme={theme} 
                      discountRules={discountRules}
                      onUpdateRules={saveDiscountRules}
                      showToast={showToast}
                    />
                  )}
 
                  {activeTab === 'purchases' && (
                    <Purchases
                      tenantId={activeTenantId}
                      products={products}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
                      permissionLevel={rolePermissions[currentUser?.role || 'Admin']?.['purchases'] || 'Admin'}
                    />
                  )}
 
                  {activeTab === 'marketing' && (
                    <Marketing
                      customers={customers}
                      discountRules={discountRules}
                      onAddDiscountRule={(rule) => saveDiscountRules([rule, ...discountRules])}
                      showToast={showToast}
                    />
                  )}
 
                  {activeTab === 'print' && (
                    <PrintMaterial
                      products={products}
                      showToast={showToast}
                    />
                  )}
 
                  {activeTab === 'integrations' && (
                    <Integrations
                      tenantId={activeTenantId}
                      products={products}
                      transactions={transactions}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
                      incomingOrders={incomingOrders}
                      setIncomingOrders={setIncomingOrders}
                    />
                  )}
 
                  {activeTab === 'website' && (
                    <WebsiteBuilder
                      tenantId={activeTenantId}
                      products={products}
                      discountRules={discountRules}
                      incomingOrders={incomingOrders}
                      setIncomingOrders={setIncomingOrders}
                      showToast={showToast}
                    />
                  )}
 
                  {activeTab === 'settings' && (
                    <Settings
                      currentUser={currentUser}
                      users={users}
                      setUsers={setUsers}
                      rolePermissions={rolePermissions}
                      setRolePermissions={setRolePermissions}
                      onLock={() => setIsLocked(true)}
                      showToast={showToast}
                    />
                  )}
                </>
              )}
            </div>
          )}
 
        </main>
 
        {/* 3. PREMIUM LOWER CONSOLE FOOTER */}
        <footer className="h-10 bg-white dark:bg-[#111113] border-t border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-500 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Console Access: {(activeRole || 'Admin').toUpperCase()} // WORKSPACE AT {activeTenant?.name?.toUpperCase() || 'LOADING...'}</span>
          </div>
          <div className="flex gap-6 font-semibold">
            <span>[F10] CASH DRAWER</span>
            <span>[F12] LOCK CONSOLE</span>
          </div>
        </footer>
 
      </div>

      {/* 3.4 SHOPIFY INTERACTIVE UNIVERSAL COMMAND SEARCH OVERLAY PALETTE */}
      {isCommandSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-zinc-950/40 dark:bg-zinc-950/70 backdrop-blur-xs animate-fade-in" onClick={() => setIsCommandSearchOpen(false)}>
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden mx-4 flex flex-col max-h-[70vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header Input */}
            <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50 dark:bg-[#18181b]/60">
              <Search className="h-5 w-5 text-zinc-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search products, transactions, or navigate..."
                value={commandSearchQuery}
                onChange={(e) => setCommandSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-zinc-900 dark:text-white focus:outline-none text-sm placeholder-zinc-400 font-sans font-medium"
              />
              <button 
                onClick={() => setIsCommandSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-150 dark:divide-zinc-800 scrollbar-thin">
              
              {/* Category 1: Navigation Actions */}
              <div className="p-3 space-y-1.5">
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 py-1">
                  System Navigation Shortcuts
                </p>
                {matchedActions.length === 0 ? (
                  <p className="text-[11px] font-medium text-zinc-400 px-3 py-1">No action matches</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {matchedActions.map((action) => (
                      <button
                        key={action.tab}
                        onClick={() => handleSelectSearchAction(action.tab)}
                        className="w-full text-left p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/65 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 flex items-center gap-3 transition cursor-pointer group"
                      >
                        <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-[#d97706]/10 text-zinc-500 dark:text-zinc-400 group-hover:text-[#d97706] flex items-center justify-center transition shrink-0">
                          {action.icon}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#d97706] transition leading-snug">
                            {action.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate leading-none">
                            {action.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category 2: Matching Products */}
              {query.length >= 1 && (
                <div className="p-3 space-y-1.5">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 py-1">
                    Matched Catalog Products ({matchedProducts.length})
                  </p>
                  {matchedProducts.length === 0 ? (
                    <div className="text-center py-4 text-zinc-400 text-xs font-mono">
                      No matching products found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {matchedProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectSearchProduct(p.id)}
                          className="w-full text-left p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/65 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 flex items-center justify-between gap-3 transition cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-850 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="h-4.5 w-4.5 text-zinc-400" />
                              )}
                            </div>
                            <div className="truncate text-left leading-tight">
                              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-[#d97706] transition">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                                SKU: {p.distributor_sku || 'N/A'} • {p.category} • {p.vendor || 'No Vendor'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-zinc-800 dark:text-white font-mono">${p.price_per_bottle.toFixed(2)}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-mono uppercase font-black mt-1 ${
                              p.inventory_bottles === 0 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/15'
                                : p.inventory_bottles < p.bottles_per_case 
                                ? 'bg-amber-500/10 text-[#d97706] border border-[#d97706]/15'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                            }`}>
                              {p.inventory_bottles} Bts ({Math.floor(p.inventory_bottles / p.bottles_per_case)} Cs)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Category 3: Matching Transactions & Receipts */}
              {query.length >= 1 && (
                <div className="p-3 space-y-1.5">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-3 py-1">
                    Matched Transactions & Receipts ({matchedTransactions.length})
                  </p>
                  {matchedTransactions.length === 0 ? (
                    <div className="text-center py-4 text-zinc-400 text-xs font-mono">
                      No matching sales records found
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {matchedTransactions.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelectSearchTransaction(t.id)}
                          className="w-full text-left p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/65 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 flex items-center justify-between gap-3 transition cursor-pointer group animate-fade-in"
                        >
                          <div className="text-left leading-tight truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-bold text-[#d97706] uppercase">{t.id}</span>
                              <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-sans font-medium">• {t.customer_name || 'Guest Checkout'}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                              {t.items.map(i => `${i.quantity}x ${i.product_name}`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-zinc-850 dark:text-zinc-100 font-mono">${t.total.toFixed(2)}</p>
                            <span className="text-[8px] font-mono text-zinc-400 uppercase mt-0.5 block">{t.payment_method}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer tips */}
            <div className="p-3 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b]/50 flex justify-between items-center text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              <div>
                <span>Press <span className="font-bold text-zinc-500">ESC</span> to close</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d97706]"></span>
                <span>Shopify Omnichannel Search Engine</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3.5 CONSOLE LOCK SCREEN OVERLAY */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md animate-fade-in">
          <div className="text-center space-y-6 max-w-sm w-full p-8 bg-white dark:bg-[#151518] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[6px_6px_0px_rgba(217,119,6,1)] mx-4">
            <div className="space-y-1.5">
              <div className="h-12 w-12 bg-[#d97706]/10 text-[#d97706] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#d97706]/20">
                <Lock className="h-5 w-5 stroke-[1.8]" />
              </div>
              <h2 className="font-serif italic font-semibold text-2xl text-zinc-900 dark:text-white leading-none">Console Locked</h2>
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Select identity & enter 4-digit PIN</p>
            </div>

            {/* Profile Selection */}
            <div className="grid grid-cols-3 gap-2 py-1">
              {users.map(u => {
                const isSelected = selectedLockUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedLockUser(u);
                      setLockPin('');
                    }}
                    className={`p-2.5 border rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#d97706]/10 border-[#d97706] text-[#d97706] font-bold shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <User className="h-4 w-4 shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wide truncate max-w-[80px]" title={u.name}>
                      {u.name.split(' ')[0]}
                    </span>
                    <span className="text-[7px] font-mono font-bold tracking-widest uppercase text-zinc-400">{u.role}</span>
                  </button>
                );
              })}
            </div>

            {/* PIN Dot Indicators */}
            <div className="space-y-4">
              <div className="flex justify-center gap-4 py-1">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`h-3.5 w-3.5 rounded-full transition-all duration-150 border ${
                      lockPin.length > index
                        ? 'bg-[#d97706] border-[#d97706] scale-110 shadow-[0_0_8px_rgba(217,119,6,0.5)]'
                        : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                    }`}
                  />
                ))}
              </div>

              {/* PIN Keypad Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num.toString())}
                    className="h-11 w-11 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-[#d97706]/15 hover:border-[#d97706]/40 text-zinc-800 dark:text-zinc-100 text-xs font-mono font-black flex items-center justify-center transition active:scale-95 cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setLockPin('')}
                  className="h-11 w-11 rounded-full text-[9px] font-mono font-bold text-zinc-400 hover:text-red-500 flex items-center justify-center transition active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-11 w-11 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-[#d97706]/15 hover:border-[#d97706]/40 text-zinc-800 dark:text-zinc-100 text-xs font-mono font-black flex items-center justify-center transition active:scale-95 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 w-11 rounded-full text-[9px] font-mono font-bold text-zinc-400 hover:text-[#d97706] flex items-center justify-center transition active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PREMIUM NOTIFICATION SYSTEMS (TOASTS) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg transform transition-all duration-300 translate-y-0 animate-slide-in ${
              t.type === 'success'
                ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
                : t.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-500'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="h-4.5 w-4.5 text-[#10b981] shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />}
            {t.type === 'info' && <ShieldCheck className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />}
            
            <div className="text-xs font-semibold leading-relaxed">
              {t.message}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
