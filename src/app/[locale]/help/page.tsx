'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_EN = [
  {
    q: 'What is the minimum order quantity?',
    a: 'The default minimum order is 500 units per product. The only exception is Machinery, which has a minimum of 1 unit.',
  },
  {
    q: 'How do I pay for orders?',
    a: 'All orders are prepaid via PayPal. After checkout, you will be redirected to WhatsApp to confirm shipping details.',
  },
  {
    q: 'What is the VIP program?',
    a: 'After completing 5 orders, you automatically become a VIP client and receive a permanent 10% discount on all future orders.',
  },
  {
    q: 'Can I build a custom product?',
    a: 'Yes! Use the "Build Your Own Product" feature to configure category, color, size, features, and quantity. We will contact you with a quote.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Shipping times vary by product and destination. After placing your order, contact us via WhatsApp and we will give you an accurate shipping estimate.',
  },
  {
    q: 'Are products quality-checked?',
    a: 'Yes. Every product undergoes strict quality control before shipping. We partner only with verified suppliers.',
  },
  {
    q: 'Can I get samples before bulk ordering?',
    a: 'Yes. Use the "Build Your Own Product" feature and select "Sample First" in the features. We will send samples before full production.',
  },
];

const FAQ_AR = [
  {
    q: 'ما هو الحد الأدنى للطلب؟',
    a: 'الحد الأدنى الافتراضي هو 500 وحدة لكل منتج. الاستثناء الوحيد هو الآلات، حيث يكون الحد الأدنى وحدة واحدة.',
  },
  {
    q: 'كيف أدفع مقابل الطلبات؟',
    a: 'جميع الطلبات مدفوعة مسبقاً عبر PayPal. بعد إتمام الدفع، سيتم توجيهك إلى WhatsApp لتأكيد تفاصيل الشحن.',
  },
  {
    q: 'ما هو برنامج VIP؟',
    a: 'بعد إتمام 5 طلبات، ستصبح تلقائياً عميل VIP وستحصل على خصم دائم 10% على جميع طلباتك المستقبلية.',
  },
  {
    q: 'هل يمكنني بناء منتج مخصص؟',
    a: 'نعم! استخدم ميزة "ابنِ منتجك" لتخصيص الفئة واللون والحجم والمميزات والكمية. سنتواصل معك بعرض سعر.',
  },
  {
    q: 'كم يستغرق الشحن؟',
    a: 'تختلف أوقات الشحن حسب المنتج والوجهة. بعد تقديم طلبك، تواصل معنا عبر WhatsApp وسنعطيك تقديراً دقيقاً.',
  },
  {
    q: 'هل المنتجات خاضعة لفحص الجودة؟',
    a: 'نعم. كل منتج يخضع لرقابة جودة صارمة قبل الشحن. نتعامل فقط مع موردين موثوقين ومعتمدين.',
  },
  {
    q: 'هل يمكنني الحصول على عينات قبل الطلب الكبير؟',
    a: 'نعم. استخدم ميزة "ابنِ منتجك" واختر "عينة أولاً" في الخصائص. سنرسل لك عينات قبل الإنتاج الكامل.',
  },
];

const BOT_RESPONSES_EN: Record<string, string> = {
  minimum: 'The default minimum order is 500 units. Machinery is the only exception with a minimum of 1 unit.',
  payment: 'We accept PayPal payments only. All orders are prepaid before processing.',
  vip: 'Complete 5 orders to automatically become VIP and get a 10% permanent discount!',
  shipping: 'Shipping times vary. Contact us on WhatsApp after placing your order for exact details.',
  custom: 'Use the "Build Your Own Product" page to create a custom order with your specifications.',
  quality: 'All products are quality-checked before shipping. We only work with verified suppliers.',
  default: 'I\'m here to help! Ask me about minimum orders, payment, shipping, VIP discounts, or custom products.',
};

const BOT_RESPONSES_AR: Record<string, string> = {
  الحد: 'الحد الأدنى الافتراضي هو 500 وحدة. الاستثناء الوحيد هو الآلات بحد أدنى وحدة واحدة.',
  دفع: 'نقبل مدفوعات PayPal فقط. جميع الطلبات تُدفع مسبقاً قبل المعالجة.',
  vip: 'أتمم 5 طلبات لتصبح عميل VIP تلقائياً وتحصل على خصم دائم 10%!',
  شحن: 'تختلف أوقات الشحن. تواصل معنا على WhatsApp بعد تقديم طلبك للحصول على التفاصيل.',
  مخصص: 'استخدم صفحة "ابنِ منتجك" لإنشاء طلب مخصص بمواصفاتك.',
  جودة: 'جميع المنتجات تخضع لفحص الجودة قبل الشحن. نعمل فقط مع موردين موثوقين.',
  default: 'أنا هنا للمساعدة! اسألني عن الحد الأدنى للطلبات، الدفع، الشحن، خصومات VIP، أو المنتجات المخصصة.',
};

function getBotReply(message: string, locale: string): string {
  const lower = message.toLowerCase();
  const responses = locale === 'ar' ? BOT_RESPONSES_AR : BOT_RESPONSES_EN;

  for (const [key, reply] of Object.entries(responses)) {
    if (key !== 'default' && lower.includes(key)) return reply;
  }
  return responses.default;
}

export default function HelpPage() {
  const locale = useLocale() as 'ar' | 'en';
  const isRTL = locale === 'ar';
  const faqs = isRTL ? FAQ_AR : FAQ_EN;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text: isRTL
        ? 'مرحباً! أنا مساعد WholesalePro. كيف يمكنني مساعدتك اليوم؟'
        : 'Hello! I\'m the WholesalePro assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    const botMsg = { role: 'bot' as const, text: getBotReply(input, locale) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28">
        {/* Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1 h-8 bg-brand-red" />
          <h1 className="text-3xl font-bold text-white font-display tracking-wider uppercase">
            {isRTL ? 'مركز المساعدة' : 'Help Center'}
          </h1>
        </div>
        <p className="text-brand-gray-400 mb-12 ms-5">
          {isRTL ? 'كل ما تحتاج معرفته للتسوق بثقة' : 'Everything you need to shop with confidence'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-brand-red">Q&A</span>
              {isRTL ? ' — الأسئلة الشائعة' : ' — Frequently Asked'}
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="border border-brand-gray-700 hover:border-brand-red/40 rounded-sm overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-start"
                  >
                    <span className="text-sm font-medium text-white">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp size={14} className="text-brand-red shrink-0 ms-2" />
                    ) : (
                      <ChevronDown size={14} className="text-brand-gray-400 shrink-0 ms-2" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-brand-gray-400 border-t border-brand-gray-700 pt-3 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chatbot */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageCircle size={18} className="text-brand-red" />
              {isRTL ? 'المساعد الذكي' : 'Smart Assistant'}
            </h2>

            <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-sm flex flex-col h-96">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                  >
                    <div
                      className={`max-w-xs rounded-sm px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-red text-white'
                          : 'bg-brand-gray-700 text-brand-gray-200'
                      }`}
                    >
                      {msg.role === 'bot' && (
                        <div className="text-xs text-brand-red font-semibold mb-1">
                          {isRTL ? 'المساعد' : 'Assistant'}
                        </div>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="px-4 py-2 border-t border-brand-gray-700 flex gap-2 overflow-x-auto">
                {(isRTL
                  ? ['الحد الأدنى؟', 'طرق الدفع', 'نظام VIP', 'مدة الشحن']
                  : ['Min order?', 'Payment methods', 'VIP system', 'Shipping time']
                ).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                      const botMsg = { role: 'bot' as const, text: getBotReply(prompt, locale) };
                      const userMsg = { role: 'user' as const, text: prompt };
                      setMessages((prev) => [...prev, userMsg, botMsg]);
                    }}
                    className="shrink-0 text-xs border border-brand-gray-600 hover:border-brand-red text-brand-gray-400 hover:text-white px-3 py-1 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 border-t border-brand-gray-700 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isRTL ? 'اكتب سؤالك...' : 'Type your question...'}
                  className="flex-1 bg-brand-gray-700 border border-brand-gray-600 text-white text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-brand-red"
                />
                <button
                  onClick={sendMessage}
                  className="bg-brand-red hover:bg-brand-red-dark text-white p-2 rounded-sm transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/972592701146"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-sm transition-colors text-sm"
            >
              <MessageCircle size={16} />
              {isRTL ? 'تحدث مع فريقنا مباشرة' : 'Talk to our team directly'}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
