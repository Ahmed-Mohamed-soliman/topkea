'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, ArrowLeft, Zap } from 'lucide-react';

export default function HeroSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden noise-bg">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-brand-gray-900 to-brand-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(229,9,20,0.15),transparent)]" />

      {/* Geometric accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 border border-brand-red rotate-45" />
        <div className="absolute top-40 right-40 w-32 h-32 border border-brand-red rotate-45" />
        <div className="absolute bottom-20 right-10 w-96 h-96 border border-brand-red/30 rotate-12" />
      </div>

      {/* Vertical red line accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-brand-red to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-semibold px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Zap size={12} />
            {isRTL ? 'منصة B2B الرائدة' : 'Leading B2B Platform'}
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display tracking-widest uppercase text-white mb-6 animate-slide-up leading-none">
            {isRTL ? (
              <>
                سوق <span className="text-brand-red">الجملة</span> الأول
              </>
            ) : (
              <>
                THE <span className="text-brand-red">#1</span> WHOLESALE
                <br />MARKETPLACE
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p
            className="text-brand-gray-200 text-lg sm:text-xl mb-10 leading-relaxed animate-slide-up max-w-xl"
            style={{ animationDelay: '100ms' }}
          >
            {t('hero_subtitle')}
          </p>

          {/* Stats */}
          <div
            className="flex flex-wrap gap-8 mb-12 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            {[
              { value: '10K+', label: isRTL ? 'منتج' : 'Products' },
              { value: '500+', label: isRTL ? 'مورد موثوق' : 'Trusted Suppliers' },
              { value: '50+', label: isRTL ? 'دولة' : 'Countries' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-display text-brand-red">{value}</div>
                <div className="text-xs text-brand-gray-400 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="flex flex-wrap gap-4 animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            <Link
              href="/trending"
              className="group flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white font-semibold px-8 py-4 rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-brand-red/30 active:scale-95"
            >
              {t('hero_cta')}
              <ArrowIcon size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/build-your-own"
              className="flex items-center gap-2 border border-brand-gray-600 hover:border-brand-red text-white font-semibold px-8 py-4 rounded-sm transition-all duration-300 hover:bg-brand-red/5"
            >
              {t('hero_cta_secondary')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-brand-black to-transparent" />
    </section>
  );
}
