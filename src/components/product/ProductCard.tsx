'use client';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCartStore } from '@/lib/cart-store';
import { Product } from '@/types';
import { getProductName, formatCurrency } from '@/lib/utils';
import { ShoppingCart, TrendingUp, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const t = useTranslations();
  const locale = useLocale() as 'ar' | 'en';
  const addItem = useCartStore((s) => s.addItem);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('topkea-wishlist') || '[]');
    setWished(wishlist.includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const wishlist: string[] = JSON.parse(localStorage.getItem('topkea-wishlist') || '[]');
    if (wished) {
      const updated = wishlist.filter((id) => id !== product.id);
      localStorage.setItem('topkea-wishlist', JSON.stringify(updated));
      setWished(false);
      toast(locale === 'ar' ? 'تم الحذف من المفضلة' : 'Removed from wishlist');
    } else {
      wishlist.push(product.id);
      localStorage.setItem('topkea-wishlist', JSON.stringify(wishlist));
      setWished(true);
      toast.success(locale === 'ar' ? '❤️ تمت الإضافة للمفضلة' : '❤️ Added to wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.min_order);
    toast.success(
      locale === 'ar'
        ? `تمت الإضافة: ${product.name_ar}`
        : `Added: ${product.name_en}`
    );
  };

  const displayPrice = product.price_tiers?.length
    ? product.price_tiers[0].price
    : product.price;

  return (
    <Link href={`/product/${product.id}`} className={cn('group block', className)}>
      <div className="product-card bg-brand-gray-800 border border-brand-gray-700 group-hover:border-brand-red/40 rounded-sm overflow-hidden">
        <div className="relative aspect-square overflow-hidden bg-brand-gray-700">
          <Image
            src={product.image}
            alt={getProductName(product, locale)}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
          />
          {product.is_trending && (
            <div className="absolute top-2 left-2 bg-brand-red text-white text-xs font-bold px-2 py-1 flex items-center gap-1">
              <TrendingUp size={10} />
              {locale === 'ar' ? 'رائج' : 'HOT'}
            </div>
          )}
          {/* Heart Button */}
          <button
            onClick={toggleWishlist}
            className={cn(
              'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              wished
                ? 'bg-brand-red text-white'
                : 'bg-black/50 text-white hover:bg-brand-red'
            )}
          >
            <Heart size={14} className={wished ? 'fill-white' : ''} />
          </button>
        </div>

        <div className="p-3">
          <p className="text-xs text-brand-gray-400 mb-1 uppercase tracking-wider">
            {t(`categories.${product.category}`)}
          </p>
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-2 group-hover:text-brand-red transition-colors">
            {getProductName(product, locale)}
          </h3>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-brand-red font-bold text-base">
                {formatCurrency(displayPrice, locale)}
              </div>
              <div className="text-brand-gray-400 text-xs">
                {t('product.min_order')}: {product.min_order} {t('product.units')}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="shrink-0 bg-brand-red hover:bg-brand-red-dark text-white p-2 rounded-sm transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
