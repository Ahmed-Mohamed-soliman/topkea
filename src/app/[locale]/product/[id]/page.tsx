'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import { useCartStore, getEffectivePrice } from '@/lib/cart-store';
import { createClient } from '@/lib/supabase';
import { Product, MIN_ORDER_BY_CATEGORY } from '@/types';
import { getProductName, getProductDescription, formatCurrency } from '@/lib/utils';
import { ShoppingCart, Plus, Minus, Package, Tag, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { CategoryKey } from '@/types';

export default function ProductPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const t = useTranslations();
  const locale = useLocale() as 'ar' | 'en';
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(500);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      try {
        const supabase = createClient();
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setProduct(data);
          setQuantity(MIN_ORDER_BY_CATEGORY[data.category as CategoryKey] || data.min_order || 500);
          const { data: rel } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(4);
          setRelated(rel || []);
        }
      } catch {
        // Demo fallback
        const demo = SEED_PRODUCTS.find((_, i) => `demo-${i}` === id) ||
          SEED_PRODUCTS[0];
        const p = { ...demo, id, created_at: '' } as Product;
        setProduct(p);
        setQuantity(p.min_order);
        setRelated(
          SEED_PRODUCTS.slice(0, 4).map((sp, i) => ({ ...sp, id: `demo-rel-${i}`, created_at: '' })) as Product[]
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const minOrder = MIN_ORDER_BY_CATEGORY[product.category];
  const effectivePrice = getEffectivePrice(product, quantity);
  const totalPrice = effectivePrice * quantity;
  const allImages = product.images?.length ? product.images : [product.image];

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
  };

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-brand-gray-800 rounded-sm overflow-hidden mb-4">
              <Image
                src={allImages[selectedImage]}
                alt={getProductName(product, locale)}
                fill
                className="object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-brand-red' : 'border-brand-gray-700'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-brand-red uppercase tracking-widest font-semibold">
                {t(`categories.${product.category}`)}
              </span>
              {product.sku && (
                <span className="text-xs text-brand-gray-400 font-mono">· {product.sku}</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4 leading-snug">
              {getProductName(product, locale)}
            </h1>

            <p className="text-brand-gray-400 mb-8 leading-relaxed">
              {getProductDescription(product, locale)}
            </p>

            {/* Price Tiers */}
            {product.price_tiers?.length ? (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={14} className="text-brand-red" />
                  <span className="text-sm font-semibold text-white">{t('product.price_tiers')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {product.price_tiers.map((tier, i) => (
                    <div
                      key={i}
                      className={`p-3 border rounded-sm transition-colors ${
                        quantity >= tier.min_qty
                          ? 'border-brand-red bg-brand-red/10'
                          : 'border-brand-gray-700 bg-brand-gray-800'
                      }`}
                    >
                      <div className="text-brand-red font-bold text-lg">
                        {formatCurrency(tier.price, locale)}
                      </div>
                      <div className="text-xs text-brand-gray-400">
                        {locale === 'ar' ? tier.label_ar : tier.label_en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="text-4xl font-bold text-brand-red mb-1">
                  {formatCurrency(product.price, locale)}
                </div>
                <div className="text-xs text-brand-gray-400">{t('product.units')}</div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="text-sm text-brand-gray-400 mb-2 block">
                {t('cart.quantity')} (min: {minOrder})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(minOrder, quantity - 100))}
                  className="w-10 h-10 border border-brand-gray-600 text-white hover:border-brand-red hover:text-brand-red rounded-sm flex items-center justify-center transition-colors"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  min={minOrder}
                  onChange={(e) => {
                    const val = Math.max(minOrder, parseInt(e.target.value) || minOrder);
                    setQuantity(val);
                  }}
                  className="w-28 bg-brand-gray-800 border border-brand-gray-600 text-white text-center px-3 py-2 rounded-sm focus:outline-none focus:border-brand-red"
                />
                <button
                  onClick={() => setQuantity(quantity + 100)}
                  className="w-10 h-10 border border-brand-gray-600 text-white hover:border-brand-red hover:text-brand-red rounded-sm flex items-center justify-center transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 bg-brand-gray-800 border border-brand-gray-700 rounded-sm mb-6">
              <div className="flex justify-between items-center">
                <span className="text-brand-gray-400 text-sm">{t('cart.total')}</span>
                <span className="text-2xl font-bold text-white">{formatCurrency(totalPrice, locale)}</span>
              </div>
              <div className="text-xs text-brand-gray-400 mt-1">
                {formatCurrency(effectivePrice, locale)} × {quantity} {t('product.units')}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-brand-red/30 active:scale-98"
            >
              <ShoppingCart size={18} />
              {t('product.add_to_cart')}
            </button>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { icon: CheckCircle, text: locale === 'ar' ? 'جودة مضمونة' : 'Quality Guaranteed' },
                { icon: Package, text: locale === 'ar' ? 'شحن سريع' : 'Fast Shipping' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-brand-gray-400">
                  <Icon size={12} className="text-green-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-8 bg-brand-red" />
              <h2 className="text-xl font-bold text-white font-display tracking-wider uppercase">
                {t('product.related')}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
