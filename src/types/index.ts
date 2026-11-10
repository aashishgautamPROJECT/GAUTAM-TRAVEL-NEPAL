export interface District {
  id: string;
  name: string;
  nepali_name: string;
  slug: string;
  description: string;
  best_months: string;
  cover_image_url: string;
  image_caption: string;
  image_credit: string;
  is_published: boolean;
}

export interface HotelRoom {
  id: string;
  hotel_id: string;
  room_type: string;
  price_per_night_npr: number;
  rooms_available: number;
  description?: string;
}

export interface PartnerHotel {
  id: string;
  district_id: string;
  name: string;
  nepali_name?: string;
  location_area: string;
  rating: number;
  description: string;
  contact_phone: string;
  contact_email: string;
  commission_rate: number;
  image_url: string;
  image_caption: string;
  image_credit: string;
  is_active: boolean;
  hotel_rooms?: HotelRoom[];
  lowest_price?: number | null;
}

export interface Experience {
  id: string;
  district_id: string;
  title: string;
  nepali_title?: string;
  category: 'sightseeing' | 'adventure' | 'wildlife' | 'culture' | 'food' | 'transport';
  description: string;
  duration_hours: number;
  price_npr: number;
  needs_booking: boolean;
  image_url: string;
  image_caption: string;
  image_credit: string;
  is_published: boolean;
}

export interface PlanItem {
  id?: string;
  plan_id?: string;
  item_type: 'hotel' | 'experience';
  hotel_room_id?: string | null;
  experience_id?: string | null;
  day_number: number;
  price_npr: number;
  hotel_name?: string;
  room_type?: string;
  experience_title?: string;
}

export interface Plan {
  id: string;
  customer_id?: string | null;
  district_id: string;
  district_name?: string;
  nights: number;
  start_date: string;
  status: 'draft' | 'pending_payment' | 'paid' | 'confirmed' | 'cancelled';
  total_npr: number;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  payment_provider?: string;
  items?: PlanItem[];
}

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  preferred_language?: string;
  preferred_currency?: string;
  role?: 'admin' | 'customer';
}

export interface Enquiry {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at?: string;
}

