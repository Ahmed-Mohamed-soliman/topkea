'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart2,
  Calculator, Settings, Plus, Upload, Download, Star, TrendingUp,
  DollarSign, Activity, AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import { AdminUsers } from './AdminUsers';
import AdminAnalytics from './AdminAnalytics';
import AdminSettings from './AdminSettings';
import AdminCustomOrders from './AdminCustomOrders';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'custom_orders' | 'users' | 'analytics' | 'accounting' | 'settings';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const locale = useLocale() as 'ar' | 'en';
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  (async () => {
    try {
      const supabase = createClient();
      const [
        { data: orders },
        { count: userCount },
        { count: productCount },
      ] = await Promise.all([
        supabase.from('orders').select('total, status'),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ]);

      const revenue = (orders || [])
        .filter(o => o.status === 'paid' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        revenue,
        orders: orders?.length || 0,
        users: userCount || 0,
        products: productCount || 0,
      });
    } catch {
      setStats({ revenue: 0, orders: 0, users: 0, products: 0 });
    } finally {
      setLoading(false);
    }
  })();
}, []);

  const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'products', label: t('products'), icon: Package },
    { id: 'orders', label: t('orders'), icon: ShoppingBag },
    { id: 'custom_orders', label: 'Custom Orders', icon: Package },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'analytics', label: t('analytics'), icon: BarChart2 },
    { id: 'accounting', label: t('accounting'), icon: Calculator },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-gray-900 border-e border-brand-gray-700 flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-brand-gray-700">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.jpeg"
              alt="Topkea"
              className="h-10 w-auto"
            />
            <span className="text-white font-display text-lg tracking-widest">
              ADMIN
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all',
                tab === id
                  ? 'bg-brand-red/10 border-e-2 border-brand-red text-white'
                  : 'text-brand-gray-400 hover:text-white hover:bg-brand-gray-800'
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-brand-gray-400 hover:text-brand-red transition-colors"
          >
            ← {locale === 'ar' ? 'العودة للمتجر' : 'Back to Store'}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ms-64 p-8">
        {tab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-white font-display tracking-wider mb-8">
              {t('dashboard')}
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: t('total_revenue'), value: formatCurrency(stats.revenue, locale), icon: DollarSign, color: 'text-green-400' },
                { label: t('total_orders'), value: stats.orders.toString(), icon: ShoppingBag, color: 'text-brand-red' },
                { label: t('total_users'), value: stats.users.toString(), icon: Users, color: 'text-blue-400' },
                { label: locale === 'ar' ? 'المنتجات' : 'Products', value: stats.products.toString(), icon: Package, color: 'text-yellow-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-brand-gray-400">{label}</span>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setTab('products')}
                className="flex items-center gap-3 p-4 bg-brand-red/10 border border-brand-red/30 rounded-sm hover:bg-brand-red/20 transition-colors text-start"
              >
                <Plus size={20} className="text-brand-red" />
                <div>
                  <div className="font-semibold text-white text-sm">{t('add_product')}</div>
                  <div className="text-xs text-brand-gray-400">{locale === 'ar' ? 'أضف منتجاً جديداً' : 'Add a new product'}</div>
                </div>
              </button>
              <button
                onClick={() => setTab('orders')}
                className="flex items-center gap-3 p-4 bg-brand-gray-800 border border-brand-gray-700 rounded-sm hover:border-brand-red/40 transition-colors text-start"
              >
                <Activity size={20} className="text-brand-gray-400" />
                <div>
                  <div className="font-semibold text-white text-sm">{locale === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}</div>
                  <div className="text-xs text-brand-gray-400">{locale === 'ar' ? 'عرض وتحديث الطلبات' : 'View and update orders'}</div>
                </div>
              </button>
              <button
                onClick={() => setTab('analytics')}
                className="flex items-center gap-3 p-4 bg-brand-gray-800 border border-brand-gray-700 rounded-sm hover:border-brand-red/40 transition-colors text-start"
              >
                <TrendingUp size={20} className="text-brand-gray-400" />
                <div>
                  <div className="font-semibold text-white text-sm">{t('analytics')}</div>
                  <div className="text-xs text-brand-gray-400">{locale === 'ar' ? 'رؤى وتحليلات' : 'Insights & analytics'}</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {tab === 'products' && <AdminProducts />}
        {tab === 'orders' && <AdminOrders />}
        {tab === 'custom_orders' && <AdminCustomOrders />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'analytics' && <AdminAnalytics />}
        {tab === 'accounting' && <AdminAccounting stats={stats} />}
        {tab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}

function AdminAccounting({ stats }: { stats: { revenue: number; orders: number } }) {
  const locale = 'en';

  const handleExport = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total Revenue', `$${stats.revenue.toFixed(2)}`],
      ['Total Orders', stats.orders],
      ['Average Order Value', `$${(stats.revenue / (stats.orders || 1)).toFixed(2)}`],
    ].map((r) => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accounting-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white">Accounting</h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white text-sm px-4 py-2 rounded-sm transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats.revenue, locale as 'en') },
          { label: 'Total Orders', value: stats.orders },
          { label: 'Avg Order Value', value: formatCurrency(stats.revenue / (stats.orders || 1), locale as 'en') },
        ].map(({ label, value }) => (
          <div key={label} className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6 text-center">
            <div className="text-brand-gray-400 text-sm mb-2">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-brand-gray-800 border border-yellow-500/30 rounded-sm p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-xs text-brand-gray-400">
          TODO: Connect to a full accounting system (e.g., QuickBooks API) for production.
          Current data is from Supabase orders table.
        </p>
      </div>
    </div>
  );
}
