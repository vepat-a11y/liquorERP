import React, { useState } from 'react';
import { 
  Plus, QrCode, Sparkles, RefreshCw, Layers, CheckCircle2, Package, Search, Wine
} from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  tenantId: string;
  theme: 'light' | 'dark';
  products: Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function Inventory({ 
  tenantId, 
  theme, 
  products, 
  refreshData, 
  showToast 
}: InventoryProps) {
  
  // Barcode Lookup States
  const [lookupBarcode, setLookupBarcode] = useState('');
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States for Add Product
  const [formData, setFormData] = useState({
    name: '',
    category: 'Liquor' as 'Wine' | 'Beer' | 'Liquor' | 'Extras',
    description: '',
    imageUrl: '',
    age_restricted: true,
    distributor_sku: '',
    barcode: '',
    bottles_per_case: 12,
    price_per_bottle: 29.99,
    cost_per_unit: 14.99,
    vendor: '',
  });

  // Intake State for Case-to-Bottle replenishment
  const [intakeProductId, setIntakeProductId] = useState('');
  const [intakeCases, setIntakeCases] = useState('0');
  const [intakeLooseBottles, setIntakeLooseBottles] = useState('0');
  const [isIntaking, setIsIntaking] = useState(false);

  // Quick preset barcodes for easy testing
  const presetBarcodes = [
    { code: '5011007003003', label: 'Jameson Whiskey 🥃' },
    { code: '3045203301010', label: 'Veuve Clicquot 🍷' },
    { code: '5010314051009', label: 'Macallan 12 🥃' },
    { code: '072890000116', label: 'Heineken 🍺' },
    { code: '5000213011321', label: 'Guinness Stout 🍺' },
  ];

  // Perform Global Barcode Lookup
  const handleBarcodeLookup = async (barcodeToQuery: string) => {
    const code = barcodeToQuery.trim();
    if (!code) {
      showToast("Please enter a barcode to look up.", "info");
      return;
    }

    setIsSearchingBarcode(true);
    showToast(`Contacting Global Food Registry (Open Food Facts) for ${code}...`, "info");

    try {
      const res = await fetch(`/api/products/lookup/${code}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to locate barcode.");
      }

      // Success autofill
      setFormData(prev => ({
        ...prev,
        name: data.name || '',
        category: data.category || 'Extras',
        barcode: data.barcode || code,
        imageUrl: data.imageUrl || '',
        age_restricted: data.age_restricted ?? true,
        distributor_sku: `DIST-${data.brand || 'SKU'}-${Math.floor(Math.random() * 900 + 100)}`.toUpperCase().replace(/\s+/g, '-'),
        bottles_per_case: data.category === 'Beer' ? 24 : (data.category === 'Wine' ? 6 : 12)
      }));

      showToast(`Successfully autofilled: ${data.name}!`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Product not found. You can enter information manually.", "error");
    } finally {
      setIsSearchingBarcode(false);
    }
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        imageUrl: formData.imageUrl,
        age_restricted: formData.category !== 'Extras',
        barcode: formData.barcode || undefined,
        distributor_sku: formData.distributor_sku || undefined,
        vendor: formData.vendor || undefined,
        bottles_per_case: Number(formData.bottles_per_case),
        inventory_bottles: 0, // Starts at 0, since receiving is handled by purchasing!
        inventory_cases: 0,
        price_per_bottle: Number(formData.price_per_bottle),
        price_per_case: Number(formData.price_per_bottle * formData.bottles_per_case * 0.9),
        cost_per_unit: Number(formData.cost_per_unit || 0)
      };

      const res = await fetch(`/api/products?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save new product to tenant storage.");

      showToast(`Created product: ${formData.name}`, "success");
      
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
      });
      setLookupBarcode('');
      refreshData();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // Receive stock - Case-to-Bottle intake replenishment
  const handleReceiveStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeProductId) {
      showToast("Please select a product for stock intake", "error");
      return;
    }

    setIsIntaking(true);
    try {
      const selectedProduct = products.find(p => p.id === intakeProductId);
      if (!selectedProduct) return;

      const cases = Number(intakeCases || 0);
      const bottles = Number(intakeLooseBottles || 0);
      const addedBottles = (cases * selectedProduct.bottles_per_case) + bottles;

      const res = await fetch(`/api/products/${intakeProductId}/receive?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cases, looseBottles: bottles })
      });

      if (!res.ok) throw new Error("Intake process failed on server.");

      showToast(`Intake Success: Added ${addedBottles} individual bottles of ${selectedProduct.name}`, 'success');
      setIntakeCases('0');
      setIntakeLooseBottles('0');
      refreshData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsIntaking(false);
    }
  };

  const filteredList = products.filter(p => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (p.barcode && p.barcode.includes(searchQuery));
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full w-full bg-[#f8f7f4] dark:bg-[#121212] overflow-hidden transition-colors duration-300">
      
      {/* LEFT SECTION: Create product catalog & barcode auto-populate (7 cols) */}
      <div className="lg:col-span-7 flex flex-col h-full bg-[#f8f7f4] dark:bg-[#121212] border-r border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 overflow-y-auto p-8 space-y-8">
        
        {/* Page Title with Newsreader typography */}
        <div>
          <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[#d97706] dark:text-amber-400 mb-1.5 block">
            Inventory Schema
          </span>
          <h2 className="font-serif italic font-medium text-3xl sm:text-4xl md:text-5xl text-[#1a1a1a] dark:text-[#f8f7f4] tracking-tight leading-tight">
            Stock Registration
          </h2>
        </div>

        {/* Top: Global Barcode Master Lookup bar */}
        <div className="brutalist-card">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d97706] dark:text-amber-400 mb-2.5 block">
            Global Barcode Database Registry Lookup // EAN Registry...
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717a] dark:text-[#a1a1aa]" />
              <input
                type="text"
                placeholder="Scan/Enter Barcode to Autofill Product Data..."
                value={lookupBarcode}
                onChange={(e) => setLookupBarcode(e.target.value)}
                className="w-full bg-zinc-100/50 dark:bg-[#121212] border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white pl-10 pr-4 py-3 text-xs focus:outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-mono transition-all"
              />
            </div>
            <button
              onClick={() => handleBarcodeLookup(lookupBarcode)}
              disabled={isSearchingBarcode || !lookupBarcode}
              className="bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-amber-600 dark:hover:bg-amber-400 font-mono font-bold text-xs px-6 border border-[#1a1a1a] dark:border-white shadow-[3px_3px_0px_#d97706] transition-all duration-150 disabled:opacity-50 flex items-center gap-2 uppercase tracking-wider cursor-pointer"
            >
              {isSearchingBarcode ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Autofill
                </>
              )}
            </button>
          </div>

          {/* Quick presets list */}
          <div className="mt-4 pt-3 border-t border-[#1a1a1a]/10 dark:border-white/10">
            <div className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Try Sandbox Database Preset Barcodes:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presetBarcodes.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLookupBarcode(item.code);
                    handleBarcodeLookup(item.code);
                  }}
                  className="bg-white dark:bg-[#1c1c1c] hover:bg-[#f8f7f4] dark:hover:bg-black border border-[#1a1a1a] dark:border-white/20 text-[10px] text-zinc-700 dark:text-zinc-300 px-3 py-1.5 font-mono shadow-[2px_2px_0px_rgba(26,26,26,1)] dark:shadow-[2px_2px_0px_rgba(248,247,244,1)] transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic add form showing skeleton when searching */}
        <div className="brutalist-card">
          <h3 className="font-serif italic font-medium text-2xl text-[#1a1a1a] dark:text-[#f8f7f4] mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#d97706]" />
            Insert Product to Store Catalog
          </h3>

          {isSearchingBarcode ? (
            /* Search skeleton loader */
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
                <div className="h-10 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
              </div>
              <div className="h-20 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-10 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
                <div className="h-10 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
                <div className="h-10 bg-[#f4f4f5] dark:bg-[#09090b] rounded-xl" />
              </div>
            </div>
          ) : (
            /* Regular Add Form */
            <form onSubmit={handleAddProductSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                    placeholder="e.g. Jameson Irish Whiskey"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white transition-all cursor-pointer font-mono"
                  >
                    <option value="Liquor" className="bg-[#f8f7f4] text-[#1a1a1a]">Spirits/Liquor 🥃</option>
                    <option value="Wine" className="bg-[#f8f7f4] text-[#1a1a1a]">Wine 🍷</option>
                    <option value="Beer" className="bg-[#f8f7f4] text-[#1a1a1a]">Beer 🍺</option>
                    <option value="Extras" className="bg-[#f8f7f4] text-[#1a1a1a]">Extras 🧊</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Barcode / UPC
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                    placeholder="EAN/UPC Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Bottle Retail Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_per_bottle}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_bottle: Number(e.target.value) }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Bottles Per Case Pack
                  </label>
                  <input
                    type="number"
                    value={formData.bottles_per_case}
                    onChange={(e) => setFormData(prev => ({ ...prev, bottles_per_case: Number(e.target.value) }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Cost / Cost Per Unit ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_per_unit: Number(e.target.value) }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                    placeholder="e.g. 14.99"
                  />
                </div>
              </div>

              {/* Vendor & Distributor Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1a1a1a]/10 dark:border-white/10">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Vendor / Distributor Name
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                    placeholder="e.g. Southern Glazer's Wine"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Distributor SKU / Catalog ID
                  </label>
                  <input
                    type="text"
                    value={formData.distributor_sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, distributor_sku: e.target.value }))}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                    placeholder="e.g. SG-JAM-88432"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Product Image URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
                  placeholder="https://images.unsplash.com/photo-..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Description / Distributor Notes
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white h-16 resize-none transition-all"
                  placeholder="Vintage and distributor release notes..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-[#d97706] hover:text-white dark:hover:bg-amber-400 font-mono font-bold py-4 border border-[#1a1a1a] shadow-[4px_4px_0px_#d97706] text-xs uppercase tracking-widest transition duration-200 cursor-pointer"
              >
                Insert Product to Tenant Catalog
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Quick Replenishment and general list (5 cols on lg) */}
      <div className="lg:col-span-5 h-full bg-[#f8f7f4] dark:bg-[#121212] border-l border-[#1a1a1a]/10 dark:border-[#f8f7f4]/10 overflow-y-auto p-8 space-y-8">

        {/* CORE INVENTORY LOGIC: Case-to-bottle intake / replenishment container */}
        <div className="brutalist-card">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-5 w-5 text-[#d97706]" />
            <h3 className="font-serif italic font-medium text-xl text-[#1a1a1a] dark:text-[#f8f7f4]">
              Case-to-Bottle breakdown intake
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed font-sans">
            Receive a new distributor shipment. Input case count and loose bottles; our algorithms instantly resolve the pack ratio to update cumulative bottle inventory.
          </p>

          <form onSubmit={handleReceiveStockSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Select Product to Receive:
              </label>
              <select
                value={intakeProductId}
                onChange={(e) => setIntakeProductId(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white transition-all cursor-pointer font-mono"
              >
                <option value="" className="bg-[#f8f7f4] text-[#1a1a1a]">-- Choose active item --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#f8f7f4] text-[#1a1a1a]">
                    {p.name} ({p.barcode || 'No Barcode'}) - Ratio: {p.bottles_per_case}/case
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Cases Received:
                </label>
                <input
                  type="number"
                  min="0"
                  value={intakeCases}
                  onChange={(e) => setIntakeCases(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Loose Bottles:
                </label>
                <input
                  type="number"
                  min="0"
                  value={intakeLooseBottles}
                  onChange={(e) => setIntakeLooseBottles(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white py-2 text-sm outline-none text-[#1a1a1a] dark:text-white font-mono transition-all"
                />
              </div>
            </div>

            {intakeProductId && (
              <div className="bg-[#d97706]/10 p-3 rounded border border-[#d97706]/20 text-[11px] text-[#d97706] font-mono leading-normal">
                {(() => {
                  const p = products.find(prod => prod.id === intakeProductId);
                  if (!p) return null;
                  const cs = Number(intakeCases || 0);
                  const bts = Number(intakeLooseBottles || 0);
                  const sum = (cs * p.bottles_per_case) + bts;
                  return (
                    <span>
                      Applying intake of <b>{cs} cases</b> x {p.bottles_per_case} bottles + <b>{bts} loose bottles</b> = <b className="font-extrabold">+{sum} total bottles</b> in stock.
                    </span>
                  );
                })()}
              </div>
            )}

            <button
              type="submit"
              disabled={isIntaking || !intakeProductId}
              className="w-full bg-[#1a1a1a] dark:bg-[#f8f7f4] text-white dark:text-[#1a1a1a] hover:bg-[#d97706] hover:text-white dark:hover:bg-amber-400 disabled:opacity-50 font-mono font-bold text-xs py-4 border border-[#1a1a1a] shadow-[4px_4px_0px_#d97706] uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Replenish Inventory Now
            </button>
          </form>
        </div>

        {/* Catalog Browser list with searching */}
        <div className="brutalist-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif italic font-medium text-xl text-[#1a1a1a] dark:text-[#f8f7f4]">
              Catalog stock browser
            </h3>
            <span className="bg-[#1a1a1a]/5 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-[#1a1a1a]/10 dark:border-white/20 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">
              {filteredList.length} items
            </span>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#71717a] dark:text-[#a1a1aa]" />
            <input
              type="text"
              placeholder="Search catalog products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-3 text-xs bg-zinc-100/50 dark:bg-[#121212] border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none text-[#1a1a1a] dark:text-white font-mono placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
            />
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {filteredList.map((p) => (
              <div 
                key={p.id}
                className="p-3 border border-[#1a1a1a]/10 dark:border-white/10 bg-white dark:bg-[#1c1c1c]/40 hover:border-[#1a1a1a] dark:hover:border-white transition flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-[#121212] border border-[#1a1a1a]/10 dark:border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-[#71717a] dark:text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#1a1a1a] dark:text-white line-clamp-1">{p.name}</div>
                    <div className="text-[9px] font-mono text-[#71717a] dark:text-[#a1a1aa] uppercase">{p.barcode || 'No Barcode'}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Retail: <span className="font-semibold text-[#1a1a1a] dark:text-white">${p.price_per_bottle.toFixed(2)}</span>
                      {p.cost_per_unit !== undefined && (
                        <>
                          <span className="mx-1">•</span>
                          Cost: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${p.cost_per_unit.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                    {p.vendor && (
                      <div className="text-[9px] text-zinc-400 mt-1 font-mono flex flex-wrap items-center gap-1.5">
                        <span className="bg-[#10b981]/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 border border-emerald-500/10 rounded uppercase text-[8px] font-bold">Vendor: {p.vendor}</span>
                        {p.distributor_sku && <span className="text-[8px] font-mono text-zinc-500">SKU: {p.distributor_sku}</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] tabular-nums">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">{p.inventory_bottles} Bts</div>
                  <div className="text-[#71717a] dark:text-[#a1a1aa] text-[9px]">({p.inventory_cases} Cases)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

