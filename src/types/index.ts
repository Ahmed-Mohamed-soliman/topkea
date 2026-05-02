export type Locale = 'ar' | 'en';

export interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  category: CategoryKey;
  price: number;
  min_order: number;
  image: string;
  images?: string[];
  stock: number;
  sku?: string;
  price_tiers?: PriceTier[];
  is_trending?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PriceTier {
  min_qty: number;
  max_qty?: number;
  price: number;
  label_ar: string;
  label_en: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_id?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_vip: boolean;
  orders_count: number;
  role: 'user' | 'admin';
  created_at: string;
}

export interface SiteSettings {
  whatsapp_number: string;
  paypal_email: string;
  hero_title_ar: string;
  hero_title_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  contact_email: string;
}

export type CategoryKey =
  | 'clothing'
  | 'accessories'
  | 'shoes'
  | 'makeup'
  | 'electronics'
  | 'batteries'
  | 'toys'
  | 'machinery'
  | 'sweets'
  | 'mobile_spare_parts'
  | 'robots'
  | 'phone_accessories'
  | 'home_appliances'
  | 'drones';

export const CATEGORIES: CategoryKey[] = [
  'clothing', 'accessories', 'shoes', 'makeup', 'electronics',
  'batteries', 'toys', 'machinery', 'sweets', 'mobile_spare_parts',
  'robots', 'phone_accessories', 'home_appliances', 'drones',
];

export const CATEGORY_ICONS: Record<CategoryKey, string> = {
  clothing: '👕',
  accessories: '👜',
  shoes: '👟',
  makeup: '💄',
  electronics: '📱',
  batteries: '🔋',
  toys: '🧸',
  machinery: '⚙️',
  sweets: '🍬',
  mobile_spare_parts: '🔧',
  robots: '🤖',
  phone_accessories: '📲',
  home_appliances: '🏠',
  drones: '🚁',
};

export const MIN_ORDER_BY_CATEGORY: Record<CategoryKey, number> = {
  clothing: 500,
  accessories: 500,
  shoes: 500,
  makeup: 500,
  electronics: 500,
  batteries: 500,
  toys: 500,
  machinery: 1,
  sweets: 500,
  mobile_spare_parts: 500,
  robots: 500,
  phone_accessories: 500,
  home_appliances: 500,
  drones: 500,
};

export const VIP_DISCOUNT = 0.10;
export const VIP_THRESHOLD = 5;
