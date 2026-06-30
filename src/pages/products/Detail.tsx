import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Page, LayoutGrid, LayoutSection } from '../../components/Polaris/Page';
import { Card, CardSection } from '../../components/Polaris/Card';
import { Badge } from '../../components/Polaris/Badge';
import { ContextualSaveBar } from '../../components/Polaris/ContextualSaveBar';
import { RequirePermission, usePermission } from '../../components/Polaris/RequirePermission';
import { Product, ChatterMessage } from '../../types';
import { 
  Send, History, ShieldCheck, DollarSign, Package, Tag, 
  Layers, Lock, HelpCircle, Eye, Calendar, User, MessageSquare
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<any>();
  const { hasPermission } = usePermission();
  const canEdit = hasPermission('products.edit');

  const products: Product[] = context.products || [];
  const product = products.find(p => p.id === id);

  // Draft state for edits
  const [draft, setDraft] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Chatter Manual Comment state
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Initialize draft on product load
  useEffect(() => {
    if (product) {
      setDraft(JSON.parse(JSON.stringify(product))); // Deep copy
    }
  }, [product]);

  if (!product || !draft) {
    return (
      <Page title="Product Not Found" backUrl="/admin/products">
        <Card title="Error">
          <p className="text-sm font-sans text-zinc-550">
            The requested product catalog record could not be found or has been removed.
          </p>
        </Card>
      </Page>
    );
  }

  // Dirty detection helper
  const getIsDirty = () => {
    if (!product || !draft) return false;
    
    // List of keys to compare
    const keys: (keyof Product)[] = [
      'name', 'category', 'description', 'imageUrl', 'age_restricted',
      'distributor_sku', 'barcode', 'bottles_per_case', 'price_per_bottle',
      'cost_per_unit', 'vendor', 'inventory_bottles'
    ];

    return keys.some(key => {
      const originalVal = product[key];
      const draftVal = draft[key];
      return originalVal !== draftVal;
    });
  };

  const isDirty = getIsDirty();

  const handleDiscard = () => {
    if (product) {
      setDraft(JSON.parse(JSON.stringify(product)));
      context.showToast('Changes discarded', 'info');
    }
  };

  const handleSave = async () => {
    if (!draft || !canEdit) return;
    setIsSaving(true);
    try {
      // Calculate inventory_cases based on updated bottles_per_case and inventory_bottles
      const finalDraft = {
        ...draft,
        inventory_cases: Math.floor(draft.inventory_bottles / draft.bottles_per_case)
      };

      const res = await fetch(`/api/products/${product.id}?tenant_id=${context.activeTenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalDraft),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to sync product record');
      }

      const updated = await res.json();
      context.showToast(`Successfully updated spec for "${updated.name}"`, 'success');
      await context.fetchTenantData(); // Reload data from backend
    } catch (e: any) {
      context.showToast(e.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);

    try {
      const res = await fetch(`/api/records/products/${product.id}/chatter?tenant_id=${context.activeTenantId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: context.currentUser?.name || 'Authorized Staff',
          comment: commentText.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to post comment to audit log');

      context.showToast('Comment added to record audit logs', 'success');
      setCommentText('');
      await context.fetchTenantData(); // Reload comments
    } catch (e: any) {
      context.showToast(e.message, 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const isActive = product.inventory_bottles > 0;

  return (
    <div className="relative">
      
      {/* Sticky Save Bar */}
      {canEdit && (
        <ContextualSaveBar
          isDirty={isDirty}
          onSave={handleSave}
          onDiscard={handleDiscard}
          isSaving={isSaving}
        />
      )}

      <Page
        title={product.name}
        backUrl="/admin/products"
        titleMetadata={
          <div className="flex items-center gap-1.5">
            <Badge tone={isActive ? 'success' : 'critical'}>
              {isActive ? 'Active' : 'Out of stock'}
            </Badge>
            {product.age_restricted && (
              <Badge tone="critical">21+ REQUIRED</Badge>
            )}
          </div>
        }
      >
        <RequirePermission permission="products.edit">
          <LayoutGrid>
            
            {/* 2/3 COLUMN: Specifications Form & Audit Chatter */}
            <LayoutSection>
              
              {/* General Information Card */}
              <Card title="General Information">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Product Name *</label>
                    <input
                      type="text"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="e.g. Jameson Irish Whiskey 750ml"
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Product Description</label>
                    <textarea
                      value={draft.description || ''}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="Proof levels, distillations details, vintage year, region, or pairing guidelines..."
                      rows={4}
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Media Card */}
              <Card title="Media & Imagery">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <img
                      src={draft.imageUrl || 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=200&auto=format&fit=crop&q=60'}
                      alt={draft.name}
                      className="h-28 w-28 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 w-full space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Image Asset URL</label>
                      <input
                        type="url"
                        value={draft.imageUrl || ''}
                        onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                      />
                      <p className="text-[10px] text-zinc-400">
                        URLs are loaded directly from secure cloud stores or distributors catalogs to guarantee high-definition checkout screens.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pricing & Stock (Variants Card) */}
              <Card title="Pricing & Inventory Specs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Retail Price ($) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={draft.price_per_bottle}
                        onChange={(e) => setDraft({ ...draft, price_per_bottle: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 pl-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                        required
                      />
                      <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Wholesale Cost ($)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={draft.cost_per_unit || 0}
                        onChange={(e) => setDraft({ ...draft, cost_per_unit: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 pl-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                      />
                      <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Margin (%)</label>
                    <div className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 border border-transparent rounded-lg text-xs font-mono font-bold text-zinc-650 dark:text-zinc-350 select-none">
                      {draft.price_per_bottle > 0 && draft.cost_per_unit
                        ? `${(((draft.price_per_bottle - draft.cost_per_unit) / draft.price_per_bottle) * 100).toFixed(1)}%`
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-850 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Current Stock (Bottles)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={draft.inventory_bottles}
                        onChange={(e) => setDraft({ ...draft, inventory_bottles: parseInt(e.target.value) || 0 })}
                        className="w-full px-3.5 py-2 pl-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                      />
                      <Package className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Bottles per wholesale Case</label>
                    <input
                      type="number"
                      value={draft.bottles_per_case}
                      onChange={(e) => setDraft({ ...draft, bottles_per_case: parseInt(e.target.value) || 12 })}
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Calculated Cases</label>
                    <div className="px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 border border-transparent rounded-lg text-xs font-mono font-bold text-zinc-650 dark:text-zinc-350 select-none">
                      {Math.floor(draft.inventory_bottles / draft.bottles_per_case)} cases ({draft.inventory_bottles % draft.bottles_per_case} loose)
                    </div>
                  </div>
                </div>
              </Card>

              {/* Real-time Audit Trail (Enterprise Chatter) */}
              <Card title="Real-time Audit Trail (Enterprise Chatter)">
                <div className="space-y-4">
                  
                  {/* Chatter message stream */}
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                    {product.chatter && product.chatter.length > 0 ? (
                      [...product.chatter].reverse().map((chat: ChatterMessage) => {
                        const dateStr = new Date(chat.timestamp).toLocaleString();
                        const isComment = chat.action === 'comment';
                        return (
                          <div 
                            key={chat.id} 
                            className={`p-3 rounded-xl border flex gap-3 text-xs ${
                              isComment 
                                ? 'bg-[#008060]/5 border-[#008060]/10 text-zinc-700 dark:text-zinc-300' 
                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-100 dark:border-zinc-850 text-zinc-600 dark:text-zinc-450'
                            }`}
                          >
                            <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                              {isComment ? (
                                <MessageSquare className="h-3 w-3 text-[#008060]" />
                              ) : (
                                <History className="h-3 w-3 text-zinc-500" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{chat.user}</span>
                                <span className="text-[9px] text-zinc-400 font-mono">{dateStr}</span>
                              </div>
                              <p className="leading-relaxed font-sans">{chat.detail}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs font-mono text-zinc-400 text-center py-4">No audit events cataloged for this record</p>
                    )}
                  </div>

                  {/* Manual Comment Input Form */}
                  <form onSubmit={handlePostComment} className="border-t border-zinc-100 dark:border-zinc-850 pt-3">
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        placeholder="Add manual notes or comments to this record's audit log..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                        disabled={isSubmittingComment}
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingComment || !commentText.trim()}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        <Send className="h-3 w-3" />
                        <span>Post</span>
                      </button>
                    </div>
                  </form>

                </div>
              </Card>

            </LayoutSection>

            {/* 1/3 COLUMN: Metadata / Status & Organization Card */}
            <LayoutSection secondary>
              
              {/* Status Card */}
              <Card title="Product Status">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Operational Level</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span className="font-sans font-bold text-xs">
                        {isActive ? 'Available in POS' : 'Out of Stock / Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-3 border-t border-zinc-100 dark:border-zinc-850">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Compliance Setting</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        id="detail_age_restricted"
                        checked={draft.age_restricted}
                        onChange={(e) => setDraft({ ...draft, age_restricted: e.target.checked })}
                        className="h-4.5 w-4.5 text-[#008060] border-zinc-300 rounded cursor-pointer"
                      />
                      <label htmlFor="detail_age_restricted" className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 cursor-pointer select-none">
                        Age scan enforced (21+)
                      </label>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Organization Card */}
              <Card title="Product Details & Metadata">
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Wholesale Distributor / Vendor</label>
                    <input
                      type="text"
                      value={draft.vendor || ''}
                      onChange={(e) => setDraft({ ...draft, vendor: e.target.value })}
                      placeholder="e.g. Breakthru Beverage Distributors"
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Category Classifier</label>
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft({ ...draft, category: e.target.value as Product['category'] })}
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition cursor-pointer"
                    >
                      <option value="Liquor">Liquor</option>
                      <option value="Wine">Wine</option>
                      <option value="Beer">Beer</option>
                      <option value="Extras">Extras</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Distributor SKU / EAN-8</label>
                    <input
                      type="text"
                      value={draft.distributor_sku || ''}
                      onChange={(e) => setDraft({ ...draft, distributor_sku: e.target.value })}
                      placeholder="e.g. SKU-1284"
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Universal Barcode (UPC)</label>
                    <input
                      type="text"
                      value={draft.barcode || ''}
                      onChange={(e) => setDraft({ ...draft, barcode: e.target.value })}
                      placeholder="e.g. 7100829104"
                      className="w-full px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs outline-none focus:border-[#008060] transition font-mono"
                    />
                  </div>
                </div>
              </Card>

            </LayoutSection>

          </LayoutGrid>
        </RequirePermission>
      </Page>
    </div>
  );
}
