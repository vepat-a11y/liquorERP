import React, { useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { Page } from '../../components/Polaris/Page';
import { Card } from '../../components/Polaris/Card';
import { DataTable, Column } from '../../components/Polaris/DataTable';
import { Badge } from '../../components/Polaris/Badge';
import { Product } from '../../types';
import { usePermission } from '../../components/Polaris/RequirePermission';
import { Search, Plus, Filter, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ProductsIndex() {
  const context = useOutletContext<any>();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const canEdit = hasPermission('products.edit');

  const products: Product[] = context.products || [];

  // Filter state
  const [activeTab, setActiveTab] = useState<'All' | 'Wine' | 'Beer' | 'Liquor' | 'Extras'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Product Creation state
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Liquor' as Product['category'],
    description: '',
    imageUrl: '',
    age_restricted: true,
    distributor_sku: '',
    barcode: '',
    bottles_per_case: 12,
    price_per_bottle: 29.99,
    cost_per_unit: 14.99,
    vendor: '',
    inventory_bottles: 24,
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      context.showToast('Product name is required', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        inventory_cases: Math.floor(formData.inventory_bottles / formData.bottles_per_case),
      };

      const res = await fetch(`/api/products?tenant_id=${context.activeTenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save product');
      const data = await res.json();

      context.showToast(`Cataloged "${data.name}" successfully!`, 'success');
      context.fetchTenantData(); // Refresh list
      setIsAdding(false);
      
      // Reset form
      setFormData({
        name: '',
        category: 'Liquor',
        description: '',
        imageUrl: '',
        age_restricted: true,
        distributor_sku: '',
        barcode: '',
        bottles_per_case: 12,
        price_per_bottle: 29.99,
        cost_per_unit: 14.99,
        vendor: '',
        inventory_bottles: 24,
      });
    } catch (err: any) {
      context.showToast(err.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeTab === 'All' || p.category === activeTab;
    const matchesQuery = searchQuery.trim() === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.includes(searchQuery) ||
      p.distributor_sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const columns: Column[] = [
    {
      key: 'name',
      title: 'Product spec',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.imageUrl || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=80&auto=format&fit=crop&q=60'}
            alt={row.name}
            className="h-10 w-10 rounded-md object-cover border border-zinc-150 dark:border-zinc-800 bg-zinc-50 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 leading-tight">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate block hover:underline">
              {row.name}
            </span>
            <span className="text-[10px] text-zinc-450 dark:text-zinc-400 font-mono tracking-tight block mt-0.5">
              SKU: {row.distributor_sku || 'N/A'} | Barcode: {row.barcode || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      render: (val) => (
        <Badge tone={val === 'Wine' ? 'attention' : val === 'Beer' ? 'info' : val === 'Liquor' ? 'warning' : 'default'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'price_per_bottle',
      title: 'Retail Price',
      align: 'right',
      render: (val) => <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">${val.toFixed(2)}</span>,
    },
    {
      key: 'inventory_bottles',
      title: 'Availability',
      align: 'center',
      render: (val, row) => {
        const cases = Math.floor(val / row.bottles_per_case);
        const loose = val % row.bottles_per_case;
        const outOfStock = val === 0;
        const lowStock = val > 0 && val < 12;

        return (
          <div className="flex flex-col items-center">
            <span className={`font-mono text-xs font-bold ${outOfStock ? 'text-red-500' : lowStock ? 'text-amber-500' : 'text-emerald-600'}`}>
              {val} bottles
            </span>
            <span className="text-[10px] text-zinc-400 font-sans tracking-tight mt-0.5">
              ({cases} c, {loose} b)
            </span>
          </div>
        );
      },
    },
    {
      key: 'age_restricted',
      title: 'Security',
      align: 'center',
      render: (val) => val ? (
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-950/30">
          <ShieldAlert className="h-3 w-3 shrink-0" />
          <span>21+ SCAN</span>
        </div>
      ) : (
        <span className="text-zinc-400 font-sans text-xs italic">None</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      align: 'center',
      render: (val, row) => {
        const isActive = row.inventory_bottles > 0;
        return (
          <Badge tone={isActive ? 'success' : 'critical'}>
            {isActive ? 'Active' : 'Out of Stock'}
          </Badge>
        );
      },
    },
  ];

  return (
    <Page
      title="Products Catalog"
      titleMetadata={<Badge tone="success">{filteredProducts.length} Items</Badge>}
      primaryAction={canEdit ? {
        content: isAdding ? 'View Catalog' : 'Add Product',
        onAction: () => setIsAdding(!isAdding),
      } : undefined}
    >
      {isAdding ? (
        <div className="max-w-2xl mx-auto">
          <Card title="Register New Catalog Item">
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Product Title *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jack Daniel's Old No.7 Whiskey"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition cursor-pointer"
                  >
                    <option value="Liquor">Liquor</option>
                    <option value="Wine">Wine</option>
                    <option value="Beer">Beer</option>
                    <option value="Extras">Extras</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Retail Price per Bottle ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_per_bottle}
                    onChange={(e) => setFormData({ ...formData, price_per_bottle: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Wholesale Cost per Bottle ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Initial Stock Level (Bottles)</label>
                  <input
                    type="number"
                    value={formData.inventory_bottles}
                    onChange={(e) => setFormData({ ...formData, inventory_bottles: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Bottles Per Wholesale Case</label>
                  <input
                    type="number"
                    value={formData.bottles_per_case}
                    onChange={(e) => setFormData({ ...formData, bottles_per_case: parseInt(e.target.value) || 12 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Distributor SKU / Wholesale SKU</label>
                  <input
                    type="text"
                    value={formData.distributor_sku}
                    onChange={(e) => setFormData({ ...formData, distributor_sku: e.target.value })}
                    placeholder="e.g. SKU-JD-750ML"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">EAN / UPC Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="e.g. 5000281021234"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Product Visual URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="e.g. https://domain.com/bottle.jpg"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Distributor Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="e.g. Southern Glazer's Distributors"
                    className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Compliance Age Restriction Check</label>
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3">
                  <input
                    type="checkbox"
                    id="age_restricted"
                    checked={formData.age_restricted}
                    onChange={(e) => setFormData({ ...formData, age_restricted: e.target.checked })}
                    className="h-4.5 w-4.5 text-[#008060] border-zinc-300 rounded-md focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="age_restricted" className="text-xs font-medium text-zinc-700 dark:text-zinc-200 cursor-pointer select-none">
                    Require strict ID/DOB verification at cashier register scan (Compliance 21+)
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Retail bottle dimensions, aging notes, proofs, and raw specs..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition resize-none"
                />
              </div>

              <div className="pt-4 flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008060] hover:bg-[#006e52] text-xs font-semibold text-white rounded-md shadow-xs transition"
                >
                  Save Catalog Record
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <Card sectioned={false}>
          {/* Filtering Header directly mirroring Shopify Polaris */}
          <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col sm:flex-row sm:items-center gap-3.5 justify-between">
            
            {/* Horizontal Filter Tabs */}
            <div className="flex border-b border-zinc-150 dark:border-zinc-850 gap-1.5 scroll-x">
              {(['All', 'Wine', 'Beer', 'Liquor', 'Extras'] as const).map((tab) => {
                const isSelected = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-2.5 text-xs font-semibold select-none cursor-pointer border-b-2 -mb-[1.5px] transition-all duration-100 ${
                      isSelected
                        ? 'border-[#008060] text-[#008060] font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Omnipresent search field inside the card */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by title, SKU, barcode..."
                className="w-full px-3.5 py-2 pl-9 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs outline-none focus:border-[#008060] transition"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            </div>

          </div>

          {/* Product Data table */}
          <DataTable
            columns={columns}
            rows={filteredProducts}
            onRowClick={(row) => navigate(`/admin/products/${row.id}`)}
            emptyState={
              <div className="text-center py-12 space-y-2">
                <AlertTriangle className="h-6 w-6 text-zinc-400 mx-auto" />
                <p className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">No matching products found</p>
                <p className="text-[10px] text-zinc-400">Try adjusting your filters or search terms</p>
              </div>
            }
          />
        </Card>
      )}
    </Page>
  );
}
