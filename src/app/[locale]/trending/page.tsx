import { createClient } from '@supabase/supabase-js';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { TrendingUp } from 'lucide-react';
import { SEED_PRODUCTS } from '@/lib/seed-data';

export default async function TrendingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  let products: Product[] = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_trending', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    products = data || [];
  } catch {
    products = SEED_PRODUCTS
      .filter((p) => p.is_trending)
      .map((p, i) => ({ ...p, id: `demo-${i}`, created_at: '' })) as Product[];
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1 h-8 bg-brand-red" />
          <h1 className="text-3xl font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
            <TrendingUp className="text-brand-red" />
            {t('nav.trending')}
          </h1>
        </div>
        <p className="text-brand-gray-400 mb-10 ms-5">
          {locale === 'ar'
            ? 'المنتجات الأكثر طلباً هذا الأسبوع من المشترين حول العالم'
            : 'Most-requested products this week from buyers worldwide'}
        </p>

        {products.length === 0 ? (
          <div className="text-center py-20 text-brand-gray-400">
            <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
            <p>{locale === 'ar' ? 'لا توجد منتجات رائجة حالياً' : 'No trending products at the moment'}</p>
          </div>
        ) : (
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
