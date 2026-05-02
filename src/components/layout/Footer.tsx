import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';
import { MessageCircle, Mail, Shield, Truck, CreditCard } from 'lucide-react';

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="bg-brand-gray-900 border-t border-brand-gray-700 mt-20">
      {/* Trust Bar */}
      <div className="bg-brand-red/10 border-b border-brand-red/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-8">
          {[
            { icon: CreditCard, text: t('home.trust_prepaid') },
            { icon: Shield, text: t('home.trust_quality') },
            { icon: Truck, text: t('home.trust_wholesale') },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-brand-gray-200">
              <Icon size={16} className="text-brand-red" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/logo.jpeg"
                alt="Topkea"
                className="h-10 w-auto"
              />
            </Link>
            <span className="font-display text-xl tracking-widest">
              TOP<span className="text-brand-red">KEA</span>
            </span>
          </div>
          <p className="text-brand-gray-400 text-sm leading-relaxed mb-4">
            {locale === 'ar'
              ? 'منصة الجملة الرائدة للمشترين المحترفين. جودة عالية، أسعار تنافسية.'
              : 'The leading wholesale platform for professional buyers. High quality, competitive prices.'}
          </p>
          <a
            href="https://wa.me/972562605367"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-sm transition-colors"
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
            {t('common.all')} {locale === 'ar' ? 'الفئات' : 'Categories'}
          </h4>
          <ul className="space-y-2">
            {CATEGORIES.slice(0, 7).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/category/${cat}`}
                  className="text-brand-gray-400 hover:text-brand-red text-sm transition-colors flex items-center gap-2"
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {t(`categories.${cat}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
            {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <ul className="space-y-2">
            {[
              { href: '/trending', label: t('nav.trending') },
              { href: '/build-your-own', label: t('nav.buildYourOwn') },
              { href: '/cart', label: t('nav.cart') },
              { href: '/help', label: locale === 'ar' ? 'المساعدة' : 'Help' },
              { href: '/auth/login', label: t('nav.login') },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-brand-gray-400 hover:text-brand-red text-sm transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
            {locale === 'ar' ? 'تواصل معنا' : 'Contact'}
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2 text-brand-gray-400 text-sm">
              <MessageCircle size={14} className="text-green-500 shrink-0" />
              <a href="https://wa.me/972562605367" className="hover:text-brand-red transition-colors">
                +972 56-260-5367
              </a>
            </li>
            <li className="flex items-center gap-2 text-brand-gray-400 text-sm">
              <Mail size={14} className="text-brand-red shrink-0" />
              <a href="mailto:info@topkea.com" className="hover:text-brand-red transition-colors">
                info@topkea.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-brand-gray-400">
          <span>© {new Date().getFullYear()} Topkea. All rights reserved.</span>
          <span>{locale === 'ar' ? 'جميع الحقوق محفوظة' : 'Built for professional wholesale buyers'}</span>
        </div>
      </div>
    </footer>
  );
}
