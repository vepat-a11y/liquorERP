import React, { useState } from 'react';
import { Printer, QrCode, Tag, Search, Sparkles, Check, ChevronDown } from 'lucide-react';
import { Product } from '../types';

interface PrintMaterialProps {
  products: Product[];
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type TemplateType = 'shelftalker' | 'pricetag' | 'poster';

export default function PrintMaterial({ products, showToast }: PrintMaterialProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [template, setTemplate] = useState<TemplateType>('shelftalker');
  const [customTitle, setCustomTitle] = useState('');
  const [customPriceOverride, setCustomPriceOverride] = useState('');
  const [badgeText, setBadgeText] = useState('LOCAL FAVORITE');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  const handlePrint = () => {
    showToast('Sent print job directly to Aura Thermal Label & Ticket Spooler (Port: USB-001)!', 'success');
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      
      {/* Selection Left Side */}
      <div className="w-80 border-r border-[#e4e4e7] dark:border-[#27272a] bg-white dark:bg-[#121214] p-6 flex flex-col justify-between shrink-0 h-full overflow-y-auto">
        <div className="space-y-6 text-xs">
          <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <Printer className="h-4.5 w-4.5 text-zinc-600 dark:text-zinc-400" />
            <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
              Tag & Label Generator
            </h3>
          </div>

          {/* 1. Pick Product */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              1. Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if (prod) {
                  setCustomTitle(prod.name);
                  setCustomPriceOverride('');
                }
              }}
              className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3"
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Pick Template */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              2. Template Format
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setTemplate('shelftalker')}
                className={`p-3 text-left border rounded-xl font-semibold cursor-pointer ${
                  template === 'shelftalker'
                    ? 'border-zinc-950 bg-zinc-50/50 dark:border-white dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <p className="font-bold">Shelf Talker (3x5 in)</p>
                <p className="text-[10px] font-normal text-zinc-400">Perfect for wine rack promos</p>
              </button>

              <button
                onClick={() => setTemplate('pricetag')}
                className={`p-3 text-left border rounded-xl font-semibold cursor-pointer ${
                  template === 'pricetag'
                    ? 'border-zinc-950 bg-zinc-50/50 dark:border-white dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <p className="font-bold">Price Sticker (1x2 in)</p>
                <p className="text-[10px] font-normal text-zinc-400">Barcode & Price bottle label</p>
              </button>

              <button
                onClick={() => setTemplate('poster')}
                className={`p-3 text-left border rounded-xl font-semibold cursor-pointer ${
                  template === 'poster'
                    ? 'border-zinc-950 bg-zinc-50/50 dark:border-white dark:bg-zinc-800 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                <p className="font-bold">Clearance Poster (Letter)</p>
                <p className="text-[10px] font-normal text-zinc-400">Large store discount placard</p>
              </button>
            </div>
          </div>

          {/* Custom overrides */}
          <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Custom overrides</span>
            
            <div className="space-y-1.5">
              <label className="block text-[9px] text-zinc-500 uppercase font-bold">Badge Banner text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. CUSTOMER CHOSEN"
                className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] text-zinc-500 uppercase font-bold">Price Override ($)</label>
              <input
                type="number"
                step="0.01"
                value={customPriceOverride}
                onChange={(e) => setCustomPriceOverride(e.target.value)}
                placeholder={`Default: $${selectedProduct?.price_per_bottle.toFixed(2)}`}
                className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-3 rounded-xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          Send to Label Printer
        </button>
      </div>

      {/* Interactive visual canvas right side */}
      <div className="flex-1 bg-zinc-100 dark:bg-[#0d0d0f] flex items-center justify-center p-8 overflow-y-auto">
        {selectedProduct ? (
          <div className="space-y-4 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Live Print Render Preview</span>
            
            {/* Template 1: Shelf Talker */}
            {template === 'shelftalker' && (
              <div className="w-[320px] h-[480px] bg-white border-2 border-zinc-900 p-6 flex flex-col justify-between text-zinc-900 shadow-2xl relative select-none rounded-xl">
                {/* Vintage border accent */}
                <div className="absolute inset-2 border border-zinc-200 rounded-lg pointer-events-none" />

                <div className="text-center space-y-2 relative">
                  <div className="bg-zinc-900 text-white text-[9px] font-bold uppercase py-1 tracking-widest rounded">
                    {badgeText || 'SPECIAL SELECTION'}
                  </div>
                  <h4 className="font-serif text-lg font-bold italic tracking-tight line-clamp-2 px-2 mt-4 text-zinc-800">
                    {customTitle || selectedProduct.name}
                  </h4>
                  <p className="text-[10px] tracking-wider text-zinc-400 font-bold uppercase">
                    Category: {selectedProduct.category}
                  </p>
                </div>

                {/* Big typography price */}
                <div className="text-center relative py-6">
                  <span className="text-sm font-bold align-super">$</span>
                  <span className="text-6xl font-serif font-black tracking-tighter">
                    {customPriceOverride ? Number(customPriceOverride).toFixed(2).split('.')[0] : selectedProduct.price_per_bottle.toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-xl font-bold align-super">
                    .{customPriceOverride ? customPriceOverride.split('.')[1] || '00' : selectedProduct.price_per_bottle.toFixed(2).split('.')[1]}
                  </span>
                </div>

                {/* Wine rating & qr code */}
                <div className="flex items-end justify-between border-t border-zinc-200 pt-4 relative">
                  <div className="text-left space-y-1">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">PRODUCT DESCR</p>
                    <p className="text-[10px] leading-tight font-medium w-36 text-zinc-600 line-clamp-3">
                      Selected premium grape harvest. Aged to pristine perfection.
                    </p>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 p-2 rounded flex flex-col items-center gap-1">
                    <QrCode className="h-8 w-8 text-zinc-800 stroke-[1.5]" />
                    <span className="text-[6px] font-bold font-mono">SCAN TO BUY</span>
                  </div>
                </div>
              </div>
            )}

            {/* Template 2: Price Sticker */}
            {template === 'pricetag' && (
              <div className="w-[280px] h-[140px] bg-white border border-zinc-300 p-4 flex items-center justify-between text-zinc-900 shadow-2xl relative select-none rounded-lg">
                <div className="flex flex-col justify-between h-full w-2/3">
                  <div>
                    <h4 className="font-bold text-[11px] leading-tight line-clamp-2">
                      {customTitle || selectedProduct.name}
                    </h4>
                    <p className="text-[9px] text-zinc-400 font-semibold uppercase">{selectedProduct.category}</p>
                  </div>

                  {/* Mock Barcode pattern lines */}
                  <div className="space-y-1 pt-2">
                    <div className="h-6 flex items-stretch gap-[2px]">
                      <div className="w-[3px] bg-black" />
                      <div className="w-[1px] bg-black" />
                      <div className="w-[4px] bg-black" />
                      <div className="w-[1px] bg-black" />
                      <div className="w-[2px] bg-black" />
                      <div className="w-[5px] bg-black" />
                      <div className="w-[1px] bg-black" />
                      <div className="w-[3px] bg-black" />
                      <div className="w-[2px] bg-black" />
                      <div className="w-[1px] bg-black" />
                      <div className="w-[4px] bg-black" />
                    </div>
                    <span className="text-[8px] font-mono tracking-widest text-zinc-500 block">
                      {selectedProduct.barcode || '78290192301'}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col justify-between h-full border-l border-dashed border-zinc-200 pl-4">
                  <span className="text-[8px] font-bold bg-zinc-900 text-white px-1.5 py-0.5 rounded uppercase">
                    AURA
                  </span>
                  <p className="text-2xl font-black font-mono tracking-tight">
                    ${customPriceOverride ? Number(customPriceOverride).toFixed(2) : selectedProduct.price_per_bottle.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Template 3: Poster */}
            {template === 'poster' && (
              <div className="w-[360px] h-[500px] bg-red-600 text-white p-8 flex flex-col justify-between shadow-2xl relative select-none rounded-xl text-center">
                <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded pointer-events-none" />

                <div className="space-y-2 mt-4">
                  <span className="bg-white text-red-600 text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase shadow">
                    {badgeText || 'SPECIAL OFFERS'}
                  </span>
                  <h3 className="text-2xl font-black tracking-tighter uppercase pt-4 line-clamp-2">
                    {customTitle || selectedProduct.name}
                  </h3>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider opacity-90">TAKE IT HOME FOR ONLY</p>
                  <p className="text-7xl font-black font-mono tracking-tighter">
                    ${customPriceOverride ? Number(customPriceOverride).toFixed(2) : selectedProduct.price_per_bottle.toFixed(2)}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Aura Retail Channels Club Specials
                  </p>
                  <p className="text-[9px] opacity-60">Quantities limited. While stocks last.</p>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-zinc-400">Please choose a product to load label previews.</div>
        )}
      </div>

    </div>
  );
}
