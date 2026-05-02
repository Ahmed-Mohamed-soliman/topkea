'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_id?: string;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  paid: 'text-green-400 bg-green-500/10',
  pending: 'text-yellow-400 bg-yellow-500/10',
  processing: 'text-blue-400 bg-blue-500/10',
  shipped: 'text-purple-400 bg-purple-500/10',
  delivered: 'text-green-400 bg-green-500/20',
  cancelled: 'text-red-400 bg-red-500/10',
};

const STATUS_OPTIONS = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Load error:', error.message);
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error('Update error:', error.message);
      alert('Error: ' + error.message);
      return;
    }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  };

  const exportCSV = () => {
    const csv = Papa.unparse(orders.map((o) => ({
      'Order ID': o.id,
      'User': o.user_id,
      'Total': `$${o.total?.toFixed(2)}`,
      'Status': o.status,
      'Date': new Date(o.created_at).toLocaleDateString(),
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orders.csv';
    a.click();
  };

  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Orders ({orders.length})</h2>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-brand-gray-600 hover:border-brand-red text-white text-sm px-4 py-2 rounded-sm transition-colors"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-4 text-center">
          <div className="text-2xl font-bold text-brand-red">{orders.length}</div>
          <div className="text-xs text-brand-gray-400 mt-1">Total Orders</div>
        </div>
        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue, 'en')}</div>
          <div className="text-xs text-brand-gray-400 mt-1">Total Revenue (paid)</div>
        </div>
        <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-xs text-brand-gray-400 mt-1">Pending Orders</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-700">
              {['Order ID', 'Total', 'Status', 'Date', 'Update Status'].map((h) => (
                <th key={h} className="text-start py-3 px-3 text-brand-gray-400 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-brand-gray-800 hover:bg-brand-gray-800/30">
                <td className="py-3 px-3 font-mono text-xs text-brand-gray-200">
                  {order.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="py-3 px-3 text-brand-red font-bold">
                  {order.total ? formatCurrency(order.total, 'en') : '—'}
                </td>
                <td className="py-3 px-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'text-white bg-gray-500/10'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-brand-gray-400 text-xs">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="bg-brand-gray-700 border border-brand-gray-600 text-white text-xs px-2 py-1.5 rounded-sm focus:outline-none focus:border-brand-red"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
