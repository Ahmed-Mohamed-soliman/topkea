'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore, getEffectivePrice } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { MIN_ORDER_BY_CATEGORY } from '@/types';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale() as 'ar' | 'en';
  const { items, removeItem, updateQuantity, getSubtotal, getDiscount, getTotal, isVip } = useCartStore();
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-black">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-20 pt-28 flex flex-col items-center justify-center min-h-[60vh]">
          <ShoppingBag size={64} className="text-brand-gray-600 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">{t('cart.empty')}</h2>
          <p className="text-brand-gray-400 mb-8">{locale === 'ar' ? 'أضف منتجات لبدء التسوق' : 'Add products to start shopping'}</p>
          <Link
            href="/"
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-8 py-3 rounded-sm transition-colors"
          >
            {t('cart.empty_cta')}
            <ArrowIcon size={16} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-8 bg-brand-red" />
          <h1 className="text-3xl font-bold text-white font-display tracking-wider uppercase">
            {t('cart.title')}
          </h1>
        </div>

        {isVip && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-sm flex items-center gap-2 text-yellow-400">
            <Star size={16} className="fill-yellow-400" />
            <span className="text-sm font-semibold">{t('home.vip_banner')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => {
              const effectivePrice = getEffectivePrice(product, quantity);
              const minOrder = MIN_ORDER_BY_CATEGORY[product.category];
              return (
                <div key={product.id} className="flex gap-4 p-4 bg-brand-gray-800 border border-brand-gray-700 rounded-sm hover:border-brand-red/30 transition-colors">
                  <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden bg-brand-gray-700">
                    <Image src={product.image} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                      {locale === 'ar' ? product.name_ar : product.name_en}
                    </h3>
                    <div className="text-brand-red font-bold">
                      {formatCurrency(effectivePrice * quantity, locale)}
                    </div>
                    <div className="text-xs text-brand-gray-400">
                      {formatCurrency(effectivePrice, locale)} × {quantity}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(product.id, Math.max(minOrder, quantity - 100))}
                        className="w-7 h-7 border border-brand-gray-600 text-white hover:border-brand-red rounded-sm flex items-center justify-center transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm text-white font-mono w-16 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 100)}
                        className="w-7 h-7 border border-brand-gray-600 text-white hover:border-brand-red rounded-sm flex items-center justify-center transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="ms-auto text-brand-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6">
              <h3 className="font-bold text-white text-lg mb-6">
                {t('checkout.order_summary')}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-400">{t('cart.subtotal')}</span>
                  <span className="text-white">{formatCurrency(subtotal, locale)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400 flex items-center gap-1">
                      <Star size={10} className="fill-yellow-400" />
                      {t('cart.vip_discount')}
                    </span>
                    <span className="text-yellow-400">-{formatCurrency(discount, locale)}</span>
                  </div>
                )}
                <div className="border-t border-brand-gray-700 pt-3 flex justify-between font-bold text-lg">
                  <span className="text-white">{t('cart.total')}</span>
                  <span className="text-brand-red">{formatCurrency(total, locale)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-brand-red/30"
              >
                {t('cart.checkout')}
                <ArrowIcon size={16} />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-1 text-xs text-brand-gray-400">
                🔒 {t('checkout.prepaid_notice')}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
