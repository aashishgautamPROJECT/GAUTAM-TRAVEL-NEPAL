-- ========================================================================
-- GAUTAM TRAVELS (गौतम ट्राभल्स) - POKHARA & CHITWAN SCHEMA FOR SUPABASE
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project-ref>/sql/new
-- ========================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- 1. DISTRICTS TABLE
create table if not exists public.districts (
  id text primary key,
  name text not null,
  nepali_name text not null,
  slug text not null unique,
  description text not null,
  best_months text not null,
  cover_image_url text not null,
  image_caption text,
  image_credit text,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- 2. PARTNER HOTELS TABLE
create table if not exists public.partner_hotels (
  id uuid primary key default gen_random_uuid(),
  district_id text not null references public.districts(id) on delete cascade,
  name text not null,
  nepali_name text,
  location_area text not null,
  rating numeric default 4.8,
  description text not null,
  contact_phone text not null,
  contact_email text not null,
  commission_rate numeric default 0.15,
  image_url text not null,
  image_caption text,
  image_credit text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 3. HOTEL ROOMS TABLE
create table if not exists public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.partner_hotels(id) on delete cascade,
  room_type text not null,
  price_per_night_npr integer not null,
  rooms_available integer not null default 5,
  description text,
  created_at timestamptz default now()
);

-- 4. EXPERIENCES TABLE
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  district_id text not null references public.districts(id) on delete cascade,
  title text not null,
  nepali_title text,
  category text not null check (category in ('sightseeing', 'adventure', 'wildlife', 'culture', 'food', 'transport')),
  description text not null,
  duration_hours numeric not null,
  price_npr integer not null,
  needs_booking boolean default true,
  image_url text not null,
  image_caption text,
  image_credit text,
  is_published boolean default true,
  created_at timestamptz default now()
);

-- 5. PLANS (BOOKINGS) TABLE
create table if not exists public.plans (
  id text primary key,
  customer_id uuid references auth.users(id) on delete set null,
  district_id text not null references public.districts(id),
  nights integer not null default 2,
  start_date date not null,
  status text not null default 'pending_payment',
  total_npr integer not null default 0,
  customer_name text,
  customer_phone text,
  payment_provider text default 'esewa',
  created_at timestamptz default now()
);

-- 6. PLAN LINE ITEMS TABLE
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans(id) on delete cascade,
  item_type text not null check (item_type in ('hotel', 'experience')),
  hotel_room_id uuid references public.hotel_rooms(id) on delete set null,
  experience_id uuid references public.experiences(id) on delete set null,
  day_number integer not null default 1,
  price_npr integer not null default 0,
  created_at timestamptz default now()
);

-- 7. PAYMENTS TABLE
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  plan_id text not null references public.plans(id) on delete cascade,
  provider text not null default 'esewa',
  amount_npr integer not null,
  status text not null default 'initiated',
  provider_reference text,
  created_at timestamptz default now()
);

-- 8. CUSTOMER ENQUIRIES TABLE
create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  created_at timestamptz default now()
);

-- 9. USER PROFILES TABLE (Syncs with Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  preferred_language text default 'en',
  preferred_currency text default 'NPR',
  role text default 'customer',
  created_at timestamptz default now()
);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables instant, safe read/write access for anonymous & authenticated users
-- ========================================================================

alter table public.districts enable row level security;
alter table public.partner_hotels enable row level security;
alter table public.hotel_rooms enable row level security;
alter table public.experiences enable row level security;
alter table public.plans enable row level security;
alter table public.plan_items enable row level security;
alter table public.payments enable row level security;
alter table public.enquiries enable row level security;
alter table public.profiles enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public select on districts" on public.districts;
drop policy if exists "Allow public select on partner_hotels" on public.partner_hotels;
drop policy if exists "Allow public select on hotel_rooms" on public.hotel_rooms;
drop policy if exists "Allow public update on hotel_rooms" on public.hotel_rooms;
drop policy if exists "Allow public select on experiences" on public.experiences;
drop policy if exists "Allow all insert on plans" on public.plans;
drop policy if exists "Allow all select on plans" on public.plans;
drop policy if exists "Allow all update on plans" on public.plans;
drop policy if exists "Allow all insert on plan_items" on public.plan_items;
drop policy if exists "Allow all select on plan_items" on public.plan_items;
drop policy if exists "Allow all insert on payments" on public.payments;
drop policy if exists "Allow all select on payments" on public.payments;
drop policy if exists "Allow all insert on enquiries" on public.enquiries;
drop policy if exists "Allow all select on enquiries" on public.enquiries;
drop policy if exists "Allow all select on profiles" on public.profiles;
drop policy if exists "Allow all upsert on profiles" on public.profiles;

-- Create open read policies for public catalog
create policy "Allow public select on districts" on public.districts for select using (true);
create policy "Allow public select on partner_hotels" on public.partner_hotels for select using (true);
create policy "Allow public select on hotel_rooms" on public.hotel_rooms for select using (true);
create policy "Allow public update on hotel_rooms" on public.hotel_rooms for update using (true);
create policy "Allow public select on experiences" on public.experiences for select using (true);

-- Allow booking submissions and reading
create policy "Allow all insert on plans" on public.plans for insert with check (true);
create policy "Allow all select on plans" on public.plans for select using (true);
create policy "Allow all update on plans" on public.plans for update using (true);

create policy "Allow all insert on plan_items" on public.plan_items for insert with check (true);
create policy "Allow all select on plan_items" on public.plan_items for select using (true);

create policy "Allow all insert on payments" on public.payments for insert with check (true);
create policy "Allow all select on payments" on public.payments for select using (true);

-- Allow contact form submissions and reading
create policy "Allow all insert on enquiries" on public.enquiries for insert with check (true);
create policy "Allow all select on enquiries" on public.enquiries for select using (true);

-- Allow profiles management
create policy "Allow all select on profiles" on public.profiles for select using (true);
create policy "Allow all upsert on profiles" on public.profiles for all using (true) with check (true);

-- ========================================================================
-- SEED DATA: POKHARA & CHITWAN DESTINATIONS, HOTELS, ROOMS & EXPERIENCES
-- ========================================================================

-- Insert Districts
insert into public.districts (id, name, nepali_name, slug, description, best_months, cover_image_url, image_caption, image_credit)
values
(
  'pokhara',
  'Pokhara',
  'पोखरा',
  'pokhara',
  'Subtropical valley flanked by the Annapurna Massif and Phewa Lake, renowned for dawn reflections, paragliding from Sarangkot, and peaceful lakeside living.',
  'October – December & March – May',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop',
  'Phewa Lake wooden doonga boats at sunset against the Annapurna range',
  'Photo: Gautam Travels Archive'
),
(
  'chitwan',
  'Chitwan',
  'चितवन',
  'chitwan',
  'Subtropical inner Terai sanctuary bordering the Rapti and Narayani rivers, home to the greater one-horned rhinoceros, Bengal tiger, and indigenous Tharu heritage.',
  'October – March',
  'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1600&auto=format&fit=crop',
  'Greater one-horned rhino grazing along the misty Rapti riverbank',
  'Photo: Gautam Travels Conservation Desk'
)
on conflict (id) do update set
  name = excluded.name,
  nepali_name = excluded.nepali_name,
  description = excluded.description;

-- Insert Partner Hotels
insert into public.partner_hotels (district_id, name, nepali_name, location_area, rating, description, contact_phone, contact_email, commission_rate, image_url, image_caption, image_credit)
values
(
  'pokhara',
  'Temple Tree Resort & Spa',
  'टेम्पल ट्री रिसोर्ट',
  'Lakeside-6, Gaurighat',
  4.9,
  'Boutique sanctuary reflecting traditional Western Nepal timber and stone architecture, nestled within manicured gardens near Phewa Lake.',
  '+977 61 465888',
  'reservations@templetreeresort.com',
  0.15,
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop',
  'Courtyard garden and swimming pool at Temple Tree Resort',
  'Photo: Temple Tree'
),
(
  'pokhara',
  'Waterfront Resort by KGH Group',
  'वाटरफ्रन्ट रिसोर्ट',
  'Sedi Height, Lakeside',
  4.7,
  'Tranquil lakeside retreat offering unobstructed panoramic lake vistas and direct pier boarding for wooden doonga boats.',
  '+977 61 466300',
  'frontdesk@waterfront.com.np',
  0.12,
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop',
  'Lakeside terrace overlooking Phewa Tal watercraft',
  'Photo: KGH Group'
),
(
  'chitwan',
  'Barahi Jungle Lodge',
  'बाराही जङ्गल लज',
  'Meghauli, Chitwan National Park',
  4.9,
  'Ultra-luxurious eco-lodge set directly upon the confluence of the Rapti and Narayani rivers, offering naturalists and private jeep safaris.',
  '+977 56 411011',
  'safari@barahijunglelodge.com',
  0.18,
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
  'Thatched Tharu cottage facing the Rapti river crossing',
  'Photo: Barahi Lodges'
),
(
  'chitwan',
  'Tigerland Safari Resort',
  'टाइगरल्याण्ड सफारी',
  'Jagatpur, Rapti Riverbank',
  4.8,
  'Eco-sustainable safari tents and brick cottages built in harmony with the community forest buffer zone.',
  '+977 56 412000',
  'info@tigerlandsafari.com',
  0.15,
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop',
  'Riverbank veranda with views into the national park canopy',
  'Photo: Tigerland'
);

-- Insert Hotel Rooms (Automatically linked to partner hotels)
insert into public.hotel_rooms (hotel_id, room_type, price_per_night_npr, rooms_available, description)
select id, 'Deluxe Garden Cottage Room', 8500, 6, 'Spacious stone cottage with private veranda facing tranquil courtyard flora.'
from public.partner_hotels where name = 'Temple Tree Resort & Spa' limit 1;

insert into public.hotel_rooms (hotel_id, room_type, price_per_night_npr, rooms_available, description)
select id, 'Annapurna Mountain Panorama Suite', 14200, 3, 'Upper-tier suite with uninterrupted views of Machhapuchhre and Phewa waters.'
from public.partner_hotels where name = 'Temple Tree Resort & Spa' limit 1;

insert into public.hotel_rooms (hotel_id, room_type, price_per_night_npr, rooms_available, description)
select id, 'Deluxe Lake Balcony Room', 6800, 4, 'Pine timber furnishings with private balcony facing the water.'
from public.partner_hotels where name = 'Waterfront Resort by KGH Group' limit 1;

insert into public.hotel_rooms (hotel_id, room_type, price_per_night_npr, rooms_available, description)
select id, 'Heritage Riverfront Villa', 24500, 5, 'Sprawling vernacular Tharu villa with private plunge deck on the Rapti river.'
from public.partner_hotels where name = 'Barahi Jungle Lodge' limit 1;

insert into public.hotel_rooms (hotel_id, room_type, price_per_night_npr, rooms_available, description)
select id, 'Deluxe Buffer Zone Cottage', 11000, 8, 'Air-conditioned solar-powered timber suite with en-suite rainforest shower.'
from public.partner_hotels where name = 'Tigerland Safari Resort' limit 1;

-- Insert Experiences for Pokhara & Chitwan
insert into public.experiences (district_id, title, nepali_title, category, description, duration_hours, price_npr, needs_booking, image_url, image_caption, image_credit)
values
(
  'pokhara',
  'Sarangkot Dawn Himalayan Flight & Paragliding',
  'सराङकोट सूर्योदय र प्याराग्लाइडिङ',
  'adventure',
  'Sunrise above the Annapurna and Dhaulagiri peaks from Sarangkot, followed by a tandem flight descending gracefully to the Phewa lakeshore.',
  3.5,
  8500,
  true,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
  'Paraglider soaring above Phewa Lake with Annapurna in background',
  'Photo: Pokhara Sky Adventures'
),
(
  'pokhara',
  'Phewa Lake Traditional Doonga Cruise & Tal Barahi Island',
  'फेवा ताल डुङ्गा सयर तथा ताल बाराही',
  'sightseeing',
  'Hand-carved wooden boat excursion across Phewa Lake with a halt at the two-tiered Tal Barahi island temple sanctuary.',
  2.0,
  1200,
  false,
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
  'Paddler steering hand-painted wooden doonga across calm water',
  'Photo: Baidam Boatmen Association'
),
(
  'pokhara',
  'World Peace Pagoda & Pumdikot Shiva Ridge Hike',
  'शान्ति स्तूपा तथा पुम्दीकोट पदयात्रा',
  'culture',
  'Guided ridge walk across Anadu Hill leading to the gleaming white Shanti Stupa and the majestic Pumdikot Shiva colossus.',
  4.0,
  2800,
  true,
  'https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop',
  'White pagoda spire overlooking Pokhara valley',
  'Photo: Gautam Travels'
),
(
  'chitwan',
  'Private Full-Day Jeep Safari with Senior Naturalist',
  'विशेष जिप सफारी र निकुञ्ज भ्रमण',
  'wildlife',
  'Deep immersion into the core park sectors of Kasara and Sukhibhar tracking one-horned rhinos, sloth bears, and elusive Royal Bengal tigers.',
  7.0,
  14500,
  true,
  'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1200&auto=format&fit=crop',
  'Open 4x4 safari vehicle pausing near wild rhino herd',
  'Photo: Chitwan Guide Association'
),
(
  'chitwan',
  'Rapti River Dugout Canoe Wildlife Drift',
  'राप्ती नदी काठको डुङ्गा सफारी',
  'wildlife',
  'Silent drift aboard a hand-hollowed silk-cotton tree trunk canoe observing sunbathing gharials, marsh muggers, and kingfishers.',
  2.5,
  1800,
  true,
  'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=1200&auto=format&fit=crop',
  'Canoe drifting along the misty morning waters of Rapti',
  'Photo: Sauraha Boatmen Circle'
),
(
  'chitwan',
  'Indigenous Tharu Village & Stick Dance Evening',
  'थारु सांस्कृतिक नाच तथा साँझ',
  'culture',
  'Authentic immersion into mud-plastered Tharu homesteads followed by an evening performance of the rhythmic Danda Nach stick dance.',
  2.0,
  950,
  false,
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop',
  'Tharu cultural dance performance in Sauraha',
  'Photo: Sauraha Cultural Group'
);
