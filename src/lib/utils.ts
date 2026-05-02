import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Locale, Product } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProductName(product: Product, locale: Locale): string {
  return locale === 'ar' ? product.name_ar : product.name_en;
}

export function getProductDescription(product: Product, locale: Locale): string {
  return locale === 'ar'
    ? (product.description_ar || '')
    : (product.description_en || '');
}

export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function buildWhatsAppMessage(orderId: string, total: number, locale: Locale): string {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972592701146';
  const message = locale === 'ar'
    ? `مرحباً، لقد أتممت طلبي رقم: ${orderId}، الإجمالي: $${total.toFixed(2)}`
    : `Hello, I've completed my order #${orderId}, Total: $${total.toFixed(2)}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}
