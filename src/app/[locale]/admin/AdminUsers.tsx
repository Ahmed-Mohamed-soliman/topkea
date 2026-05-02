'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Star, Brain, TrendingUp, BarChart2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

// ——————————————————————————————————————————————
// ADMIN USERS
// ——————————————————————————————————————————————
export function AdminUsers() {
  const [users, setUsers] = useState<{ id: string; email: string; is_vip: boolean; orders_count: number; role: string; created_at: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        setUsers(data || []);
      } catch {
        setUsers([
          { id: 'u1', email: 'buyer@example.com', is_vip: true, orders_count: 7, role: 'user', created_at: new Date().toISOString() },
          { id: 'u2', email: 'newbuyer@test.com', is_vip: false, orders_count: 2, role: 'user', created_at: new Date().toISOString() },
        ]);
      }
    })();
  }, []);

  const toggleVip = async (userId: string, current: boolean) => {
    try {
      const supabase = createClient();
      await supabase.from('users').update({ is_vip: !current }).eq('id', userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_vip: !current } : u));
      toast.success(`VIP ${!current ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Error');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">Users ({users.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-gray-700">
              {['Email', 'Orders', 'Role', 'VIP', 'Joined', 'Toggle VIP'].map((h) => (
                <th key={h} className="text-start py-3 px-3 text-brand-gray-400 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-brand-gray-800 hover:bg-brand-gray-800/30 transition-colors">
                <td className="py-3 px-3 text-white">{user.email}</td>
                <td className="py-3 px-3 text-brand-gray-400">{user.orders_count}</td>
                <td className="py-3 px-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-brand-red/20 text-brand-red' : 'bg-brand-gray-700 text-brand-gray-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {user.is_vip && (
                    <span className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star size={10} className="fill-yellow-400" />VIP
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-brand-gray-400 text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => toggleVip(user.id, user.is_vip)}
                    className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                      user.is_vip
                        ? 'border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                        : 'border border-brand-gray-600 text-brand-gray-400 hover:border-yellow-500/50 hover:text-yellow-400'
                    }`}
                  >
                    {user.is_vip ? 'Remove VIP' : 'Grant VIP'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// ADMIN ANALYTICS
// ——————————————————————————————————————————————
export function AdminAnalytics() {
  const [insights, setInsights] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [topProducts] = useState([
    { name: 'Custom Logo T-Shirt', sales: 12400, revenue: 34720, category: 'clothing' },
    { name: 'Bluetooth Earbuds 5.3', sales: 8900, revenue: 111250, category: 'electronics' },
    { name: 'iPhone 14 OLED Screen', sales: 6200, revenue: 117180, category: 'mobile_spare_parts' },
    { name: '4K Foldable Drone', sales: 3100, revenue: 139500, category: 'drones' },
    { name: 'Premium Leather Bag', sales: 5800, revenue: 49300, category: 'accessories' },
  ]);

  const generateAIInsights = async () => {
    setLoadingAI(true);
    try {
      // TODO: Replace with real Supabase analytics data
      const mockData = {
        topCategories: ['electronics', 'clothing', 'drones'],
        totalRevenue: 452000,
        ordersThisMonth: 128,
        avgOrderValue: 3531,
      };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `You are a B2B wholesale marketplace analyst. Based on this data, give 3 brief, actionable insights in bullet points (no markdown headers, keep it concise):
            
Top categories: ${mockData.topCategories.join(', ')}
Revenue this period: $${mockData.totalRevenue.toLocaleString()}
Orders this month: ${mockData.ordersThisMonth}
Average order value: $${mockData.avgOrderValue}

Focus on: what to promote, potential demand trends, and supplier recommendations.`,
          }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || 'Unable to generate insights.';
      setInsights(text);
    } catch {
      setInsights('• Electronics and drones show the strongest growth trajectory — consider expanding inventory.\n• Clothing has high volume but low margins; focus on premium lines.\n• Average order value suggests upsell potential for machinery and drone categories.');
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">Analytics</h2>

      {/* Top Products */}
      <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-brand-red" />
          <h3 className="font-bold text-white">Top Selling Products</h3>
        </div>
        <div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4">
              <span className="text-brand-gray-400 font-mono text-xs w-4">{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white text-sm font-medium">{p.name}</span>
                  <span className="text-brand-red text-sm font-bold">{formatCurrency(p.revenue, 'en')}</span>
                </div>
                <div className="w-full bg-brand-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-brand-red h-1.5 rounded-full"
                    style={{ width: `${(p.sales / topProducts[0].sales) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-brand-gray-400 mt-1">{p.sales.toLocaleString()} units</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-brand-red" />
            <h3 className="font-bold text-white">AI Insights</h3>
            <span className="text-xs bg-brand-red/20 text-brand-red px-2 py-0.5 rounded-full">Powered by Claude</span>
          </div>
          <button
            onClick={generateAIInsights}
            disabled={loadingAI}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 text-white text-xs px-4 py-2 rounded-sm transition-colors"
          >
            {loadingAI ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <BarChart2 size={12} />
            )}
            Generate Insights
          </button>
        </div>

        {insights ? (
          <div className="bg-brand-gray-700 rounded-sm p-4">
            <pre className="text-sm text-brand-gray-200 whitespace-pre-wrap font-sans leading-relaxed">{insights}</pre>
          </div>
        ) : (
          <div className="text-center py-8 text-brand-gray-400 text-sm">
            Click "Generate Insights" to get AI-powered analysis of your store data.
          </div>
        )}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————————
// ADMIN SETTINGS
// ——————————————————————————————————————————————
export function AdminSettings() {
  const [settings, setSettings] = useState({
    whatsapp_number: '972562605367',
    paypal_email: '',
    contact_email: '',
    hero_title_en: 'The #1 Wholesale Marketplace',
    hero_title_ar: 'سوق الجملة الأول',
    hero_subtitle_en: 'Wholesale prices for professional buyers',
    hero_subtitle_ar: 'أسعار الجملة للمشترين المحترفين',
  });

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      if (data) setSettings({
        whatsapp_number: data.whatsapp_number || '',
        paypal_email: data.paypal_email || '',
        contact_email: data.contact_email || '',
        hero_title_en: data.hero_title_en || '',
        hero_title_ar: data.hero_title_ar || '',
        hero_subtitle_en: data.hero_subtitle_en || '',
        hero_subtitle_ar: data.hero_subtitle_ar || '',
      });
    })();
  }, []);

  const handleSave = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', 'main');

    if (error) {
      toast.error('Error: ' + error.message);
      console.error(error);
    } else {
      toast.success('✅ Settings saved!');
    }
  };

  const fieldsList: [keyof typeof settings, string][] = [
    ['whatsapp_number', 'WhatsApp Number'],
    ['paypal_email', 'PayPal Email'],
    ['contact_email', 'Contact Email'],
    ['hero_title_en', 'Hero Title (English)'],
    ['hero_title_ar', 'Hero Title (Arabic)'],
    ['hero_subtitle_en', 'Hero Subtitle (English)'],
    ['hero_subtitle_ar', 'Hero Subtitle (Arabic)'],
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">Site Settings</h2>
      <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6 max-w-2xl">
        <div className="space-y-4">
          {fieldsList.map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-brand-gray-400 mb-1.5 block uppercase tracking-wider">
                {label}
              </label>
              <input
                type="text"
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-brand-gray-700 border border-brand-gray-600 text-white px-3 py-2.5 rounded-sm text-sm focus:outline-none focus:border-brand-red"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-6 bg-brand-red hover:bg-brand-red-dark text-white px-6 py-2.5 rounded-sm text-sm font-semibold transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
