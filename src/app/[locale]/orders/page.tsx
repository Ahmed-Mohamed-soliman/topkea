'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase';
import { Package } from 'lucide-react';

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
};

const COLORS: Record<string, string> = {
  paid: 'text-green-400 bg-green-500/10',
  pending: 'text-yellow-400 bg-yellow-500/10',
  processing: 'text-blue-400 bg-blue-500/10',
  shipped: 'text-purple-400 bg-purple-500/10',
  delivered: 'text-green-400 bg-green-500/20',
  cancelled: 'text-red-400 bg-red-500/10',
};

const AR_STATUS: Record<string, string> = {
  paid: 'مدفوع',
  pending: 'قيد الانتظار',
  processing: 'جاري التجهيز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

export default function OrdersPage() {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const run = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = '/' + locale + '/auth/login'; return; }

    const [{ data: orders }, { data: customOrders }] = await Promise.all([
      supabase.from('orders').select('id,total,status,created_at').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('custom_orders').select('id,category,quantity,status,created_at').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    ]);

    const allOrders = [
      ...(orders || []).map(o => ({ ...o, type: 'order', total: o.total })),
      ...(customOrders || []).map(o => ({ ...o, type: 'custom', total: 0, id: o.id })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setOrders(allOrders as Order[]);
    setLoading(false);
  };
  run();
}, [locale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-20 pt-36">

        <div className="flex items-center gap-4 mb-8">
          <div className="w-1 h-8 bg-brand-red" />
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package size={20} className="text-brand-red" />
            {isRTL ? 'طلباتي' : 'My Orders'}
          </h1>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20 bg-brand-gray-800 border border-brand-gray-700 rounded-sm">
            <Package size={48} className="text-brand-gray-600 mx-auto mb-4" />
            <p className="text-brand-gray-400 mb-4">
              {isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}
            </p>
            <button
              onClick={() => { window.location.href = '/' + locale; }}
              className="inline-block bg-brand-red text-white text-sm px-6 py-2.5 rounded-sm"
            >
              {isRTL ? 'ابدأ التسوق' : 'Start Shopping'}
            </button>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-4 bg-brand-gray-800 border border-brand-gray-700 rounded-sm hover:border-brand-red/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-mono text-white font-semibold">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </div>
                    {o.type === 'custom' && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                        {isRTL ? 'مخصص' : 'Custom'}
                      </span>
                    )}
                  </div>
                  {o.type === 'custom' && o.category && (
                    <div className="text-xs text-brand-gray-400 mb-1">
                      {o.category} × {o.quantity?.toLocaleString()} units
                    </div>
                  )}
                  <div className="text-xs text-brand-gray-400">
                    {new Date(o.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}
                  </div>
                </div>
                <div className="text-end">
                  {o.total > 0 && (
                    <div className="font-bold text-white mb-1">${o.total.toFixed(2)}</div>
                  )}
                  <span className={'text-xs px-2 py-1 rounded-full ' + (COLORS[o.status] || 'text-white bg-gray-500/10')}>
                    {isRTL ? (AR_STATUS[o.status] || o.status) : o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
} 
