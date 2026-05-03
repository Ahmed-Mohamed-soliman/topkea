'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { createClient } from '@/lib/supabase';
import { Product, CategoryKey, CATEGORY_ICONS, CATEGORIES } from '@/types';
import { Search, SlidersHorizontal } from 'lucide-react';
import { SEED_PRODUCTS } from '@/lib/seed-data';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = useTranslations();
  const locale = useLocale() as 'ar' | 'en';
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryKey>('clothing');

  useEffect(() => {
    (async () => {
      const { slug } = await params;
      if (slug === 'all') {
        setCategory('clothing'); // أو أي default category عندك
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(48);

        setProducts(data || []);
        setFiltered(data || []);
      } else {
        const cat = slug as CategoryKey;
        setCategory(cat);

        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('category', cat)
          .eq('is_active', true);

        setProducts(data || []);
        setFiltered(data || []);
      }
    })();
  }, [params]);

  useEffect(() => {
    let result = [...products];
    if (search) {
      result = result.filter((p) =>
        p.name_ar.includes(search) || p.name_en.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    setFiltered(result);
  }, [search, sortBy, products]);

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-8 bg-brand-red" />
          <div className="flex items-center gap-3">
            <span className="text-3xl">{CATEGORY_ICONS[category] || '🛍'}</span>
            <h1 className="text-3xl font-bold text-white font-display tracking-wider uppercase">
              {t(`categories.${category}`)}
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-brand-gray-800 border border-brand-gray-700 rounded-sm">
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white text-sm pl-9 pr-4 py-2.5 rounded-sm focus:outline-none focus:border-brand-red"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-brand-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-gray-700 border border-brand-gray-600 text-white text-sm px-4 py-2.5 rounded-sm focus:outline-none focus:border-brand-red"
            >
              <option value="default">{t('common.sort')}</option>
              <option value="price_asc">{locale === 'ar' ? 'السعر: من الأقل' : 'Price: Low to High'}</option>
              <option value="price_desc">{locale === 'ar' ? 'السعر: من الأعلى' : 'Price: High to Low'}</option>
            </select>
          </div>
          <div className="text-sm text-brand-gray-400 flex items-center">
            {filtered.length} {locale === 'ar' ? 'منتج' : 'products'}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-gray-800 rounded-sm aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-brand-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p>{locale === 'ar' ? 'لا توجد منتجات' : 'No products found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
