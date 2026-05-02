-- ==============================================
-- WholesalePro Supabase Schema
-- Run this in your Supabase SQL Editor
-- ==============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================
-- USERS TABLE
-- ==============================================
create table if not exists public.users (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null unique,
  full_name   text,
  is_vip      boolean not null default false,
  orders_count int not null default 0,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================
-- PRODUCTS TABLE
-- ==============================================
create table if not exists public.products (
  id              uuid primary key default uuid_generate_v4(),
  name_ar         text not null,
  name_en         text not null,
  description_ar  text,
  description_en  text,
  category        text not null,
  price           numeric(10,2) not null,
  min_order       int not null default 500,
  image           text not null default '',
  images          text[],
  stock           int not null default 0,
  sku             text,
  price_tiers     jsonb,
  is_trending     boolean not null default false,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category);
create index if not exists products_trending_idx on public.products(is_trending) where is_trending = true;
create index if not exists products_active_idx on public.products(is_active) where is_active = true;

-- ==============================================
-- ORDERS TABLE
-- ==============================================
create table if not exists public.orders (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.users(id) on delete set null,
  items       jsonb not null default '[]',
  total       numeric(10,2) not null,
  status      text not null default 'pending'
              check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  payment_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

-- ==============================================
-- CUSTOM ORDERS TABLE
-- ==============================================
create table if not exists public.custom_orders (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid references public.users(id) on delete set null,
  category  text,
  color     text,
  size      text,
  features  text[],
  quantity  int not null default 500,
  notes     text,
  status    text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ==============================================
-- SITE SETTINGS TABLE
-- ==============================================
create table if not exists public.site_settings (
  id                text primary key default 'main',
  whatsapp_number   text not null default '972592701146',
  paypal_email      text not null default '',
  contact_email     text not null default '',
  hero_title_en     text not null default 'The #1 Wholesale Marketplace',
  hero_title_ar     text not null default 'سوق الجملة الأول',
  hero_subtitle_en  text not null default 'Wholesale prices for professional buyers',
  hero_subtitle_ar  text not null default 'أسعار الجملة للمشترين المحترفين',
  updated_at        timestamptz not null default now()
);

insert into public.site_settings (id) values ('main') on conflict do nothing;

-- ==============================================
-- RPC: Increment orders count + auto-VIP
-- ==============================================
create or replace function public.increment_orders_count(uid uuid)
returns void language plpgsql security definer as $$
declare
  new_count int;
begin
  update public.users
  set orders_count = orders_count + 1
  where id = uid
  returning orders_count into new_count;

  -- Auto-grant VIP after 5 orders
  if new_count >= 5 then
    update public.users set is_vip = true where id = uid;
  end if;
end;
$$;

-- ==============================================
-- ROW LEVEL SECURITY
-- ==============================================

-- Users: can only see/edit own row
alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "Admins can update all users"
  on public.users for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Products: public read, admin write
alter table public.products enable row level security;

create policy "Products are publicly readable"
  on public.products for select
  using (is_active = true);

create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Orders: users see own, admins see all
alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- Site settings: public read
alter table public.site_settings enable row level security;

create policy "Site settings are public"
  on public.site_settings for select
  using (true);

create policy "Admins can edit settings"
  on public.site_settings for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- ==============================================
-- SEED DATA — 14 Products
-- ==============================================
insert into public.products
  (name_ar, name_en, description_ar, description_en, category, price, min_order, image, stock, sku, price_tiers, is_trending, is_active)
values
(
  'تيشيرت قطني بشعار مخصص',
  'Custom Logo Cotton T-Shirt',
  'قميص قطني عالي الجودة 100% قطن مشط، مثالي للطباعة بالشعارات والعلامات التجارية',
  '100% combed cotton premium tee, perfect for logo printing and brand merchandise',
  'clothing', 2.80, 500,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
  50000, 'CLO-TSH-001',
  '[{"min_qty":500,"price":2.80,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":1000,"price":2.40,"label_ar":"1000-4999 قطعة","label_en":"1000-4999 pcs"},{"min_qty":5000,"price":1.95,"label_ar":"5000+ قطعة","label_en":"5000+ pcs"}]',
  true, true
),
(
  'حقيبة جلدية فاخرة',
  'Premium Leather Handbag',
  'حقيبة يد نسائية من جلد البولي يوريثان عالي الجودة، تصميم عصري أنيق',
  'High-quality PU leather women handbag, modern elegant design',
  'accessories', 8.50, 500,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
  20000, 'ACC-BAG-002',
  '[{"min_qty":500,"price":8.50,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":1000,"price":7.20,"label_ar":"1000+ قطعة","label_en":"1000+ pcs"}]',
  true, true
),
(
  'حذاء رياضي خفيف',
  'Lightweight Sport Sneaker',
  'حذاء رياضي خفيف الوزن، مريح للقدم، متوفر بمقاسات 36-46',
  'Ultra-lightweight sport shoe, breathable mesh upper, sizes 36-46',
  'shoes', 6.90, 500,
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  30000, 'SHO-SNK-003',
  '[{"min_qty":500,"price":6.90,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":2000,"price":5.60,"label_ar":"2000+ قطعة","label_en":"2000+ pcs"}]',
  false, true
),
(
  'أحمر شفاه مات طويل الأمد',
  'Long-Lasting Matte Lipstick',
  'أحمر شفاه مات فاخر 24 ساعة، 36 درجة لونية، مضاد للماء',
  '24-hour matte lipstick, 36 shades, waterproof formula',
  'makeup', 1.20, 500,
  'https://images.unsplash.com/photo-1586495777744-4e6232bf0651?w=600',
  100000, 'MAK-LIP-004',
  '[{"min_qty":500,"price":1.20,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":5000,"price":0.95,"label_ar":"5000+ قطعة","label_en":"5000+ pcs"}]',
  true, true
),
(
  'سماعة لاسلكية بلوتوث 5.3',
  'Bluetooth 5.3 Wireless Earbuds',
  'سماعة لاسلكية TWS بلوتوث 5.3، إلغاء الضوضاء النشط، بطارية 30 ساعة',
  'TWS Bluetooth 5.3, active noise cancellation, 30-hour battery life',
  'electronics', 12.50, 500,
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
  15000, 'ELE-EAR-005',
  '[{"min_qty":500,"price":12.50,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":1000,"price":10.80,"label_ar":"1000+ قطعة","label_en":"1000+ pcs"}]',
  true, true
),
(
  'بطارية ليثيوم 18650 عالية الطاقة',
  'High-Power 18650 Lithium Battery',
  'بطارية ليثيوم 18650 سعة 3500mAh، معتمدة CE، للأجهزة الإلكترونية',
  '3500mAh 18650 lithium cell, CE certified, industrial grade',
  'batteries', 1.85, 500,
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600',
  200000, 'BAT-LIT-006',
  '[{"min_qty":500,"price":1.85,"label_ar":"500-1999 قطعة","label_en":"500-1999 pcs"},{"min_qty":2000,"price":1.50,"label_ar":"2000+ قطعة","label_en":"2000+ pcs"}]',
  false, true
),
(
  'لعبة مكعبات بناء تعليمية',
  'Educational Building Blocks Set',
  'مجموعة مكعبات بناء تعليمية للأطفال من 3-12 سنة، 200 قطعة ملونة آمنة',
  'Educational STEM building blocks for ages 3-12, 200 colorful safe pieces',
  'toys', 3.40, 500,
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
  40000, 'TOY-BLK-007',
  '[{"min_qty":500,"price":3.40,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":3000,"price":2.80,"label_ar":"3000+ قطعة","label_en":"3000+ pcs"}]',
  false, true
),
(
  'آلة تعبئة أوتوماتيكية',
  'Automatic Packaging Machine',
  'آلة تعبئة وتغليف أوتوماتيكية سرعة 60 كيس/دقيقة، مناسبة للمصانع الصغيرة',
  'Semi-auto packing machine, 60 bags/min, suitable for small factories',
  'machinery', 1200.00, 1,
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
  50, 'MAC-PKG-008',
  '[{"min_qty":1,"price":1200.00,"label_ar":"1-4 آلات","label_en":"1-4 machines"},{"min_qty":5,"price":1050.00,"label_ar":"5+ آلات","label_en":"5+ machines"}]',
  false, true
),
(
  'شوكولاتة فاخرة بالحليب',
  'Premium Milk Chocolate Bar',
  'شوكولاتة بالحليب الفاخرة 100 جرام، تعبئة خاصة قابلة للتخصيص',
  'Premium 100g milk chocolate, customizable private label packaging',
  'sweets', 0.85, 500,
  'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600',
  100000, 'SWT-CHO-009',
  '[{"min_qty":500,"price":0.85,"label_ar":"500-4999 قطعة","label_en":"500-4999 pcs"},{"min_qty":5000,"price":0.68,"label_ar":"5000+ قطعة","label_en":"5000+ pcs"}]',
  false, true
),
(
  'شاشة OLED لآيفون 14',
  'iPhone 14 OLED Screen Assembly',
  'شاشة OLED أصلية لآيفون 14 مع إطار كامل، ضمان 12 شهراً',
  'OEM OLED screen assembly for iPhone 14 with full frame, 12-month warranty',
  'mobile_spare_parts', 18.90, 500,
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600',
  10000, 'MSP-SCR-010',
  '[{"min_qty":500,"price":18.90,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":1000,"price":16.50,"label_ar":"1000+ قطعة","label_en":"1000+ pcs"}]',
  true, true
),
(
  'روبوت تعليمي برمجي',
  'Programmable Educational Robot Kit',
  'روبوت تعليمي قابل للبرمجة للأطفال من 8-16 سنة، يدعم Python وScratch',
  'Programmable STEM robot for ages 8-16, supports Python and Scratch coding',
  'robots', 25.00, 500,
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
  5000, 'ROB-EDU-011',
  '[{"min_qty":500,"price":25.00,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":1000,"price":21.00,"label_ar":"1000+ قطعة","label_en":"1000+ pcs"}]',
  true, true
),
(
  'كفر هاتف مضاد للصدمات',
  'Heavy-Duty Shockproof Phone Case',
  'كفر هاتف متوافق مع جميع موديلات آيفون وسامسونج، حماية 360 درجة',
  'Compatible with all iPhone and Samsung models, 360-degree protection',
  'phone_accessories', 1.10, 500,
  'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600',
  80000, 'PHO-CAS-012',
  '[{"min_qty":500,"price":1.10,"label_ar":"500-1999 قطعة","label_en":"500-1999 pcs"},{"min_qty":2000,"price":0.85,"label_ar":"2000+ قطعة","label_en":"2000+ pcs"}]',
  false, true
),
(
  'مروحة لاسلكية محمولة',
  'Portable Wireless Table Fan',
  'مروحة مكتبية لاسلكية قابلة لإعادة الشحن، 3 سرعات، هادئة 30dB',
  'Rechargeable desktop fan, 3-speed settings, whisper-quiet 30dB',
  'home_appliances', 4.20, 500,
  'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?w=600',
  25000, 'HOM-FAN-013',
  '[{"min_qty":500,"price":4.20,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":2000,"price":3.50,"label_ar":"2000+ قطعة","label_en":"2000+ pcs"}]',
  false, true
),
(
  'طائرة مسيّرة مع كاميرا 4K',
  'Foldable Drone with 4K Camera',
  'طائرة مسيّرة احترافية مع كاميرا 4K، نطاق 1.5كم، وقت طيران 25 دقيقة',
  'Professional foldable drone, 4K camera, 1.5km range, 25-min flight time',
  'drones', 45.00, 500,
  'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600',
  3000, 'DRO-4K-014',
  '[{"min_qty":500,"price":45.00,"label_ar":"500-999 قطعة","label_en":"500-999 pcs"},{"min_qty":1000,"price":38.00,"label_ar":"1000+ قطعة","label_en":"1000+ pcs"}]',
  true, true
);
