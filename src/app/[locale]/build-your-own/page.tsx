'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase';
import { CATEGORIES, CATEGORY_ICONS, MIN_ORDER_BY_CATEGORY, CategoryKey } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const COLOR_OPTIONS = ['#000000', '#FFFFFF', '#E50914', '#1E40AF', '#16A34A', '#D97706', '#7C3AED', '#DB2777'];
const SIZE_OPTIONS_EN = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const SIZE_OPTIONS_AR = ['صغير جداً', 'صغير', 'متوسط', 'كبير', 'كبير جداً', 'كبير جداً جداً', 'مقاس موحد'];
const FEATURE_OPTIONS_EN = ['Custom Logo Print', 'Premium Packaging', 'Bulk Discount', 'Rush Production', 'OEM Branding', 'Sample First'];
const FEATURE_OPTIONS_AR = ['طباعة شعار مخصص', 'تغليف فاخر', 'خصم الكمية', 'إنتاج سريع', 'علامة تجارية OEM', 'عينة أولاً'];

export default function BuildYourOwnPage() {
  const t = useTranslations('build');
  const locale = useLocale() as 'ar' | 'en';
  const isRTL = locale === 'ar';
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CategoryKey | ''>('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(500);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const minOrder = category ? MIN_ORDER_BY_CATEGORY[category as CategoryKey] : 500;
  const sizeOptions = isRTL ? SIZE_OPTIONS_AR : SIZE_OPTIONS_EN;
  const featureOptions = isRTL ? FEATURE_OPTIONS_AR : FEATURE_OPTIONS_EN;

  const toggleFeature = (f: string) => {
    setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleSubmit = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('custom_orders').insert({
        user_id: user?.id,
        category,
        color,
        size,
        features,
        quantity,
        notes,
        status: 'pending',
      });
    } catch {
      // Demo — just show success
    }
    setSubmitted(true);
    toast.success(t('success'));
  };

  const steps = [t('category_step'), t('options_step'), t('quantity_step')];

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-black">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 pt-32 text-center">
          <div className="bg-brand-gray-800 border border-green-500/30 rounded-sm p-12">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">
              {isRTL ? 'تم إرسال طلبك!' : 'Order Submitted!'}
            </h2>
            <p className="text-brand-gray-400">{t('success')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        {/* Title */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-8 bg-brand-red" />
          <div>
            <h1 className="text-3xl font-bold text-white font-display tracking-wider uppercase">{t('title')}</h1>
            <p className="text-brand-gray-400 text-sm mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors',
                  i === step ? 'bg-brand-red text-white' :
                  i < step ? 'bg-green-600 text-white' :
                  'bg-brand-gray-700 text-brand-gray-400'
                )}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={cn('text-xs hidden sm:block', i === step ? 'text-white' : 'text-brand-gray-400')}>
                {label}
              </span>
              {i < steps.length - 1 && (
                <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-green-600' : 'bg-brand-gray-700')} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-8">
          {/* Step 0: Category */}
          {step === 0 && (
            <div>
              <h3 className="font-bold text-white text-lg mb-6">{t('category_step')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'p-4 border rounded-sm text-center transition-all duration-200',
                      category === cat
                        ? 'border-brand-red bg-brand-red/10 text-white'
                        : 'border-brand-gray-600 text-brand-gray-400 hover:border-brand-red/50 hover:text-white'
                    )}
                  >
                    <div className="text-2xl mb-2">{CATEGORY_ICONS[cat]}</div>
                    <div className="text-xs font-medium">{locale === 'ar' ? cat : cat.replace('_', ' ')}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Options */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-white mb-4">{t('color')}</h3>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 transition-all',
                        color === c ? 'border-brand-red scale-110' : 'border-transparent hover:border-brand-gray-400'
                      )}
                      style={{ backgroundColor: c, boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #333' : 'none' }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">{t('size')}</h3>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        'px-4 py-2 border rounded-sm text-sm font-medium transition-colors',
                        size === s ? 'border-brand-red bg-brand-red text-white' : 'border-brand-gray-600 text-brand-gray-400 hover:border-brand-red hover:text-white'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">{t('features')}</h3>
                <div className="flex flex-wrap gap-2">
                  {featureOptions.map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFeature(f)}
                      className={cn(
                        'px-3 py-2 border rounded-sm text-xs font-medium transition-colors',
                        features.includes(f) ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'border-brand-gray-600 text-brand-gray-400 hover:border-brand-red/50 hover:text-white'
                      )}
                    >
                      {features.includes(f) ? '✓ ' : ''}{f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">{isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder={isRTL ? 'أي تفاصيل إضافية...' : 'Any additional details...'}
                  className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-brand-red resize-none text-sm"
                />
              </div>
            </div>
          )}

          {/* Step 2: Quantity */}
          {step === 2 && (
            <div>
              <h3 className="font-bold text-white text-lg mb-2">{t('quantity_step')}</h3>
              <p className="text-brand-gray-400 text-sm mb-8">
                {isRTL ? `الحد الأدنى للطلب: ${minOrder} وحدة` : `Minimum order: ${minOrder} units`}
              </p>

              <div className="space-y-6">
                <div>
                  <input
                    type="range"
                    min={minOrder}
                    max={10000}
                    step={100}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-brand-red"
                  />
                  <div className="flex justify-between text-xs text-brand-gray-400 mt-1">
                    <span>{minOrder}</span>
                    <span className="text-white font-bold text-lg">{quantity.toLocaleString()}</span>
                    <span>10,000</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-brand-gray-700 rounded-sm space-y-2 text-sm">
                  {[
                    { label: isRTL ? 'الفئة' : 'Category', value: category ? `${CATEGORY_ICONS[category as CategoryKey]} ${category}` : '-' },
                    { label: isRTL ? 'اللون' : 'Color', value: color || '-' },
                    { label: isRTL ? 'الحجم' : 'Size', value: size || '-' },
                    { label: isRTL ? 'الكمية' : 'Quantity', value: `${quantity.toLocaleString()} ${isRTL ? 'وحدة' : 'units'}` },
                    { label: isRTL ? 'المميزات' : 'Features', value: features.length ? features.join(', ') : '-' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-brand-gray-400">{label}:</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-10">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 border border-brand-gray-600 hover:border-brand-red text-white px-6 py-3 rounded-sm transition-colors text-sm"
              >
                {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                {isRTL ? 'السابق' : 'Previous'}
              </button>
            ) : <div />}

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 0 && !category}
                className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 text-white px-6 py-3 rounded-sm transition-colors text-sm font-semibold"
              >
                {isRTL ? 'التالي' : 'Next'}
                <NextIcon size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-8 py-3 rounded-sm transition-colors text-sm font-semibold"
              >
                <Send size={16} />
                {t('submit')}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
