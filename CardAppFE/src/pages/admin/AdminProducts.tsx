import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Edit, X, Search, AlertTriangle, Upload, ImageIcon, Trash2 } from 'lucide-react';
import { productsService } from '../../services/products.service';
import { Product } from '../../types';
import { handleApiError } from '../../lib/api';
import { useQuery as useCatsQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

const emptyForm = {
  name: '', slug: '', description: '', brand: 'POKEMON' as const, productType: 'BOOSTER_BOX' as const,
  price: '', compareAtPrice: '', stockQuantity: 0, imageUrls: [] as string[], isFeatured: false, isActive: true, sku: '', categoryId: '',
};

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('accessToken');
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return data.url as string;
};

const ImageUpload = ({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange([...urls, url]);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeUrl = (idx: number) => {
    onChange(urls.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {urls.map((url, idx) => (
          <div key={idx} className="relative group">
            <img src={url} alt="" className="w-20 h-24 object-cover rounded-lg border border-dark-700" />
            <button
              type="button"
              onClick={() => removeUrl(idx)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-20 h-24 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-dark-600 text-dark-500 hover:border-gold-500 hover:text-gold-400 transition-colors text-xs disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload size={16} />
              <span>Upload</span>
            </>
          )}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {urls.length === 0 && (
        <p className="text-dark-500 text-xs flex items-center gap-1">
          <ImageIcon size={12} /> No images yet — click Upload to add one
        </p>
      )}
    </div>
  );
};

export const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => productsService.getAll({ page, limit: 15, search: search || undefined }),
  });

  const { data: categories } = useCatsQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await apiClient.GET('/api/categories'); return data ?? []; },
  });

  const createMut = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setShowForm(false); toast.success('Product created'); },
    onError: handleApiError,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setEditProduct(null); toast.success('Product updated'); },
    onError: handleApiError,
  });

  const deleteMut = useMutation({
    mutationFn: productsService.remove,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deactivated'); },
    onError: handleApiError,
  });

  const handleOpenEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name, slug: product.slug, description: product.description,
      brand: product.brand as any, productType: product.productType as any,
      price: product.price, compareAtPrice: product.compareAtPrice || '',
      stockQuantity: product.stockQuantity, imageUrls: product.imageUrls,
      isFeatured: product.isFeatured, isActive: product.isActive,
      sku: product.sku, categoryId: product.categoryId,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      price: parseFloat(form.price as string),
      compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice as string) : undefined,
    };
    if (editProduct) {
      updateMut.mutate({ id: editProduct.id, data });
    } else {
      createMut.mutate(data as any);
    }
  };

  const isFormOpen = showForm || !!editProduct;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="section-title">Products</h1>
        <button onClick={() => { setShowForm(true); setEditProduct(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2 py-2 px-4">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input-field pl-9"
        />
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-semibold">{editProduct ? 'Edit Product' : 'New Product'}</h2>
            <button onClick={() => { setShowForm(false); setEditProduct(null); }} className="text-dark-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">SKU</label>
              <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="input-field" required>
                <option value="">Select category</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Brand</label>
              <select value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value as any })} className="input-field">
                <option value="POKEMON">Pokémon</option>
                <option value="ONE_PIECE">One Piece</option>
              </select>
            </div>
            <div>
              <label className="label">Product Type</label>
              <select value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value as any })} className="input-field">
                <option value="BOOSTER_BOX">Booster Box</option>
                <option value="INDIVIDUAL_CARD">Individual Card</option>
                <option value="ACCESSORY">Accessory</option>
              </select>
            </div>
            <div>
              <label className="label">Price (AUD)</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="label">Compare At Price (optional)</label>
              <input type="number" step="0.01" value={form.compareAtPrice} onChange={e => setForm({ ...form, compareAtPrice: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label">Stock Quantity</label>
              <input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: parseInt(e.target.value) })} className="input-field" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Product Images</label>
              <ImageUpload urls={form.imageUrls} onChange={urls => setForm({ ...form, imageUrls: urls })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-[100px]" required />
            </div>
            <div className="sm:col-span-2 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-gold-500" />
                <span className="text-dark-300 text-sm">Featured Product</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-gold-500" />
                <span className="text-dark-300 text-sm">Active</span>
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="btn-primary flex-1">
                {(createMut.isPending || updateMut.isPending) ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditProduct(null); }} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left text-dark-400 font-medium px-4 py-3">Product</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3 hidden sm:table-cell">Brand</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3">Price</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3">Stock</th>
                <th className="text-left text-dark-400 font-medium px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right text-dark-400 font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    <td className="px-4 py-3" colSpan={6}><div className="h-8 skeleton rounded" /></td>
                  </tr>
                ))
              ) : data?.data.map((product: Product) => (
                <tr key={product.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrls[0] ? (
                        <img src={product.imageUrls[0]} alt="" className="w-10 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-12 bg-dark-800 rounded flex items-center justify-center">
                          <ImageIcon size={16} className="text-dark-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium line-clamp-1">{product.name}</p>
                        <p className="text-dark-500 text-xs">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${product.brand === 'POKEMON' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.brand === 'POKEMON' ? 'Pokémon' : 'One Piece'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gold-400 font-medium">A${Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs ${product.stockQuantity <= 5 ? 'text-amber-400' : 'text-white'}`}>
                      {product.stockQuantity <= 5 && <AlertTriangle size={12} />}
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${product.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenEdit(product)} className="p-1.5 text-dark-400 hover:text-white transition-colors">
                      <Edit size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-40 text-sm">Prev</button>
          <span className="flex items-center px-3 text-dark-400 text-sm">{page} / {data.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === data.totalPages} className="btn-secondary py-2 px-4 disabled:opacity-40 text-sm">Next</button>
        </div>
      )}
    </div>
  );
};
