'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

type CustomOrder = {
  id: string;
  user_id: string | null;
  category: string;
  color: string;
  size: string;
  features: string[];
  quantity: number;
  notes: string;
  status: string;
  created_at: string;
};

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  type?: string;
  category?: string;
  quantity?: number;
};

const STATUS_OPTIONS = ['pending', 'reviewing', 'quoted', 'confirmed', 'cancelled'];

export default function AdminCustomOrders() {
  const [orders, setOrders] = useState<CustomOrder[]>([]);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('custom_orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    })();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('custom_orders').update({ status }).eq('id', id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-500/10',
    reviewing: 'text-blue-400 bg-blue-500/10',
    quoted: 'text-purple-400 bg-purple-500/10',
    confirmed: 'text-green-400 bg-green-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">
        Custom Orders ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-brand-gray-400">
          No custom orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-5 hover:border-brand-red/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-gray-400">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'text-white bg-gray-500/10'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-white font-semibold">
                      📦 {order.category}
                    </span>
                    {order.color && (
                      <span className="text-brand-gray-400">
                        🎨 {order.color}
                      </span>
                    )}
                    {order.size && (
                      <span className="text-brand-gray-400">
                        📐 {order.size}
                      </span>
                    )}
                    <span className="text-brand-red font-bold">
                      × {order.quantity.toLocaleString()} units
                    </span>
                  </div>
                  {order.features?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {order.features.map((f) => (
                        <span key={f} className="text-xs bg-brand-gray-700 text-brand-gray-300 px-2 py-0.5 rounded-sm">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {order.notes && (
                    <p className="text-xs text-brand-gray-400 mt-1 italic">
                      "{order.notes}"
                    </p>
                  )}
                  <p className="text-xs text-brand-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="bg-brand-gray-700 border border-brand-gray-600 text-white text-xs px-3 py-2 rounded-sm focus:outline-none focus:border-brand-red"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
