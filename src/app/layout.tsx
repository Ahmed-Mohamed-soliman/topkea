import type { Metadata } from 'next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
export const metadata: Metadata = {
  title: 'Topkea — Wholesale Marketplace',
  description: 'Global wholesale marketplace — سوق الجملة العالمي | Bulk Orders · Global Supply',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};
