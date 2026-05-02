import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'react-hot-toast';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-black text-brand-white antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster
            position={isRTL ? 'top-left' : 'top-right'}
            toastOptions={{
              style: {
                background: '#1F1F1F',
                color: '#fff',
                border: '1px solid #E50914',
                fontFamily: isRTL
                  ? 'Noto Kufi Arabic, sans-serif'
                  : 'DM Sans, sans-serif',
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
