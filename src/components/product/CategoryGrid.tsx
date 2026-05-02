'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import { cn } from '@/lib/utils';

const CATEGORY_IMAGES: Record<string, string> = {
  clothing: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
  accessories: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
  makeup: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
  batteries: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
  toys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  machinery: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
  sweets: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
  mobile_spare_parts: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400',
  robots: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
  phone_accessories: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
  home_appliances: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
  drones: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
};

export default function CategoryGrid() {
  const t = useTranslations();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-8 bg-brand-red" />
          <h2 className="text-2xl font-bold text-white font-display tracking-wider uppercase">
            {t('home.categories_title')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {CATEGORIES.map((category, i) => (
            <Link
              key={category}
              href={`/category/${category}`}
              className={cn(
                'group relative overflow-hidden rounded-sm border border-brand-gray-700 hover:border-brand-red/50 transition-all duration-300',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${CATEGORY_IMAGES[category]})` }}
              />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300" />

              <div className="relative p-4 flex flex-col items-center justify-center min-h-[100px] text-center gap-2">
                <span className="text-2xl">{CATEGORY_ICONS[category]}</span>
                <span className="text-xs font-semibold text-white leading-tight">
                  {t(`categories.${category}`)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
