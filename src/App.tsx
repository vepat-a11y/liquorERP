import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Package, FileText, Sun, Moon, 
  Layers, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2, ChevronRight, Store, Percent,
  Menu, ChevronLeft, Truck, Megaphone, DollarSign, Printer, Globe, User, Users, Tag, Lock, Laptop, Key, Fingerprint, Check
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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_pos_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('aura_pos_active_user', JSON.stringify(currentUser));
    setActiveRole(currentUser.role);
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

  const handleTenantChange = (tid: string) => {
    setActiveTenantId(tid);
    const selected = tenants.find(t => t.id === tid);
    if (selected) {
      showToast(`Clerk session switch: Loaded database workspace for ${selected.name}`, 'info');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f8f7f4] dark:bg-[#121212] text-[#1a1a1a] dark:text-[#f8f7f4] font-sans select-none flex flex-col overflow-hidden transition-colors duration-300">
      
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* 1. LEFT FIXED SIDEBAR */}
        <header className={`${isSidebarCollapsed ? 'w-16 px-2 py-4' : 'w-56 px-4 py-6'} border-r border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 flex flex-col bg-white dark:bg-[#121212] shrink-0 transition-all duration-300 justify-between h-full overflow-y-auto`}>
        <div className="space-y-6">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm shrink-0">
                M
              </div>
              {!isSidebarCollapsed && (
                <span className="font-sans font-black text-sm uppercase tracking-widest text-zinc-900 dark:text-white">
                  MODULE<span className="text-[#d97706] font-normal font-mono">.</span>
                </span>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-1.5 rounded border border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 hover:border-[#1a1a1a] dark:hover:border-white text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-white transition-all cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation links - styled vertically */}
          <div className="space-y-1.5">
            <nav className="flex flex-col gap-1 text-xs font-semibold tracking-tight">
              
              {/* Register */}
              {(rolePermissions[currentUser.role]?.['register'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('register')}
                  title="01. REGISTER"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'register' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">REGISTER</span>}
                </button>
              )}

              {/* Products */}
              {(rolePermissions[currentUser.role]?.['inventory'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('inventory')}
                  title="PRODUCT CATALOG"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'inventory' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">PRODUCTS</span>}
                </button>
              )}

              {/* Reports */}
              {(rolePermissions[currentUser.role]?.['history'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('history')}
                  title="ANALYTICS & DATABASE"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'history' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">TRANSACTIONS</span>}
                </button>
              )}

              {/* Discounts */}
              {(rolePermissions[currentUser.role]?.['discounts'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('discounts')}
                  title="OFFERS & CAMPAIGNS"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'discounts' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Percent className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">PROMOTIONS</span>}
                </button>
              )}

              {/* Purchases */}
              {(rolePermissions[currentUser.role]?.['purchases'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('purchases')}
                  title="LOGISTICS & ORDERS"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'purchases' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Truck className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">PURCHASES</span>}
                </button>
              )}

              {/* Marketing */}
              {(rolePermissions[currentUser.role]?.['marketing'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('marketing')}
                  title="PUBLIC MARKETING"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'marketing' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Megaphone className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">MARKETING</span>}
                </button>
              )}

              {/* Print Material */}
              {(rolePermissions[currentUser.role]?.['print'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('print')}
                  title="PRINT DESIGNER"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'print' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)] font-bold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Printer className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">PRINTING</span>}
                </button>
              )}

              {/* Integrations */}
              {(rolePermissions[currentUser.role]?.['integrations'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('integrations')}
                  title="CLOUD INTEGRATIONS"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'integrations' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)] font-bold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">INTEGRATIONS</span>}
                </button>
              )}

              {/* Online Store Website Builder */}
              {(rolePermissions[currentUser.role]?.['website'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('website')}
                  title="ONLINE STORE"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'website' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)] font-bold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Laptop className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">ONLINE STORE</span>}
                </button>
              )}

              {/* Settings & User Rights */}
              {(rolePermissions[currentUser.role]?.['settings'] || 'Admin') !== 'No Access' && (
                <button
                  onClick={() => setActiveTab('settings')}
                  title="SYSTEM SETTINGS"
                  className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                    isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                  } ${
                    activeTab === 'settings' 
                      ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)] font-bold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="font-sans text-[10px] uppercase tracking-widest font-black">SETTINGS</span>}
                </button>
              )}

            </nav>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 pt-4 border-t border-[#e4e4e7] dark:border-[#27272a]">
          {!isSidebarCollapsed && (
            <div className="bg-zinc-50 dark:bg-[#18181b] border border-[#1a1a1a]/10 dark:border-white/10 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                <span className="uppercase font-bold tracking-wider">Active Staff</span>
                <span className="bg-[#d97706]/15 text-[#d97706] px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase">{currentUser.role}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="truncate">
                  <p className="text-[11px] font-bold text-zinc-900 dark:text-white truncate max-w-[100px]" title={currentUser.name}>
                    {currentUser.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsLocked(true)}
                  className="p-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-red-500 hover:text-white text-zinc-600 dark:text-zinc-300 rounded-lg transition-all cursor-pointer shrink-0"
                  title="Lock Workstation Console [F12]"
                >
                  <Lock className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Theme Toggler & Date */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'} pt-1`}>
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light')}
              className="p-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#71717a] dark:text-[#a1a1aa] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold w-full"
              title="Toggle Theme: Light / Dark / System"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  {!isSidebarCollapsed && <span className="text-[10px] uppercase font-mono tracking-wider">Dark</span>}
                </>
              ) : theme === 'light' ? (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  {!isSidebarCollapsed && <span className="text-[10px] uppercase font-mono tracking-wider">Light</span>}
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin-slow" />
                  {!isSidebarCollapsed && <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500">System</span>}
                </>
              )}
            </button>
            {!isSidebarCollapsed && (
              <span className="text-[#71717a] dark:text-[#a1a1aa] font-mono text-[10px] tabular-nums whitespace-nowrap pl-2">2026-06-26</span>
            )}
          </div>
        </div>
      </header>

      {/* RIGHT CONTENT WORKSPACE AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
        
        {/* 2. MAIN WORKSPACE */}
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
                  <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
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
                    className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold"
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
                      activeUserId={currentUser.id}
                      activeUser={currentUser.name}
                    />
                  )}

                  {activeTab === 'inventory' && (
                    <Inventory 
                      tenantId={activeTenantId} 
                      theme={theme} 
                      products={products}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
                      permissionLevel={rolePermissions[currentUser.role]?.['inventory'] || 'Admin'}
                      activeUser={currentUser.name}
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
                      permissionLevel={rolePermissions[currentUser.role]?.['history'] || 'Admin'}
                      activeUser={currentUser.name}
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
                      permissionLevel={rolePermissions[currentUser.role]?.['purchases'] || 'Admin'}
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

        {/* 3. FOOTER */}
        <footer className="h-10 bg-white dark:bg-[#1a1a1a] border-t-2 border-[#1a1a1a] dark:border-[#f8f7f4] px-6 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 shrink-0 select-none">
          <div>CORE ACCESS: {activeRole.toUpperCase()} // LEVEL 04</div>
          <div className="flex gap-6">
            <span>[F10] CASH DRAWER</span>
            <span>[F12] LOCK CONSOLE</span>
          </div>
        </footer>

      </div>

    </div>

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
