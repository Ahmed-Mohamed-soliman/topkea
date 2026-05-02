'use client';
import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { createClient } from '@/lib/supabase';
import { Product, CategoryKey, CATEGORIES } from '@/types';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { Plus, Pencil, Trash2, Upload, X, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

const EMPTY_FORM = {
  name_ar: '', name_en: '', description_ar: '', description_en: '',
  category: 'clothing' as CategoryKey, price: '', min_order: '500',
  image: '', stock: '1000', sku: '', is_trending: false, is_active: true,
};

export default function AdminProducts() {
  const locale = useLocale() as 'ar' | 'en';
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load error:', error.message);
      toast.error(`Load failed: ${error.message}`);
      return;
    }
    setProducts(data || []);
  };

  const handleSave = async () => {
    if (!form.name_en || !form.price || !form.image) {
      toast.error('Name, Price and Image are required');
      return;
    }

    const supabase = createClient();

    const payload = {
      name_ar: form.name_ar || form.name_en,
      name_en: form.name_en,
      description_ar: form.description_ar,
      description_en: form.description_en,
      category: form.category,
      price: parseFloat(form.price),
      min_order: parseInt(form.min_order) || 500,
      image: form.image,
      stock: parseInt(form.stock) || 0,
      sku: form.sku || null,
      is_trending: form.is_trending,
      is_active: form.is_active,
    };

    try {
      if (editing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id);

        if (error) {
          console.error('Update error:', error);
          toast.error(`Update failed: ${error.message}`);
          return;
        }
        toast.success('✅ Product updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(payload);

        if (error) {
          console.error('Insert error:', error);
          toast.error(`Insert failed: ${error.message}`);
          return;
        }
        toast.success('✅ Product added');
      }

      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      loadProducts();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Unexpected error:', msg);
      toast.error(`Error: ${msg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', id);
      toast.success('Deleted');
      loadProducts();
    } catch {
      toast.error('Error');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name_ar: product.name_ar,
      name_en: product.name_en,
      description_ar: product.description_ar || '',
      description_en: product.description_en || '',
      category: product.category,
      price: product.price.toString(),
      min_order: product.min_order.toString(),
      image: product.image,
      stock: product.stock.toString(),
      sku: product.sku || '',
      is_trending: product.is_trending || false,
      is_active: product.is_active,
    });
    setShowForm(true);
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const supabase = createClient();
        const rows = results.data as Record<string, string>[];
        for (const row of rows) {
          if (!row.name_en) continue;
          await supabase.from('products').insert({
            name_ar: row.name_ar || row.name_en,
            name_en: row.name_en,
            category: row.category || 'clothing',
            price: parseFloat(row.price) || 0,
            min_order: parseInt(row.min_order) || 500,
            image: row.image || '',
            stock: parseInt(row.stock) || 1000,
            is_active: true,
          });
        }
        toast.success(`Imported ${rows.length} products`);
        loadProducts();
      },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Products ({products.length})</h2>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 border border-brand-gray-600 hover:border-brand-red text-white text-sm px-3 py-2 rounded-sm transition-colors"
          >
            <Upload size={14} />
            CSV
          </button>
          <button
            onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-sm px-4 py-2 rounded-sm transition-colors"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-brand-gray-800 border border-brand-red/30 rounded-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white">{editing ? 'Edit Product' : 'New Product'}</h3>
            <button onClick={() => setShowForm(false)} className="text-brand-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              ['name_en', 'Name (English)', 'text'],
              ['name_ar', 'الاسم (عربي)', 'text'],
              ['price', 'Price ($)', 'number'],
              ['min_order', 'Min Order', 'number'],
              ['stock', 'Stock', 'number'],
              ['sku', 'SKU', 'text'],
            ] as [keyof typeof form, string, string][]).map(([key, label, type]) => (
              <div key={key}>
                <label className="text-xs text-brand-gray-400 mb-1 block">{label}</label>
                <input
                  type={type}
                  value={form[key] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-brand-red"
                />
              </div>
            ))}

            <div>
              <label className="text-xs text-brand-gray-400 mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as CategoryKey })}
                className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-brand-red"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-6">
              {[
                { key: 'is_trending', label: 'Trending' },
                { key: 'is_active', label: 'Active' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as 'is_trending' | 'is_active']}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="accent-brand-red"
                  />
                  <span className="text-sm text-white">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[['description_en', 'Description (EN)'], ['description_ar', 'الوصف (AR)']].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-brand-gray-400 mb-1 block">{label}</label>
                <textarea
                  value={form[key as 'description_en' | 'description_ar']}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  rows={2}
                  className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-brand-red resize-none"
                />
              </div>
            ))}
          </div>
      {/* Image Upload */}
      <div className="md:col-span-2">
        <label className="text-xs text-brand-gray-400 mb-1 block">Product Image</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Image URL or upload below"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white px-3 py-2 rounded-sm text-sm focus:outline-none focus:border-brand-red mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const supabase = createClient();
                const ext = file.name.split('.').pop();
                const fileName = `product-${Date.now()}.${ext}`;
                const { data, error } = await supabase.storage
                  .from('products')
                  .upload(fileName, file, { upsert: true });
                if (error) {
                  toast.error('Upload failed: ' + error.message);
                  return;
                }
                const { data: { publicUrl } } = supabase.storage
                  .from('products')
                  .getPublicUrl(fileName);
                setForm({ ...form, image: publicUrl });
                toast.success('Image uploaded ✅');
              }}
              className="w-full text-xs text-brand-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:bg-brand-red file:text-white hover:file:bg-brand-red-dark cursor-pointer"
            />
          </div>
          {form.image && (
            <div className="relative w-20 h-20 rounded-sm overflow-hidden bg-brand-gray-700 shrink-0">
              <img src={form.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

          <button
            onClick={handleSave}
            className="mt-6 flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2.5 rounded-sm text-sm font-semibold transition-colors"
          >
            <Save size={14} />
            Save Product
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-700">
              {['Product', 'Category', 'Price', 'Min Order', 'Stock', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-start py-3 px-3 text-brand-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-brand-gray-800 hover:bg-brand-gray-800/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    {p.image && (
                      <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-brand-gray-700 shrink-0">
                        <Image src={p.image} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium line-clamp-1">{p.name_en}</div>
                      <div className="text-brand-gray-400 text-xs">{p.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-brand-gray-400">{p.category}</td>
                <td className="py-3 px-3 text-brand-red font-semibold">{formatCurrency(p.price, 'en')}</td>
                <td className="py-3 px-3 text-white">{p.min_order}</td>
                <td className="py-3 px-3 text-white">{p.stock.toLocaleString()}</td>
                <td className="py-3 px-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-brand-gray-400 hover:text-white transition-colors p-1">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-brand-gray-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
