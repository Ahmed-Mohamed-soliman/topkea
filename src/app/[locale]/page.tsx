import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/layout/HeroSection';
import CategoryGrid from '@/components/product/CategoryGrid';
import ProductCard from '@/components/product/ProductCard';
import { Product } from '@/types';
import { TrendingUp } from 'lucide-react';
import { SEED_PRODUCTS } from '@/lib/seed-data';


export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');

  let trendingProducts: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_trending', true)
      .eq('is_active', true)
      .limit(8);

    trendingProducts = data || [];
  } catch {
    // Fallback to seed data for demo when Supabase not configured
    trendingProducts = SEED_PRODUCTS.filter((p) => p.is_trending).slice(0, 8).map((p, i) => ({
      ...p,
      id: `demo-${i}`,
      created_at: new Date().toISOString(),
    })) as Product[];
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main>
        <HeroSection />
        <CategoryGrid />

        {/* Trending Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-brand-red" />
                <h2 className="text-2xl font-bold text-white font-display tracking-wider uppercase flex items-center gap-2">
                  <TrendingUp size={20} className="text-brand-red" />
                  {t('trending_title')}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 border-y border-brand-gray-700 bg-brand-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                {
                  title: t('trust_prepaid'),
                  desc: locale === 'ar' ? 'نضمن أمان معاملاتك التجارية' : 'Your transactions are fully secured',
                  icon: '🔒',
                },
                {
                  title: t('trust_quality'),
                  desc: locale === 'ar' ? 'كل منتج يمر بفحص جودة صارم قبل الشحن' : 'Every product passes strict QC before shipping',
                  icon: '✅',
                },
                {
                  title: t('trust_wholesale'),
                  desc: locale === 'ar' ? 'أسعار جملة حصرية للمشترين المحترفين' : 'Exclusive wholesale rates for bulk buyers',
                  icon: '💰',
                },
              ].map(({ title, desc, icon }) => (
                <div key={title} className="group p-6 border border-brand-gray-700 hover:border-brand-red/40 rounded-sm transition-all duration-300 hover:bg-brand-red/5">
                  <div className="text-4xl mb-4">{icon}</div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-brand-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
