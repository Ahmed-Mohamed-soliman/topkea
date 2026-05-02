'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/lib/cart-store';
import { createClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Shield, CheckCircle, MessageCircle, User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

export default function CheckoutPage() {
  const locale = useLocale() as 'ar' | 'en';
  const router = useRouter();
  const isRTL = locale === 'ar';
  const { items, getTotal, getDiscount, isVip, clearCart } = useCartStore();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '', email: '', phone: '', address: '', city: '', country: '',
  });
  const total = getTotal();

  const handleSubmit = async () => {
    const { name, email, phone, address, city, country } = customerInfo;
    if (!name || !email || !phone || !address || !city || !country) {
      toast.error(isRTL ? 'من فضلك اكمل كل البيانات' : 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const orderRef = `ORD-${Date.now()}`;

      const { data: order } = await supabase
        .from('orders')
        .insert({
          user_id: session?.user?.id || null,
          items,
          total,
          status: 'pending',
          payment_id: orderRef,
          shipping_info: customerInfo,
        })
        .select()
        .single();

      if (order?.id) {
        if (session?.user) {
          await supabase.rpc('increment_orders_count', { uid: session.user.id });
        }
        setOrderId(order.id);
      } else {
        setOrderId(orderRef);
      }

      clearCart();
      setOrderComplete(true);
    <a 
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={async () => {
        if (orderId && orderId.length > 10) {
          const supabase = createClient();
          await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', orderId);
        }
      }}
      className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-sm transition-colors text-lg"
    >
      <MessageCircle size={24} />
      {isRTL ? 'أكمل الطلب على واتساب' : 'Complete Order on WhatsApp'}
    </a>
    } catch (err) {
      console.error(err);
      setOrderId(`ORD-${Date.now()}`);
      clearCart();
      setOrderComplete(true);
    } finally {
      setLoading(false);
    }
  };

  const buildWhatsAppMessage = (id: string) => {
    const itemsList = items
      .map(({ product, quantity }) =>
        `• ${locale === 'ar' ? product.name_ar : product.name_en} × ${quantity}`
      )
      .join('\n');

    const message = isRTL
      ? `🛒 *طلب جديد من WholesalePro*\n\n` +
        `📋 *رقم الطلب:* ${id.slice(0, 8).toUpperCase()}\n\n` +
        `👤 *بيانات العميل:*\n` +
        `الاسم: ${customerInfo.name}\n` +
        `الإيميل: ${customerInfo.email}\n` +
        `الهاتف: ${customerInfo.phone}\n\n` +
        `📦 *المنتجات:*\n${itemsList}\n\n` +
        `📍 *عنوان الشحن:*\n${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}\n\n` +
        `💰 *الإجمالي: $${total.toFixed(2)}*\n\n` +
        `أرجو تأكيد الطلب وإرسال تفاصيل الدفع 🙏`
      : `🛒 *New Order from WholesalePro*\n\n` +
        `📋 *Order ID:* ${id.slice(0, 8).toUpperCase()}\n\n` +
        `👤 *Customer Info:*\n` +
        `Name: ${customerInfo.name}\n` +
        `Email: ${customerInfo.email}\n` +
        `Phone: ${customerInfo.phone}\n\n` +
        `📦 *Products:*\n${itemsList}\n\n` +
        `📍 *Shipping Address:*\n${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}\n\n` +
        `💰 *Total: $${total.toFixed(2)}*\n\n` +
        `Please confirm the order and send payment details 🙏`;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972592701146';
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  if (items.length === 0 && !orderComplete) {
    router.push('/cart');
    return null;
  }

  if (orderComplete) {
    const waLink = buildWhatsAppMessage(orderId);
    return (
      <div className="min-h-screen bg-brand-black">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-20 pt-32 text-center">
          <div className="bg-brand-gray-800 border border-green-500/30 rounded-sm p-12">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-3">
              {isRTL ? '✅ تم استلام طلبك!' : '✅ Order Received!'}
            </h1>
            <p className="text-brand-gray-400 mb-2">
              {isRTL
                ? 'دوس على الزرار عشان تتواصل معنا على واتساب وتكمل عملية الدفع'
                : 'Click the button to contact us on WhatsApp and complete payment'}
            </p>
            <p className="text-xs text-brand-gray-400 font-mono mb-8">
              #{orderId.slice(0, 8).toUpperCase()}
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-sm transition-colors text-lg"
            >
              <MessageCircle size={24} />
              {isRTL ? 'أكمل الطلب على واتساب' : 'Complete Order on WhatsApp'}
            </a>
            <p className="text-xs text-brand-gray-500 mt-4">
              {isRTL
                ? 'سيتم إرسال تفاصيل طلبك كاملة على واتساب'
                : 'Your complete order details will be sent to WhatsApp'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">

        <div className="flex items-center gap-4 mb-10">
          <div className="w-1 h-8 bg-brand-red" />
          <h1 className="text-3xl font-bold text-white font-display tracking-wider uppercase">
            {isRTL ? 'إتمام الطلب' : 'Complete Your Order'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Shipping Form */}
          <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <MapPin size={16} className="text-brand-red" />
              {isRTL ? 'بيانات الشحن والتواصل' : 'Shipping & Contact Info'}
            </h3>

            <div className="space-y-4">
              {[
                { key: 'name', label: isRTL ? 'الاسم الكامل' : 'Full Name', type: 'text', icon: User },
                { key: 'email', label: isRTL ? 'البريد الإلكتروني' : 'Email', type: 'email', icon: Mail },
                { key: 'phone', label: isRTL ? 'رقم الهاتف' : 'Phone Number', type: 'tel', icon: Phone },
                { key: 'country', label: isRTL ? 'الدولة' : 'Country', type: 'text', icon: MapPin },
                { key: 'city', label: isRTL ? 'المدينة' : 'City', type: 'text', icon: MapPin },
              ].map(({ key, label, type, icon: Icon }) => (
                <div key={key}>
                  <label className="text-xs text-brand-gray-400 mb-1.5 block">
                    {label} <span className="text-brand-red">*</span>
                  </label>
                  <div className="relative">
                    <Icon size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-brand-gray-400" />
                    <input
                      type={type}
                      value={customerInfo[key as keyof CustomerInfo]}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, [key]: e.target.value })}
                      className="w-full bg-brand-gray-700 border border-brand-gray-600 focus:border-brand-red text-white ps-9 pe-4 py-2.5 rounded-sm text-sm outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs text-brand-gray-400 mb-1.5 block">
                  {isRTL ? 'عنوان الشحن التفصيلي' : 'Detailed Address'} <span className="text-brand-red">*</span>
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  rows={2}
                  placeholder={isRTL ? 'الشارع، المبنى، الشقة...' : 'Street, Building, Apt...'}
                  className="w-full bg-brand-gray-700 border border-brand-gray-600 focus:border-brand-red text-white px-4 py-2.5 rounded-sm text-sm outline-none transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Order Summary + WhatsApp */}
          <div className="space-y-4">
            <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-6">
              <h3 className="font-bold text-white mb-4">
                {isRTL ? 'ملخص الطلب' : 'Order Summary'}
              </h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-brand-gray-400 truncate me-4">
                      {locale === 'ar' ? product.name_ar : product.name_en} ×{quantity}
                    </span>
                    <span className="text-white shrink-0">
                      {formatCurrency(product.price * quantity, locale)}
                    </span>
                  </div>
                ))}
                {isVip && (
                  <div className="flex justify-between text-sm text-yellow-400">
                    <span>⭐ VIP 10%</span>
                    <span>-{formatCurrency(getDiscount(), locale)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-brand-gray-700 pt-3 flex justify-between font-bold text-xl">
                <span className="text-white">{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="text-brand-red">{formatCurrency(total, locale)}</span>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm p-5">
              <h4 className="font-semibold text-white mb-3 text-sm">
                {isRTL ? '📋 كيف يعمل؟' : '📋 How it works?'}
              </h4>
              <div className="space-y-2">
                {(isRTL ? [
                  '1️⃣ اكمل بياناتك واضغط "إرسال الطلب"',
                  '2️⃣ سيتم توجيهك لواتساب مع تفاصيل طلبك كاملة',
                  '3️⃣ سنتواصل معك لتأكيد الطلب وإرسال بيانات الدفع',
                  '4️⃣ بعد الدفع يتم تجهيز الشحن فوراً',
                ] : [
                  '1️⃣ Fill your info and click "Send Order"',
                  '2️⃣ You\'ll be redirected to WhatsApp with full order details',
                  '3️⃣ We\'ll confirm your order and send payment details',
                  '4️⃣ After payment, shipping is prepared immediately',
                ]).map((step) => (
                  <p key={step} className="text-xs text-brand-gray-400">{step}</p>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-brand-gray-700/50 rounded-sm text-xs text-brand-gray-400">
              <Shield size={12} className="text-green-500 shrink-0" />
              {isRTL ? 'بياناتك محمية وآمنة 100%' : 'Your data is 100% safe & secure'}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-sm transition-colors text-base"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MessageCircle size={20} />
                  {isRTL ? 'إرسال الطلب على واتساب' : 'Send Order via WhatsApp'}
                </>
              )}
            </button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
