import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Package, TrendingUp, AlertTriangle, Search, Plus, Minus, Edit2, Image, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

const TABS = ['Inventory', 'Sales Report'] as const;
type Tab = (typeof TABS)[number];

const stockBadge = (qty: number) => {
  if (qty === 0) return 'bg-red-500/20 text-red-400';
  if (qty <= 5) return 'bg-orange-500/20 text-orange-400';
  if (qty <= 15) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-emerald-500/20 text-emerald-400';
};

export const AdminInventory = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('Inventory');
  const [search, setSearch] = useState('');
  const [editStockId, setEditStockId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState('');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['admin-inventory', search],
    queryFn: async () => {
      const { data } = await apiClient.GET('/api/admin/inventory', {
        params: { query: { search: search || undefined, limit: '50' } as any },
      });
      return data;
    },
  });

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['admin-sales-report'],
    queryFn: async () => {
      const { data } = await apiClient.GET('/api/admin/reports/sales');
      return data ?? [];
    },
    enabled: tab === 'Sales Report',
  });

  const adjustMut = useMutation({
    mutationFn: async ({ id, adjustment }: { id: string; adjustment: number }) => {
      const { error } = await apiClient.PATCH('/api/admin/inventory/{id}/adjust' as any, {
        params: { path: { id } },
        body: { adjustment } as any,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inventory'] }),
    onError: () => toast.error('Failed to adjust stock'),
  });

  const setStockMut = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await apiClient.PATCH('/api/admin/inventory/{id}/set-stock' as any, {
        params: { path: { id } },
        body: { quantity } as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setEditStockId(null);
    },
    onError: () => toast.error('Failed to set stock'),
  });

  const handleAdjust = (id: string, delta: number) => {
    adjustMut.mutate({ id, adjustment: delta });
  };

  const handleSetStock = (id: string) => {
    const qty = parseInt(stockInput, 10);
    if (isNaN(qty) || qty < 0) { toast.error('Enter a valid quantity'); return; }
    setStockMut.mutate({ id, quantity: qty });
  };

  const handleUpload = async (productId: string, file: File) => {
    setUploadingFor(productId);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') ?? ''}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      const product = (inventory as any)?.data?.find((p: any) => p.id === productId);
      if (!product) return;

      const newUrls = [...(product.imageUrls ?? []), url];
      const patchRes = await apiClient.PATCH('/api/products/{id}' as any, {
        params: { path: { id: productId } },
        body: { imageUrls: newUrls } as any,
      });
      if ((patchRes as any).error) throw (patchRes as any).error;

      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleRemoveImage = async (productId: string, url: string) => {
    const product = (inventory as any)?.data?.find((p: any) => p.id === productId);
    if (!product) return;
    const newUrls = (product.imageUrls ?? []).filter((u: string) => u !== url);
    const { error } = await apiClient.PATCH('/api/products/{id}' as any, {
      params: { path: { id: productId } },
      body: { imageUrls: newUrls } as any,
    });
    if (error) { toast.error('Failed to remove image'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    toast.success('Image removed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Inventory & Reports</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {t === 'Inventory' && <Package size={14} className="inline mr-1.5" />}
            {t === 'Sales Report' && <TrendingUp size={14} className="inline mr-1.5" />}
            {t}
          </button>
        ))}
      </div>

      {tab === 'Inventory' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="input-field pl-9"
            />
          </div>

          {invLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <LoadingSkeleton key={i} className="h-24" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {((inventory as any)?.data ?? []).map((product: any) => (
                <motion.div
                  key={product.id}
                  layout
                  className="card p-4"
                >
                  <div className="flex gap-4">
                    {/* Images */}
                    <div className="flex-shrink-0 space-y-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {(product.imageUrls ?? []).slice(0, 3).map((url: string, idx: number) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt=""
                              className="w-14 h-14 object-cover rounded-lg bg-dark-800"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/56x56/1a1a2e/9ca3af?text=IMG'; }}
                            />
                            <button
                              onClick={() => handleRemoveImage(product.id, url)}
                              className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 rounded-full text-white"
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setUploadingFor(product.id);
                            fileRef.current?.click();
                          }}
                          className="w-14 h-14 border-2 border-dashed border-dark-600 rounded-lg flex flex-col items-center justify-center text-dark-500 hover:border-gold-500 hover:text-gold-400 transition-all"
                        >
                          {uploadingFor === product.id ? (
                            <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Image size={12} />
                              <span className="text-[9px] mt-0.5">Add</span>
                            </>
                          )}
                        </button>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && uploadingFor) handleUpload(uploadingFor, file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-medium text-sm truncate">{product.name}</p>
                          <p className="text-dark-400 text-xs mt-0.5">
                            {product.sku} · {product.brand} · {product.category?.name}
                          </p>
                        </div>
                        <span className={`badge text-xs flex items-center gap-1 ${stockBadge(product.stockQuantity)}`}>
                          {product.stockQuantity === 0 && <AlertTriangle size={10} />}
                          {product.stockQuantity} in stock
                        </span>
                      </div>

                      {/* Stock controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleAdjust(product.id, -1)}
                          disabled={product.stockQuantity === 0}
                          className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center text-dark-300 hover:bg-dark-600 disabled:opacity-40 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white font-mono text-sm w-8 text-center">{product.stockQuantity}</span>
                        <button
                          onClick={() => handleAdjust(product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center text-dark-300 hover:bg-dark-600 transition-colors"
                        >
                          <Plus size={12} />
                        </button>

                        <div className="flex-1" />

                        {editStockId === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="input-field w-20 text-sm py-1.5"
                              placeholder="Qty"
                              min="0"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSetStock(product.id)}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Set
                            </button>
                            <button
                              onClick={() => setEditStockId(null)}
                              className="btn-secondary text-xs py-1.5 px-3"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditStockId(product.id); setStockInput(String(product.stockQuantity)); }}
                            className="flex items-center gap-1.5 text-dark-400 hover:text-gold-400 text-xs transition-colors"
                          >
                            <Edit2 size={12} /> Set exact
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {((inventory as any)?.data?.length ?? 0) === 0 && (
                <div className="text-center py-12 text-dark-400">No products found</div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'Sales Report' && (
        <div className="space-y-4">
          {salesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <LoadingSkeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="px-4 py-3 text-left text-dark-400 font-medium">Product</th>
                      <th className="px-4 py-3 text-right text-dark-400 font-medium">Units Sold</th>
                      <th className="px-4 py-3 text-right text-dark-400 font-medium">Revenue</th>
                      <th className="px-4 py-3 text-right text-dark-400 font-medium">Stock Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {((salesReport as any[]) ?? []).map((item: any, i: number) => (
                        <motion.tr
                          key={item.productId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-dark-800 last:border-0 hover:bg-dark-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt=""
                                  className="w-10 h-10 object-cover rounded-lg bg-dark-800 flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                              <div>
                                <p className="text-white font-medium">{item.productName}</p>
                                <p className="text-dark-400 text-xs">{item.sku} · {item.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-white font-mono">{item.unitsSold}</td>
                          <td className="px-4 py-3 text-right text-emerald-400 font-mono">
                            A${Number(item.revenue).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${stockBadge(item.stockRemaining)}`}>
                              {item.stockRemaining}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>

                {((salesReport as any[]) ?? []).length === 0 && (
                  <div className="text-center py-12 text-dark-400">No sales data yet</div>
                )}
              </div>

              {/* Summary */}
              {((salesReport as any[]) ?? []).length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="card p-4 text-center">
                    <p className="text-dark-400 text-xs mb-1">Total Products Sold</p>
                    <p className="text-white font-bold text-xl">
                      {((salesReport as any[]) ?? []).reduce((sum: number, i: any) => sum + i.unitsSold, 0)}
                    </p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-dark-400 text-xs mb-1">Total Revenue</p>
                    <p className="text-emerald-400 font-bold text-xl">
                      A${((salesReport as any[]) ?? [])
                        .reduce((sum: number, i: any) => sum + Number(i.revenue), 0)
                        .toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="card p-4 text-center">
                    <p className="text-dark-400 text-xs mb-1">Products Moved</p>
                    <p className="text-white font-bold text-xl">{((salesReport as any[]) ?? []).length}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
