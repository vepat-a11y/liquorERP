import React, { useState, useEffect } from 'react';
import { 
  Laptop, Smartphone, Palette, Type, Image, Layout, Sparkles, Check, 
  ArrowUp, ArrowDown, Eye, EyeOff, Globe, RefreshCw, ShoppingBag, Plus, Minus, 
  Trash2, X, MapPin, Phone, Mail, Clock, Store, Beer, Wine, ChevronRight,
  ArrowLeft, Copy, Sliders, Upload, Star, Play, HelpCircle, FileText, Gift,
  ShieldAlert, Award, Truck
} from 'lucide-react';
import { Product, DiscountRule, DeliveryOrder } from '../types';

interface WebsiteBuilderProps {
  tenantId: string;
  products: Product[];
  discountRules: DiscountRule[];
  incomingOrders: DeliveryOrder[];
  setIncomingOrders: React.Dispatch<React.SetStateAction<DeliveryOrder[]>>;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface Section {
  id: string;
  type: string;
  name: string;
  active: boolean;
  settings: Record<string, any>;
}

export default function WebsiteBuilder({
  tenantId,
  products,
  discountRules,
  incomingOrders,
  setIncomingOrders,
  showToast
}: WebsiteBuilderProps) {
  // Device simulator
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'sections' | 'theme'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Global Theme Settings
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#8b5cf6', // violet
    secondaryColor: '#f43f5e', // rose
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    headerBgColor: '#ffffff',
    footerBgColor: '#111827',
    fontFamily: 'Inter', // Inter, Playfair Display, Space Grotesk, JetBrains Mono, Cormorant Garamond, Cinzel, Montserrat
    logoType: 'text' as 'text' | 'image',
    logoText: 'Obsidian Vintage Reserve',
    logoUrl: '',
    logoStyle: 'wine' as 'wine' | 'beer' | 'cocktail' | 'store',
    
    // Age Gate
    ageGateEnabled: true,
    ageGateTitle: 'Age Verification Required',
    ageGateDescription: 'You must be at least 21 years of age to access our craft spirits cellar.',
    ageGateYesText: 'Yes, I am 21+',
    ageGateNoText: 'No, Exit',
    ageGateForceShow: false,
    ageGateBgColor: '#111827',
    ageGateTextColor: '#ffffff',
    ageGateBtnColor: '#8b5cf6',

    // Newsletter Promo Popup
    newsletterPopupEnabled: true,
    newsletterPopupTitle: 'Unlock the Private Reserve',
    newsletterPopupOffer: 'Join our guild today and get an immediate 15% off coupon code for your next premium spirits order.',
    newsletterPopupPlaceholder: 'Enter your premium email address...',
    newsletterPopupCta: 'Request Membership Access',
    newsletterPopupSuccess: 'Welcome to the inner circle! Use code VIP15 for 15% off.',
    newsletterPopupImageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=300',
    newsletterPopupDelay: 2,
    newsletterPopupForceShow: false
  });

  // Load fonts dynamically
  useEffect(() => {
    const fontLink = document.getElementById('g-fonts-custom');
    const url = `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700;900&family=JetBrains+Mono:wght@400;700&family=Montserrat:wght@400;600;800&display=swap`;
    if (fontLink) {
      fontLink.setAttribute('href', url);
    } else {
      const link = document.createElement('link');
      link.id = 'g-fonts-custom';
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
  }, []);

  // Popup states
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [newsletterClosed, setNewsletterClosed] = useState(false);
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Auto-trigger Newsletter Popup after a delay
  useEffect(() => {
    if (themeConfig.newsletterPopupEnabled && !themeConfig.newsletterPopupForceShow && !newsletterClosed) {
      const timer = setTimeout(() => {
        setIsNewsletterOpen(true);
      }, themeConfig.newsletterPopupDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [themeConfig.newsletterPopupEnabled, themeConfig.newsletterPopupDelay, themeConfig.newsletterPopupForceShow, newsletterClosed]);

  // Section List State
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'sec-alert',
      type: 'alert',
      name: 'Alert Notification Banner',
      active: true,
      settings: { text: '✨ FREE LOCAL DELIVERY ON ORDERS OVER $50 • 10% OFF WINE BOXES ✨' }
    },
    {
      id: 'sec-hero',
      type: 'hero',
      name: 'Aesthetic Hero Banner',
      active: true,
      settings: {
        title: 'Curated Fine Spirits & Craft Liquors',
        subtitle: 'Expertly selected reserve vintages, limited boutique brewery batches, and high-altitude artisanal spirits curated for the sophisticated collector.',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600',
        align: 'left',
        btnText: 'Shop Curated Reserve',
        overlay: 55
      }
    },
    {
      id: 'sec-bento',
      type: 'promo',
      name: 'Bento Promo Highlights',
      active: true,
      settings: {
        title: 'Obsidian Reserve Promises',
        subtitle: 'Premium standards that define our selection process',
        items: [
          { title: 'Local Cold Delivery', desc: 'Delivered chilled in 2 hours with eco-friendly containers.', icon: 'Truck' },
          { title: 'Sommelier Choice', desc: 'Each barrel hand-selected by certified masters.', icon: 'Award' },
          { title: 'Vaulted Cellarage', desc: 'Stored at strict 55°F temperature & 70% humidity.', icon: 'Store' }
        ]
      }
    },
    {
      id: 'sec-catalog',
      type: 'catalog',
      name: 'Live Product Menu Shop',
      active: true,
      settings: {
        title: 'E-Commerce Reserve Catalog',
        subtitle: 'Bottled inventory updated directly from current POS cache',
        columns: 3,
        category: 'All'
      }
    },
    {
      id: 'sec-testimonials',
      type: 'testimonials',
      name: 'Customer Testimonials',
      active: true,
      settings: {
        title: 'Collector Endorsements',
        subtitle: 'Trusted by premium spirits collectors globally.',
        reviews: [
          { name: 'Sarah J.', rating: 5, comment: 'The vintage barrel choices here are exceptional. My order arrived perfectly chilled.' },
          { name: 'Arthur P.', rating: 5, comment: 'Incredible Sommelier consulting. Saved my wedding anniversary party!' }
        ]
      }
    },
    {
      id: 'sec-footer',
      type: 'footer',
      name: 'Interactive Location & Footer',
      active: true,
      settings: {
        aboutText: 'Established in 2012, our family bottle boutique prides itself on source traceability, pristine cellar temp storage, and direct partnership with independent craft vineyards.',
        address: '1048 Obsidian Way, Suite B, Downtown',
        phone: '(555) 492-9018',
        email: 'sommelier@obsidianreserve.com',
        hours: 'Mon-Sat: 10:00 AM - 10:00 PM'
      }
    }
  ]);

  // Section Ordering & Visibility
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[nextIdx];
    updated[nextIdx] = temp;
    setSections(updated);
    showToast(`Reordered section "${temp.name}"`, 'info');
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    setEditingSectionId(null);
    showToast('Deleted section block from theme.', 'info');
  };

  const duplicateSection = (section: Section) => {
    const copy: Section = {
      ...section,
      id: `sec-${section.type}-${Date.now()}`,
      name: `${section.name} (Copy)`
    };
    const idx = sections.findIndex(s => s.id === section.id);
    const updated = [...sections];
    updated.splice(idx + 1, 0, copy);
    setSections(updated);
    showToast(`Duplicated "${section.name}"!`, 'success');
  };

  const addSection = (type: string) => {
    const templates: Record<string, Partial<Section>> = {
      alert: { type: 'alert', name: 'Alert Notification Banner', settings: { text: '✨ SPECIAL PROMOTIONAL NOTICE HERE ✨' } },
      hero: { type: 'hero', name: 'Aesthetic Hero Banner', settings: { title: 'Modern Craft Distillery Room', subtitle: 'Join us for custom barrel imports, direct distillations, and live tastings.', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600', align: 'center', btnText: 'Reserve Bottle Now', overlay: 40 } },
      promo: { type: 'promo', name: 'Bento Promo Highlights', settings: { title: 'Core Advantages', subtitle: 'Our benchmark standards', items: [{ title: 'Free Local Ship', desc: 'No-charge delivery for premium subscribers.', icon: 'Truck' }] } },
      catalog: { type: 'catalog', name: 'Live Product Menu Shop', settings: { title: 'Fresh Seasonal Barrel list', subtitle: 'Bottled inventory updated directly', columns: 3, category: 'All' } },
      faq: { type: 'faq', name: 'FAQ Accordion', settings: { title: 'Frequently Asked Questions', subtitle: 'Get answers to common deliveries and curations', faqs: [{ q: 'Is a physical ID checked?', a: 'Yes. State law requires physical 21+ ID check upon package dropoff.' }] } },
      testimonials: { type: 'testimonials', name: 'Customer Testimonials', settings: { title: 'Social Reviews', subtitle: 'Enthusiast ratings', reviews: [{ name: 'Marcella S.', rating: 5, comment: 'Cold chain shipping was flawless.' }] } },
      lookbook: { type: 'lookbook', name: 'The Cellar Lookbook', settings: { title: 'Vintages Lookbook Portfolio', subtitle: 'A quick tour inside our reserves', images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400', 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&q=80&w=400'] } },
      about: { type: 'about', name: 'About Us Story Block', settings: { aboutText: 'We curate boutique liquors from independent producers around the globe.', aboutText2: 'Our humidity-controlled brick vaults guarantee perfect maturation.', image: 'https://images.unsplash.com/photo-1594462106222-3cf22d45a8f5?auto=format&fit=crop&q=80&w=300', layout: 'left' } },
      video: { type: 'video', name: 'Featured Video Block', settings: { title: 'Tour Our Private Vineyard Vaults', subtitle: 'A deep look at our traditional wine crafting process.', videoPlaceholder: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' } },
      newsletter: { type: 'newsletter', name: 'Newsletter Form Block', settings: { title: 'Join the Cellar Guild Newsletter', subtitle: 'Get private vault allocations and weekend testing invites.', placeholder: 'Your email...', ctaText: 'Join Guild' } },
      footer: { type: 'footer', name: 'Interactive Location & Footer', settings: { aboutText: 'Premium provisions for collectors.', address: '123 Vineyard Lane', phone: '(555) 0122', email: 'hello@vineyard.com', hours: 'Daily: 11AM - 9PM' } }
    };

    const tpl = templates[type];
    if (tpl) {
      const newId = `sec-${type}-${Date.now()}`;
      const newSection: Section = { id: newId, type: tpl.type!, name: tpl.name!, active: true, settings: { ...tpl.settings } };
      
      const footerIdx = sections.findIndex(s => s.type === 'footer');
      const updated = [...sections];
      if (footerIdx !== -1) {
        updated.splice(footerIdx, 0, newSection);
      } else {
        updated.push(newSection);
      }
      setSections(updated);
      setEditingSectionId(newId);
      showToast(`Added section block "${newSection.name}"!`, 'success');
    }
  };

  // Image Upload handler (logo)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThemeConfig(prev => ({ ...prev, logoType: 'image', logoUrl: reader.result as string }));
        showToast('Logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Upload handler (newsletter image)
  const handleNewsletterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThemeConfig(prev => ({ ...prev, newsletterPopupImageUrl: reader.result as string }));
        showToast('Newsletter pop-up image updated!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulated shopping cart
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountRule | null>(null);

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [orderType, setOrderType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [simCategory, setSimCategory] = useState<'All' | 'Wine' | 'Beer' | 'Liquor'>('All');

  // FAQ open question tracker (FAQ section)
  const [faqOpenMap, setFaqOpenMap] = useState<Record<string, boolean>>({});

  // Video playback simulation
  const [isVideoPlaying, setIsVideoPlaying] = useState<Record<string, boolean>>({});

  const addToSimCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price_per_bottle * item.qty), 0);
    let discount = 0;
    cart.forEach(item => {
      const rule = discountRules.find(r => r.isActive && r.type === 'category' && r.category === item.product.category);
      if (rule && rule.minQuantity && item.qty >= rule.minQuantity) {
        discount += rule.discountPercent ? (item.product.price_per_bottle * item.qty * (rule.discountPercent / 100)) : (rule.discountAmount || 0);
      }
    });
    if (appliedCoupon) {
      discount += appliedCoupon.discountPercent ? ((subtotal - discount) * (appliedCoupon.discountPercent / 100)) : (appliedCoupon.discountAmount || 0);
    }
    const tax = Math.max(0, (subtotal - discount) * 0.0825);
    return { subtotal, discount, tax, total: Math.max(0, subtotal - discount + tax) };
  };

  const handleApplyCoupon = () => {
    const matched = discountRules.find(r => r.isActive && r.type === 'coupon' && r.code?.toUpperCase() === coupon.trim().toUpperCase());
    if (matched) {
      setAppliedCoupon(matched);
      showToast(`Coupon "${coupon.toUpperCase()}" applied!`, 'success');
    } else {
      showToast('Invalid coupon code.', 'error');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!custName.trim() || !custPhone.trim()) {
      showToast('Name and phone are required.', 'error');
      return;
    }
    if (orderType === 'Delivery' && !deliveryAddress.trim()) {
      showToast('Delivery address is required.', 'error');
      return;
    }

    const orderId = 'WEB-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: DeliveryOrder = {
      id: orderId,
      platform: orderType === 'Pickup' ? 'Website Instore Pickup' : 'Website Delivery',
      customer: `${custName} (${orderType})`,
      phone: custPhone,
      address: orderType === 'Delivery' ? deliveryAddress : undefined,
      items: cart.map(item => ({ productName: item.product.name, productId: item.product.id, qty: item.qty })),
      total: calculateTotals().total,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setIncomingOrders(prev => [newOrder, ...prev]);
    setCheckoutStep('success');
    showToast(`🔔 Order ${orderId} submitted to POS Feed!`, 'success');
  };

  const resetCart = () => {
    setCart([]);
    setIsCartOpen(false);
    setCheckoutStep('cart');
    setAppliedCoupon(null);
    setCoupon('');
    setCustName('');
    setCustPhone('');
    setDeliveryAddress('');
  };

  const renderIcon = (name: string, className = "h-5 w-5") => {
    switch (name) {
      case 'Truck': return <Truck className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Store': return <Store className={className} />;
      case 'Check': return <Check className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Find currently editing section
  const currentSection = sections.find(s => s.id === editingSectionId);

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      
      {/* LEFT: SHOPIFY-STYLE THEME & SECTION SIDEBAR */}
      <div className="w-full md:w-5/12 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full overflow-hidden">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Shopify Theme Editor
              </h3>
              <p className="text-[10px] text-zinc-400">Design dynamic pages & components</p>
            </div>
          </div>
          
          <button
            onClick={() => showToast('All changes published & active on client portal!', 'success')}
            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Globe className="h-3 w-3" />
            Publish Live
          </button>
        </div>

        {/* Global tab toggler */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={() => { setActiveSidebarTab('sections'); setEditingSectionId(null); }}
            className={`flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSidebarTab === 'sections'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            Page Sections
          </button>
          <button
            onClick={() => setActiveSidebarTab('theme')}
            className={`flex-1 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSidebarTab === 'theme'
                ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Theme Settings
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: SECTIONS LIST & DND */}
          {activeSidebarTab === 'sections' && (
            <>
              {editingSectionId === null ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Layout Blocks & Sections</span>
                    <span className="text-[8px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-mono uppercase font-bold">Live Grid</span>
                  </div>

                  <div className="space-y-1.5">
                    {sections.map((sec, idx) => (
                      <div 
                        key={sec.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          sec.active 
                            ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-800 dark:text-zinc-100' 
                            : 'border-zinc-100 dark:border-zinc-900 bg-zinc-100/30 dark:bg-zinc-900/5 text-zinc-400 line-through'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSection(sec.id)}
                            className="text-zinc-400 hover:text-zinc-900 transition-colors"
                            title={sec.active ? 'Hide Section' : 'Show Section'}
                          >
                            {sec.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => setEditingSectionId(sec.id)}
                            className="hover:underline text-left cursor-pointer truncate max-w-[140px]"
                          >
                            {sec.name}
                          </button>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, 'up')}
                            className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            disabled={idx === sections.length - 1}
                            onClick={() => moveSection(idx, 'down')}
                            className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-20"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateSection(sec)}
                            className="p-1 rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteSection(sec.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Add Section templates dropdown */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">+ Add Custom Section Block</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { type: 'alert', label: 'Alert Notice', desc: 'Promotional bar' },
                        { type: 'hero', label: 'Hero Banner', desc: 'Cover visual header' },
                        { type: 'promo', label: 'Bento Grid', desc: 'Promise highlighters' },
                        { type: 'catalog', label: 'Product Catalog', desc: 'Online catalog grid' },
                        { type: 'faq', label: 'FAQ Accordion', desc: 'Interactive answers' },
                        { type: 'testimonials', label: 'Testimonials', desc: 'Enthusiast feedback' },
                        { type: 'lookbook', label: 'Lookbook', desc: 'Lifestyle gallery' },
                        { type: 'about', label: 'About Us', desc: 'Two-column story' },
                        { type: 'video', label: 'Featured Video', desc: 'Video showcase' },
                        { type: 'newsletter', label: 'Newsletter Form', desc: 'Subscription block' }
                      ].map(secTpl => (
                        <button
                          key={secTpl.type}
                          onClick={() => addSection(secTpl.type)}
                          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                        >
                          <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200">{secTpl.label}</p>
                          <p className="text-[8px] text-zinc-400">{secTpl.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* SECTION INNER CONFIGURATOR SCREEN */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <button 
                      onClick={() => setEditingSectionId(null)}
                      className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <h4 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">Configure Section</h4>
                      <p className="text-[9px] text-zinc-400">Editing: {currentSection?.name}</p>
                    </div>
                  </div>

                  {currentSection && (
                    <div className="space-y-4">
                      {/* Name editor */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Display Title Label</label>
                        <input
                          type="text"
                          value={currentSection.name}
                          onChange={(e) => {
                            setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, name: e.target.value } : s));
                          }}
                          className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                        />
                      </div>

                      {/* Render settings dynamically based on section type */}
                      {currentSection.type === 'alert' && (
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 block mb-1">Promo Notice Ticker Text</label>
                          <textarea
                            value={currentSection.settings.text || ''}
                            onChange={(e) => {
                              setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, text: e.target.value } } : s));
                            }}
                            rows={3}
                            className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                          />
                        </div>
                      )}

                      {currentSection.type === 'hero' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Hero Heading Title</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Hero Subtitle Paragraph</label>
                            <textarea
                              value={currentSection.settings.subtitle || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, subtitle: e.target.value } } : s));
                              }}
                              rows={3}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">CTA Button Text</label>
                            <input
                              type="text"
                              value={currentSection.settings.btnText || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, btnText: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Overlay Dim %</label>
                            <input
                              type="range"
                              min="0"
                              max="90"
                              value={currentSection.settings.overlay || 40}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, overlay: parseInt(e.target.value) } } : s));
                              }}
                              className="w-full accent-violet-600"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Background Image URL</label>
                            <input
                              type="text"
                              value={currentSection.settings.image || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, image: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'catalog' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Section Title</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Grid Display Columns</label>
                            <select
                              value={currentSection.settings.columns || 3}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, columns: parseInt(e.target.value) } } : s));
                              }}
                              className="w-full text-xs font-semibold px-2 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            >
                              <option value="2">2 Columns Grid</option>
                              <option value="3">3 Columns Grid</option>
                              <option value="4">4 Columns Grid (Compact)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'promo' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Highlights Headline</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Highlights Subtitle</label>
                            <input
                              type="text"
                              value={currentSection.settings.subtitle || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, subtitle: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Bento Card 1</span>
                            <input
                              type="text"
                              placeholder="Title"
                              value={currentSection.settings.items?.[0]?.title || ''}
                              onChange={(e) => {
                                const arr = [...(currentSection.settings.items || [])];
                                if (!arr[0]) arr[0] = { title: '', desc: '', icon: 'Truck' };
                                arr[0].title = e.target.value;
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, items: arr } } : s));
                              }}
                              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none"
                            />
                            <textarea
                              placeholder="Description text"
                              value={currentSection.settings.items?.[0]?.desc || ''}
                              onChange={(e) => {
                                const arr = [...(currentSection.settings.items || [])];
                                if (!arr[0]) arr[0] = { title: '', desc: '', icon: 'Truck' };
                                arr[0].desc = e.target.value;
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, items: arr } } : s));
                              }}
                              className="w-full text-[11px] px-2.5 py-1.5 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'about' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Story Paragraph 1</label>
                            <textarea
                              value={currentSection.settings.aboutText || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, aboutText: e.target.value } } : s));
                              }}
                              rows={3}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Story Paragraph 2</label>
                            <textarea
                              value={currentSection.settings.aboutText2 || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, aboutText2: e.target.value } } : s));
                              }}
                              rows={3}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Image Illustration URL</label>
                            <input
                              type="text"
                              value={currentSection.settings.image || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, image: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Image Position Layout</label>
                            <select
                              value={currentSection.settings.layout || 'left'}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, layout: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-2 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            >
                              <option value="left">Image on Left Side</option>
                              <option value="right">Image on Right Side</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'testimonials' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Headline</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Testimonial 1</span>
                            <input
                              type="text"
                              placeholder="Reviewer Name"
                              value={currentSection.settings.reviews?.[0]?.name || ''}
                              onChange={(e) => {
                                const arr = [...(currentSection.settings.reviews || [])];
                                if (!arr[0]) arr[0] = { name: '', comment: '', rating: 5 };
                                arr[0].name = e.target.value;
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, reviews: arr } } : s));
                              }}
                              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none"
                            />
                            <textarea
                              placeholder="Quote text"
                              value={currentSection.settings.reviews?.[0]?.comment || ''}
                              onChange={(e) => {
                                const arr = [...(currentSection.settings.reviews || [])];
                                if (!arr[0]) arr[0] = { name: '', comment: '', rating: 5 };
                                arr[0].comment = e.target.value;
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, reviews: arr } } : s));
                              }}
                              className="w-full text-[11px] px-2.5 py-1.5 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'faq' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Accordion Headline</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl space-y-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Accordion Question 1</span>
                            <input
                              type="text"
                              placeholder="Question"
                              value={currentSection.settings.faqs?.[0]?.q || ''}
                              onChange={(e) => {
                                const arr = [...(currentSection.settings.faqs || [])];
                                if (!arr[0]) arr[0] = { q: '', a: '' };
                                arr[0].q = e.target.value;
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, faqs: arr } } : s));
                              }}
                              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none"
                            />
                            <textarea
                              placeholder="Answer text"
                              value={currentSection.settings.faqs?.[0]?.a || ''}
                              onChange={(e) => {
                                const arr = [...(currentSection.settings.faqs || [])];
                                if (!arr[0]) arr[0] = { q: '', a: '' };
                                arr[0].a = e.target.value;
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, faqs: arr } } : s));
                              }}
                              className="w-full text-[11px] px-2.5 py-1.5 bg-white dark:bg-zinc-800 border rounded-lg focus:outline-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'video' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Video Header</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Cover Placeholder URL</label>
                            <input
                              type="text"
                              value={currentSection.settings.videoPlaceholder || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, videoPlaceholder: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Direct Video URL (.mp4)</label>
                            <input
                              type="text"
                              value={currentSection.settings.videoUrl || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, videoUrl: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'newsletter' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Heading Title</label>
                            <input
                              type="text"
                              value={currentSection.settings.title || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, title: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Submit CTA Button Text</label>
                            <input
                              type="text"
                              value={currentSection.settings.ctaText || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, ctaText: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      {currentSection.type === 'footer' && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Footer About text</label>
                            <textarea
                              value={currentSection.settings.aboutText || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, aboutText: e.target.value } } : s));
                              }}
                              rows={2}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Support Phone</label>
                            <input
                              type="text"
                              value={currentSection.settings.phone || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, phone: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 block mb-1">Store Address</label>
                            <input
                              type="text"
                              value={currentSection.settings.address || ''}
                              onChange={(e) => {
                                setSections(prev => prev.map(s => s.id === currentSection.id ? { ...s, settings: { ...s.settings, address: e.target.value } } : s));
                              }}
                              className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => deleteSection(currentSection.id)}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl text-xs font-bold transition-all mt-4 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete This Section Block
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: GLOBAL THEME SETTINGS (COLORS & TYPOGRAPHY) */}
          {activeSidebarTab === 'theme' && (
            <div className="space-y-4">
              
              {/* BRAND COLOR PALETTE */}
              <div className="space-y-3.5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">1. Color Palette Manager</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Primary Brand Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-8 w-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                        {themeConfig.primaryColor.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeConfig.secondaryColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="h-8 w-12 rounded cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <span className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-300">
                        {themeConfig.secondaryColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Canvas Background</label>
                    <input
                      type="color"
                      value={themeConfig.backgroundColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="h-8 w-full rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Canvas Text Color</label>
                    <input
                      type="color"
                      value={themeConfig.textColor}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      className="h-8 w-full rounded cursor-pointer border-0 p-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* CURATED TYPOGRAPHY */}
              <div className="space-y-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">2. Google Font Integrations</span>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Primary Store Font</label>
                  <select
                    value={themeConfig.fontFamily}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full text-xs font-semibold px-2.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                  >
                    <option value="Inter">Inter (Sans-Serif Standard)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech-Forward)</option>
                    <option value="Playfair Display">Playfair Display (Vintage Serif)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Classical Fine Wine)</option>
                    <option value="Cinzel">Cinzel (Artisan Sculpture)</option>
                    <option value="Montserrat">Montserrat (Geometric Grotesque)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Sleek Coding)</option>
                  </select>
                </div>
              </div>

              {/* LOGO CUSTOMIZATION & LOCAL FILE UPLOAD */}
              <div className="space-y-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">3. Persistent Brand Logo</span>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => setThemeConfig(prev => ({ ...prev, logoType: 'text' }))}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      themeConfig.logoType === 'text' ? 'border-zinc-950 bg-zinc-50 text-zinc-950' : 'border-zinc-100 text-zinc-400'
                    }`}
                  >
                    Text Brand
                  </button>
                  <button
                    onClick={() => setThemeConfig(prev => ({ ...prev, logoType: 'image' }))}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      themeConfig.logoType === 'image' ? 'border-zinc-950 bg-zinc-50 text-zinc-950' : 'border-zinc-100 text-zinc-400'
                    }`}
                  >
                    Image Upload
                  </button>
                </div>

                {themeConfig.logoType === 'text' ? (
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 block mb-1">Logo Text Name</label>
                    <input
                      type="text"
                      value={themeConfig.logoText}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, logoText: e.target.value }))}
                      className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 block mb-0.5">Upload Logo File (.png/.svg)</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 cursor-pointer transition-all">
                        <Upload className="h-4 w-4 text-zinc-400 mb-1" />
                        <span className="text-[9px] font-bold text-zinc-500">Choose custom image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {themeConfig.logoUrl && (
                        <div className="h-14 w-14 shrink-0 border rounded-xl overflow-hidden bg-zinc-50 flex items-center justify-center p-1">
                          <img src={themeConfig.logoUrl} className="h-full w-full object-contain" alt="Uploaded logo preview" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* AGE VERIFICATION GATE CUSTOMIZER */}
              <div className="space-y-3.5 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">4. Age Gate verification</span>
                  <input
                    type="checkbox"
                    checked={themeConfig.ageGateEnabled}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, ageGateEnabled: e.target.checked }))}
                    className="accent-violet-600 rounded"
                  />
                </div>

                {themeConfig.ageGateEnabled && (
                  <div className="space-y-3 animate-slide-in">
                    <div className="flex items-center justify-between p-2 bg-amber-500/10 text-amber-600 rounded-xl text-[9px] font-semibold">
                      <span>Preview Override: Force display gate?</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.ageGateForceShow}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, ageGateForceShow: e.target.checked }))}
                        className="accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Age Gate Title</label>
                      <input
                        type="text"
                        value={themeConfig.ageGateTitle}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, ageGateTitle: e.target.value }))}
                        className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Instruction Text</label>
                      <textarea
                        value={themeConfig.ageGateDescription}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, ageGateDescription: e.target.value }))}
                        rows={2}
                        className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ANNOUNCEMENT NEWSLETTER POPUP CUSTOMIZER */}
              <div className="space-y-3.5 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">5. Newsletter promo popup</span>
                  <input
                    type="checkbox"
                    checked={themeConfig.newsletterPopupEnabled}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, newsletterPopupEnabled: e.target.checked }))}
                    className="accent-violet-600 rounded"
                  />
                </div>

                {themeConfig.newsletterPopupEnabled && (
                  <div className="space-y-3 animate-slide-in">
                    <div className="flex items-center justify-between p-2 bg-amber-500/10 text-amber-600 rounded-xl text-[9px] font-semibold">
                      <span>Preview Override: Force display popup?</span>
                      <input
                        type="checkbox"
                        checked={themeConfig.newsletterPopupForceShow}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, newsletterPopupForceShow: e.target.checked }))}
                        className="accent-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Offer Heading Title</label>
                      <input
                        type="text"
                        value={themeConfig.newsletterPopupTitle}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, newsletterPopupTitle: e.target.value }))}
                        className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-1">Coupon description text</label>
                      <textarea
                        value={themeConfig.newsletterPopupOffer}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, newsletterPopupOffer: e.target.value }))}
                        rows={2}
                        className="w-full text-xs font-semibold px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 block mb-0.5">Popup Graphic/Promo Banner (.jpg/.png)</label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 cursor-pointer transition-all">
                          <Upload className="h-4 w-4 text-zinc-400 mb-1" />
                          <span className="text-[9px] font-bold text-zinc-500">Choose custom graphic</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewsletterImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT: LIVE INTERACTIVE PREVIEW PANEL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-3">
        
        {/* Device preview togglers */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'desktop' 
                  ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              Desktop View
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'mobile' 
                  ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Mobile Screen
            </button>
          </div>

          <span className="text-[10px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3 animate-pulse text-[#8b5cf6]" />
            Interactive Store Portal Sandbox
          </span>
        </div>

        {/* Dynamic Canvas Container */}
        <div className="flex-1 w-full bg-zinc-200/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-1 flex items-center justify-center overflow-hidden relative">
          
          {/* SIMULATED VIEWPORT CONTAINER */}
          <div 
            id="storefront-canvas"
            style={{ 
              fontFamily: themeConfig.fontFamily,
              backgroundColor: themeConfig.backgroundColor,
              color: themeConfig.textColor
            }}
            className={`transition-all duration-300 overflow-y-auto shadow-xl relative select-text ${
              device === 'desktop' 
                ? 'w-full h-full rounded-xl' 
                : 'w-[360px] h-[600px] rounded-[32px] border-[8px] border-zinc-950 dark:border-zinc-800'
            }`}
          >
            {/* Dynamic layout loops */}
            {sections.map((sec) => {
              if (!sec.active) return null;

              // 1. ALERT BANNER
              if (sec.type === 'alert') {
                return (
                  <div 
                    key={sec.id}
                    style={{ backgroundColor: themeConfig.primaryColor }}
                    className="py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white text-center select-none"
                  >
                    {sec.settings.text}
                  </div>
                );
              }

              // 2. HERO BANNER
              if (sec.type === 'hero') {
                return (
                  <div key={sec.id} className="relative h-64 md:h-72 overflow-hidden bg-zinc-950 flex items-center">
                    {/* Dim Overlay */}
                    <div 
                      className="absolute inset-0 z-10 bg-black" 
                      style={{ opacity: (sec.settings.overlay || 40) / 100 }}
                    />
                    <img 
                      src={sec.settings.image || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600'} 
                      alt="Store Hero" 
                      className="absolute inset-0 h-full w-full object-cover select-none"
                    />
                    
                    <div className="relative z-20 px-6 md:px-12 max-w-xl text-white space-y-3">
                      <div 
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white"
                        style={{ backgroundColor: themeConfig.primaryColor }}
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        Guild Selected Reserve
                      </div>
                      <h1 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                        {sec.settings.title}
                      </h1>
                      <p className="text-[10px] md:text-[11px] text-zinc-300 leading-relaxed font-medium">
                        {sec.settings.subtitle}
                      </p>
                      <div>
                        <a 
                          href="#catalog"
                          style={{ backgroundColor: themeConfig.primaryColor }}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-[10px] font-bold text-white shadow hover:opacity-90 transition-all cursor-pointer"
                        >
                          {sec.settings.btnText || 'Shop Reserve'}
                          <ChevronRight className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. CATALOG
              if (sec.type === 'catalog') {
                return (
                  <div key={sec.id} id="catalog" className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-zinc-100">
                      <div>
                        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">{sec.settings.title}</h2>
                        <p className="text-[9px] text-zinc-400">{sec.settings.subtitle}</p>
                      </div>

                      {/* category filters */}
                      <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg text-[9px] font-bold self-start select-none">
                        {(['All', 'Wine', 'Beer', 'Liquor'] as const).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSimCategory(cat)}
                            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                              simCategory === cat 
                                ? 'bg-white text-zinc-900 shadow-sm' 
                                : 'text-zinc-400 hover:text-zinc-600'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* grid */}
                    <div className={`grid gap-3 ${
                      sec.settings.columns === 2 ? 'grid-cols-2' : sec.settings.columns === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'
                    }`}>
                      {products
                        .filter(p => simCategory === 'All' || p.category === simCategory)
                        .map(prod => (
                          <div key={prod.id} className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col justify-between group">
                            <div className="aspect-square bg-zinc-50 relative overflow-hidden">
                              <img 
                                src={prod.imageUrl || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200'} 
                                alt={prod.name} 
                                className="h-full w-full object-cover group-hover:scale-105 transition-all"
                              />
                              {prod.age_restricted && (
                                <span className="absolute top-1.5 left-1.5 bg-amber-500/10 text-amber-600 border border-amber-200/50 text-[7px] font-black px-1 py-0.5 rounded uppercase">
                                  21+ Required
                                </span>
                              )}
                            </div>
                            <div className="p-2.5 space-y-1">
                              <span className="text-[7px] font-extrabold text-zinc-400 uppercase">{prod.category}</span>
                              <h4 className="text-[10px] font-bold text-zinc-950 leading-snug line-clamp-1">{prod.name}</h4>
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] font-mono font-bold text-zinc-900">${prod.price_per_bottle.toFixed(2)}</span>
                                <button
                                  onClick={() => addToSimCart(prod)}
                                  style={{ backgroundColor: themeConfig.primaryColor }}
                                  className="text-white p-1 rounded-lg hover:opacity-90 transition-all cursor-pointer flex items-center justify-center shadow-sm"
                                >
                                  <Plus className="h-3 w-3 stroke-[3]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              }

              // 4. BENTO PROMO GRID
              if (sec.type === 'promo') {
                return (
                  <div key={sec.id} className="p-6 bg-zinc-50 border-y border-zinc-100 space-y-4">
                    <div className="text-center">
                      <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">{sec.settings.title}</h2>
                      <p className="text-[9px] text-zinc-400">{sec.settings.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(sec.settings.items || []).map((item: any, i: number) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex items-start gap-3">
                          <div 
                            style={{ color: themeConfig.primaryColor }}
                            className="p-1.5 bg-zinc-50 rounded-lg"
                          >
                            {renderIcon(item.icon)}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-[10px] font-extrabold text-zinc-900 uppercase">{item.title}</h4>
                            <p className="text-[9px] text-zinc-500 leading-normal">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 5. TESTIMONIALS
              if (sec.type === 'testimonials') {
                return (
                  <div key={sec.id} className="p-6 bg-zinc-50/50 space-y-4 text-center">
                    <div>
                      <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">{sec.settings.title}</h2>
                      <p className="text-[9px] text-zinc-400">{sec.settings.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                      {(sec.settings.reviews || []).map((rev: any, i: number) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm space-y-2">
                          <div className="flex justify-center gap-0.5">
                            {[...Array(rev.rating || 5)].map((_, starIdx) => (
                              <Star key={starIdx} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-[9px] text-zinc-500 italic leading-relaxed">"{rev.comment}"</p>
                          <p className="text-[8px] font-bold uppercase text-zinc-950 tracking-wider">— {rev.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 6. ABOUT
              if (sec.type === 'about') {
                const imgCol = (
                  <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-zinc-100 rounded-xl overflow-hidden shadow-sm shrink-0">
                    <img 
                      src={sec.settings.image || 'https://images.unsplash.com/photo-1594462106222-3cf22d45a8f5?auto=format&fit=crop&q=80&w=200'} 
                      alt="About narrative" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                );

                const textCol = (
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4" style={{ backgroundColor: themeConfig.primaryColor }} />
                      <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Our Heritage Story</span>
                    </div>
                    <h3 className="text-xs font-extrabold text-zinc-900">Premium Cellar Care since 2012</h3>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{sec.settings.aboutText}</p>
                    {sec.settings.aboutText2 && <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">{sec.settings.aboutText2}</p>}
                  </div>
                );

                return (
                  <div key={sec.id} className="p-6 md:p-8 bg-white border-y border-zinc-100 flex flex-col md:flex-row items-center gap-5">
                    {sec.settings.layout === 'right' ? (
                      <>
                        {textCol}
                        {imgCol}
                      </>
                    ) : (
                      <>
                        {imgCol}
                        {textCol}
                      </>
                    )}
                  </div>
                );
              }

              // 7. FAQ ACCORDION
              if (sec.type === 'faq') {
                return (
                  <div key={sec.id} className="p-6 bg-white space-y-4">
                    <div className="text-center">
                      <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">{sec.settings.title}</h2>
                      <p className="text-[9px] text-zinc-400">{sec.settings.subtitle}</p>
                    </div>

                    <div className="max-w-md mx-auto space-y-2">
                      {(sec.settings.faqs || []).map((f: any, i: number) => {
                        const isOpen = faqOpenMap[`${sec.id}-${i}`];
                        return (
                          <div key={i} className="border border-zinc-100 rounded-xl overflow-hidden">
                            <button
                              onClick={() => setFaqOpenMap(prev => ({ ...prev, [`${sec.id}-${i}`]: !isOpen }))}
                              className="w-full p-3 text-left text-[10px] font-bold text-zinc-800 flex items-center justify-between hover:bg-zinc-50/50"
                            >
                              <span>{f.q}</span>
                              <HelpCircle className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                            </button>
                            {isOpen && (
                              <div className="p-3 bg-zinc-50 text-[9px] text-zinc-500 border-t border-zinc-100 leading-relaxed animate-slide-in">
                                {f.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // 8. FEATURED VIDEO
              if (sec.type === 'video') {
                const isPlaying = isVideoPlaying[sec.id];
                return (
                  <div key={sec.id} className="p-6 bg-white space-y-3">
                    <div className="text-center">
                      <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">{sec.settings.title}</h2>
                      <p className="text-[9px] text-zinc-400">{sec.settings.subtitle}</p>
                    </div>

                    <div className="max-w-md mx-auto aspect-video bg-zinc-950 rounded-xl overflow-hidden relative border border-zinc-100 flex items-center justify-center">
                      {isPlaying && sec.settings.videoUrl ? (
                        <video 
                          src={sec.settings.videoUrl} 
                          controls 
                          autoPlay 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-black/40 z-10" />
                          <img 
                            src={sec.settings.videoPlaceholder || 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600'} 
                            alt="Video Cover" 
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          <button
                            onClick={() => setIsVideoPlaying(prev => ({ ...prev, [sec.id]: true }))}
                            className="relative z-20 h-12 w-12 bg-white/95 text-zinc-950 hover:scale-105 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
                          >
                            <Play className="h-5 w-5 fill-zinc-950 text-zinc-950 ml-0.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              }

              // 9. LOOKBOOK
              if (sec.type === 'lookbook') {
                return (
                  <div key={sec.id} className="p-6 bg-white space-y-3">
                    <div className="text-center">
                      <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900">{sec.settings.title}</h2>
                      <p className="text-[9px] text-zinc-400">{sec.settings.subtitle}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      {(sec.settings.images || []).map((imgUrl: string, i: number) => (
                        <div key={i} className="aspect-square bg-zinc-100 rounded-xl overflow-hidden shadow-sm">
                          <img src={imgUrl} className="h-full w-full object-cover hover:scale-105 transition-all" alt="Lookbook" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // 10. NEWSLETTER FORM BLOCK
              if (sec.type === 'newsletter') {
                return (
                  <div key={sec.id} className="p-6 bg-zinc-900 text-white rounded-xl mx-4 my-2 text-center space-y-3">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">{sec.settings.title}</h3>
                      <p className="text-[9px] text-zinc-400 leading-relaxed">{sec.settings.subtitle}</p>
                    </div>
                    <div className="flex gap-1.5 max-w-sm mx-auto">
                      <input
                        type="email"
                        placeholder={sec.settings.placeholder || 'Enter email...'}
                        className="flex-1 text-[10px] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none text-white"
                      />
                      <button
                        style={{ backgroundColor: themeConfig.primaryColor }}
                        onClick={() => showToast('Subscribed successfully!', 'success')}
                        className="text-white text-[10px] font-bold px-4 py-1.5 rounded-lg hover:opacity-90 transition-colors"
                      >
                        {sec.settings.ctaText || 'Subscribe'}
                      </button>
                    </div>
                  </div>
                );
              }

              // 11. FOOTER
              if (sec.type === 'footer') {
                return (
                  <div key={sec.id} className="p-6 bg-zinc-950 text-zinc-400 text-[9px] space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-white">
                          {themeConfig.logoType === 'image' && themeConfig.logoUrl ? (
                            <img src={themeConfig.logoUrl} className="h-6 object-contain" alt="Store logo" />
                          ) : (
                            <span className="font-extrabold uppercase text-[10px]">{themeConfig.logoText}</span>
                          )}
                        </div>
                        <p className="leading-relaxed text-zinc-500">{sec.settings.aboutText}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-zinc-300 uppercase tracking-wide">Customer Support</span>
                        <p className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {sec.settings.address}</p>
                        <p className="flex items-center gap-1"><Phone className="h-3 w-3 shrink-0" /> {sec.settings.phone}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-bold text-zinc-300 uppercase tracking-wide">Boutique Hours</span>
                        <p className="flex items-center gap-1"><Clock className="h-3 w-3 shrink-0" /> {sec.settings.hours}</p>
                        <p className="text-[8px] text-zinc-600">ID checked and physical verification required on delivery.</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-900 text-center text-[8px] text-zinc-600 flex justify-between">
                      <p>© 2026 {themeConfig.logoText}. Powered by AuraPOS.</p>
                      <p className="font-mono uppercase text-[7px]">VERIFICATION 21+ ACTIVE</p>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* STICKY HEADER NAVBAR HEADER */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-white/95 dark:bg-white/90 backdrop-blur-md border-b border-zinc-100 flex items-center justify-between px-4 z-40 select-none shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-950">
                {themeConfig.logoType === 'image' && themeConfig.logoUrl ? (
                  <img src={themeConfig.logoUrl} className="h-8 max-w-[100px] object-contain" alt="Brand Logo" />
                ) : (
                  <div className="flex items-center gap-1">
                    {themeConfig.logoStyle === 'wine' && <Wine className="h-4 w-4" style={{ color: themeConfig.primaryColor }} />}
                    {themeConfig.logoStyle === 'beer' && <Beer className="h-4 w-4" style={{ color: themeConfig.primaryColor }} />}
                    {themeConfig.logoStyle === 'store' && <Store className="h-4 w-4" style={{ color: themeConfig.primaryColor }} />}
                    <span className="font-extrabold text-xs uppercase tracking-tight">{themeConfig.logoText}</span>
                  </div>
                )}
              </div>

              {/* Shopping Cart button trigger */}
              <button
                onClick={() => { setIsCartOpen(true); setCheckoutStep('cart'); }}
                className="relative p-2 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                {cart.length > 0 && (
                  <span 
                    style={{ backgroundColor: themeConfig.primaryColor }}
                    className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-white h-4.5 w-4.5 rounded-full flex items-center justify-center"
                  >
                    {cart.reduce((sum, i) => sum + i.qty, 0)}
                  </span>
                )}
              </button>
            </div>

            {/* SHOPPING CART OVERLAY DRAWER */}
            {isCartOpen && (
              <div className="absolute inset-0 bg-black/60 z-50 flex justify-end">
                <div className="w-80 h-full bg-white flex flex-col shadow-2xl relative select-text animate-slide-in">
                  
                  <div className="p-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4" style={{ color: themeConfig.primaryColor }} />
                      <h3 className="font-black text-xs text-zinc-900 uppercase">Your Online Order</h3>
                    </div>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {checkoutStep === 'cart' && (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                          <div className="h-48 flex flex-col items-center justify-center text-center space-y-1">
                            <ShoppingBag className="h-8 w-8 text-zinc-200 stroke-[1.5]" />
                            <p className="text-[10px] font-bold text-zinc-400">Your basket is empty</p>
                          </div>
                        ) : (
                          cart.map(item => (
                            <div key={item.product.id} className="flex gap-2.5 text-xs border-b border-zinc-50 pb-2.5">
                              <img src={item.product.imageUrl || ''} className="h-10 w-10 object-cover rounded bg-zinc-50 shrink-0" alt="Item" />
                              <div className="flex-1 space-y-0.5">
                                <h4 className="font-bold text-[10px] text-zinc-900 leading-tight">{item.product.name}</h4>
                                <p className="text-[9px] text-zinc-400 font-mono">${item.product.price_per_bottle.toFixed(2)} each</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center border border-zinc-100 rounded">
                                    <button onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))} className="p-1 text-zinc-400 hover:text-zinc-900"><Minus className="h-2.5 w-2.5" /></button>
                                    <span className="px-2 text-[9px] font-bold">{item.qty}</span>
                                    <button onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, qty: i.qty + 1 } : i))} className="p-1 text-zinc-400 hover:text-zinc-900"><Plus className="h-2.5 w-2.5" /></button>
                                  </div>
                                  <button onClick={() => setCart(prev => prev.filter(i => i.product.id !== item.product.id))} className="text-red-400 hover:text-red-600"><Trash2 className="h-3 w-3" /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {cart.length > 0 && (
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 space-y-2.5 shrink-0">
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              placeholder="Coupon Code"
                              value={coupon}
                              onChange={(e) => setCoupon(e.target.value)}
                              className="flex-1 text-[9px] px-2 py-1.5 bg-white border border-zinc-200 rounded-lg focus:outline-none uppercase"
                            />
                            <button onClick={handleApplyCoupon} style={{ backgroundColor: themeConfig.primaryColor }} className="text-white text-[9px] font-bold px-3 py-1.5 rounded-lg">Apply</button>
                          </div>

                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between text-zinc-500"><span>Subtotal</span><span>${calculateTotals().subtotal.toFixed(2)}</span></div>
                            {calculateTotals().discount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>Discount</span><span>-${calculateTotals().discount.toFixed(2)}</span></div>}
                            <div className="flex justify-between text-zinc-500"><span>Tax (8.25%)</span><span>${calculateTotals().tax.toFixed(2)}</span></div>
                            <div className="flex justify-between text-zinc-900 font-bold border-t pt-1.5 text-xs"><span>Total</span><span style={{ color: themeConfig.primaryColor }}>${calculateTotals().total.toFixed(2)}</span></div>
                          </div>

                          <button onClick={() => setCheckoutStep('details')} style={{ backgroundColor: themeConfig.primaryColor }} className="w-full text-white py-2 rounded-xl text-xs font-bold text-center">Proceed to checkout</button>
                        </div>
                      )}
                    </div>
                  )}

                  {checkoutStep === 'details' && (
                    <form onSubmit={handleCheckoutSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                        <h4 className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider mb-1">Specifications</h4>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">Your Name</label>
                          <input type="text" required placeholder="John Doe" value={custName} onChange={(e) => setCustName(e.target.value)} className="w-full text-[10px] px-2.5 py-2 bg-zinc-50 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">Phone Number</label>
                          <input type="text" required placeholder="(555) 0192" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} className="w-full text-[10px] px-2.5 py-2 bg-zinc-50 border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">Method</label>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <button type="button" onClick={() => setOrderType('Pickup')} className={`py-1.5 rounded-lg border ${orderType === 'Pickup' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-150 text-zinc-400'}`}>Pickup</button>
                            <button type="button" onClick={() => setOrderType('Delivery')} className={`py-1.5 rounded-lg border ${orderType === 'Delivery' ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-150 text-zinc-400'}`}>Delivery</button>
                          </div>
                        </div>

                        {orderType === 'Delivery' && (
                          <div>
                            <label className="text-[9px] font-bold text-zinc-500 block mb-0.5">Delivery Address</label>
                            <input type="text" required placeholder="742 Evergreen Terrace" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full text-[10px] px-2.5 py-2 bg-zinc-50 border rounded-lg" />
                          </div>
                        )}

                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-lg text-[8px] leading-relaxed">
                          <p className="font-bold">🔞 AGE VERIFICATION PROTOCOL</p>
                          <p>You must present a 21+ physical ID upon package dropoff or pickup. No unattended dropoffs.</p>
                        </div>
                      </div>

                      <div className="p-4 border-t bg-zinc-50/50 space-y-2 shrink-0">
                        <div className="flex justify-between text-xs font-bold text-zinc-900"><span>Total:</span><span style={{ color: themeConfig.primaryColor }}>${calculateTotals().total.toFixed(2)}</span></div>
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setCheckoutStep('cart')} className="py-2 border border-zinc-200 rounded-lg text-[9px] text-zinc-500 hover:bg-zinc-50">Back</button>
                          <button type="submit" style={{ backgroundColor: themeConfig.primaryColor }} className="py-2 text-white rounded-lg text-[9px] font-bold">Order now</button>
                        </div>
                      </div>
                    </form>
                  )}

                  {checkoutStep === 'success' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-slide-in">
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><Check className="h-6 w-6 stroke-[3]" /></div>
                      <div>
                        <h4 className="font-black text-xs uppercase text-zinc-900">Checkout Completed</h4>
                        <p className="text-[9px] text-zinc-400">Order successfully routed to live POS feed!</p>
                      </div>
                      <button onClick={resetCart} style={{ backgroundColor: themeConfig.primaryColor }} className="w-full text-white py-2 rounded-xl text-xs font-bold">Return to storefront</button>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* AGE GATE FULL VIEWPORT COVER */}
            {themeConfig.ageGateEnabled && (!isAgeVerified || themeConfig.ageGateForceShow) && (
              <div 
                style={{ backgroundColor: themeConfig.ageGateBgColor }}
                className="absolute inset-0 z-50 flex items-center justify-center p-6 select-none"
              >
                <div 
                  style={{ color: themeConfig.ageGateTextColor }}
                  className="w-full max-w-sm text-center space-y-6 bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-2xl"
                >
                  <div className="flex justify-center">
                    <div 
                      style={{ backgroundColor: `${themeConfig.primaryColor}1a`, color: themeConfig.primaryColor }}
                      className="p-4 rounded-full"
                    >
                      <ShieldAlert className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-sm font-black tracking-tight uppercase">
                      {themeConfig.ageGateTitle}
                    </h2>
                    <p className="text-[10px] opacity-80 leading-relaxed">
                      {themeConfig.ageGateDescription}
                    </p>
                  </div>
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setIsAgeVerified(true);
                        showToast('Age verified successfully!', 'success');
                      }}
                      style={{ backgroundColor: themeConfig.ageGateBtnColor, color: '#ffffff' }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold shadow hover:opacity-95 transition-all cursor-pointer"
                    >
                      {themeConfig.ageGateYesText}
                    </button>
                    <button
                      onClick={() => {
                        showToast('Access denied. You must be of legal age to enter this boutique.', 'error');
                      }}
                      className="w-full py-2.5 rounded-xl text-xs font-bold border border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      {themeConfig.ageGateNoText}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NEWSLETTER ANNOUNCEMENT POPUP OVERLAY */}
            {themeConfig.newsletterPopupEnabled && (isNewsletterOpen || themeConfig.newsletterPopupForceShow) && !newsletterClosed && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-45 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl relative select-text animate-slide-in text-zinc-900">
                  <button
                    onClick={() => { setNewsletterClosed(true); setIsNewsletterOpen(false); }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/10 hover:bg-black/20 text-white cursor-pointer z-50"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {themeConfig.newsletterPopupImageUrl && (
                    <div className="h-28 relative bg-zinc-100">
                      <img src={themeConfig.newsletterPopupImageUrl} alt="Promo" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-5 space-y-3.5 text-center">
                    <div className="space-y-1">
                      <span className="text-[8px] bg-indigo-50 text-indigo-600 font-extrabold px-1.5 py-0.5 rounded uppercase inline-block">Exclusive allocation invitation</span>
                      <h3 className="text-xs font-black tracking-tight uppercase text-zinc-950">{themeConfig.newsletterPopupTitle}</h3>
                      <p className="text-[10px] text-zinc-500 leading-normal">{themeConfig.newsletterPopupOffer}</p>
                    </div>

                    {newsletterSubmitted ? (
                      <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-3 rounded-xl flex flex-col items-center justify-center">
                        <Check className="h-5 w-5 mb-1" />
                        <p>{themeConfig.newsletterPopupSuccess}</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <input
                          type="email"
                          placeholder={themeConfig.newsletterPopupPlaceholder}
                          className="w-full text-[10px] font-semibold px-3 py-2 bg-zinc-50 border rounded-xl focus:outline-none"
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            if (newsletterEmail.includes('@')) {
                              setNewsletterSubmitted(true);
                              showToast('Subscribed to private reserve vault list!', 'success');
                              setTimeout(() => { setNewsletterClosed(true); setIsNewsletterOpen(false); }, 2000);
                            } else {
                              showToast('Enter a valid email address.', 'error');
                            }
                          }}
                          style={{ backgroundColor: themeConfig.primaryColor }}
                          className="w-full text-white py-2 rounded-xl text-[10px] font-bold shadow"
                        >
                          {themeConfig.newsletterPopupCta}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
