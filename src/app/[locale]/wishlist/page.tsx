'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase';
import { Link } from '@/i18n/routing';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const locale = useLocale() as 'ar' | 'en';
  const isRTL = locale === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ids: string[] = JSON.parse(localStorage.getItem('topkea-wishlist') || '[]');
      if (ids.length === 0) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', ids);
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const removeAll = () => {
    localStorage.removeItem('topkea-wishlist');
    setProducts([]);
  };

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-36">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-brand-red" />
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Heart size={20} className="text-brand-red fill-brand-red" />
              {isRTL ? 'المفضلة' : 'Wishlist'}
              {products.length > 0 && (
                <span className="text-brand-gray-400 text-base font-normal">({products.length})</span>
              )}
            </h1>
          </div>
          {products.length > 0 && (
            <button
              onClick={removeAll}
              className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
              {isRTL ? 'مسح الكل' : 'Clear all'}
            </button>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-brand-gray-800 border border-brand-gray-700 rounded-sm">
            <Heart size={48} className="text-brand-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">
              {isRTL ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
            </p>
            <p className="text-brand-gray-400 text-sm mb-6">
              {isRTL ? 'دوس على القلب على أي منتج لإضافته' : 'Click the heart on any product to add it'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-sm px-6 py-2.5 rounded-sm transition-colors"
            >
              <ShoppingBag size={14} />
              {isRTL ? 'تسوق الآن' : 'Shop Now'}
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
