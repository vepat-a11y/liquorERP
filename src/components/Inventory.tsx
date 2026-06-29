import React, { useState } from 'react';
import { 
  Plus, QrCode, Sparkles, RefreshCw, CheckCircle2, Package, Search, Wine, Lock, 
  ShieldAlert, FileText, Check, Save, MessageSquare, Clock, Calendar, User, 
  ShoppingBag, Download, Upload, X, Eye, HelpCircle, Archive, Trash2, Layers,
  Settings
} from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  tenantId: string;
  theme: 'light' | 'dark';
  products: Product[];
  refreshData: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  permissionLevel: string;
  activeUser: string;
}

export default function Inventory({ 
  tenantId, 
  theme, 
  products, 
  refreshData, 
  showToast,
  permissionLevel = 'Admin',
  activeUser = 'Staff'
}: InventoryProps) {
  
  // Selected Product as an Active Record for Odoo-style Chatter Drawer
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Modal Toggles
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGearMenuOpen, setIsGearMenuOpen] = useState(false);

  // Search, Filter & Sorter States (Replaces old tabs and search layout)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'Liquor' | 'Wine' | 'Beer' | 'Extras'>('All');
  const [activeStockFilter, setActiveStockFilter] = useState<'All' | 'in_stock' | 'low_stock' | 'out_of_stock'>('All');
  const [activeAgeFilter, setActiveAgeFilter] = useState<'All' | 'restricted' | 'unrestricted'>('All');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc'>('name_asc');

  // Barcode Lookup States inside Add Modal
  const [lookupBarcode, setLookupBarcode] = useState('');
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);

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
    inventory_bottles: 24, // Initial Stock in bottles
  });

  // Edit Product Field States for Selected Record
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price_per_bottle: 0,
    cost_per_unit: 0,
    vendor: '',
    distributor_sku: '',
  });

  // Manual chatter comment state
  const [chatterComment, setChatterComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);

  // Import states
  const [isImporting, setIsImporting] = useState(false);
  const [pastedJson, setPastedJson] = useState('');

  // Quick preset barcodes for easy testing
  const presetBarcodes = [
    { code: '5011007003003', label: 'Jameson Whiskey 🥃' },
    { code: '3045203301010', label: 'Veuve Clicquot 🍷' },
    { code: '5010314051009', label: 'Macallan 12 🥃' },
    { code: '072890000116', label: 'Heineken 🍺' },
    { code: '5000213011321', label: 'Guinness Stout 🍺' },
  ];

  // Read only permission constraints
  const isReadOnly = permissionLevel === 'Read Only';

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Perform Global Barcode Lookup inside Add Product Modal
  const handleBarcodeLookup = async (barcodeToQuery: string) => {
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot trigger global registry queries", "error");
      return;
    }

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

    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot create products", "error");
      return;
    }

    if (!formData.name.trim()) {
      showToast("Product name is required", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        inventory_cases: Math.floor(formData.inventory_bottles / formData.bottles_per_case)
      };

      const res = await fetch(`/api/products?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      showToast(`Success: Cataloged "${data.name}"`, "success");
      
      // Select the newly created product immediately!
      setSelectedProductId(data.id);
      setIsCreateModalOpen(false);

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
      setLookupBarcode('');

      refreshData();
    } catch (err: any) {
      showToast(err.message || "Error saving product.", "error");
    }
  };

  // Handle Edit Product Specifications
  const handleStartEditRecord = () => {
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot modify records", "error");
      return;
    }
    if (!selectedProduct) return;
    setEditFormData({
      name: selectedProduct.name,
      price_per_bottle: selectedProduct.price_per_bottle,
      cost_per_unit: selectedProduct.cost_per_unit || 0,
      vendor: selectedProduct.vendor || '',
      distributor_sku: selectedProduct.distributor_sku || '',
    });
    setIsEditingRecord(true);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      const res = await fetch(`/api/products/${selectedProductId}?tenant_id=${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update product.");

      showToast(`Successfully updated record for "${data.name}"`, "success");
      setIsEditingRecord(false);
      refreshData();
    } catch (err: any) {
      showToast(err.message || "Error updating record", "error");
    }
  };

  // Handle Post Chatter Comment
  const handlePostChatterComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !chatterComment.trim()) return;

    setIsPostingComment(true);
    try {
      const res = await fetch(`/api/records/products/${selectedProductId}/chatter?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: activeUser,
          comment: chatterComment.trim()
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to post comment.");

      showToast("Chatter updated", "success");
      setChatterComment('');
      refreshData();
    } catch (err: any) {
      showToast(err.message || "Error posting comment", "error");
    } finally {
      setIsPostingComment(false);
    }
  };

  // Export Products Catalog as JSON
  const handleExportProducts = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `products_catalog_export_${tenantId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast(`Successfully exported ${products.length} product records!`, "success");
    } catch (e: any) {
      showToast("Export failed: " + e.message, "error");
    }
  };

  // Custom pasted JSON catalog import
  const handlePastedJsonImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot import catalogs", "error");
      return;
    }

    if (!pastedJson.trim()) {
      showToast("Please paste catalog JSON data first.", "error");
      return;
    }

    setIsImporting(true);
    try {
      const parsed = JSON.parse(pastedJson.trim());
      const itemsToImport = Array.isArray(parsed) ? parsed : [parsed];
      
      let importCount = 0;
      for (const item of itemsToImport) {
        if (!item.name) continue;
        
        await fetch(`/api/products?tenant_id=${tenantId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name,
            category: item.category || 'Extras',
            description: item.description || '',
            imageUrl: item.imageUrl || '',
            age_restricted: item.age_restricted ?? true,
            distributor_sku: item.distributor_sku || `SKU-${Math.floor(Math.random() * 9000 + 1000)}`,
            barcode: item.barcode || '',
            bottles_per_case: item.bottles_per_case || 12,
            price_per_bottle: item.price_per_bottle || 29.99,
            cost_per_unit: item.cost_per_unit || 14.99,
            vendor: item.vendor || 'Unknown',
            inventory_bottles: item.inventory_bottles ?? 24,
            inventory_cases: Math.floor((item.inventory_bottles ?? 24) / (item.bottles_per_case || 12))
          })
        });
        importCount++;
      }

      showToast(`Catalog imported successfully! Added ${importCount} products.`, "success");
      setIsImportModalOpen(false);
      setPastedJson('');
      refreshData();
    } catch (err: any) {
      showToast("Failed to parse JSON. Please verify standard database schema format.", "error");
    } finally {
      setIsImporting(false);
    }
  };

  // Import Predefined Shopify Demo Catalog
  const handleImportDemoProducts = async () => {
    if (isReadOnly) {
      showToast("Access Denied: Read Only profiles cannot import products", "error");
      return;
    }

    setIsImporting(true);
    showToast("Importing premium craft beverages & spirits...", "info");

    const demoProducts = [
      {
        name: "The Balvenie DoubleWood 12 Year Old Scotch",
        category: "Liquor" as const,
        description: "Whisky aged in refill American oak casks before finishing in first-fill European oak Oloroso sherry butts.",
        imageUrl: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&q=80&w=200",
        age_restricted: true,
        distributor_sku: "DIST-BALV-12",
        barcode: "083664872105",
        bottles_per_case: 6,
        price_per_bottle: 74.99,
        cost_per_unit: 42.00,
        vendor: "Southern Glazers",
        inventory_bottles: 18,
      },
      {
        name: "Lagavulin 16 Year Old Single Malt Scotch",
        category: "Liquor" as const,
        description: "Deep, dry and exceptionally peaty Scotch single malt from Islay, Scotland.",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200",
        age_restricted: true,
        distributor_sku: "DIST-LAGA-16",
        barcode: "008112800155",
        bottles_per_case: 6,
        price_per_bottle: 115.00,
        cost_per_unit: 68.00,
        vendor: "Southern Glazers",
        inventory_bottles: 12,
      },
      {
        name: "Dom Pérignon Vintage Brut Champagne",
        category: "Wine" as const,
        description: "A legendary Champagne with intense complexity, balanced notes of brioche, dry fruits and mineral finish.",
        imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200",
        age_restricted: true,
        distributor_sku: "DIST-DOMP-2012",
        barcode: "3185370000335",
        bottles_per_case: 6,
        price_per_bottle: 249.99,
        cost_per_unit: 145.00,
        vendor: "Alliance Beverage",
        inventory_bottles: 8,
      },
      {
        name: "Cloudy Bay Sauvignon Blanc",
        category: "Wine" as const,
        description: "Crisp, elegant Sauvignon Blanc from Marlborough, New Zealand, bursts with vibrant passion fruit and lime zest.",
        imageUrl: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=200",
        age_restricted: true,
        distributor_sku: "DIST-CLOUDY-BAY",
        barcode: "9418443100222",
        bottles_per_case: 12,
        price_per_bottle: 34.99,
        cost_per_unit: 18.50,
        vendor: "Alliance Beverage",
        inventory_bottles: 24,
      },
      {
        name: "Delirium Tremens Belgian Strong Ale",
        category: "Beer" as const,
        description: "An outstanding Belgian Strong Pale Ale, famous for its pink elephant logo and rich citrusy spice complexity.",
        imageUrl: "https://images.unsplash.com/photo-1563189304-46d29d1ed7a6?auto=format&fit=crop&q=80&w=200",
        age_restricted: true,
        distributor_sku: "DIST-DELIRIUM-ALE",
        barcode: "5412186000122",
        bottles_per_case: 24,
        price_per_bottle: 22.99,
        cost_per_unit: 12.50,
        vendor: "Craft Imports Co",
        inventory_bottles: 48,
      }
    ];

    try {
      let importedCount = 0;
      for (const item of demoProducts) {
        const alreadyExists = products.some(p => p.barcode === item.barcode);
        if (!alreadyExists) {
          await fetch(`/api/products?tenant_id=${tenantId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...item,
              inventory_cases: Math.floor(item.inventory_bottles / item.bottles_per_case)
            })
          });
          importedCount++;
        }
      }

      showToast(`Import completed! Populated catalog with ${importedCount} premium craft items.`, "success");
      setIsImportModalOpen(false);
      refreshData();
    } catch (e: any) {
      showToast("Import failed: " + e.message, "error");
    } finally {
      setIsImporting(false);
    }
  };

  // Filter & Sort list based on the brand new unified search bar & filter controls
  const filteredList = products
    .filter(p => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
                            p.name.toLowerCase().includes(query) ||
                            (p.barcode && p.barcode.includes(query)) ||
                            (p.category && p.category.toLowerCase().includes(query)) ||
                            (p.vendor && p.vendor.toLowerCase().includes(query)) ||
                            (p.distributor_sku && p.distributor_sku.toLowerCase().includes(query));
      
      const matchesCategory = activeCategoryFilter === 'All' || p.category === activeCategoryFilter;
      
      const stockStatus = p.inventory_bottles === 0 
        ? 'out_of_stock' 
        : (p.inventory_bottles < p.bottles_per_case ? 'low_stock' : 'in_stock');
        
      const matchesStock = activeStockFilter === 'All' || 
                           (activeStockFilter === 'out_of_stock' && stockStatus === 'out_of_stock') ||
                           (activeStockFilter === 'low_stock' && stockStatus === 'low_stock') ||
                           (activeStockFilter === 'in_stock' && stockStatus === 'in_stock');
                           
      const matchesAge = activeAgeFilter === 'All' ||
                         (activeAgeFilter === 'restricted' && p.age_restricted) ||
                         (activeAgeFilter === 'unrestricted' && !p.age_restricted);

      return matchesSearch && matchesCategory && matchesStock && matchesAge;
    })
    .sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price_asc') return a.price_per_bottle - b.price_per_bottle;
      if (sortBy === 'price_desc') return b.price_per_bottle - a.price_per_bottle;
      if (sortBy === 'stock_asc') return a.inventory_bottles - b.inventory_bottles;
      if (sortBy === 'stock_desc') return b.inventory_bottles - a.inventory_bottles;
      return 0;
    });

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-[#f6f6f7] dark:bg-[#0c0c0e]">
      
      {/* NEW COMPACT UNIFIED TOP UTILITY BAR (Matches Shopify/Odoo Settings setup) */}
      <div className="p-4 bg-white dark:bg-[#111113] border-b border-zinc-200/80 dark:border-zinc-800 shrink-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.01)] z-30">
        
        {/* Left: Search Bar with advanced filter options embedded */}
        <div className="flex-1 flex flex-wrap items-center gap-2.5">
          {/* Text Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, SKU, brand, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl focus:border-[#d97706] focus:bg-white dark:focus:bg-zinc-950 focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={activeCategoryFilter}
            onChange={(e) => setActiveCategoryFilter(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#d97706] cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Liquor">Liquor Shelf</option>
            <option value="Wine">Wine Cellar</option>
            <option value="Beer">Beer Cold Box</option>
            <option value="Extras">Extras / Merchandise</option>
          </select>

          {/* Stock Level Filter */}
          <select
            value={activeStockFilter}
            onChange={(e) => setActiveStockFilter(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#d97706] cursor-pointer"
          >
            <option value="All">All Stock Levels</option>
            <option value="in_stock">In Stock (Good)</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Age Compliance Filter */}
          <select
            value={activeAgeFilter}
            onChange={(e) => setActiveAgeFilter(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#d97706] cursor-pointer"
          >
            <option value="All">All Compliance</option>
            <option value="restricted">🔞 21+ Verification Required</option>
            <option value="unrestricted">Unrestricted General</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#d97706] cursor-pointer font-bold"
          >
            <option value="name_asc">Sort: Title (A-Z)</option>
            <option value="name_desc">Sort: Title (Z-A)</option>
            <option value="price_asc">Sort: Price (Low → High)</option>
            <option value="price_desc">Sort: Price (High → Low)</option>
            <option value="stock_asc">Sort: Stock (Low → High)</option>
            <option value="stock_desc">Sort: Stock (High → Low)</option>
          </select>
        </div>

        {/* Right: Actions menu with Gear Icon dropdown + New Product Button */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto relative">
          
          {/* Gear icon dropdown for import/export configurations */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGearMenuOpen(!isGearMenuOpen)}
              className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center"
              title="Catalog Tools & Import/Export"
            >
              <Settings className={`h-4.5 w-4.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${isGearMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {isGearMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsGearMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#141416] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-xs text-zinc-750 dark:text-zinc-300 animate-fade-in">
                  <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800 text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Database Utilities
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsGearMenuOpen(false);
                      handleExportProducts();
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-zinc-400" />
                    Export Catalog (JSON)
                  </button>

                  <button
                    onClick={() => {
                      setIsGearMenuOpen(false);
                      setIsImportModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-mono font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 text-zinc-400" />
                    Import Catalog (JSON)
                  </button>

                  <button
                    onClick={() => {
                      setIsGearMenuOpen(false);
                      handleImportDemoProducts();
                    }}
                    disabled={isReadOnly}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 font-mono font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-40 text-[#d97706]"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#d97706]" />
                    Load Demo Catalog
                  </button>
                </div>
              </>
            )}
          </div>

          {/* New Product Trigger Button */}
          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#d97706] text-white hover:bg-[#b45309] font-mono font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-[0_2px_4px_rgba(217,119,6,0.15)] hover:shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-45"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER: Split view setup between visual grid cards and details panel */}
      <main className="flex-1 overflow-hidden p-6 flex gap-6">
        
        {/* PRODUCTS VISUAL CARD CATALOG SECTION */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
          
          <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-850/60 bg-zinc-50/40 dark:bg-[#131315]/40 shrink-0 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Catalog Directory Screen
            </span>
            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
              Showing <span className="text-zinc-800 dark:text-white font-bold">{filteredList.length}</span> of {products.length} Products
            </div>
          </div>

          <div className="flex-1 overflow-auto p-5 bg-[#fcfcfc] dark:bg-[#0c0c0e]">
            {filteredList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-transparent">
                <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-700 mb-4 stroke-[1.5]">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="font-serif italic font-medium text-xl text-zinc-800 dark:text-zinc-100">
                  No warehouse products found
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 max-w-md mx-auto leading-relaxed uppercase font-mono tracking-wider">
                  Adjust your search queries or filter dropdown constraints to reveal matching database records.
                </p>

                <div className="flex items-center gap-3 mt-6">
                  {products.length === 0 && (
                    <button
                      type="button"
                      onClick={handleImportDemoProducts}
                      disabled={isReadOnly}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-mono font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-40"
                    >
                      Import Predefined Catalog
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#d97706] text-white hover:bg-[#b45309] font-mono font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-45"
                  >
                    Catalog New Product
                  </button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 transition-all duration-300 ${
                selectedProductId 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}>
                {filteredList.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  const stockStatus = p.inventory_bottles === 0 
                    ? 'out' 
                    : (p.inventory_bottles < p.bottles_per_case ? 'low' : 'good');

                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setIsEditingRecord(false);
                      }}
                      className={`group bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all duration-200 cursor-pointer relative ${
                        isSelected 
                          ? 'ring-2 ring-[#d97706] border-transparent shadow-sm bg-amber-500/[0.01]' 
                          : 'hover:border-zinc-350 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Top Row: category and restrictions */}
                      <div className="flex items-center justify-between gap-1.5 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                          p.category === 'Liquor' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/40' :
                          p.category === 'Wine' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200/40' :
                          p.category === 'Beer' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/40' :
                          'bg-zinc-150 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/60'
                        }`}>
                          {p.category}
                        </span>

                        {p.age_restricted && (
                          <span 
                            className="text-[9px] select-none shrink-0 bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/15 font-mono font-bold uppercase tracking-wider"
                            title="21+ Compliance Age Lock Active"
                          >
                            🔞 21+
                          </span>
                        )}
                      </div>

                      {/* Image block */}
                      <div className="h-32 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850/60 overflow-hidden flex items-center justify-center mb-3 relative select-none">
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            referrerPolicy="no-referrer" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <Package className="h-10 w-10 text-zinc-300 dark:text-zinc-700 stroke-[1.25]" />
                        )}

                        {/* Quick stock overlay badge */}
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest font-black shadow-sm border ${
                            stockStatus === 'out' ? 'bg-red-500 text-white border-transparent' :
                            stockStatus === 'low' ? 'bg-amber-500 text-white border-transparent' :
                            'bg-emerald-500 text-white border-transparent'
                          }`}>
                            {stockStatus === 'out' ? 'Out of Stock' : stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex-1 mb-3">
                        <h3 className="font-serif italic font-semibold text-zinc-900 dark:text-white text-xs line-clamp-2 leading-snug group-hover:text-[#d97706] transition-colors">
                          {p.name}
                        </h3>
                        
                        {/* ID & UPC Barcode details */}
                        <div className="mt-2 space-y-0.5 text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                          {p.distributor_sku && (
                            <div className="flex justify-between">
                              <span>SKU:</span>
                              <span className="font-semibold text-zinc-650 dark:text-zinc-300">{p.distributor_sku}</span>
                            </div>
                          )}
                          {p.barcode && (
                            <div className="flex justify-between">
                              <span>Barcode:</span>
                              <span className="text-zinc-650 dark:text-zinc-350">{p.barcode}</span>
                            </div>
                          )}
                          {p.vendor && (
                            <div className="flex justify-between max-w-full truncate">
                              <span>Vendor:</span>
                              <span className="text-zinc-600 dark:text-zinc-400 font-sans font-medium max-w-[120px] truncate">{p.vendor}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer: Price vs Inventory */}
                      <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-end justify-between">
                        <div>
                          <p className="text-[8px] font-mono uppercase text-zinc-400 font-bold">Price</p>
                          <p className="font-mono text-xs font-black text-zinc-900 dark:text-white mt-0.5">
                            ${p.price_per_bottle.toFixed(2)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[8px] font-mono uppercase text-zinc-400 font-bold">Stock</p>
                          <p className={`font-mono font-black text-xs mt-0.5 ${
                            stockStatus === 'out' ? 'text-red-500' :
                            stockStatus === 'low' ? 'text-amber-500' :
                            'text-emerald-500'
                          }`}>
                            {p.inventory_bottles} Bts
                          </p>
                          <p className="text-[8px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
                            ({Math.floor(p.inventory_bottles / p.bottles_per_case)} Cs)
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ACTIVE RECORD SPLIT DETAIL PANEL (Shopify/Odoo Style) */}
        {selectedProduct && (
          <div className="w-[420px] xl:w-[450px] bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden shrink-0 h-full animate-fade-in">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-[#18181b] flex items-start justify-between">
              <div className="space-y-1.5 pr-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] uppercase bg-amber-500/10 text-[#d97706] border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-widest">
                    Active Record Specs
                  </span>
                  <span className="font-mono text-[9px] text-zinc-400">
                    ID: {selectedProduct.id}
                  </span>
                </div>
                
                <h3 className="font-serif italic font-semibold text-lg text-zinc-950 dark:text-white leading-tight">
                  {selectedProduct.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isEditingRecord ? (
                  <button
                    onClick={handleStartEditRecord}
                    disabled={isReadOnly}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 px-2.5 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase hover:border-[#1a1a1a] dark:hover:border-white transition shadow-sm cursor-pointer flex items-center gap-1 disabled:opacity-40"
                  >
                    <Save className="h-3 w-3 text-zinc-400" />
                    Edit Specs
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingRecord(false)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-[10px] font-mono uppercase font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedProductId(null)}
                  className="p-1 rounded-lg hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable specs & timelines */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-150 dark:divide-zinc-800">
              
              {/* Product Specifications Section */}
              <div className="p-5">
                {!isEditingRecord ? (
                  /* Read Mode */
                  <div className="grid grid-cols-2 gap-y-4 gap-x-5 text-xs">
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Retail Bottle Price</p>
                      <p className="font-bold text-sm text-zinc-900 dark:text-white mt-1 font-mono">${selectedProduct.price_per_bottle.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Wholesale Unit Cost</p>
                      <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                        {selectedProduct.cost_per_unit ? `$${selectedProduct.cost_per_unit.toFixed(2)}` : 'Not Configured'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Primary Distributor</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1">{selectedProduct.vendor || 'No vendor linked'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Distributor SKU</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1 font-mono">{selectedProduct.distributor_sku || 'No SKU code'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Age Compliance</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1 flex items-center gap-1">
                        {selectedProduct.age_restricted ? '🔞 21+ Age Verification Gate' : 'Unrestricted General'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold">Pack Ratio (bts/cs)</p>
                      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mt-1 font-mono">{selectedProduct.bottles_per_case} Bottles / Case</p>
                    </div>
                    <div className="col-span-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 font-bold mb-1">Stock on hand inventory</p>
                      <div className="flex items-center gap-4 py-2 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                        <div className="font-mono tabular-nums">
                          <span className="text-zinc-900 dark:text-white font-extrabold text-sm">{selectedProduct.inventory_bottles}</span>
                          <span className="text-zinc-400 text-[9px] ml-1">total bottles</span>
                        </div>
                        <div className="text-zinc-300 dark:text-zinc-700">|</div>
                        <div className="font-mono tabular-nums">
                          <span className="text-zinc-900 dark:text-white font-bold text-sm">
                            {Math.floor(selectedProduct.inventory_bottles / selectedProduct.bottles_per_case)}
                          </span>
                          <span className="text-zinc-400 text-[9px] ml-1">cases ({selectedProduct.bottles_per_case} pack)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode Specs */
                  <form onSubmit={handleSaveProductEdit} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase text-zinc-400 mb-1">Product Title</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(p => ({ ...p, name: e.target.value }))}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs focus:outline-none focus:border-[#d97706] text-zinc-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase text-zinc-400 mb-1">Retail Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.price_per_bottle}
                          onChange={(e) => setEditFormData(p => ({ ...p, price_per_bottle: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase text-zinc-400 mb-1">Distributor Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.cost_per_unit}
                          onChange={(e) => setEditFormData(p => ({ ...p, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase text-zinc-400 mb-1">Distributor SKU</label>
                        <input
                          type="text"
                          value={editFormData.distributor_sku}
                          onChange={(e) => setEditFormData(p => ({ ...p, distributor_sku: e.target.value }))}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono font-bold uppercase text-zinc-400 mb-1">Vendor Name</label>
                        <input
                          type="text"
                          value={editFormData.vendor}
                          onChange={(e) => setEditFormData(p => ({ ...p, vendor: e.target.value }))}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-2.5 font-mono font-bold border border-transparent uppercase tracking-widest text-[10px] hover:bg-[#d97706] hover:text-white dark:hover:bg-[#d97706] dark:hover:text-white transition cursor-pointer rounded-xl"
                    >
                      Save Specifications
                    </button>
                  </form>
                )}
              </div>

              {/* Odoo Audit Chatter Stream Section */}
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4.5 w-4.5 text-[#d97706]" />
                    <span className="font-serif italic font-semibold text-sm text-zinc-950 dark:text-white">Record Chatter Timeline</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {selectedProduct.chatter?.length || 0} Events
                  </span>
                </div>

                {/* Post New Note Form */}
                <form onSubmit={handlePostChatterComment} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type staff log, verification or supplier note..."
                    value={chatterComment}
                    onChange={(e) => setChatterComment(e.target.value)}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-850 dark:text-zinc-200 focus:outline-none focus:border-[#d97706] placeholder-zinc-400 dark:placeholder-zinc-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !chatterComment.trim()}
                    className="bg-zinc-950 dark:bg-white hover:bg-[#d97706] dark:hover:bg-[#d97706] text-white dark:text-zinc-950 hover:text-white dark:hover:text-white px-4 py-2.5 rounded-xl font-mono text-[9px] font-bold uppercase transition shrink-0 cursor-pointer disabled:opacity-40"
                  >
                    Post Note
                  </button>
                </form>

                {/* Chatter History */}
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {(!selectedProduct.chatter || selectedProduct.chatter.length === 0) ? (
                    <div className="text-center py-6 text-zinc-400 text-[9px] font-mono uppercase tracking-widest bg-zinc-50/50 dark:bg-[#121212]/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                      No audited actions logged yet.
                    </div>
                  ) : (
                    [...selectedProduct.chatter].reverse().map((cht) => {
                      let actionColor = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500';
                      let icon = <Clock className="h-3 w-3" />;

                      if (cht.action === 'created') {
                        actionColor = 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400';
                        icon = <Check className="h-3 w-3" />;
                      } else if (cht.action === 'update') {
                        actionColor = 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400';
                        icon = <Save className="h-3 w-3" />;
                      } else if (cht.action === 'inventory_received') {
                        actionColor = 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400';
                        icon = <Layers className="h-3 w-3" />;
                      } else if (cht.action === 'sale_deducted') {
                        actionColor = 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400';
                        icon = <ShoppingBag className="h-3 w-3" />;
                      } else if (cht.action === 'comment') {
                        actionColor = 'bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400';
                        icon = <MessageSquare className="h-3 w-3" />;
                      }

                      return (
                        <div key={cht.id} className="flex gap-3 text-xs leading-normal">
                          <div className={`h-6 w-6 rounded-full ${actionColor} flex items-center justify-center shrink-0 mt-0.5`}>
                            {icon}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between text-[9px]">
                              <span className="font-bold text-zinc-850 dark:text-white">{cht.user}</span>
                              <span className="text-zinc-400 font-mono">
                                {new Date(cht.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                              {cht.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD / CATALOG NEW PRODUCT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#18181b]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#d97706]" />
                <h3 className="font-serif italic font-semibold text-lg text-zinc-900 dark:text-white">
                  Catalog New Product
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Content Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* GLOBAL REGISTRY AUTOFILL */}
              <div className="p-4 bg-[#faf9f6] dark:bg-[#18181b] rounded-xl border border-amber-500/10 dark:border-amber-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-4.5 w-4.5 text-[#d97706]" />
                  <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-white">
                    Global Registry UPC Autofill Engine
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-500 leading-normal mb-3">
                  Scan a barcoded retail bottle or enter an EAN/UPC below. We query the global registry database to automatically fetch legal compliance, category structures, packaging counts, and images.
                </p>
                
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Scan barcode or type digits (e.g. 5011007003003)..."
                    value={lookupBarcode}
                    onChange={(e) => setLookupBarcode(e.target.value)}
                    className="flex-1 bg-white dark:bg-[#0c0c0e] border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                  />
                  <button
                    type="button"
                    disabled={isSearchingBarcode}
                    onClick={() => handleBarcodeLookup(lookupBarcode)}
                    className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-[#d97706] hover:text-white font-mono font-bold text-[10px] uppercase tracking-wider px-4 rounded-xl border border-transparent transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {isSearchingBarcode ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Autofill'}
                  </button>
                </div>

                {/* Preset helpers */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
                  <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider self-center mr-1">Try presets:</span>
                  {presetBarcodes.map((pb) => (
                    <button
                      key={pb.code}
                      type="button"
                      onClick={() => {
                        setLookupBarcode(pb.code);
                        handleBarcodeLookup(pb.code);
                      }}
                      className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-[#d97706] hover:border-amber-500/20 text-[9px] font-mono py-1 px-2 rounded border border-zinc-200/50 dark:border-zinc-700/55 transition cursor-pointer"
                    >
                      {pb.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Product Fields */}
              <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Product Title / Brand Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jameson Irish Whiskey 750ml"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-[#d97706] text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Category Shelf</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(p => ({ ...p, category: e.target.value as any }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white cursor-pointer focus:outline-none focus:border-[#d97706]"
                    >
                      <option value="Liquor">Liquor</option>
                      <option value="Wine">Wine</option>
                      <option value="Beer">Beer</option>
                      <option value="Extras">Extras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">UPC Barcode Digit</label>
                    <input
                      type="text"
                      placeholder="e.g. 5011007003003"
                      value={formData.barcode}
                      onChange={(e) => setFormData(p => ({ ...p, barcode: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Retail P/B ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price_per_bottle}
                      onChange={(e) => setFormData(p => ({ ...p, price_per_bottle: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Distributor Cost ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_per_unit}
                      onChange={(e) => setFormData(p => ({ ...p, cost_per_unit: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Pack size (Bts/Cs)</label>
                    <input
                      type="number"
                      required
                      value={formData.bottles_per_case}
                      onChange={(e) => setFormData(p => ({ ...p, bottles_per_case: parseInt(e.target.value) || 12 }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Vendor/Distributor</label>
                    <input
                      type="text"
                      placeholder="e.g. Southern Glazers Wine & Spirits"
                      value={formData.vendor}
                      onChange={(e) => setFormData(p => ({ ...p, vendor: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Distributor SKU</label>
                    <input
                      type="text"
                      placeholder="SKU Code"
                      value={formData.distributor_sku}
                      onChange={(e) => setFormData(p => ({ ...p, distributor_sku: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Opening Stock (Loose Bottles) *</label>
                    <input
                      type="number"
                      required
                      value={formData.inventory_bottles}
                      onChange={(e) => setFormData(p => ({ ...p, inventory_bottles: parseInt(e.target.value) || 0 }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1">Product Media Image URL</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(p => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    id="form_age_restricted"
                    checked={formData.age_restricted}
                    onChange={(e) => setFormData(p => ({ ...p, age_restricted: e.target.checked }))}
                    className="h-4 w-4 text-[#d97706] border-zinc-300 rounded focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="form_age_restricted" className="font-mono text-[9px] font-bold uppercase text-zinc-500 cursor-pointer select-none">
                    Requires Legal 21+ Age Verification Gate At Register Checkouts
                  </label>
                </div>

                <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-5 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#d97706] text-white hover:bg-[#b45309] px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg cursor-pointer"
                  >
                    Insert Into Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT PRODUCTS CATALOG */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col animate-fade-in">
            
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#18181b]">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#d97706]" />
                <h3 className="font-serif italic font-semibold text-lg text-zinc-900 dark:text-white">
                  Import Products Catalog
                </h3>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Predefined Import Section */}
              <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs">
                <h4 className="font-serif italic font-semibold text-sm text-zinc-900 dark:text-white mb-1.5">
                  Populate database with premium craft items?
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-4">
                  If your system has no products or you are setting up a new tenant warehouse, click below to load five premium, high-converting wine, liquor, and stout beer products with full graphics, pricing, SKU and barcoding metadata.
                </p>
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={handleImportDemoProducts}
                  className="w-full bg-[#d97706] text-white hover:bg-[#b45309] font-mono font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition shadow cursor-pointer disabled:opacity-40"
                >
                  {isImporting ? "Adding Catalog Records..." : "Load Premium Demo Products Catalog"}
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                <span className="flex-shrink mx-4 text-zinc-400 font-mono text-[10px] uppercase font-bold">Or Paste Custom Catalog JSON</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>

              {/* Paste JSON Form */}
              <form onSubmit={handlePastedJsonImport} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-400 mb-1.5">Pasted Database Schema JSON Array</label>
                  <textarea
                    rows={6}
                    value={pastedJson}
                    onChange={(e) => setPastedJson(e.target.value)}
                    placeholder={`[\n  {\n    "name": "Ardbeg Peated Scotch Whisky",\n    "category": "Liquor",\n    "price_per_bottle": 64.99,\n    "barcode": "083664872199"\n  }\n]`}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-[10px] font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#d97706] placeholder-zinc-400"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-4 py-2.5 rounded-xl font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !pastedJson.trim()}
                    className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-[#d97706] hover:text-white px-5 py-2.5 rounded-xl font-mono font-bold text-[10px] uppercase tracking-wider transition cursor-pointer disabled:opacity-40"
                  >
                    {isImporting ? "Processing..." : "Import Catalog List"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
