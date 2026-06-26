import React, { useState } from 'react';
import { Megaphone, Mail, MessageSquare, Plus, Search, Tag, Globe, Sparkles, Send, Users, ShieldCheck, Check } from 'lucide-react';
import { Customer, DiscountRule } from '../types';

interface MarketingProps {
  customers: Customer[];
  discountRules: DiscountRule[];
  onAddDiscountRule: (rule: DiscountRule) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface Campaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'Google Merchant';
  audience: string;
  promoCode?: string;
  status: 'Draft' | 'Sent';
  sentAt?: string;
  clicks: number;
  conversions: number;
}

export default function Marketing({ customers, discountRules, onAddDiscountRule, showToast }: MarketingProps) {
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'google_merchant'>('campaigns');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    return [
      {
        id: 'CAMP-001',
        name: 'July 4th Wine Clearance',
        type: 'Email',
        audience: 'Wine Enthusiasts (48 subscribers)',
        promoCode: 'SAVE5',
        status: 'Sent',
        sentAt: '2026-06-22T09:00:00Z',
        clicks: 142,
        conversions: 34
      },
      {
        id: 'CAMP-002',
        name: 'Weekly Flash Deals',
        type: 'SMS',
        audience: 'All VIP Club (124 subscribers)',
        promoCode: 'VIP15',
        status: 'Sent',
        sentAt: '2026-06-25T11:30:00Z',
        clicks: 312,
        conversions: 89
      }
    ];
  });

  const [isCreating, setIsCreating] = useState(false);
  const [campName, setCampName] = useState('');
  const [campType, setCampType] = useState<'Email' | 'SMS'>('Email');
  const [audienceCohort, setAudienceCohort] = useState('All Customers');
  const [campMessage, setCampMessage] = useState('');
  const [linkCouponCode, setLinkCouponCode] = useState('');
  const [createCouponAutomatic, setCreateCouponAutomatic] = useState(false);
  const [autoCouponDiscount, setAutoCouponDiscount] = useState(15);

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) {
      showToast('Please enter a campaign name', 'error');
      return;
    }

    let linkedCode = linkCouponCode;
    
    // Automatically generate coupon in Discounts if checked!
    if (createCouponAutomatic) {
      linkedCode = `MKT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const newRule: DiscountRule = {
        id: `rule_auto_${Date.now()}`,
        name: `${campName} Coupon (${linkedCode})`,
        type: 'coupon',
        code: linkedCode,
        discountPercent: autoCouponDiscount,
        isActive: true
      };
      onAddDiscountRule(newRule);
      showToast(`Coupon ${linkedCode} (${autoCouponDiscount}% Off) created automatically in Discount settings!`, 'success');
    }

    const newCampaign: Campaign = {
      id: `CAMP-${Math.floor(100 + Math.random() * 900)}`,
      name: campName,
      type: campType,
      audience: `${audienceCohort} (${customers.length} subscribers)`,
      promoCode: linkedCode || undefined,
      status: 'Sent',
      sentAt: new Date().toISOString(),
      clicks: 0,
      conversions: 0
    };

    setCampaigns([newCampaign, ...campaigns]);
    setIsCreating(false);
    setCampName('');
    setCampMessage('');
    setLinkCouponCode('');
    setCreateCouponAutomatic(false);
    showToast(`Campaign "${campName}" sent to ${customers.length} users successfully!`, 'success');
  };

  const [googleMerchantSyncing, setGoogleMerchantSyncing] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const handleGoogleSync = () => {
    setGoogleMerchantSyncing(true);
    setTimeout(() => {
      setGoogleMerchantSyncing(false);
      setGoogleStatus('connected');
      showToast('Google Merchant Center local inventory feed catalog fully synchronized successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      
      {/* Action Bar */}
      <div className="h-16 px-6 border-b border-[#e4e4e7] dark:border-[#27272a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            <h2 className="text-sm font-bold text-[#09090b] dark:text-white uppercase tracking-wider">
              Marketing & Channels
            </h2>
          </div>
          
          <div className="flex border-l border-[#e4e4e7] dark:border-[#27272a] pl-4 gap-2">
            <button
              onClick={() => setActiveSubTab('campaigns')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                activeSubTab === 'campaigns'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Email & SMS Blast
            </button>
            <button
              onClick={() => setActiveSubTab('google_merchant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'google_merchant'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Google Merchant
            </button>
          </div>
        </div>

        {activeSubTab === 'campaigns' && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Campaign Blast
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeSubTab === 'google_merchant' ? (
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-amber-500 flex items-center justify-center font-bold text-white text-xs">G</span>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Google Merchant Center integration</h3>
                </div>
                <p className="text-xs text-zinc-500">
                  Drive foot traffic and online orders by listing your local store products on Google Search, Maps, and Google Shopping.
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                googleStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
              }`}>
                {googleStatus === 'connected' ? 'Connected' : 'Not Connected'}
              </span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/60 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Live Google Local Inventory Status</span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase">Synced Products</p>
                  <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                    {googleStatus === 'connected' ? '45 items online' : '0 items'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase">Merchant Feed ID</p>
                  <p className="text-sm font-bold font-mono text-zinc-900 dark:text-white">
                    {googleStatus === 'connected' ? 'MC-ID-884920' : '--'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Sync Strategy Configuration</h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/10 rounded-xl border border-zinc-100 dark:border-zinc-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-zinc-900" />
                  <div>
                    <p className="font-semibold">Synchronize loose stock counts (Local Inventory Ads)</p>
                    <p className="text-[10px] text-zinc-500">Allows customer to see local "In Stock" tags on Google Maps searches</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/10 rounded-xl border border-zinc-100 dark:border-zinc-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-zinc-900" />
                  <div>
                    <p className="font-semibold">Automatic real-time API delta push on sale</p>
                    <p className="text-[10px] text-zinc-500">Every time a product is purchased at Register, update Google Merchant counts instantly</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleGoogleSync}
              disabled={googleMerchantSyncing}
              className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-3 rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {googleMerchantSyncing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin text-zinc-400" />
                  Syncing inventory and catalog feed...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  Publish & Sync Catalog to Google
                </>
              )}
            </button>
          </div>
        ) : isCreating ? (
          <form onSubmit={handleSendCampaign} className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-6 max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Launch Multi-Channel Campaign Blast
              </h3>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="e.g. Premium Napa Cabernet Tasting Announcement"
                  className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Channel / Type
                  </label>
                  <select
                    value={campType}
                    onChange={(e) => setCampType(e.target.value as any)}
                    className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3"
                  >
                    <option value="Email">Email Marketing</option>
                    <option value="SMS">SMS Text Blast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Audience Cohort
                  </label>
                  <select
                    value={audienceCohort}
                    onChange={(e) => setAudienceCohort(e.target.value)}
                    className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3"
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="VIP Club Members">VIP Club Members</option>
                    <option value="Frequent Wine Buyers">Frequent Wine Buyers</option>
                    <option value="Unsubscribe Cohort">Lapsed Customers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Message Copy
                </label>
                <textarea
                  required
                  rows={4}
                  value={campMessage}
                  onChange={(e) => setCampMessage(e.target.value)}
                  placeholder="Type your message text here..."
                  className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-white font-sans"
                />
              </div>

              {/* ERP linkage: automatically spawn promo code */}
              <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/40 dark:bg-zinc-900/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createCouponAutomatic}
                    onChange={(e) => setCreateCouponAutomatic(e.target.checked)}
                    className="rounded text-zinc-950"
                  />
                  <div>
                    <p className="font-semibold">Automatically generate promo coupon in registry</p>
                    <p className="text-[10px] text-zinc-500">Will make a custom code redeemable at Checkout</p>
                  </div>
                </label>

                {createCouponAutomatic ? (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Discount Percent (%)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={autoCouponDiscount}
                        onChange={(e) => setAutoCouponDiscount(Number(e.target.value))}
                        className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                        Live Preview Code
                      </label>
                      <input
                        type="text"
                        disabled
                        value="[ AUTO-GENERATED ]"
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2 text-zinc-400 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">
                      Link Existing Promo Code (Optional)
                    </label>
                    <select
                      value={linkCouponCode}
                      onChange={(e) => setLinkCouponCode(e.target.value)}
                      className="w-full bg-[#fafafa] dark:bg-[#09090b] border border-[#e4e4e7] dark:border-[#27272a] rounded-xl p-2 font-mono"
                    >
                      <option value="">-- No linked coupon --</option>
                      {discountRules.filter(r => r.type === 'coupon' && r.code).map(r => (
                        <option key={r.id} value={r.code}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-3 rounded-xl text-xs font-bold hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Launch & Broadcast Blast
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">SMS/Email Subscribers</p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">{customers.length * 12 + 20}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Campaigns Sent</p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">{campaigns.length}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Conversion Revenue</p>
                  <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                    ${campaigns.reduce((acc, c) => acc + (c.conversions * 45), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Campaign Table list */}
            <div className="bg-white dark:bg-[#121214] border border-[#e4e4e7] dark:border-[#27272a] rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                <h3 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Active Campaigns</h3>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {campaigns.map(camp => (
                  <div key={camp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                          {camp.id}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          camp.type === 'Email' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                          {camp.type === 'Email' ? <Mail className="h-2.5 w-2.5" /> : <MessageSquare className="h-2.5 w-2.5" />}
                          {camp.type}
                        </span>
                      </div>
                      <p className="font-bold text-zinc-900 dark:text-white">{camp.name}</p>
                      <p className="text-[10px] text-zinc-500">Audience: {camp.audience}</p>
                      {camp.promoCode && (
                        <div className="pt-1 flex items-center gap-1 text-[9px] font-mono text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded w-max">
                          <Tag className="h-2.5 w-2.5" />
                          <span>Promo Linked: {camp.promoCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-center md:text-right">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase">Receipts</p>
                        <p className="font-bold font-mono text-zinc-900 dark:text-white">Success</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase">Clicks</p>
                        <p className="font-bold font-mono text-zinc-900 dark:text-white">{camp.clicks}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase">Conversions</p>
                        <p className="font-bold font-mono text-zinc-900 dark:text-white">{camp.conversions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
