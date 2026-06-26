import React, { useState } from 'react';
import { 
  Globe, Cpu, Check, AlertCircle, ShoppingCart, RefreshCw, 
  Layers, ShieldAlert, Store, Eye, Clock, Phone, MapPin, 
  ChevronRight, ArrowRight, ClipboardList, Settings, Sparkles, CheckCircle2,
  DollarSign, Database, FileSpreadsheet, Link2, Unlink2, Activity, Zap
} from 'lucide-react';
import { Product, DeliveryOrder, Transaction } from '../types';

interface IntegrationsProps {
  tenantId: string;
  products: Product[];
  transactions: Transaction[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  incomingOrders: DeliveryOrder[];
  setIncomingOrders: React.Dispatch<React.SetStateAction<DeliveryOrder[]>>;
}

export default function Integrations({ 
  tenantId, 
  products, 
  transactions,
  refreshData, 
  showToast,
  incomingOrders,
  setIncomingOrders
}: IntegrationsProps) {
  
  // Tab-state inside integrations page
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'configs' | 'quickbooks'>('orders');

  // Integrations configuration states
  const [integrations, setIntegrations] = useState([
    { id: 'uber', name: 'UberEats', enabled: true, logo: '🏍️', apiConnected: true, ordersProcessed: 42, storeId: 'uber_store_obsidian_01' },
    { id: 'doordash', name: 'DoorDash', enabled: true, logo: '🎯', apiConnected: true, ordersProcessed: 31, storeId: 'dd_obsidian_downtown' },
    { id: 'grubhub', name: 'GrubHub', enabled: false, logo: '🍔', apiConnected: false, storeId: '' },
    { id: 'instacart', name: 'Instacart', enabled: true, logo: '🥕', apiConnected: true, ordersProcessed: 18, storeId: 'instacart_obsidian_hq' },
    { id: 'website', name: 'Own Shopify Website', enabled: true, logo: '🌐', apiConnected: true, ordersProcessed: 124, storeId: 'obsidian-vintage.aura.shop' }
  ]);

  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'All' | 'UberEats' | 'DoorDash' | 'GrubHub' | 'Instacart' | 'Website Instore Pickup' | 'Website Delivery'>('All');

  // QuickBooks Online Integration states
  const [qboConnected, setQboConnected] = useState<boolean>(true);
  const [qboClientId, setQboClientId] = useState<string>('sb-aurapos-client-94839');
  const [qboClientSecret, setQboClientSecret] = useState<string>('************************************');
  const [qboEnv, setQboEnv] = useState<'sandbox' | 'production'>('sandbox');
  
  // Chart of Accounts mappings
  const [qboAccounts, setQboAccounts] = useState({
    income: '4010 - Beverage Product Sales',
    cogs: '5010 - Cost of Beverage Goods Sold',
    asset: '1210 - Liquor/Wine Inventory Asset',
    bank: '1010 - Operating Bank Checking'
  });

  // Real-time synchronization Logs
  const [qboLogs, setQboLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'sales' | 'purchases' | 'discounts' | 'inventory';
    subtotal: number;
    status: 'Success' | 'Error';
    details: string;
  }>>([
    {
      id: 'QBS-10823',
      timestamp: '2026-06-26 12:45:11',
      type: 'sales',
      subtotal: transactions.reduce((sum, t) => sum + t.total, 0) || 540.25,
      status: 'Success',
      details: 'Created QBO SalesReceipt matching daily checkout transactions. Balanced Dr checking / Cr product sales.'
    },
    {
      id: 'QBB-38491',
      timestamp: '2026-06-25 18:12:04',
      type: 'purchases',
      subtotal: 1200.00,
      status: 'Success',
      details: 'Created QBO Vendor Bill mapping warehouse purchase order from Southern Glazer\'s Wine.'
    },
    {
      id: 'QBD-49230',
      timestamp: '2026-06-25 18:12:05',
      type: 'discounts',
      subtotal: 45.00,
      status: 'Success',
      details: 'Synced promotional rule claims matching discount rule claims to QBO Discount line items.'
    }
  ]);

  const [isSyncingSales, setIsSyncingSales] = useState(false);
  const [isSyncingPurchases, setIsSyncingPurchases] = useState(false);
  const [isSyncingDiscounts, setIsSyncingDiscounts] = useState(false);
  const [isSyncingInventory, setIsSyncingInventory] = useState(false);

  const handleToggle = (id: string) => {
    setIntegrations(prev => prev.map(channel => {
      if (channel.id === id) {
        const nextState = !channel.enabled;
        showToast(`${channel.name} integration ${nextState ? 'ENABLED' : 'DISABLED'}!`, 'info');
        return { ...channel, enabled: nextState, apiConnected: nextState };
      }
      return channel;
    }));
  };

  // 3-Stage Order state progress:
  // Step 1: Staff clicks "Accept Order" -> status becomes 'Accepted'
  // Step 2: Staff clicks "Mark Ready & Deduct Stock" -> deducts stock, status becomes 'Processed'
  
  const handleAcceptOrder = (orderId: string) => {
    setIncomingOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        showToast(`Order ${orderId} Accepted! Preparation list sent to kitchen.`, 'success');
        return { ...o, status: 'Accepted' as any }; // custom middle state
      }
      return o;
    }));
  };

  const handleProcessDeliveryOrder = async (orderId: string) => {
    const order = incomingOrders.find(o => o.id === orderId);
    if (!order) return;

    try {
      // Loop over items and decrease stock counts using negative receiving!
      for (const item of order.items) {
        const prod = products.find(p => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
        const finalId = prod ? prod.id : item.productId;
        
        if (!finalId) continue;

        // Perform stock deduction via receiving endpoint with negative looseBottles
        await fetch(`/api/products/${finalId}/receive?tenant_id=${tenantId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cases: 0,
            looseBottles: -item.qty // Deduct stock!
          })
        });
      }

      setIncomingOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return { ...o, status: 'Processed' };
        }
        return o;
      }));

      showToast(`Order ${orderId} finalized. Stock successfully deducted.`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(`Error updating stock: ${err.message}`, 'error');
    }
  };

  const handleSyncSales = () => {
    if (!qboConnected) {
      showToast('QuickBooks Online API is disconnected. Please authorize first.', 'error');
      return;
    }
    setIsSyncingSales(true);
    setTimeout(() => {
      const salesTotal = transactions.reduce((sum, t) => sum + t.total, 0);
      const taxTotal = transactions.reduce((sum, t) => sum + (t.tax || 0), 0);
      const newLog = {
        id: `QBS-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'sales' as const,
        subtotal: salesTotal || 350.00,
        status: 'Success' as const,
        details: `Synced daily sales report. Total Sales: $${salesTotal.toFixed(2)}, Tax: $${taxTotal.toFixed(2)}. Balanced checking (${qboAccounts.bank}) and product sales (${qboAccounts.income}) accounts.`
      };
      setQboLogs(prev => [newLog, ...prev]);
      setIsSyncingSales(false);
      showToast('Daily sales ledger successfully synchronized to QuickBooks Online!', 'success');
    }, 1200);
  };

  const handleSyncPurchases = () => {
    if (!qboConnected) {
      showToast('QuickBooks Online API is disconnected. Please authorize first.', 'error');
      return;
    }
    setIsSyncingPurchases(true);
    setTimeout(() => {
      const newLog = {
        id: `QBB-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'purchases' as const,
        subtotal: 820.00,
        status: 'Success' as const,
        details: `Synced warehouse item purchases as Bills to QBO Accounts Payable against inventory asset (${qboAccounts.asset}).`
      };
      setQboLogs(prev => [newLog, ...prev]);
      setIsSyncingPurchases(false);
      showToast('Vendor purchase bills successfully synchronized to QuickBooks Online!', 'success');
    }, 1200);
  };

  const handleSyncDiscounts = () => {
    if (!qboConnected) {
      showToast('QuickBooks Online API is disconnected. Please authorize first.', 'error');
      return;
    }
    setIsSyncingDiscounts(true);
    setTimeout(() => {
      const newLog = {
        id: `QBD-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'discounts' as const,
        subtotal: 35.00,
        status: 'Success' as const,
        details: `Synced coupon discounts as offset deduction line-items. Debited Sales Discounts, credited Accounts Receivable.`
      };
      setQboLogs(prev => [newLog, ...prev]);
      setIsSyncingDiscounts(false);
      showToast('Discounts and coupon credits successfully synchronized to QuickBooks Online!', 'success');
    }, 1200);
  };

  const handleSyncInventory = () => {
    if (!qboConnected) {
      showToast('QuickBooks Online API is disconnected. Please authorize first.', 'error');
      return;
    }
    setIsSyncingInventory(true);
    setTimeout(() => {
      const valuation = products.reduce((sum, p) => {
        const cost = p.cost_per_unit || (p.price_per_bottle ? p.price_per_bottle * 0.5 : 5.00);
        const bottles = p.inventory_bottles || 0;
        return sum + (cost * bottles);
      }, 0);
      const newLog = {
        id: `QBI-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'inventory' as const,
        subtotal: valuation,
        status: 'Success' as const,
        details: `Calculated current store beverage inventory valuation: $${valuation.toFixed(2)}. Adjusted QBO Inventory Asset (${qboAccounts.asset}) with balanced equity offset.`
      };
      setQboLogs(prev => [newLog, ...prev]);
      setIsSyncingInventory(false);
      showToast('Inventory valuation successfully synchronized to QuickBooks Online!', 'success');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* Top Header Controls bar */}
      <div className="h-16 px-6 border-b border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#09090b] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-indigo-500" />
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Omnichannel Integrations Dashboard
            </h2>
            <p className="text-[10px] text-zinc-400">Sync third-party marketplaces and online orders with your POS inventory</p>
          </div>
        </div>

        {/* View togglers */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Fulfillment Console ({incomingOrders.filter(o => o.status !== 'Processed').length} Active)
          </button>
          
          <button
            onClick={() => setActiveSubTab('configs')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'configs'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Channel Configurations
          </button>

          <button
            onClick={() => setActiveSubTab('quickbooks')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'quickbooks'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            QuickBooks Online
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {activeSubTab === 'quickbooks' ? (
          /* QUICKBOOKS ONLINE INTEGRATION PANEL */
          <div className="space-y-6 max-w-5xl">
            
            {/* Connection Banner */}
            <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-sans font-black text-lg shadow-md shrink-0">
                    qb
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">
                      QuickBooks Online Sync Module
                    </h3>
                    <p className="text-xs text-zinc-400">Direct ledger integration for daily sales, vendor bills, tax liability, and inventory assets</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 ${
                    qboConnected 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${qboConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    {qboConnected ? 'QBO INSTANCE CONNECTED' : 'DISCONNECTED'}
                  </span>

                  <button
                    onClick={() => {
                      setQboConnected(prev => !prev);
                      showToast(qboConnected ? 'QuickBooks Online session terminated.' : 'QuickBooks Online sandbox authorized successfully!', qboConnected ? 'info' : 'success');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      qboConnected
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    }`}
                  >
                    {qboConnected ? 'Disconnect' : 'Connect QuickBooks'}
                  </button>
                </div>
              </div>

              {/* API Credentials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">QuickBooks Client ID</label>
                  <input
                    type="text"
                    value={qboClientId}
                    onChange={(e) => setQboClientId(e.target.value)}
                    placeholder="Enter Client ID"
                    className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-mono text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">QuickBooks Client Secret</label>
                  <input
                    type="password"
                    value={qboClientSecret}
                    onChange={(e) => setQboClientSecret(e.target.value)}
                    placeholder="Enter Client Secret"
                    className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-mono text-zinc-700 dark:text-zinc-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">Authorization Realm Environment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQboEnv('sandbox')}
                      className={`py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        qboEnv === 'sandbox'
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Sandbox
                    </button>
                    <button
                      type="button"
                      onClick={() => setQboEnv('production')}
                      className={`py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                        qboEnv === 'production'
                          ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Production
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Account Mapping Panel */}
              <div className="lg:col-span-1 bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Database className="h-4.5 w-4.5 text-zinc-400" />
                  <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                    Chart of Accounts Mapping
                  </h4>
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Map double-entry transactions from AuraPOS ledger points to the correct corresponding chart accounts inside QBO.
                </p>

                <div className="space-y-3.5 pt-2 text-xs">
                  <div>
                    <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Sales Income Account</label>
                    <input
                      type="text"
                      value={qboAccounts.income}
                      onChange={(e) => setQboAccounts(prev => ({ ...prev, income: e.target.value }))}
                      className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-semibold text-zinc-700 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Cost of Goods Sold (COGS)</label>
                    <input
                      type="text"
                      value={qboAccounts.cogs}
                      onChange={(e) => setQboAccounts(prev => ({ ...prev, cogs: e.target.value }))}
                      className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-semibold text-zinc-700 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Inventory Asset Account</label>
                    <input
                      type="text"
                      value={qboAccounts.asset}
                      onChange={(e) => setQboAccounts(prev => ({ ...prev, asset: e.target.value }))}
                      className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-semibold text-zinc-700 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Checking / Deposit Bank Account</label>
                    <input
                      type="text"
                      value={qboAccounts.bank}
                      onChange={(e) => setQboAccounts(prev => ({ ...prev, bank: e.target.value }))}
                      className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-semibold text-zinc-700 dark:text-zinc-200"
                    />
                  </div>

                  <button
                    onClick={() => showToast('Chart of Accounts ledger configuration saved!', 'success')}
                    className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-3 rounded-xl text-xs font-bold hover:opacity-90 mt-4 cursor-pointer"
                  >
                    Save Mappings
                  </button>
                </div>
              </div>

              {/* Action Synchronizers List */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Real-time sync controllers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Sales report synchronizer card */}
                  <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                          Daily Sales & Taxes
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Computes standard sales subtotal, payment divisions, and municipal sales tax liability to generate a structured SalesReceipt in QBO.
                      </p>
                      
                      <div className="bg-[#fafafa] dark:bg-[#18181b] p-2.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block">Ready for Sync</span>
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          <span>Today's Total:</span>
                          <span>${transactions.reduce((acc, t) => acc + t.total, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncSales}
                      disabled={isSyncingSales}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isSyncingSales ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing Sync...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Sync Sales & Taxes
                        </>
                      )}
                    </button>
                  </div>

                  {/* Purchases POs synchronizer card */}
                  <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4.5 w-4.5 text-sky-500" />
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                          Vendor Purchase Bills
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Pulls warehouse purchase history and files vendor invoice records directly to accounts payable.
                      </p>
                      
                      <div className="bg-[#fafafa] dark:bg-[#18181b] p-2.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block">Pending Invoices</span>
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          <span>Unresolved Bills:</span>
                          <span>$820.00</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncPurchases}
                      disabled={isSyncingPurchases}
                      className="w-full bg-zinc-900 dark:bg-zinc-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isSyncingPurchases ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Sending POs...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Sync Vendor Bills
                        </>
                      )}
                    </button>
                  </div>

                  {/* Discounts & Promos synchronizer card */}
                  <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4.5 w-4.5 text-indigo-500" />
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                          Promo Rules & Discounts
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Matches active discount rule claims to QBO Discount line items to maintain correct net margins.
                      </p>
                      
                      <div className="bg-[#fafafa] dark:bg-[#18181b] p-2.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block">Active Promos</span>
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          <span>Tally Rules Claimed:</span>
                          <span>4 Campaign Runs</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncDiscounts}
                      disabled={isSyncingDiscounts}
                      className="w-full bg-zinc-900 dark:bg-zinc-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isSyncingDiscounts ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Syncing discounts...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Sync Promo Discounts
                        </>
                      )}
                    </button>
                  </div>

                  {/* Inventory valuation synchronizer card */}
                  <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Database className="h-4.5 w-4.5 text-amber-500" />
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                          Inventory Asset Worth
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Calculates current catalog valuation using unit purchase cost * loose bottle stock to align the inventory asset sheet.
                      </p>
                      
                      <div className="bg-[#fafafa] dark:bg-[#18181b] p-2.5 rounded-xl space-y-1">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase block">Asset Worth (Calculated)</span>
                        <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          <span>Current Valuation:</span>
                          <span>
                            ${products.reduce((sum, p) => {
                              const cost = p.cost_per_unit || (p.price_per_bottle ? p.price_per_bottle * 0.5 : 5.00);
                              return sum + (cost * (p.inventory_bottles || 0));
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncInventory}
                      disabled={isSyncingInventory}
                      className="w-full bg-zinc-900 dark:bg-zinc-800 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      {isSyncingInventory ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Computing valuation...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Sync Asset Valuation
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>

            </div>

            {/* QBO Sync Feed Terminal */}
            <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#fafafa] dark:bg-zinc-900/10 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  <Activity className="h-4.5 w-4.5 text-zinc-500" />
                  QuickBooks Online Integration Logs
                </div>
                <span className="text-[9px] font-mono text-zinc-400">Security-logged transmission audits</span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {qboLogs.map(log => (
                  <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-extrabold text-zinc-400">{log.id}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                          log.type === 'sales' ? 'bg-emerald-500/10 text-emerald-500' :
                          log.type === 'purchases' ? 'bg-sky-500/10 text-sky-500' :
                          log.type === 'discounts' ? 'bg-indigo-500/10 text-indigo-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {log.type} sync
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                        {log.details}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-zinc-400 uppercase font-bold">Ledger Amount</p>
                      <p className="font-mono font-extrabold text-sm text-zinc-900 dark:text-white">
                        ${log.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : activeSubTab === 'configs' ? (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-xs text-amber-700 dark:text-amber-500">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Third-Party Marketplace API Gateway</p>
                <p>When channels are toggled ON, the system starts a secure real-time listener to ingest incoming orders. These automatically appear in the Fulfillment tab where inventory is automatically deducted upon ready confirmation.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map(channel => (
                <div 
                  key={channel.id}
                  className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-xl block shadow-sm">{channel.logo}</span>
                      <div>
                        <h4 className="font-extrabold text-xs text-zinc-900 dark:text-white">{channel.name}</h4>
                        <p className="text-[9px] text-zinc-400 font-mono">
                          {channel.enabled ? '● Channel Connected' : '○ Offline'}
                        </p>
                      </div>
                    </div>

                    {/* IOS switch */}
                    <button
                      onClick={() => handleToggle(channel.id)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                        channel.enabled ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full shadow transition-all ${
                        channel.enabled ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white dark:bg-zinc-400'
                      }`} />
                    </button>
                  </div>

                  {channel.enabled && (
                    <div className="pt-3 border-t border-zinc-50 dark:border-zinc-900 space-y-3 text-[10px] animate-slide-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-zinc-400 font-bold block mb-1">Integration Store Key</label>
                          <input
                            type="text"
                            placeholder="Store Identifier"
                            value={channel.storeId || 'obsidian_auto_v1'}
                            disabled
                            className="w-full font-mono bg-zinc-50 dark:bg-zinc-900 p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-zinc-400 font-bold block mb-1">Incoming Webhook</label>
                          <input
                            type="text"
                            placeholder="Webhook Secret"
                            value="https://api.aurapos.com/v1/webhook"
                            disabled
                            className="w-full font-mono bg-zinc-50 dark:bg-zinc-900 p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 p-2 rounded-lg">
                        <span>Synced to inventory checklist</span>
                        <span>Processed: <strong>{channel.ordersProcessed || 0}</strong> orders</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* fulfillment LIVE ORDERS TILES VIEW */
          <div className="space-y-6">
            
            {/* Platform filter tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-900 pb-3">
              {[
                { id: 'All', label: 'All Channels', count: incomingOrders.length },
                { id: 'UberEats', label: 'UberEats 🏍️', count: incomingOrders.filter(o => o.platform === 'UberEats').length },
                { id: 'DoorDash', label: 'DoorDash 🎯', count: incomingOrders.filter(o => o.platform === 'DoorDash').length },
                { id: 'Instacart', label: 'Instacart 🥕', count: incomingOrders.filter(o => o.platform === 'Instacart').length },
                { id: 'Website Instore Pickup', label: 'Website Pickup 📦', count: incomingOrders.filter(o => o.platform === 'Website Instore Pickup').length },
                { id: 'Website Delivery', label: 'Website Delivery 🏠', count: incomingOrders.filter(o => o.platform === 'Website Delivery').length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedPlatformFilter(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    selectedPlatformFilter === tab.id
                      ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow'
                      : 'bg-white dark:bg-[#121214] text-zinc-500 border border-zinc-200/60 dark:border-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                    selectedPlatformFilter === tab.id
                      ? 'bg-white/20 text-white dark:bg-zinc-900 dark:text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders Feed layout */}
            {incomingOrders.filter(o => selectedPlatformFilter === 'All' || o.platform === selectedPlatformFilter).length === 0 ? (
              <div className="h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                <ClipboardList className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs font-bold text-zinc-400">No active orders matching this channel filter</p>
                <p className="text-[10px] text-zinc-400">Place an order from the simulated "Online Store" tab to see it appear live here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {incomingOrders
                  .filter(o => selectedPlatformFilter === 'All' || o.platform === selectedPlatformFilter)
                  .map(order => {
                    // Match icons
                    const getIcon = () => {
                      if (order.platform === 'UberEats') return '🏍️';
                      if (order.platform === 'DoorDash') return '🎯';
                      if (order.platform === 'Instacart') return '🥕';
                      if (order.platform === 'Website Instore Pickup') return '📦';
                      return '🏠';
                    };

                    return (
                      <div 
                        key={order.id}
                        className={`bg-white dark:bg-[#121214] border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                          order.status === 'Processed'
                            ? 'border-zinc-100 dark:border-zinc-900/60 opacity-70'
                            : order.status === 'Accepted'
                            ? 'border-indigo-500/40 ring-1 ring-indigo-500/10'
                            : 'border-amber-500/30'
                        }`}
                      >
                        {/* Order Header Card */}
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getIcon()}</span>
                            <div>
                              <span className="font-mono font-bold text-[10px] uppercase text-zinc-600 dark:text-zinc-300">
                                {order.id}
                              </span>
                              <p className="text-[9px] text-zinc-400 font-bold">{order.platform}</p>
                            </div>
                          </div>

                          <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            order.status === 'Processed' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : order.status === 'Accepted'
                              ? 'bg-indigo-500/10 text-indigo-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {order.status === 'Processed' 
                              ? 'Processed' 
                              : order.status === 'Accepted'
                              ? 'Preparing' 
                              : 'Awaiting Action'}
                          </span>
                        </div>

                        {/* Customer & product details */}
                        <div className="p-4 flex-1 space-y-3.5 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <Store className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                              {order.customer}
                            </p>
                            {order.phone && (
                              <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                                <Phone className="h-3 w-3 shrink-0" />
                                {order.phone}
                              </p>
                            )}
                            {order.address && (
                              <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {order.address}
                              </p>
                            )}
                          </div>

                          {/* List of ordered items */}
                          <div className="space-y-1.5 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-900">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Order Items Checklist</p>
                            <div className="space-y-1">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                                  <span>{it.productName}</span>
                                  <span className="font-mono text-zinc-400">x{it.qty}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Order Footer Actions */}
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between text-xs shrink-0">
                          <div>
                            <p className="text-[9px] text-zinc-400 uppercase font-bold leading-none">Order Value</p>
                            <p className="font-mono font-black text-sm text-zinc-900 dark:text-white pt-1">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>

                          {order.status === 'Pending' && (
                            <button
                              onClick={() => handleAcceptOrder(order.id)}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                            >
                              Accept Order
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}

                          {order.status === 'Accepted' && (
                            <button
                              onClick={() => handleProcessDeliveryOrder(order.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                            >
                              Deduct & Complete
                              <ArrowRight className="h-3 w-3 animate-pulse" />
                            </button>
                          )}

                          {order.status === 'Processed' && (
                            <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 select-none">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Ready
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
