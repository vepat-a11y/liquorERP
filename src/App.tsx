import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Package, FileText, Sun, Moon, 
  Layers, RefreshCw, AlertCircle, ShieldCheck, CheckCircle2, ChevronRight, Store, Percent,
  Menu, ChevronLeft, Truck, Megaphone, DollarSign, Printer, Globe, Users, Tag, Lock, Laptop
} from 'lucide-react';
import Register from './components/Register';
import Inventory from './components/Inventory';
import History from './components/History';
import Discounts from './components/Discounts';
import Purchases from './components/Purchases';
import Marketing from './components/Marketing';
import Accounting from './components/Accounting';
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

export default function App() {
  // Theme & Layout state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<
    'register' | 'inventory' | 'history' | 'discounts' | 'purchases' | 'marketing' | 'accounting' | 'print' | 'integrations' | 'settings' | 'website'
  >('register');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'Admin' | 'Manager' | 'Cashier'>('Admin');

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

  // Sync index.html root body dark/light class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#121212'; // dark ink
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8f7f4'; // warm bg
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
      
      {/* SYSTEM TOP */}
      <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#1a1a1a] dark:border-[#f8f7f4] bg-white dark:bg-[#1a1a1a] select-none shrink-0">
        <div className="font-mono font-bold uppercase tracking-wider text-xs sm:text-sm md:text-base flex items-center gap-3">
          <span>AuraPOS // CORE_SYSTEM</span>
          {activeTenant && (
            <span className="text-[10px] md:text-xs text-amber-600 dark:text-amber-400 border border-[#d97706]/40 px-2 py-0.5 rounded font-normal bg-amber-500/10 uppercase tracking-wider">
              {activeTenant.name}
            </span>
          )}
        </div>
        <div className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-4 sm:gap-6">
          <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CONNECTED
          </span>
          <span className="text-[#d97706] dark:text-amber-400 font-bold">[SECURITY: ACTIVE]</span>
          <span className="tabular-nums font-medium text-zinc-500 dark:text-zinc-400">
            {currentTime}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* 1. LEFT FIXED SIDEBAR */}
        <header className={`${isSidebarCollapsed ? 'w-16 px-2 py-4' : 'w-56 px-4 py-6'} border-r border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 flex flex-col bg-white dark:bg-[#121212] shrink-0 transition-all duration-300 justify-between h-full overflow-y-auto`}>
        <div className="space-y-6">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 pb-3">
            <div className="flex items-center gap-2">
              {!isSidebarCollapsed && (
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#d97706] dark:text-amber-400">
                  ACCESS POINTS
                </span>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className="p-1.5 rounded border border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 hover:border-[#1a1a1a] dark:hover:border-white text-zinc-400 hover:text-[#1a1a1a] dark:hover:text-white transition-all cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation links - styled vertically */}
          <div className="space-y-1.5">
            <nav className="flex flex-col gap-1 text-xs font-semibold tracking-tight">
              
              {/* Register */}
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
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">01. REGISTER</span>}
              </button>

              {/* Products */}
              <button
                onClick={() => setActiveTab('inventory')}
                title="02. PRODUCT_CATALOG"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'inventory' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Package className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">02. PRODUCT_CATALOG</span>}
              </button>

              {/* Reports */}
              <button
                onClick={() => setActiveTab('history')}
                title="03. ANALYTICS_DB"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'history' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">03. ANALYTICS_DB</span>}
              </button>

              {/* Discounts */}
              <button
                onClick={() => setActiveTab('discounts')}
                title="04. OFFERS_CAMPAIGNS"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'discounts' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Percent className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">04. OFFERS_CAMPAIGNS</span>}
              </button>

              {/* Purchases */}
              <button
                onClick={() => setActiveTab('purchases')}
                title="05. LOGISTICS_HUB"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'purchases' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Truck className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">05. LOGISTICS_HUB</span>}
              </button>

              {/* Marketing */}
              <button
                onClick={() => setActiveTab('marketing')}
                title="06. PUBLIC_MARKETING"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'marketing' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">06. PUBLIC_MARKETING</span>}
              </button>

              {/* Accounting */}
              <button
                onClick={() => setActiveTab('accounting')}
                title="07. FINANCE_AUDIT"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'accounting' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <DollarSign className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">07. FINANCE_AUDIT</span>}
              </button>

              {/* Print Material */}
              <button
                onClick={() => setActiveTab('print')}
                title="08. PRINT_CORE"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'print' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Printer className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">08. PRINT_CORE</span>}
              </button>

              {/* Integrations */}
              <button
                onClick={() => setActiveTab('integrations')}
                title="09. CLOUD_INTEGRATIONS"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'integrations' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Globe className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">09. CLOUD_INTEGRATIONS</span>}
              </button>

              {/* Online Store Website Builder */}
              <button
                onClick={() => setActiveTab('website')}
                title="10. ONLINE_PORTAL"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'website' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Laptop className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">10. ONLINE_PORTAL</span>}
              </button>

              {/* Settings & User Rights */}
              <button
                onClick={() => setActiveTab('settings')}
                title="11. SYSTEM_SETTINGS"
                className={`w-full py-3 px-3 transition-all duration-200 cursor-pointer text-left flex items-center gap-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  activeTab === 'settings' 
                    ? 'bg-white dark:bg-[#1c1c1c] text-[#1a1a1a] dark:text-white font-bold border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:shadow-[3px_3px_0px_rgba(248,247,244,1)]' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-[#1c1c1c] hover:text-[#1a1a1a] dark:hover:text-white border border-transparent hover:border-[#1a1a1a] dark:hover:border-white hover:shadow-[3px_3px_0px_rgba(26,26,26,1)] dark:hover:shadow-[3px_3px_0px_rgba(248,247,244,1)]'
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                {!isSidebarCollapsed && <span className="font-mono text-[11px] uppercase tracking-wider">11. SYSTEM_SETTINGS</span>}
              </button>

            </nav>
          </div>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 pt-4 border-t border-[#e4e4e7] dark:border-[#27272a]">
          {!isSidebarCollapsed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-[#f4f4f5] dark:bg-[#18181b] px-3 py-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] text-[11px] font-medium">
                <span className="text-[#71717a] dark:text-[#a1a1aa]">Terminal</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></div>
                  <span className="text-[#09090b] dark:text-[#f4f4f5] font-bold">01</span>
                </div>
              </div>
            </div>
          )}

          {/* Theme Toggler & Date */}
          <div className={`flex items-center ${isSidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'} pt-1`}>
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#18181b] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#71717a] dark:text-[#a1a1aa] transition-all cursor-pointer flex items-center justify-center"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {!isSidebarCollapsed && (
              <span className="text-[#71717a] dark:text-[#a1a1aa] font-mono text-[11px] tabular-nums">2026-06-26</span>
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
              {activeRole === 'Cashier' && ['inventory', 'purchases', 'accounting', 'settings'].includes(activeTab) ? (
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
                    />
                  )}

                  {activeTab === 'inventory' && (
                    <Inventory 
                      tenantId={activeTenantId} 
                      theme={theme} 
                      products={products}
                      refreshData={() => fetchTenantData(activeTenantId)}
                      showToast={showToast}
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

                  {activeTab === 'accounting' && (
                    <Accounting
                      transactions={transactions}
                      products={products}
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
                      activeRole={activeRole}
                      onChangeRole={setActiveRole}
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
