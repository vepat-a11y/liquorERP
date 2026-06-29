import React, { useState } from 'react';
import { Truck, Plus, CheckCircle, Search, ClipboardList, RefreshCw, Trash2, Calendar } from 'lucide-react';
import { Product } from '../types';

interface PurchasesProps {
  tenantId: string;
  products: Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  permissionLevel?: string;
}

interface PurchaseOrder {
  id: string;
  vendor: string;
  status: 'Pending' | 'Received';
  createdAt: string;
  items: {
    productId: string;
    productName: string;
    cases: number;
    looseBottles: number;
    cost_per_unit: number;
  }[];
  totalCost: number;
}

export default function Purchases({ tenantId, products, refreshData, showToast, permissionLevel = 'Admin' }: PurchasesProps) {
  const isReadOnly = permissionLevel === 'Read Only';
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`aura_pos_pos_${tenantId}`);
    if (saved) return JSON.parse(saved);
    
    // Default mock data that relates directly to the existing products
    return [
      {
        id: 'PO-2026-001',
        vendor: "Southern Glazer's Wine & Spirits",
        status: 'Received',
        createdAt: '2026-06-20T10:30:00Z',
        items: [
          {
            productId: products[0]?.id || '1',
            productName: products[0]?.name || 'Premium Cabernet Sauvignon',
            cases: 5,
            looseBottles: 0,
            cost_per_unit: products[0]?.cost_per_unit || 14.99
          }
        ],
        totalCost: (products[0]?.cost_per_unit || 14.99) * 5 * (products[0]?.bottles_per_case || 12)
      },
      {
        id: 'PO-2026-002',
        vendor: 'Allied Beverage Group',
        status: 'Pending',
        createdAt: '2026-06-25T14:15:00Z',
        items: [
          {
            productId: products[1]?.id || '2',
            productName: products[1]?.name || 'Craft Double IPA 6-Pack',
            cases: 10,
            looseBottles: 12,
            cost_per_unit: products[1]?.cost_per_unit || 8.50
          }
        ],
        totalCost: (products[1]?.cost_per_unit || 8.50) * (10 * (products[1]?.bottles_per_case || 6) + 12)
      }
    ];
  });

  const savePOs = (newOrders: PurchaseOrder[]) => {
    setPurchaseOrders(newOrders);
    localStorage.setItem(`aura_pos_pos_${tenantId}`, JSON.stringify(newOrders));
  };

  const [isCreating, setIsCreating] = useState(false);
  const [newPOVendor, setNewPOVendor] = useState('');
  const [newPOItems, setNewPOItems] = useState<{
    productId: string;
    cases: number;
    looseBottles: number;
    cost_per_unit: number;
  }[]>([]);

  // Selected item addition form inside PO Creator
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addCases, setAddCases] = useState(0);
  const [addLooseBottles, setAddLooseBottles] = useState(0);
  const [addCost, setAddCost] = useState(0);

  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setAddCost(prod.cost_per_unit || 0);
    }
  };

  const addItemToNewPO = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (addCases === 0 && addLooseBottles === 0) {
      showToast('Please specify a positive quantity (cases or bottles)', 'error');
      return;
    }

    setNewPOItems(prev => [
      ...prev,
      {
        productId: selectedProductId,
        cases: addCases,
        looseBottles: addLooseBottles,
        cost_per_unit: addCost
      }
    ]);

    // reset
    setSelectedProductId('');
    setAddCases(0);
    setAddLooseBottles(0);
    setAddCost(0);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPOVendor.trim()) {
      showToast('Please specify a vendor name', 'error');
      return;
    }
    if (newPOItems.length === 0) {
      showToast('Please add at least one product item to the PO', 'error');
      return;
    }

    // Calculate total cost
    let totalCost = 0;
    const items = newPOItems.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      const totalQuantity = (item.cases * prod.bottles_per_case) + item.looseBottles;
      const itemCost = totalQuantity * item.cost_per_unit;
      totalCost += itemCost;

      return {
        productId: item.productId,
        productName: prod.name,
        cases: item.cases,
        looseBottles: item.looseBottles,
        cost_per_unit: item.cost_per_unit
      };
    });

    const newPO: PurchaseOrder = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      vendor: newPOVendor,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      items,
      totalCost
    };

    savePOs([newPO, ...purchaseOrders]);
    setIsCreating(false);
    setNewPOVendor('');
    setNewPOItems([]);
    showToast(`Purchase Order ${newPO.id} created successfully!`, 'success');
  };

  const handleReceivePO = async (poId: string) => {
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot receive purchase order shipments", "error");
      return;
    }
    const po = purchaseOrders.find(o => o.id === poId);
    if (!po) return;
    if (po.status === 'Received') return;

    try {
      // Loop over items and perform receiving
      for (const item of po.items) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod) continue;

        // Perform receiving via standard API endpoint
        const res = await fetch(`/api/products/${item.productId}/receive?tenant_id=${tenantId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cases: item.cases,
            looseBottles: item.looseBottles
          })
        });

        if (!res.ok) {
          throw new Error(`Failed to receive product ${item.productName}`);
        }
      }

      // Update PO state to Received
      const updatedPOs = purchaseOrders.map(o => {
        if (o.id === poId) {
          return { ...o, status: 'Received' as const };
        }
        return o;
      });

      savePOs(updatedPOs);
      showToast(`Purchase Order ${poId} marked as RECEIVED. Inventory has been updated!`, 'success');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePO = (poId: string) => {
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot delete purchase orders", "error");
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete PO ${poId}?`);
    if (confirmed) {
      savePOs(purchaseOrders.filter(o => o.id !== poId));
      showToast(`Purchase Order ${poId} deleted`, 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      
      {/* Upper Action Bar */}
      <div className="h-16 px-6 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-sm font-bold text-[#09090b] dark:text-white uppercase tracking-wider">
            Purchases & Receiving
          </h2>
        </div>
        <button
          onClick={() => {
            if (isReadOnly) {
              showToast("Access Denied: Read Only profiles cannot create purchase orders", "error");
              return;
            }
            setIsCreating(true);
          }}
          disabled={isReadOnly}
          className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          New Purchase Order
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isCreating ? (
          <form onSubmit={handleCreatePO} className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Create Purchase Order</h3>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Distributor / Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={newPOVendor}
                  onChange={(e) => setNewPOVendor(e.target.value)}
                  placeholder="e.g. Southern Glazer's Wine & Spirits"
                  className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white transition-all"
                />
              </div>

              {/* Add Items Sub-form */}
              <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/10">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Add Item To Order
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleSelectProduct(e.target.value)}
                      className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Case size: {p.bottles_per_case})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Unit wholesale cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={addCost}
                      onChange={(e) => setAddCost(Number(e.target.value))}
                      className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Cases Ordered
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addCases}
                      onChange={(e) => setAddCases(Number(e.target.value))}
                      className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Loose Bottles Ordered
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addLooseBottles}
                      onChange={(e) => setAddLooseBottles(Number(e.target.value))}
                      className="w-full text-xs bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItemToNewPO}
                  className="w-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl py-2 text-xs font-semibold"
                >
                  Add Item To PO
                </button>
              </div>

              {/* Items List inside New PO */}
              {newPOItems.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Purchase Order Items ({newPOItems.length})
                  </span>
                  <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                    {newPOItems.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId)!;
                      const totalBottles = (item.cases * prod.bottles_per_case) + item.looseBottles;
                      const itemTotal = totalBottles * item.cost_per_unit;
                      return (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-[#121214]">
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{prod.name}</p>
                            <p className="text-[10px] text-zinc-500">
                              {item.cases > 0 && `${item.cases}cs `}
                              {item.looseBottles > 0 && `${item.looseBottles}bt `}
                              ({totalBottles} bottles total) @ ${item.cost_per_unit.toFixed(2)}/bottle
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono font-bold">${itemTotal.toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => setNewPOItems(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-3 rounded-xl text-xs font-bold hover:opacity-90"
            >
              Submit & Print Purchase Order
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PO Stats widgets */}
              <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total POs</p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">{purchaseOrders.length}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <RefreshCw className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Pending POs</p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                    {purchaseOrders.filter(o => o.status === 'Pending').length}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Received & Stocked</p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                    {purchaseOrders.filter(o => o.status === 'Received').length}
                  </p>
                </div>
              </div>
            </div>

            {/* PO Table */}
            <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Purchase History & Drafts</h3>
              </div>

              {purchaseOrders.length === 0 ? (
                <div className="p-12 text-center text-zinc-400">
                  No Purchase Orders found. Click "New Purchase Order" to generate one.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {purchaseOrders.map(order => (
                    <div key={order.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                            {order.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'Received' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{order.vendor}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        {/* Display PO Items briefly */}
                        <div className="pt-2 text-[10px] text-zinc-500 list-disc list-inside space-y-0.5">
                          {order.items.map((it, idx) => (
                            <div key={idx}>
                              • {it.productName} ({it.cases > 0 ? `${it.cases} cases` : ''}{it.cases > 0 && it.looseBottles > 0 ? ' & ' : ''}{it.looseBottles > 0 ? `${it.looseBottles} loose bottles` : ''})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total PO Value</p>
                          <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white">${order.totalCost.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === 'Pending' && (
                            <button
                              onClick={() => handleReceivePO(order.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Receive Inventory
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePO(order.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Delete PO"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
