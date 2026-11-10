import { supabase, isSupabaseConfigured } from './supabase';
import {
  fallbackDistricts,
  fallbackHotels,
  fallbackRooms,
  fallbackExperiences,
  fallbackPlans
} from '../data/fallback';
import { District, PartnerHotel, HotelRoom, Experience, Plan, PlanItem } from '../types';

export const isUsingDemoData = !isSupabaseConfigured;

/**
 * Fetch published districts
 */
export async function getDistricts(): Promise<{ data: District[]; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { data: fallbackDistricts.filter(d => d.is_published), error: null };
  }

  try {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('is_published', true)
      .order('name');

    if (error) throw error;
    if (data && data.length > 0) {
      return { data: data as District[], error: null };
    }
    return { data: fallbackDistricts, error: null };
  } catch (err: any) {
    console.warn("Supabase fetch failed, falling back to local dataset:", err.message);
    return { data: fallbackDistricts, error: null };
  }
}

/**
 * Fetch district by slug
 */
export async function getDistrictBySlug(slug: string): Promise<{ data: District | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    const district = fallbackDistricts.find(d => d.slug === slug);
    return { data: district || null, error: district ? null : 'District not found' };
  }

  try {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) throw error;
    return { data: data as District, error: null };
  } catch (err: any) {
    console.warn("Using fallback district:", err.message);
    const d = fallbackDistricts.find(d => d.slug === slug);
    return { data: d || null, error: d ? null : 'District not found' };
  }
}

/**
 * Fetch active partner hotels for a district (with lowest price per night from rooms)
 */
export async function getHotelsForDistrict(districtId: string): Promise<{ data: PartnerHotel[]; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    const hotels = fallbackHotels.filter(h => h.district_id === districtId && h.is_active);
    const hotelsWithPrice = hotels.map(h => {
      const rooms = fallbackRooms.filter(r => r.hotel_id === h.id);
      const lowest_price = rooms.length > 0 ? Math.min(...rooms.map(r => r.price_per_night_npr)) : null;
      return { ...h, hotel_rooms: rooms, lowest_price };
    });
    return { data: hotelsWithPrice, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('partner_hotels')
      .select(`
        *,
        hotel_rooms (id, hotel_id, room_type, price_per_night_npr, rooms_available, description)
      `)
      .eq('district_id', districtId)
      .eq('is_active', true);

    if (error) throw error;

    if (data && data.length > 0) {
      const formatted: PartnerHotel[] = data.map((hotel: any) => {
        const rooms: HotelRoom[] = hotel.hotel_rooms || [];
        const lowest = rooms.length > 0 ? Math.min(...rooms.map(r => r.price_per_night_npr)) : null;
        return { ...hotel, hotel_rooms: rooms, lowest_price: lowest };
      });
      return { data: formatted, error: null };
    }

    // Fallback if empty
    const hotels = fallbackHotels.filter(h => h.district_id === districtId && h.is_active);
    const hotelsWithPrice = hotels.map(h => {
      const rooms = fallbackRooms.filter(r => r.hotel_id === h.id);
      const lowest_price = rooms.length > 0 ? Math.min(...rooms.map(r => r.price_per_night_npr)) : null;
      return { ...h, hotel_rooms: rooms, lowest_price };
    });
    return { data: hotelsWithPrice, error: null };
  } catch (err: any) {
    console.warn("Fallback hotels used:", err.message);
    const hotels = fallbackHotels.filter(h => h.district_id === districtId && h.is_active);
    const hotelsWithPrice = hotels.map(h => {
      const rooms = fallbackRooms.filter(r => r.hotel_id === h.id);
      const lowest_price = rooms.length > 0 ? Math.min(...rooms.map(r => r.price_per_night_npr)) : null;
      return { ...h, hotel_rooms: rooms, lowest_price };
    });
    return { data: hotelsWithPrice, error: null };
  }
}

/**
 * Fetch rooms for a hotel
 */
export async function getRoomsForHotel(hotelId: string): Promise<{ data: HotelRoom[]; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    const rooms = fallbackRooms.filter(r => r.hotel_id === hotelId);
    return { data: rooms, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('hotel_rooms')
      .select('*')
      .eq('hotel_id', hotelId);

    if (error) throw error;
    return { data: (data as HotelRoom[]) || [], error: null };
  } catch (err: any) {
    const rooms = fallbackRooms.filter(r => r.hotel_id === hotelId);
    return { data: rooms, error: null };
  }
}

/**
 * Fetch published experiences for a district
 */
export async function getExperiencesForDistrict(districtId: string): Promise<{ data: Experience[]; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    const exps = fallbackExperiences.filter(e => e.district_id === districtId && e.is_published);
    return { data: exps, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('district_id', districtId)
      .eq('is_published', true);

    if (error) throw error;
    if (data && data.length > 0) {
      return { data: data as Experience[], error: null };
    }
    const exps = fallbackExperiences.filter(e => e.district_id === districtId && e.is_published);
    return { data: exps, error: null };
  } catch (err: any) {
    console.warn("Fallback experiences used:", err.message);
    const exps = fallbackExperiences.filter(e => e.district_id === districtId && e.is_published);
    return { data: exps, error: null };
  }
}

/**
 * Create booking plan, line items, and payment intent
 */
export async function createBookingPlan(payload: {
  customer_id?: string | null;
  district_id: string;
  district_name?: string;
  nights: number;
  start_date: string;
  total_npr: number;
  items: PlanItem[];
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  payment_provider: string;
}): Promise<{ data: Plan | null; error: string | null }> {
  const planRef = `MJ-${Math.floor(100000 + Math.random() * 900000)}`;

  if (!isSupabaseConfigured || !supabase) {
    const localPlans: Plan[] = JSON.parse(localStorage.getItem('mj_plans') || '[]');
    const newPlan: Plan = {
      id: planRef,
      customer_id: payload.customer_id || 'guest',
      district_id: payload.district_id,
      district_name: payload.district_name || 'Nepal',
      nights: payload.nights,
      start_date: payload.start_date,
      status: 'pending_payment',
      total_npr: payload.total_npr,
      created_at: new Date().toISOString(),
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_email: payload.customer_email,
      payment_provider: payload.payment_provider,
      items: payload.items
    };
    localPlans.unshift(newPlan);
    localStorage.setItem('mj_plans', JSON.stringify(localPlans));
    return { data: newPlan, error: null };
  }

  try {
    // 1. Insert plan
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert({
        id: planRef,
        customer_id: payload.customer_id || null,
        district_id: payload.district_id,
        nights: payload.nights,
        start_date: payload.start_date,
        status: 'pending_payment',
        total_npr: payload.total_npr,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        payment_provider: payload.payment_provider
      })
      .select()
      .single();

    if (planError) throw planError;

    // 2. Insert items
    if (payload.items && payload.items.length > 0) {
      const itemsToInsert = payload.items.map(item => ({
        plan_id: planData.id,
        item_type: item.item_type,
        hotel_room_id: item.hotel_room_id || null,
        experience_id: item.experience_id || null,
        day_number: item.day_number,
        price_npr: item.price_npr
      }));

      await supabase.from('plan_items').insert(itemsToInsert);
    }

    // 3. Record payment initiation
    await supabase.from('payments').insert({
      plan_id: planData.id,
      provider: payload.payment_provider,
      amount_npr: payload.total_npr,
      status: 'initiated',
      provider_reference: planRef
    });

    const fullPlan: Plan = {
      ...planData,
      district_name: payload.district_name,
      items: payload.items
    };

    return { data: fullPlan, error: null };
  } catch (err: any) {
    console.error("Supabase booking creation error, falling back locally:", err.message);
    const localPlans: Plan[] = JSON.parse(localStorage.getItem('mj_plans') || '[]');
    const fallbackPlan: Plan = {
      id: planRef,
      customer_id: payload.customer_id || 'guest',
      district_id: payload.district_id,
      district_name: payload.district_name,
      nights: payload.nights,
      start_date: payload.start_date,
      status: 'pending_payment',
      total_npr: payload.total_npr,
      created_at: new Date().toISOString(),
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      payment_provider: payload.payment_provider,
      items: payload.items
    };
    localPlans.unshift(fallbackPlan);
    localStorage.setItem('mj_plans', JSON.stringify(localPlans));
    return { data: fallbackPlan, error: null };
  }
}

/**
 * Fetch plans for a user
 */
export async function getUserPlans(userId: string): Promise<{ data: Plan[]; error: string | null }> {
  const localPlans: Plan[] = JSON.parse(localStorage.getItem('mj_plans') || '[]');

  if (!isSupabaseConfigured || !supabase) {
    return { data: [...localPlans, ...fallbackPlans], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*, districts(name)')
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      const mapped: Plan[] = data.map((p: any) => ({
        ...p,
        district_name: p.districts?.name || 'District'
      }));
      return { data: [...localPlans, ...mapped], error: null };
    }
    return { data: [...localPlans, ...fallbackPlans], error: null };
  } catch (err: any) {
    return { data: [...localPlans, ...fallbackPlans], error: null };
  }
}

/**
 * Submit general enquiry
 */
export async function submitEnquiry(enquiry: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) {
    const enquiries = JSON.parse(localStorage.getItem('mj_enquiries') || '[]');
    enquiries.push({ ...enquiry, id: Date.now() });
    localStorage.setItem('mj_enquiries', JSON.stringify(enquiries));
    return { success: true, message: "Your enquiry has been received by our desk. We will respond promptly via WhatsApp or email." };
  }

  try {
    const { error } = await supabase.from('enquiries').insert([enquiry]);
    if (error) throw error;
    return { success: true, message: "Your enquiry has been received by our desk. We will respond promptly via WhatsApp or email." };
  } catch (err: any) {
    console.warn("Saving enquiry locally:", err.message);
    const enquiries = JSON.parse(localStorage.getItem('mj_enquiries') || '[]');
    enquiries.push({ ...enquiry, id: Date.now() });
    localStorage.setItem('mj_enquiries', JSON.stringify(enquiries));
    return { success: true, message: "Your enquiry has been received by our desk. We will respond promptly via WhatsApp or email." };
  }
}

/**
 * ADMIN: Get all customer booking plans
 */
export async function getAllPlans(): Promise<{ data: Plan[]; error: string | null }> {
  const localPlans: Plan[] = JSON.parse(localStorage.getItem('mj_plans') || '[]');

  if (!isSupabaseConfigured || !supabase) {
    return { data: [...localPlans, ...fallbackPlans], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*, districts(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      const mapped: Plan[] = data.map((p: any) => ({
        ...p,
        district_name: p.districts?.name || 'District'
      }));
      return { data: [...localPlans, ...mapped], error: null };
    }
    return { data: [...localPlans, ...fallbackPlans], error: null };
  } catch (err: any) {
    return { data: [...localPlans, ...fallbackPlans], error: null };
  }
}

/**
 * ADMIN: Update plan booking status
 */
export async function updatePlanStatus(
  planId: string,
  newStatus: 'draft' | 'pending_payment' | 'paid' | 'confirmed' | 'cancelled'
): Promise<{ success: boolean; error: string | null }> {
  // Update local plans if present
  const localPlans: Plan[] = JSON.parse(localStorage.getItem('mj_plans') || '[]');
  const idx = localPlans.findIndex(p => p.id === planId);
  if (idx !== -1) {
    localPlans[idx].status = newStatus;
    localStorage.setItem('mj_plans', JSON.stringify(localPlans));
  }

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('plans')
      .update({ status: newStatus })
      .eq('id', planId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * ADMIN: Get all contact enquiries
 */
export async function getAllEnquiries(): Promise<{ data: any[]; error: string | null }> {
  const localEnquiries = JSON.parse(localStorage.getItem('mj_enquiries') || '[]');

  if (!isSupabaseConfigured || !supabase) {
    return { data: localEnquiries, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || localEnquiries, error: null };
  } catch (err: any) {
    return { data: localEnquiries, error: null };
  }
}

/**
 * ADMIN: Update hotel room price or available count
 */
export async function updateHotelRoom(
  roomId: string,
  updates: { price_per_night_npr?: number; rooms_available?: number }
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: true, error: null };
  }
  try {
    const { error } = await supabase
      .from('hotel_rooms')
      .update(updates)
      .eq('id', roomId);
    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

