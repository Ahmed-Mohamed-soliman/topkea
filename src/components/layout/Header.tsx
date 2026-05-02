'use client';
import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useCartStore } from '@/lib/cart-store';
import { createClient } from '@/lib/supabase';
import {
  ShoppingCart, Menu, X, Globe, Search, MapPin,
  User, Package, Heart, LogOut, Settings, ChevronDown, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, CATEGORY_ICONS } from '@/types';

const ALL_COUNTRIES = [
  { code: 'AF', name_ar: 'أفغانستان', name_en: 'Afghanistan', flag: '🇦🇫' },
  { code: 'AL', name_ar: 'ألبانيا', name_en: 'Albania', flag: '🇦🇱' },
  { code: 'DZ', name_ar: 'الجزائر', name_en: 'Algeria', flag: '🇩🇿' },
  { code: 'AR', name_ar: 'الأرجنتين', name_en: 'Argentina', flag: '🇦🇷' },
  { code: 'AU', name_ar: 'أستراليا', name_en: 'Australia', flag: '🇦🇺' },
  { code: 'AT', name_ar: 'النمسا', name_en: 'Austria', flag: '🇦🇹' },
  { code: 'BH', name_ar: 'البحرين', name_en: 'Bahrain', flag: '🇧🇭' },
  { code: 'BD', name_ar: 'بنغلاديش', name_en: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BE', name_ar: 'بلجيكا', name_en: 'Belgium', flag: '🇧🇪' },
  { code: 'BR', name_ar: 'البرازيل', name_en: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', name_ar: 'كندا', name_en: 'Canada', flag: '🇨🇦' },
  { code: 'CN', name_ar: 'الصين', name_en: 'China', flag: '🇨🇳' },
  { code: 'CO', name_ar: 'كولومبيا', name_en: 'Colombia', flag: '🇨🇴' },
  { code: 'HR', name_ar: 'كرواتيا', name_en: 'Croatia', flag: '🇭🇷' },
  { code: 'CY', name_ar: 'قبرص', name_en: 'Cyprus', flag: '🇨🇾' },
  { code: 'CZ', name_ar: 'التشيك', name_en: 'Czech Republic', flag: '🇨🇿' },
  { code: 'DK', name_ar: 'الدنمارك', name_en: 'Denmark', flag: '🇩🇰' },
  { code: 'EG', name_ar: 'مصر', name_en: 'Egypt', flag: '🇪🇬' },
  { code: 'ET', name_ar: 'إثيوبيا', name_en: 'Ethiopia', flag: '🇪🇹' },
  { code: 'FI', name_ar: 'فنلندا', name_en: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name_ar: 'فرنسا', name_en: 'France', flag: '🇫🇷' },
  { code: 'DE', name_ar: 'ألمانيا', name_en: 'Germany', flag: '🇩🇪' },
  { code: 'GH', name_ar: 'غانا', name_en: 'Ghana', flag: '🇬🇭' },
  { code: 'GR', name_ar: 'اليونان', name_en: 'Greece', flag: '🇬🇷' },
  { code: 'HK', name_ar: 'هونغ كونغ', name_en: 'Hong Kong', flag: '🇭🇰' },
  { code: 'HU', name_ar: 'المجر', name_en: 'Hungary', flag: '🇭🇺' },
  { code: 'IN', name_ar: 'الهند', name_en: 'India', flag: '🇮🇳' },
  { code: 'ID', name_ar: 'إندونيسيا', name_en: 'Indonesia', flag: '🇮🇩' },
  { code: 'IQ', name_ar: 'العراق', name_en: 'Iraq', flag: '🇮🇶' },
  { code: 'IE', name_ar: 'أيرلندا', name_en: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name_ar: 'إيطاليا', name_en: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name_ar: 'اليابان', name_en: 'Japan', flag: '🇯🇵' },
  { code: 'JO', name_ar: 'الأردن', name_en: 'Jordan', flag: '🇯🇴' },
  { code: 'KZ', name_ar: 'كازاخستان', name_en: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'KE', name_ar: 'كينيا', name_en: 'Kenya', flag: '🇰🇪' },
  { code: 'KW', name_ar: 'الكويت', name_en: 'Kuwait', flag: '🇰🇼' },
  { code: 'LB', name_ar: 'لبنان', name_en: 'Lebanon', flag: '🇱🇧' },
  { code: 'LY', name_ar: 'ليبيا', name_en: 'Libya', flag: '🇱🇾' },
  { code: 'MY', name_ar: 'ماليزيا', name_en: 'Malaysia', flag: '🇲🇾' },
  { code: 'MX', name_ar: 'المكسيك', name_en: 'Mexico', flag: '🇲🇽' },
  { code: 'MA', name_ar: 'المغرب', name_en: 'Morocco', flag: '🇲🇦' },
  { code: 'NL', name_ar: 'هولندا', name_en: 'Netherlands', flag: '🇳🇱' },
  { code: 'NZ', name_ar: 'نيوزيلندا', name_en: 'New Zealand', flag: '🇳🇿' },
  { code: 'NG', name_ar: 'نيجيريا', name_en: 'Nigeria', flag: '🇳🇬' },
  { code: 'NO', name_ar: 'النرويج', name_en: 'Norway', flag: '🇳🇴' },
  { code: 'OM', name_ar: 'عُمان', name_en: 'Oman', flag: '🇴🇲' },
  { code: 'PK', name_ar: 'باكستان', name_en: 'Pakistan', flag: '🇵🇰' },
  { code: 'PS', name_ar: 'فلسطين', name_en: 'Palestine', flag: '🇵🇸' },
  { code: 'PH', name_ar: 'الفلبين', name_en: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name_ar: 'بولندا', name_en: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name_ar: 'البرتغال', name_en: 'Portugal', flag: '🇵🇹' },
  { code: 'QA', name_ar: 'قطر', name_en: 'Qatar', flag: '🇶🇦' },
  { code: 'RO', name_ar: 'رومانيا', name_en: 'Romania', flag: '🇷🇴' },
  { code: 'RU', name_ar: 'روسيا', name_en: 'Russia', flag: '🇷🇺' },
  { code: 'SA', name_ar: 'السعودية', name_en: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'SN', name_ar: 'السنغال', name_en: 'Senegal', flag: '🇸🇳' },
  { code: 'SG', name_ar: 'سنغافورة', name_en: 'Singapore', flag: '🇸🇬' },
  { code: 'ZA', name_ar: 'جنوب أفريقيا', name_en: 'South Africa', flag: '🇿🇦' },
  { code: 'KR', name_ar: 'كوريا الجنوبية', name_en: 'South Korea', flag: '🇰🇷' },
  { code: 'ES', name_ar: 'إسبانيا', name_en: 'Spain', flag: '🇪🇸' },
  { code: 'SD', name_ar: 'السودان', name_en: 'Sudan', flag: '🇸🇩' },
  { code: 'SE', name_ar: 'السويد', name_en: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name_ar: 'سويسرا', name_en: 'Switzerland', flag: '🇨🇭' },
  { code: 'SY', name_ar: 'سوريا', name_en: 'Syria', flag: '🇸🇾' },
  { code: 'TW', name_ar: 'تايوان', name_en: 'Taiwan', flag: '🇹🇼' },
  { code: 'TZ', name_ar: 'تنزانيا', name_en: 'Tanzania', flag: '🇹🇿' },
  { code: 'TH', name_ar: 'تايلاند', name_en: 'Thailand', flag: '🇹🇭' },
  { code: 'TN', name_ar: 'تونس', name_en: 'Tunisia', flag: '🇹🇳' },
  { code: 'TR', name_ar: 'تركيا', name_en: 'Turkey', flag: '🇹🇷' },
  { code: 'UG', name_ar: 'أوغندا', name_en: 'Uganda', flag: '🇺🇬' },
  { code: 'UA', name_ar: 'أوكرانيا', name_en: 'Ukraine', flag: '🇺🇦' },
  { code: 'AE', name_ar: 'الإمارات', name_en: 'UAE', flag: '🇦🇪' },
  { code: 'GB', name_ar: 'بريطانيا', name_en: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name_ar: 'أمريكا', name_en: 'United States', flag: '🇺🇸' },
  { code: 'UZ', name_ar: 'أوزبكستان', name_en: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'VN', name_ar: 'فيتنام', name_en: 'Vietnam', flag: '🇻🇳' },
  { code: 'YE', name_ar: 'اليمن', name_en: 'Yemen', flag: '🇾🇪' },
];

type Country = typeof ALL_COUNTRIES[0];
type UserProfile = { email: string; name?: string; is_vip?: boolean; role?: string };

export default function Header() {
  const locale = useLocale() as 'ar' | 'en';
  const router = useRouter();
  const pathname = usePathname();
  const isRTL = locale === 'ar';

  const [user, setUser] = useState<UserProfile | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id:string;name_ar:string;name_en:string;image:string;price:number}[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(ALL_COUNTRIES.find(c => c.code === 'EG')!);
  const [countrySearch, setCountrySearch] = useState('');
  const [mounted, setMounted] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, is_vip, role')
          .eq('id', session.user.id)
          .single();
        setUser({
          email: session.user.email || '',
          name: profile?.full_name || session.user.user_metadata?.full_name,
          is_vip: profile?.is_vip,
          role: profile?.role,
        });
        
        // تحديث الـ VIP في الـ cart
        if (profile?.is_vip) {
          useCartStore.getState().setVip(true);
        } else {
          useCartStore.getState().setVip(false);
        }
      }
    });

    const saved = localStorage.getItem('selectedCountry');
    if (saved) {
      try { setSelectedCountry(JSON.parse(saved)); } catch {}
    }

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountries(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) setShowCategories(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowProfile(false);
    router.push('/');
  };

  const switchLocale = () => {
    router.replace(pathname, { locale: locale === 'ar' ? 'en' : 'ar' });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select('id, name_ar, name_en, image, price')
      .or(`name_en.ilike.%${query}%,name_ar.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(6);
    setSearchResults(data || []);
    setShowSearch(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    localStorage.setItem('selectedCountry', JSON.stringify(country));
    setShowCountries(false);
    setCountrySearch('');
  };

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name_en.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.name_ar.includes(countrySearch)
  );

  if (!mounted) return (
    <header className="fixed top-0 inset-x-0 z-50 bg-brand-black border-b border-brand-gray-700 h-14" />
  );

  return (
    <header className={cn(
      'fixed top-0 inset-x-0 z-50 transition-all duration-300',
      scrolled ? 'bg-brand-black/98 backdrop-blur-md shadow-lg' : 'bg-brand-black'
    )}>
      {/* TOP BAR */}
      <div className="border-b border-brand-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.jpeg"
              alt="Topkea"
              className="h-10 w-auto"
            />
          </Link>
          
          {/* Deliver To */}
          <div ref={countryRef} className="relative shrink-0 hidden md:block">
            <button
              onClick={() => { setShowCountries(!showCountries); setCountrySearch(''); }}
              className="flex items-center gap-1.5 text-brand-gray-200 hover:text-white transition-colors"
            >
              <MapPin size={14} className="text-brand-red shrink-0" />
              <div className="text-start">
                <div className="text-xs text-brand-gray-400 leading-none mb-0.5">
                  {isRTL ? 'التوصيل إلى' : 'Deliver to'}
                </div>
                <div className="text-xs font-semibold flex items-center gap-1">
                  <span>{selectedCountry.flag}</span>
                  <span>{isRTL ? selectedCountry.name_ar : selectedCountry.name_en}</span>
                  <ChevronDown size={10} className={cn('transition-transform', showCountries && 'rotate-180')} />
                </div>
              </div>
            </button>

            {showCountries && (
              <div className="absolute top-full mt-2 start-0 w-64 bg-brand-gray-800 border border-brand-gray-700 rounded-sm shadow-2xl z-[9999] overflow-hidden">
                {/* Search inside countries */}
                <div className="p-2 border-b border-brand-gray-700">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={isRTL ? 'ابحث عن دولة...' : 'Search country...'}
                    className="w-full bg-brand-gray-700 text-white text-xs px-3 py-2 rounded-sm outline-none"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => selectCountry(country)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-brand-gray-700',
                        selectedCountry.code === country.code ? 'text-brand-red bg-brand-red/5' : 'text-brand-gray-200'
                      )}
                    >
                      <span>{country.flag}</span>
                      <span>{isRTL ? country.name_ar : country.name_en}</span>
                      {selectedCountry.code === country.code && (
                        <span className="ms-auto text-brand-red text-xs">✓</span>
                      )}
                    </button>
                  ))}
                  {filteredCountries.length === 0 && (
                    <p className="text-center text-brand-gray-400 text-xs py-4">
                      {isRTL ? 'لا توجد نتائج' : 'No results'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-[35%] hidden md:block relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={isRTL ? 'ابحث عن منتجات...' : 'Search products...'}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 hover:border-brand-gray-500 focus:border-brand-red text-white text-sm ps-9 pe-4 py-2 rounded-sm outline-none transition-colors"
                />
              </div>
            </form>

            {/* Search Suggestions */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 start-0 end-0 bg-brand-gray-800 border border-brand-gray-700 rounded-sm shadow-2xl z-[9999] overflow-hidden">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-brand-gray-700 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="w-8 h-8 object-cover rounded-sm bg-brand-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {isRTL ? product.name_ar : product.name_en}
                      </div>
                      <div className="text-xs text-brand-red">${product.price}</div>
                    </div>
                  </Link>
                ))}
                <button
                  onClick={handleSearchSubmit as never}
                  className="w-full text-center text-xs text-brand-red py-2 hover:bg-brand-gray-700 border-t border-brand-gray-700"
                >
                  {isRTL ? `عرض كل نتائج "${searchQuery}"` : `See all results for "${searchQuery}"`}
                </button>
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 ms-auto">
            {/* Language */}
            <button
              onClick={switchLocale}
              className="hidden sm:flex items-center gap-1 text-xs text-brand-gray-300 hover:text-white border border-brand-gray-700 hover:border-brand-red px-2.5 py-1.5 rounded-sm transition-colors"
            >
              <Globe size={12} />
              {locale === 'ar' ? 'EN' : 'عربية'}
            </button>

            {/* Profile */}
            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 hover:bg-brand-gray-800 px-2 py-1.5 rounded-sm transition-colors"
                >
                  <div className="w-7 h-7 bg-brand-red rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-start">
                    <div className="text-xs text-brand-gray-400 leading-none mb-0.5">
                      {isRTL ? 'مرحباً' : 'Hello'}
                    </div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1">
                      {user.name?.split(' ')[0] || (isRTL ? 'حسابي' : 'Account')}
                      {user.is_vip && <Star size={10} className="text-yellow-400 fill-yellow-400" />}
                      <ChevronDown size={10} className={cn('transition-transform text-brand-gray-400', showProfile && 'rotate-180')} />
                    </div>
                  </div>
                </button>

                {showProfile && (
                  <div className="absolute top-full mt-2 end-0 w-64 bg-brand-gray-800 border border-brand-gray-700 rounded-sm shadow-2xl z-[9999] overflow-hidden">
                    <div className="p-4 border-b border-brand-gray-700 bg-brand-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-sm font-bold text-white">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm truncate flex items-center gap-1">
                            {user.name || (isRTL ? 'مستخدم' : 'User')}
                            {user.is_vip && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Star size={8} className="fill-yellow-400" />VIP
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-brand-gray-400 truncate">{user.email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {[
                        { icon: User, label: isRTL ? 'الملف الشخصي' : 'My Profile', href: '/profile' },
                        { icon: Package, label: isRTL ? 'طلباتي' : 'My Orders', href: '/orders' },
                        { icon: Heart, label: isRTL ? 'المفضلة' : 'Wishlist', href: '/wishlist' },
                      ].map(({ icon: Icon, label, href }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray-200 hover:bg-brand-gray-700 hover:text-white transition-colors"
                        >
                          <Icon size={15} className="text-brand-gray-400" />
                          {label}
                        </Link>
                      ))}

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowProfile(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-red hover:bg-brand-red/10 transition-colors"
                        >
                          <Settings size={15} />
                          {isRTL ? 'لوحة التحكم' : 'Admin Dashboard'}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-brand-gray-700 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut size={15} />
                        {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-brand-red transition-colors"
              >
                <User size={16} />
                <span className="hidden sm:block">{isRTL ? 'تسجيل الدخول' : 'Sign In'}</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 bg-brand-red hover:bg-brand-red-dark text-white px-3 py-2 rounded-sm transition-colors"
            >
              <ShoppingCart size={16} />
              <span className="text-xs font-bold hidden sm:block">{isRTL ? 'السلة' : 'Cart'}</span>
              {mounted && itemCount > 0 && (
              <span className="absolute -top-2 -end-2 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
            </Link>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-brand-gray-300 hover:text-white"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* NAV BAR */}
      <div className="relative border-b border-brand-gray-800 bg-brand-gray-900/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-6 h-10 overflow-x-auto">

          {/* All Categories */}
          <div ref={categoriesRef} className="relative shrink-0">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white hover:text-brand-red transition-colors whitespace-nowrap"
            >
              <Menu size={14} />
              {isRTL ? 'كل الفئات' : 'All Categories'}
              <ChevronDown size={10} className={cn('transition-transform', showCategories && 'rotate-180')} />
            </button>

            {showCategories && (
              <div className="fixed mt-1 w-56 bg-brand-gray-800 border border-brand-gray-700 rounded-sm shadow-2xl z-[9999] py-1 max-h-80 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/category/${cat}`}
                    onClick={() => setShowCategories(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray-200 hover:bg-brand-gray-700 hover:text-white transition-colors"
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {isRTL ? cat : cat.replace(/_/g, ' ')}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          {[
            { href: '/trending', label: isRTL ? '🔥 الأكثر رواجاً' : '🔥 Trending' },
            { href: '/build-your-own', label: isRTL ? '⚙️ ابنِ منتجك' : '⚙️ Build Your Own' },
            { href: '/category/electronics', label: isRTL ? '📱 إلكترونيات' : '📱 Electronics' },
            { href: '/category/clothing', label: isRTL ? '👕 ملابس' : '👕 Clothing' },
            { href: '/category/drones', label: isRTL ? '🚁 طائرات' : '🚁 Drones' },
            { href: '/help', label: isRTL ? '💬 المساعدة' : '💬 Help' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs text-brand-gray-400 hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent hover:border-brand-red"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="md:hidden border-b border-brand-gray-800 px-3 py-2">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={isRTL ? 'ابحث...' : 'Search...'}
              className="w-full bg-brand-gray-800 border border-brand-gray-700 text-white text-sm ps-9 pe-4 py-2 rounded-sm outline-none"
            />
          </div>
        </form>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-gray-900 border-b border-brand-gray-700">
          <div className="px-4 py-3 space-y-1">
            {[
              { href: '/trending', label: isRTL ? '🔥 الأكثر رواجاً' : '🔥 Trending' },
              { href: '/build-your-own', label: isRTL ? '⚙️ ابنِ منتجك' : '⚙️ Build Your Own' },
              { href: '/cart', label: isRTL ? '🛒 السلة' : '🛒 Cart' },
              { href: '/help', label: isRTL ? '💬 المساعدة' : '💬 Help' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm text-brand-gray-200 hover:text-white border-b border-brand-gray-800 last:border-0"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
