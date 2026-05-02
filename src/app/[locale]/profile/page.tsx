'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase';
import { User, Package, Star, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const locale = useLocale() as 'ar' | 'en';
  const router = useRouter();
  const isRTL = locale === 'ar';

  const [profile, setProfile] = useState<{
    id: string; email: string; full_name?: string;
    is_vip: boolean; orders_count: number; role: string; created_at: string;
  } | null>(null);
  const [orders, setOrders] = useState<{ id: string; total: number; status: string; created_at: string }[]>([]);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');

  useEffect(() => {
  (async () => {
    try {
      const supabase = createClient();
      
      // استخدم getSession بدل getUser
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      const user = session.user;

      const { data: prof, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile error:', error.message);
        // حتى لو فيه error نكمل بالبيانات الأساسية
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name,
          is_vip: false,
          orders_count: 0,
          role: 'user',
          created_at: user.created_at,
        });
        setLoading(false);
        return;
      }

      if (prof) {
        setProfile(prof);
        setNewName(prof.full_name || '');
      }

      const { data: ords } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ords || []);
    } catch (err) {
      console.error('Profile page error:', err);
    } finally {
      setLoading(false);
    }
  })();
}, []);

  const handleSaveName = async () => {
    if (!profile || !newName.trim()) return;
    const supabase = createClient();
    await supabase.from('users').update({ full_name: newName }).eq('id', profile.id);
    setProfile({ ...profile, full_name: newName });
    setEditing(false);
    toast.success(isRTL ? 'تم الحفظ!' : 'Saved!');
  };

  const STATUS_COLORS: Record<string, string> = {
    paid: 'text-green-400 bg-green-500/10',
    pending: 'text-yellow-400 bg-yellow-500/10',
    processing: 'text-blue-400 bg-blue-500/10',
    shipped: 'text-purple-400 bg-purple-500/10',
    delivered: 'text-green-400 bg-green-500/20',
    cancelled: 'text-red-400 bg-red-500/10',
  };

  const STATUS_AR: Record<string, string> = {
    paid: 'مدفوع', pending: 'قيد الانتظار', processing: 'جاري التجهيز',
    shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
  };

  if (loading) return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  const vipProgress = Math.min((profile.orders_count / 5) * 100, 100);

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">

        {/* Profile Header */}
        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-brand-red rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {(profile.full_name || profile.email)[0].toUpperCase()}
              </div>
              {profile.is_vip && (
                <div className="absolute -bottom-1 -end-1 bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center">
                  <Star size={12} className="fill-white text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-brand-gray-700 border border-brand-red text-white px-3 py-1 rounded-sm text-sm outline-none"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="text-green-400 hover:text-green-300">
                      <Save size={16} />
                    </button>
                    <button onClick={() => setEditing(false)} className="text-brand-gray-400 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-bold text-white">
                      {profile.full_name || (isRTL ? 'مستخدم' : 'User')}
                    </h1>
                    {profile.is_vip && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Star size={10} className="fill-yellow-400" /> VIP
                      </span>
                    )}
                    <button onClick={() => setEditing(true)} className="text-brand-gray-400 hover:text-white transition-colors">
                      <Edit2 size={14} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-brand-gray-400">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} /> {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={13} />
                  {profile.orders_count} {isRTL ? 'طلب' : 'orders'}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-brand-gray-500">
                  {isRTL ? 'عضو منذ' : 'Member since'} {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* VIP Progress */}
          {!profile.is_vip && (
            <div className="mt-5 p-4 bg-brand-gray-700/50 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Star size={14} className="text-yellow-400" />
                  {isRTL ? 'طريقك للـ VIP' : 'Path to VIP'}
                </span>
                <span className="text-xs text-brand-gray-400">
                  {profile.orders_count}/5 {isRTL ? 'طلبات' : 'orders'}
                </span>
              </div>
              <div className="w-full bg-brand-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${vipProgress}%` }}
                />
              </div>
              <p className="text-xs text-brand-gray-400 mt-2">
                {isRTL
                  ? `${5 - profile.orders_count} طلبات متبقية للحصول على خصم VIP 10%`
                  : `${5 - profile.orders_count} more orders to unlock 10% VIP discount`}
              </p>
            </div>
          )}

          {profile.is_vip && (
            <div className="mt-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-sm flex items-center gap-3">
              <Star size={20} className="text-yellow-400 fill-yellow-400 shrink-0" />
              <div>
                <p className="text-yellow-400 font-bold text-sm">
                  {isRTL ? '🌟 أنت عميل VIP!' : '🌟 You are a VIP Client!'}
                </p>
                <p className="text-xs text-brand-gray-400">
                  {isRTL ? 'تستمتع بخصم 10% على جميع طلباتك' : 'Enjoy 10% discount on all your orders'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: isRTL ? 'إجمالي الطلبات' : 'Total Orders',
              value: profile.orders_count,
              icon: Package,
              color: 'text-brand-red',
            },
            {
              label: isRTL ? 'إجمالي الإنفاق' : 'Total Spent',
              value: formatCurrency(orders.reduce((s, o) => s + o.total, 0), locale),
              icon: Mail,
              color: 'text-green-400',
            },
            {
              label: isRTL ? 'حالة العضوية' : 'Membership',
              value: profile.is_vip ? 'VIP ⭐' : (isRTL ? 'عادي' : 'Standard'),
              icon: Star,
              color: profile.is_vip ? 'text-yellow-400' : 'text-brand-gray-400',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-4 text-center">
              <Icon size={18} className={cn(color, 'mx-auto mb-2')} />
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-brand-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm">
          <div className="p-4 border-b border-brand-gray-700">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Package size={16} className="text-brand-red" />
              {isRTL ? 'طلباتي' : 'My Orders'} ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={40} className="text-brand-gray-600 mx-auto mb-3" />
              <p className="text-brand-gray-400 text-sm">
                {isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-brand-gray-700">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-brand-gray-700/30 transition-colors">
                  <div>
                    <div className="text-sm font-mono text-brand-gray-300 mb-1">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className="text-xs text-brand-gray-400">
                      {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-bold text-white mb-1">
                      {formatCurrency(order.total, locale)}
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[order.status] || 'text-white bg-gray-500/10')}>
                      {isRTL ? STATUS_AR[order.status] : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
