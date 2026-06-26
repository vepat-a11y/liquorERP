import React, { useState } from 'react';
import { 
  Globe, Cpu, Check, AlertCircle, ShoppingCart, RefreshCw, 
  Layers, ShieldAlert, Store, Eye, Clock, Phone, MapPin, 
  ChevronRight, ArrowRight, ClipboardList, Settings, Sparkles, CheckCircle2
} from 'lucide-react';
import { Product, DeliveryOrder } from '../types';

interface IntegrationsProps {
  tenantId: string;
  products: Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  incomingOrders: DeliveryOrder[];
  setIncomingOrders: React.Dispatch<React.SetStateAction<DeliveryOrder[]>>;
}

export default function Integrations({ 
  tenantId, 
  products, 
  refreshData, 
  showToast,
  incomingOrders,
  setIncomingOrders
}: IntegrationsProps) {
  
  // Tab-state inside integrations page
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'configs'>('orders');

  // Integrations configuration states
  const [integrations, setIntegrations] = useState([
    { id: 'uber', name: 'UberEats', enabled: true, logo: '🏍️', apiConnected: true, ordersProcessed: 42, storeId: 'uber_store_obsidian_01' },
    { id: 'doordash', name: 'DoorDash', enabled: true, logo: '🎯', apiConnected: true, ordersProcessed: 31, storeId: 'dd_obsidian_downtown' },
    { id: 'grubhub', name: 'GrubHub', enabled: false, logo: '🍔', apiConnected: false, storeId: '' },
    { id: 'instacart', name: 'Instacart', enabled: true, logo: '🥕', apiConnected: true, ordersProcessed: 18, storeId: 'instacart_obsidian_hq' },
    { id: 'website', name: 'Own Shopify Website', enabled: true, logo: '🌐', apiConnected: true, ordersProcessed: 124, storeId: 'obsidian-vintage.aura.shop' }
  ]);

  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'All' | 'UberEats' | 'DoorDash' | 'GrubHub' | 'Instacart' | 'Website Instore Pickup' | 'Website Delivery'>('All');

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
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {activeSubTab === 'configs' ? (
          /* CONFIGURATION VIEW */
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
