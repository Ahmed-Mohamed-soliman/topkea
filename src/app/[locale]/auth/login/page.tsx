'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase';
import { Mail, Lock, Eye, EyeOff, User, Phone, Chrome, ShieldCheck, Truck, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'landing' | 'login' | 'register';

export default function AuthPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';
  const [step, setStep] = useState<Step>('landing');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regAgree, setRegAgree] = useState(false);

  const handleGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/${locale}` },
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error(isRTL ? 'ادخل الإيميل وكلمة المرور' : 'Enter email and password');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast.success(isRTL ? '👋 مرحباً بك!' : '👋 Welcome back!');
      router.push('/');
    } catch {
      toast.error(isRTL ? '❌ الإيميل أو كلمة المرور غلط' : '❌ Wrong email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      toast.error(isRTL ? 'من فضلك اكمل كل البيانات' : 'Please fill all fields');
      return;
    }
    if (regPassword.length < 6) {
      toast.error(isRTL ? 'كلمة المرور لازم 6 حروف على الأقل' : 'Password needs 6+ characters');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error(isRTL ? 'كلمة المرور مش متطابقة' : 'Passwords do not match');
      return;
    }
    if (!regAgree) {
      toast.error(isRTL ? 'لازم توافق على الشروط والأحكام' : 'You must agree to the terms');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: { data: { full_name: regName, phone: regPhone } },
      });
      if (error) throw error;
      toast.success(isRTL ? '✅ تم إنشاء الحساب! سجل دخولك' : '✅ Account created! Please login');
      setStep('login');
      setLoginEmail(regEmail);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('already registered')) {
        toast.error(isRTL ? 'الإيميل ده مسجل بالفعل' : 'Email already registered');
      } else {
        toast.error(isRTL ? 'حصل خطأ، حاول تاني' : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── LANDING STEP ───────────────────────────────────────
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(229,9,20,0.08),transparent)]" />

        {/* Header */}
        <div className="relative border-b border-brand-gray-700 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.jpeg"
              alt="Topkea"
              className="h-10 w-auto"
            />
          </Link>
          <Link href="/" className="text-xs text-brand-gray-400 hover:text-white transition-colors">
            {isRTL ? '← العودة للمتجر' : '← Back to Store'}
          </Link>
        </div>

        <div className="relative flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">

            {/* Welcome */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isRTL ? 'أهلاً بك في Topkea' : 'Welcome to Topkea'}
              </h1>
              <p className="text-brand-gray-400 text-sm">
                {isRTL
                  ? 'سجل دخولك أو أنشئ حساباً للوصول لأسعار الجملة الحصرية'
                  : 'Sign in or create an account to access exclusive wholesale prices'}
              </p>
            </div>

            {/* Main Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setStep('login')}
                className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 rounded-sm transition-all duration-200 text-base hover:shadow-lg hover:shadow-brand-red/20"
              >
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                onClick={() => setStep('register')}
                className="w-full border-2 border-brand-gray-600 hover:border-brand-red text-white font-bold py-4 rounded-sm transition-all duration-200 text-base hover:bg-brand-red/5"
              >
                {isRTL ? 'إنشاء حساب جديد' : 'Create New Account'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-gray-700" />
              </div>
              <div className="relative text-center">
                <span className="bg-brand-black px-3 text-xs text-brand-gray-400">
                  {isRTL ? 'أو تابع مع' : 'or continue with'}
                </span>
              </div>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border border-brand-gray-600 hover:border-brand-gray-400 text-white py-3 rounded-sm transition-colors text-sm font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            {/* Trust badges */}
            <div className="mt-10 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: ShieldCheck, text: isRTL ? 'دفع آمن 100%' : '100% Secure' },
                { icon: Truck, text: isRTL ? 'شحن سريع' : 'Fast Shipping' },
                { icon: Tag, text: isRTL ? 'أسعار جملة' : 'Wholesale Prices' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1.5 p-3 border border-brand-gray-700 rounded-sm">
                  <Icon size={16} className="text-brand-red" />
                  <span className="text-xs text-brand-gray-400">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── LOGIN STEP ─────────────────────────────────────────
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(229,9,20,0.08),transparent)]" />

        {/* Header */}
        <div className="relative border-b border-brand-gray-700 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.jpeg"
              alt="Topkea"
              className="h-10 w-auto"
            />
          </Link>
          <button
            onClick={() => setStep('landing')}
            className="text-xs text-brand-gray-400 hover:text-white transition-colors"
          >
            {isRTL ? '← رجوع' : '← Back'}
          </button>
        </div>

        <div className="relative flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </h2>
              <p className="text-brand-gray-400 text-sm">
                {isRTL ? 'ادخل بياناتك للوصول لحسابك' : 'Enter your details to access your account'}
              </p>
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border border-brand-gray-600 hover:border-brand-gray-400 text-white py-3 rounded-sm transition-colors text-sm font-medium mb-6"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isRTL ? 'المتابعة مع Google' : 'Continue with Google'}
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-gray-700" />
              </div>
              <div className="relative text-center">
                <span className="bg-brand-black px-3 text-xs text-brand-gray-400">
                  {isRTL ? 'أو بالإيميل' : 'or with email'}
                </span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-brand-gray-400 mb-1.5 block">
                  {isRTL ? 'الإيميل' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="example@email.com"
                    className="w-full bg-brand-gray-800 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-4 py-3 rounded-sm text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-brand-gray-400">
                    {isRTL ? 'كلمة المرور' : 'Password'}
                  </label>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-brand-gray-800 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-10 py-3 rounded-sm text-sm outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-white">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-sm transition-colors text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isRTL ? 'جاري الدخول...' : 'Signing in...'}
                  </span>
                ) : isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-brand-gray-400 mt-6">
              {isRTL ? 'مش عندك حساب؟' : "Don't have an account?"}
              {' '}
              <button
                onClick={() => setStep('register')}
                className="text-brand-red hover:underline font-semibold"
              >
                {isRTL ? 'إنشاء حساب' : 'Create one'}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── REGISTER STEP ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(229,9,20,0.08),transparent)]" />

      {/* Header */}
      <div className="relative border-b border-brand-gray-700 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.jpeg"
              alt="Topkea"
              className="h-10 w-auto"
            />
          </Link>
        <button
          onClick={() => setStep('landing')}
          className="text-xs text-brand-gray-400 hover:text-white transition-colors"
        >
          {isRTL ? '← رجوع' : '← Back'}
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">
              {isRTL ? 'إنشاء حساب جديد' : 'Create Your Account'}
            </h2>
            <p className="text-brand-gray-400 text-sm">
              {isRTL ? 'انضم لآلاف المشترين الاحترافيين' : 'Join thousands of professional buyers'}
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-brand-gray-600 hover:border-brand-gray-400 text-white py-3 rounded-sm transition-colors text-sm font-medium mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isRTL ? 'التسجيل مع Google' : 'Sign up with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-gray-700" />
            </div>
            <div className="relative text-center">
              <span className="bg-brand-black px-3 text-xs text-brand-gray-400">
                {isRTL ? 'أو بالإيميل' : 'or with email'}
              </span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs text-brand-gray-400 mb-1.5 block">
                {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  autoFocus
                  placeholder={isRTL ? 'محمد أحمد' : 'John Doe'}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-4 py-3 rounded-sm text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-brand-gray-400 mb-1.5 block">
                {isRTL ? 'الإيميل' : 'Email Address'} <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Mail size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-4 py-3 rounded-sm text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-brand-gray-400 mb-1.5 block">
                {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                <span className="text-brand-gray-600 ms-1 text-xs">
                  ({isRTL ? 'اختياري' : 'optional'})
                </span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder={isRTL ? '+20 1XX XXX XXXX' : '+1 234 567 8900'}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-4 py-3 rounded-sm text-sm outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-brand-gray-400 mb-1.5 block">
                {isRTL ? 'كلمة المرور' : 'Password'} <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder={isRTL ? 'على الأقل 6 حروف' : 'At least 6 characters'}
                  className="w-full bg-brand-gray-800 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-10 py-3 rounded-sm text-sm outline-none transition-colors"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-white">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {/* Password strength */}
              {regPassword && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      regPassword.length >= i * 3
                        ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-yellow-500' : i <= 3 ? 'bg-blue-500' : 'bg-green-500'
                        : 'bg-brand-gray-700'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-brand-gray-400 mb-1.5 block">
                {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-brand-red">*</span>
              </label>
              <div className="relative">
                <Lock size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  required
                  placeholder={isRTL ? 'اعد كتابة كلمة المرور' : 'Repeat your password'}
                  className={`w-full bg-brand-gray-800 border text-white ps-9 pe-10 py-3 rounded-sm text-sm outline-none transition-colors ${
                    regConfirm && regConfirm !== regPassword
                      ? 'border-red-500'
                      : regConfirm && regConfirm === regPassword
                      ? 'border-green-500'
                      : 'border-brand-gray-600 focus:border-brand-red'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-white">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {regConfirm && regConfirm !== regPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {isRTL ? '❌ كلمة المرور مش متطابقة' : '❌ Passwords do not match'}
                </p>
              )}
              {regConfirm && regConfirm === regPassword && (
                <p className="text-green-400 text-xs mt-1">
                  {isRTL ? '✅ كلمة المرور متطابقة' : '✅ Passwords match'}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setRegAgree(!regAgree)}
                className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  regAgree ? 'bg-brand-red border-brand-red' : 'border-brand-gray-600 group-hover:border-brand-red'
                }`}
              >
                {regAgree && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-xs text-brand-gray-400 leading-relaxed">
                {isRTL
                  ? 'أوافق على الشروط والأحكام وسياسة الخصوصية الخاصة بـ Topkea'
                  : 'I agree to the Terms & Conditions and Privacy Policy of Topkea'}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !regAgree}
              className="w-full bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-sm transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRTL ? 'جاري الإنشاء...' : 'Creating account...'}
                </span>
              ) : isRTL ? 'إنشاء الحساب' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-brand-gray-400 mt-6">
            {isRTL ? 'عندك حساب بالفعل؟' : 'Already have an account?'}
            {' '}
            <button
              onClick={() => setStep('login')}
              className="text-brand-red hover:underline font-semibold"
            >
              {isRTL ? 'سجل دخولك' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
