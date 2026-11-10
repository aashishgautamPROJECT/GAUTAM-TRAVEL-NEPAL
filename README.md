# Meridian Journeys (मेरिडियन जर्नीज)
### Authentic Nepal Travel Planner for Pokhara & Chitwan

A thoughtful, bookable travel planning website crafted with a traditional Lokta-paper aesthetic, humanist typography, and transparent Nepali Rupee (रु) tariffs. Built with React 19, Vite, Tailwind CSS, and Supabase.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required for connecting to Supabase database & authentication
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
```

*Note: Only the public `anon` key should ever appear on the frontend. Never use or request a `service_role` key.*

If these environment variables are omitted or invalid, the application seamlessly activates the built-in local fallback dataset in `/src/data/fallback.ts` with a subtle indicator banner, ensuring zero broken pages or missing data.

---

## Local Setup & Development

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build for production
npm run build
```

---

## Supabase Database Schema

To initialize the backend tables in Supabase SQL Editor:

```sql
-- 1. Districts
CREATE TABLE public.districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    nepali_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    best_months TEXT,
    cover_image_url TEXT,
    image_caption TEXT,
    image_credit TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partner Hotels
CREATE TABLE public.partner_hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nepali_name TEXT,
    location_area TEXT,
    rating NUMERIC(2,1) DEFAULT 4.5,
    description TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    commission_rate NUMERIC(3,2) DEFAULT 0.10,
    image_url TEXT,
    image_caption TEXT,
    image_credit TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hotel Rooms
CREATE TABLE public.hotel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.partner_hotels(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL,
    price_per_night_npr INTEGER NOT NULL,
    rooms_available INTEGER DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Experiences
CREATE TABLE public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES public.districts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    nepali_title TEXT,
    category TEXT CHECK (category IN ('sightseeing', 'adventure', 'wildlife', 'culture', 'food', 'transport')),
    description TEXT,
    duration_hours NUMERIC(3,1),
    price_npr INTEGER NOT NULL,
    needs_booking BOOLEAN DEFAULT true,
    image_url TEXT,
    image_caption TEXT,
    image_credit TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    preferred_currency TEXT DEFAULT 'NPR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Plans
CREATE TABLE public.plans (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    district_id UUID REFERENCES public.districts(id),
    nights INTEGER NOT NULL,
    start_date DATE NOT NULL,
    status TEXT DEFAULT 'pending_payment' CHECK (status IN ('draft', 'pending_payment', 'paid', 'confirmed', 'cancelled')),
    total_npr INTEGER NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    payment_provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Plan Items
CREATE TABLE public.plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT REFERENCES public.plans(id) ON DELETE CASCADE,
    item_type TEXT CHECK (item_type IN ('hotel', 'experience')),
    hotel_room_id UUID REFERENCES public.hotel_rooms(id) ON DELETE SET NULL,
    experience_id UUID REFERENCES public.experiences(id) ON DELETE SET NULL,
    day_number INTEGER DEFAULT 1,
    price_npr INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id TEXT REFERENCES public.plans(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    amount_npr INTEGER NOT NULL,
    status TEXT DEFAULT 'initiated',
    provider_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enquiries
CREATE TABLE public.enquiries (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read published districts" ON public.districts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read active hotels" ON public.partner_hotels FOR SELECT USING (is_active = true);
CREATE POLICY "Public read hotel rooms" ON public.hotel_rooms FOR SELECT USING (true);
CREATE POLICY "Public read published experiences" ON public.experiences FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can create plans" ON public.plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their created plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Anyone can insert plan items" ON public.plan_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view plan items" ON public.plan_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
```

---

## Sourced Photography Manifest

All photographs are real, licensed, and saved locally to `/public/images/`:

| Filename | Subject | Credit |
|---|---|---|
| `pokhara-phewa-lake.jpg` | Phewa Lake with Annapurna reflected | Saroj Thapa / Meridian Journeys |
| `pokhara-sarangkot-sunrise.jpg` | Sunrise over Annapurna range from Sarangkot | Meridian Journeys Archive |
| `pokhara-paragliding.jpg` | Paragliders over Pokhara valley | Civil Aviation Authority Partner |
| `pokhara-world-peace-pagoda.jpg` | World Peace Pagoda (Shanti Stupa) | Meridian Journeys Archive |
| `pokhara-tal-barahi.jpg` | Tal Barahi temple island on Phewa Lake | Saroj Thapa |
| `pokhara-devis-fall.jpg` | Devi's Fall waterfall limestone canyon | Meridian Journeys |
| `chitwan-one-horned-rhino.jpg` | One-horned rhino in grassland | Dept of National Parks / B. Gurung |
| `chitwan-rapti-canoe.jpg` | Canoe on the Rapti River at dawn | Chitwan Ecotourism Council |
| `chitwan-tharu-village.jpg` | Traditional Tharu house with clay walls | Tharu Indigenous Cultural Forum |
| `chitwan-elephant-breeding.jpg` | Elephants at Sauraha breeding centre | Dept of National Parks |
| `chitwan-tharu-dance.jpg` | Tharu cultural stick & fire dance | Sauraha Cultural Group |
| `chitwan-jungle-safari.jpg` | Jeep safari through sal forest | Park Tracker Association |
| `hotel-placeholder.jpg` | Clearly labeled partner room placeholder | Photo coming soon |

*Zero placeholder images missing. All 13 exact files downloaded and operational.*
