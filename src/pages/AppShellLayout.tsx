import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, Package, FileText, Sun, Moon, 
  Layers, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2, ChevronRight, Store, Percent,
  Menu, ChevronLeft, Truck, Megaphone, DollarSign, Printer, Globe, User, Users, Tag, Lock, Laptop, Key, Fingerprint, Check, Search, Home, Activity, X
} from 'lucide-react';
import { Tenant, Product, Customer, Transaction, DiscountRule, DeliveryOrder } from '../types';
import { PermissionProvider, SYSTEM_ROLES, UserWithPermissions } from '../components/Polaris/RequirePermission';

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
  }
];

export default function AppShellLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme & Layout state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'Admin' | 'Manager' | 'Cashier'>('Admin');

  // Shopify Navigation & Search States
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

  // Keep lock user in sync with currentUser when changed outside lock screen
  useEffect(() => {
    if (currentUser) {
      setSelectedLockUser(currentUser);
    }
  }, [currentUser]);

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
        root.style.backgroundColor = '#121212';
      } else {
        root.classList.remove('dark');
        root.style.backgroundColor = '#f1f2f4'; // Cool Gray Canvas to reduce eye strain
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

  // Keypad processing for locked screen
  const handleKeypadPress = (val: string) => {
    if (lockPin.length >= 4) return;
    const nextPin = lockPin + val;
    setLockPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === selectedLockUser.pin) {
        setCurrentUser(selectedLockUser);
        setIsLocked(false);
        setLockPin('');
        showToast(`Unlocked! Switched to profile ${selectedLockUser.name}`, 'success');
      } else {
        showToast('Access Denied: Incorrect PIN code', 'error');
        setLockPin('');
      }
    }
  };

  const handleBackspace = () => {
    setLockPin(prev => prev.slice(0, -1));
  };

  // Keyboard binding for hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Computed states for Shopify Omnipresent Search Bar
  const query = commandSearchQuery.toLowerCase().trim();
  
  const matchedProducts = query.length >= 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.barcode?.includes(query) ||
        p.distributor_sku?.toLowerCase().includes(query)
      )
    : [];

  const matchedCustomers = query.length >= 1
    ? customers.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query)
      )
    : [];

  const polarisUser: UserWithPermissions = {
    id: currentUser.id,
    name: currentUser.name,
    pin: currentUser.pin,
    role: SYSTEM_ROLES[currentUser.role || 'Admin']
  };

  const activePath = location.pathname;

  return (
    <PermissionProvider user={polarisUser}>
      <div className="flex h-screen overflow-hidden bg-[#f1f2f4] dark:bg-[#121212] text-zinc-800 dark:text-zinc-200">
        
        {/* 1. FIXED LEFT NAV SIDEBAR (240px wide, dark obsidian theme) */}
        <aside 
          className={`bg-[#1a1a1a] border-r border-zinc-900 flex flex-col h-full shrink-0 transition-all duration-200 ease-in-out z-20 ${
            isSidebarCollapsed ? 'w-16' : 'w-[240px]'
          }`}
        >
          {/* Header/Logo */}
          <div className="h-14 flex items-center px-4 justify-between border-b border-zinc-900 bg-[#141414] select-none">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-8 w-8 rounded-lg bg-[#008060] flex items-center justify-center text-white shrink-0 shadow-md">
                <ShoppingBag className="h-4 w-4 stroke-[2]" />
              </div>
              {!isSidebarCollapsed && (
                <div className="text-left leading-tight">
                  <span className="font-sans font-bold text-xs tracking-tight text-white block">AURA POS</span>
                  <span className="text-[8px] font-mono font-bold text-[#d97706] tracking-widest uppercase">SAAS SHELL</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-1 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-850 cursor-pointer"
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Navigation Links directly styled mirroring Shopify Polaris */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1 select-none">
            
            {/* POS REGISTER */}
            <Link
              to="/admin/register"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/register'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Store className={`h-4 w-4 shrink-0 ${activePath === '/admin/register' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>POS Register</span>}
            </Link>

            {/* PRODUCTS */}
            <Link
              to="/admin/products"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath.startsWith('/admin/products')
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Package className={`h-4 w-4 shrink-0 ${activePath.startsWith('/admin/products') ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Products Catalog</span>}
            </Link>

            {/* ORDERS / HISTORY */}
            <Link
              to="/admin/orders"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/orders'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <FileText className={`h-4 w-4 shrink-0 ${activePath === '/admin/orders' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Orders & Receipts</span>}
            </Link>

            {/* CUSTOMERS */}
            <Link
              to="/admin/customers"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/customers'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Users className={`h-4 w-4 shrink-0 ${activePath === '/admin/customers' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Customers CRM</span>}
            </Link>

            {/* PURCHASES & INTAKE */}
            <Link
              to="/admin/purchases"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/purchases'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Truck className={`h-4 w-4 shrink-0 ${activePath === '/admin/purchases' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Inventory Intake</span>}
            </Link>

            {/* MARKETING */}
            <Link
              to="/admin/marketing"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/marketing'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Megaphone className={`h-4 w-4 shrink-0 ${activePath === '/admin/marketing' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Marketing Deals</span>}
            </Link>

            {/* PRINT LABELS */}
            <Link
              to="/admin/print"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/print'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Printer className={`h-4 w-4 shrink-0 ${activePath === '/admin/print' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Print Labels</span>}
            </Link>

            {/* INTEGRATIONS */}
            <Link
              to="/admin/integrations"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/integrations'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Globe className={`h-4 w-4 shrink-0 ${activePath === '/admin/integrations' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Omnichannel Integrations</span>}
            </Link>

            {/* WEBSITE */}
            <Link
              to="/admin/website"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/website'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Layers className={`h-4 w-4 shrink-0 ${activePath === '/admin/website' ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Online Store Builder</span>}
            </Link>

          </nav>

          {/* Bottom Settings Link exactly as Shopify Admin does */}
          <div className="pt-3 border-t border-zinc-900 shrink-0 p-2.5 space-y-1 select-none bg-[#141414]">
            <Link
              to="/admin/settings"
              className={`w-full py-2 px-3 rounded-md transition-all duration-150 flex items-center gap-3 text-left font-sans text-xs font-semibold tracking-tight ${
                activePath === '/admin/settings'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
              }`}
            >
              <Fingerprint className={`h-4.5 w-4.5 shrink-0 ${activePath === '/admin/settings' ? 'text-[#d97706]' : 'text-zinc-400'}`} />
              {!isSidebarCollapsed && <span>Admin & Security Settings</span>}
            </Link>
          </div>
        </aside>

        {/* 2. MAIN WORKSPACE SCENARIO */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Top Bar / Header */}
          <header className="h-14 bg-white dark:bg-[#151518] border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-xs">
            <div className="flex items-center gap-4">
              
              {/* Tenancy dropdown switcher */}
              <div className="relative">
                <select
                  value={activeTenantId}
                  onChange={(e) => setActiveTenantId(e.target.value)}
                  className="appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-350 dark:hover:border-zinc-700 rounded-lg px-3 py-1.5 pr-8 text-xs font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-[#d97706] cursor-pointer shadow-xs min-w-[150px] sm:min-w-[190px] transition-colors"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400">
                  <RefreshCw className="h-3 w-3 animate-spin-slow" />
                </div>
              </div>

              {/* Shopify Omnipresent Search box click trigger */}
              <button
                onClick={() => setIsCommandSearchOpen(true)}
                className="hidden md:flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-750 px-3.5 py-1.5 rounded-lg text-zinc-450 dark:text-zinc-400 transition-colors text-xs text-left w-64 shadow-2xs select-none cursor-pointer"
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1">Search anything...</span>
                <kbd className="bg-zinc-200 dark:bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded-sm font-mono border border-zinc-300 dark:border-zinc-700 font-extrabold text-zinc-500">⌘K</kbd>
              </button>
            </div>

            {/* Profile Dropdown / User Switch / Lock Controls */}
            <div className="flex items-center gap-3">
              
              {/* Dark/Light mode toggle */}
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer text-zinc-500 dark:text-zinc-400"
                title="Toggle visual style"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Lock Button */}
              <button
                onClick={() => setIsLocked(true)}
                className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-500 hover:text-amber-600 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold select-none"
                title="Lock Terminal"
              >
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Lock</span>
              </button>

              {/* Employee display */}
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-850 px-2.5 py-1 rounded-lg">
                <div className="h-5 w-5 bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 font-serif italic">
                  {currentUser?.name?.[0] || 'A'}
                </div>
                <div className="text-left leading-none hidden lg:block select-none">
                  <p className="text-[10px] font-bold text-zinc-850 dark:text-zinc-100">{currentUser?.name?.split(' (')?.[0] || 'Active User'}</p>
                  <span className="text-[8px] font-mono text-[#d97706] uppercase tracking-wider font-extrabold">{currentUser?.role || 'Admin'}</span>
                </div>
              </div>

            </div>
          </header>

          {/* Core App Main Viewport */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f1f2f4] dark:bg-[#121212]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-[#008060]"></div>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest animate-pulse">Syncing Database State...</p>
              </div>
            ) : (
              <Outlet context={{
                activeTenantId,
                setActiveTenantId,
                tenants,
                products,
                customers,
                transactions,
                currentUser,
                setCurrentUser,
                users,
                setUsers,
                rolePermissions,
                setRolePermissions,
                discountRules,
                saveDiscountRules,
                incomingOrders,
                setIncomingOrders,
                theme,
                isSidebarCollapsed,
                showToast,
                fetchTenantData: () => fetchTenantData(activeTenantId),
                onLock: () => setIsLocked(true)
              }} />
            )}
          </main>

          {/* Universal Footer */}
          <footer className="h-10 bg-white dark:bg-[#111113] border-t border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-500 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Console Access: {(activeRole || 'Admin').toUpperCase()} // WORKSPACE AT {activeTenant?.name?.toUpperCase() || 'LOADING...'}</span>
            </div>
            <div className="flex gap-6 font-semibold">
              <span>[F10] CASH DRAWER</span>
              <span className="hidden md:inline">SYSTEM TIME: {currentTime || 'SYNCING...'}</span>
            </div>
          </footer>

        </div>

        {/* 3. SHOPIFY OMNIPRESENT SEARCH MODAL */}
        {isCommandSearchOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/70 backdrop-blur-xs flex items-start justify-center pt-24 px-4 z-40 animate-fade-in">
            <div className="bg-white dark:bg-[#161619] border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[460px] animate-scale-up">
              
              {/* Search Bar Input */}
              <div className="h-12 border-b border-zinc-150 dark:border-zinc-850 flex items-center px-4 gap-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                <Search className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Type to search products, customers, transactions or command settings..."
                  value={commandSearchQuery}
                  onChange={(e) => setCommandSearchQuery(e.target.value)}
                  className="flex-1 h-full bg-transparent border-none text-sm outline-none text-zinc-850 dark:text-white placeholder-zinc-400"
                />
                <button
                  onClick={() => {
                    setIsCommandSearchOpen(false);
                    setCommandSearchQuery('');
                  }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer"
                >
                  <X className="h-4 w-4 text-zinc-400 hover:text-zinc-650" />
                </button>
              </div>

              {/* Search Results Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {commandSearchQuery.trim() === "" ? (
                  <div className="text-center py-6 space-y-1.5 select-none">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-350 font-sans leading-none">Instant Omnichannel Lookup</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Type brand, client profile, order ID or barcode to jump directly</p>
                  </div>
                ) : (
                  <>
                    {/* Products matches */}
                    {matchedProducts.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Products ({matchedProducts.length})</div>
                        <div className="space-y-1">
                          {matchedProducts.slice(0, 4).map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setIsCommandSearchOpen(false);
                                setCommandSearchQuery('');
                                navigate(`/admin/products/${p.id}`);
                              }}
                              className="w-full text-left p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg flex items-center justify-between border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={p.imageUrl} alt={p.name} className="h-8 w-8 rounded-md object-cover border border-zinc-150 shrink-0" referrerPolicy="no-referrer" />
                                <div className="min-w-0 leading-tight">
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{p.name}</p>
                                  <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">{p.category} | SKU: {p.distributor_sku || 'N/A'}</p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">${p.price_per_bottle.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer matches */}
                    {matchedCustomers.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Customers CRM ({matchedCustomers.length})</div>
                        <div className="space-y-1">
                          {matchedCustomers.slice(0, 4).map(c => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setIsCommandSearchOpen(false);
                                setCommandSearchQuery('');
                                navigate(`/admin/customers`);
                              }}
                              className="w-full text-left p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg flex items-center justify-between border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors cursor-pointer"
                            >
                              <div className="min-w-0 leading-tight">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{c.name}</p>
                                <p className="text-[9px] font-mono text-zinc-400 mt-0.5">{c.email} | {c.phone}</p>
                              </div>
                              <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-bold">CLIENT</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedProducts.length === 0 && matchedCustomers.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-xs font-mono text-zinc-400 font-bold uppercase">No results found for "{commandSearchQuery}"</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Search Info Footer */}
              <div className="h-8 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between px-4 text-[9px] font-mono text-zinc-400 uppercase select-none">
                <div className="flex items-center gap-1.5">
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
                      className="h-11 w-11 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-[#d97706]/15 hover:border-[#d97706]/40 text-zinc-800 dark:text-zinc-100 text-xs font-mono flex items-center justify-center transition active:scale-95 cursor-pointer font-bold"
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
                    className="h-11 w-11 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 hover:bg-[#d97706]/15 hover:border-[#d97706]/40 text-zinc-800 dark:text-zinc-100 text-xs font-mono flex items-center justify-center transition active:scale-95 cursor-pointer font-bold"
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

        {/* 4. PREMIUM TOASTS */}
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
    </PermissionProvider>
  );
}
