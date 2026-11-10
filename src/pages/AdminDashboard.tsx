import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllPlans, updatePlanStatus, getAllEnquiries, getDistricts, getHotelsForDistrict, updateHotelRoom } from '../lib/api';
import { formatNPR, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { Plan, District, PartnerHotel, HotelRoom } from '../types';

export default function AdminDashboard() {
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Tab state: 'bookings' | 'enquiries' | 'rates'
  const [activeTab, setActiveTab] = useState<'bookings' | 'enquiries' | 'rates'>('bookings');

  // Bookings state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  // Enquiries state
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  // Hotel room inventory state
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [hotels, setHotels] = useState<PartnerHotel[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  // Edit room modal/form state
  const [editingRoom, setEditingRoom] = useState<HotelRoom | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editAvailable, setEditAvailable] = useState<number>(0);
  const [roomSaveSuccess, setRoomSaveSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      loadPlans();
      loadDistricts();
    }
  }, [isAdmin]);

  const loadPlans = async () => {
    setPlansLoading(true);
    const { data } = await getAllPlans();
    if (data) setPlans(data);
    setPlansLoading(false);
  };

  const loadEnquiries = async () => {
    setEnquiriesLoading(true);
    const { data } = await getAllEnquiries();
    if (data) setEnquiries(data);
    setEnquiriesLoading(false);
  };

  const loadDistricts = async () => {
    const { data } = await getDistricts();
    if (data && data.length > 0) {
      setDistricts(data);
      setSelectedDistrictId(data[0].id);
      loadHotels(data[0].id);
    }
  };

  const loadHotels = async (districtId: string) => {
    setRoomsLoading(true);
    const { data } = await getHotelsForDistrict(districtId);
    if (data) setHotels(data);
    setRoomsLoading(false);
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    loadHotels(distId);
  };

  const handleStatusChange = async (planId: string, newStatus: any) => {
    setUpdateMsg('');
    const res = await updatePlanStatus(planId, newStatus);
    if (res.success) {
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: newStatus } : p));
      setUpdateMsg(`Booking ${planId} status updated to ${newStatus}.`);
    } else {
      setUpdateMsg(`Failed to update status: ${res.error}`);
    }
  };

  const handleOpenRoomEdit = (room: HotelRoom) => {
    setEditingRoom(room);
    setEditPrice(room.price_per_night_npr);
    setEditAvailable(room.rooms_available);
    setRoomSaveSuccess('');
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    const res = await updateHotelRoom(editingRoom.id, {
      price_per_night_npr: Number(editPrice),
      rooms_available: Number(editAvailable)
    });

    if (res.success) {
      setRoomSaveSuccess(`Room "${editingRoom.room_type}" updated successfully.`);
      // Update local hotel rooms
      setHotels(prev => prev.map(h => ({
        ...h,
        hotel_rooms: h.hotel_rooms?.map(r => r.id === editingRoom.id ? { ...r, price_per_night_npr: editPrice, rooms_available: editAvailable } : r)
      })));
      setTimeout(() => setEditingRoom(null), 1200);
    } else {
      setRoomSaveSuccess(`Error: ${res.error}`);
    }
  };

  // Filter plans
  const filteredPlans = plans.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = !searchQuery || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.customer_phone && p.customer_phone.includes(searchQuery)) ||
      (p.district_name && p.district_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate high level metrics
  const totalBookings = plans.length;
  const pendingCount = plans.filter(p => p.status === 'pending_payment').length;
  const confirmedCount = plans.filter(p => p.status === 'confirmed').length;
  const totalRevenueNPR = plans.reduce((sum, p) => p.status !== 'cancelled' ? sum + (p.total_npr || 0) : sum, 0);

  // Guard: if checking auth status, show loading state
  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-2 border-[#2F5D7C] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
          Verifying Administrator Privileges...
        </p>
      </div>
    );
  }

  // Guard: if not an authorized administrator, strictly deny access
  if (!user || !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-white border border-[#D9D3C7] p-8 rounded-[4px] shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-700 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-red-700 font-bold px-2.5 py-0.5 bg-red-50 rounded-[2px] border border-red-200 inline-block">
              Restricted Area &bull; Access Denied
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F2A2E]">
              Administrator Authentication Required
            </h1>
            <p className="text-xs text-[#4A5B60] leading-relaxed">
              The Gautam Travels Management Console contains sensitive traveler itineraries, booking ledgers, and partner rate controls. It is restricted exclusively to authorized administrators.
            </p>
            {user ? (
              <div className="p-3 bg-[#FAF7F0] border border-[#D9D3C7] rounded-[4px] text-xs text-[#1F2A2E] text-left">
                <span className="text-[10px] uppercase font-semibold text-[#728388] block">Current Account:</span>
                <span className="font-mono font-medium">{user.email || profile?.email}</span>
                <span className="text-[11px] text-red-700 block mt-1">This account does not hold administrator permissions.</span>
              </div>
            ) : null}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center text-xs">
            {user ? (
              <>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/login?redirect=/admin');
                  }}
                  className="px-5 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white font-semibold rounded-[4px] transition-colors"
                >
                  Sign Out &amp; Use Admin Account
                </button>
                <Link
                  to="/"
                  className="px-5 py-2.5 border border-[#D9D3C7] text-[#1F2A2E] hover:bg-[#FAF7F0] font-semibold rounded-[4px] transition-colors text-center"
                >
                  Return to Home
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login?redirect=/admin"
                  className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white font-semibold rounded-[4px] transition-colors text-center"
                >
                  Sign in with Admin Credentials &rarr;
                </Link>
                <Link
                  to="/"
                  className="px-5 py-2.5 border border-[#D9D3C7] text-[#1F2A2E] hover:bg-[#FAF7F0] font-semibold rounded-[4px] transition-colors text-center"
                >
                  Return to Home
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#D9D3C7] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
              Agency Operations Console
            </span>
            <span className="px-2 py-0.5 bg-[#1F2A2E] text-white text-[10px] uppercase font-bold rounded-[2px]">
              Admin
            </span>
            <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded-[2px]">
              {user?.email || profile?.email}
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F2A2E] mt-1">
            Gautam Travels Management Desk
          </h1>
          <p className="text-xs text-[#4A5B60] mt-1">
            Manage customer bookings, respond to regional enquiries, and update partner hotel rates.
          </p>
        </div>

        {/* Tab navigation & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex border border-[#D9D3C7] bg-[#FAF7F0] rounded-[4px] p-1 text-xs">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-semibold rounded-[2px] transition-colors ${
                activeTab === 'bookings' ? 'bg-[#1F2A2E] text-white' : 'text-[#4A5B60] hover:text-[#1F2A2E]'
              }`}
            >
              Bookings ({totalBookings})
            </button>
            <button
              onClick={() => { setActiveTab('enquiries'); loadEnquiries(); }}
              className={`px-4 py-2 font-semibold rounded-[2px] transition-colors ${
                activeTab === 'enquiries' ? 'bg-[#1F2A2E] text-white' : 'text-[#4A5B60] hover:text-[#1F2A2E]'
              }`}
            >
              Enquiries
            </button>
            <button
              onClick={() => setActiveTab('rates')}
              className={`px-4 py-2 font-semibold rounded-[2px] transition-colors ${
                activeTab === 'rates' ? 'bg-[#1F2A2E] text-white' : 'text-[#4A5B60] hover:text-[#1F2A2E]'
              }`}
            >
              Lodge Inventory &amp; Rates
            </button>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="px-3 py-2 text-xs border border-[#D9D3C7] bg-white hover:bg-red-50 text-[#728388] hover:text-red-700 font-medium rounded-[4px] transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D9D3C7] p-5 rounded-[4px]">
          <span className="text-[11px] uppercase tracking-wider text-[#728388] block font-semibold">Total Plans</span>
          <span className="font-serif text-3xl font-semibold text-[#1F2A2E] block mt-1">{totalBookings}</span>
          <span className="text-[10px] text-[#4A5B60]">Across Pokhara & Chitwan</span>
        </div>

        <div className="bg-white border border-[#D9D3C7] p-5 rounded-[4px]">
          <span className="text-[11px] uppercase tracking-wider text-amber-800 block font-semibold">Pending Verification</span>
          <span className="font-serif text-3xl font-semibold text-amber-900 block mt-1">{pendingCount}</span>
          <span className="text-[10px] text-[#4A5B60]">Awaiting SMS / payment QR</span>
        </div>

        <div className="bg-white border border-[#D9D3C7] p-5 rounded-[4px]">
          <span className="text-[11px] uppercase tracking-wider text-emerald-800 block font-semibold">Confirmed Stays</span>
          <span className="font-serif text-3xl font-semibold text-emerald-900 block mt-1">{confirmedCount}</span>
          <span className="text-[10px] text-[#4A5B60]">Room and guides locked</span>
        </div>

        <div className="bg-white border border-[#D9D3C7] p-5 rounded-[4px]">
          <span className="text-[11px] uppercase tracking-wider text-[#2F5D7C] block font-semibold">Scheduled Volume</span>
          <span className="font-serif text-3xl font-semibold text-[#2F5D7C] block mt-1">{formatNPR(totalRevenueNPR)}</span>
          <span className="text-[10px] text-[#4A5B60]">Gross tariff volume</span>
        </div>
      </div>

      {/* TAB 1: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          
          {updateMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-[4px]">
              {updateMsg}
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white border border-[#D9D3C7] p-4 rounded-[4px] flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by Ref, Name, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-xs bg-[#FAF7F0] focus:border-[#2F5D7C]"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#728388] font-semibold">Filter Status:</span>
              {['all', 'pending_payment', 'confirmed', 'paid', 'cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-[2px] capitalize transition-colors ${
                    statusFilter === s ? 'bg-[#1F2A2E] text-white font-bold' : 'bg-[#FAF7F0] text-[#4A5B60] hover:bg-[#E8E0D0]'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-[#D9D3C7] rounded-[4px] overflow-x-auto">
            {plansLoading ? (
              <div className="p-12 text-center text-xs text-[#4A5B60]">Loading customer itineraries...</div>
            ) : filteredPlans.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#4A5B60] italic">No matching booking plans found.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F0] border-b border-[#D9D3C7] uppercase tracking-wider text-[#728388] font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">District & Dates</th>
                    <th className="py-3 px-4">Payable</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D3C7]">
                  {filteredPlans.map(plan => (
                    <tr key={plan.id} className="hover:bg-[#FAF7F0]/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1F2A2E]">
                        {plan.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <strong className="block text-[#1F2A2E]">{plan.customer_name || 'Guest Booking'}</strong>
                        <span className="text-[11px] text-[#728388] font-mono">{plan.customer_phone || 'No phone'}</span>
                        {plan.customer_email && <span className="text-[10px] text-[#728388] block">{plan.customer_email}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#1F2A2E] block">{plan.district_name || 'Nepal District'}</span>
                        <span className="text-[11px] text-[#4A5B60]">{plan.nights} nights &bull; starts {formatDate(plan.start_date)}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#2F5D7C]">
                        {formatNPR(plan.total_npr)}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-[#4A5B60]">
                        {plan.payment_provider || 'esewa'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-[2px] text-[10px] uppercase font-bold tracking-wider ${
                          plan.status === 'confirmed' ? 'bg-emerald-100 text-emerald-900' :
                          plan.status === 'pending_payment' ? 'bg-amber-100 text-amber-900' :
                          plan.status === 'paid' ? 'bg-blue-100 text-blue-900' :
                          plan.status === 'cancelled' ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <select
                          value={plan.status}
                          onChange={(e) => handleStatusChange(plan.id, e.target.value)}
                          className="border border-[#D9D3C7] bg-[#FAF7F0] p-1 rounded-[2px] text-[11px] font-medium"
                        >
                          <option value="pending_payment">Set Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="paid">Set Paid</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-white border border-[#D9D3C7] rounded-[4px] p-6 space-y-4">
          <div className="flex justify-between items-baseline border-b border-[#D9D3C7] pb-3">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#1F2A2E]">Customer Contact Enquiries</h2>
              <p className="text-xs text-[#4A5B60]">Messages dispatched from the /contact form.</p>
            </div>
            <button
              onClick={loadEnquiries}
              className="text-xs uppercase tracking-wider text-[#2F5D7C] font-semibold hover:underline"
            >
              Refresh
            </button>
          </div>

          {enquiriesLoading ? (
            <div className="p-8 text-center text-xs text-[#4A5B60]">Loading enquiries...</div>
          ) : enquiries.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#4A5B60] italic">No customer enquiries received yet.</div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq, idx) => (
                <div key={idx} className="border border-[#D9D3C7] p-4 rounded-[4px] bg-[#FAF7F0] space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-lg font-semibold text-[#1F2A2E]">{enq.name}</h4>
                    <span className="text-[10px] text-[#728388] font-mono">{enq.created_at ? formatDate(enq.created_at) : 'Recent'}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-[#4A5B60]">
                    <span>Email: <strong>{enq.email}</strong></span>
                    <span>Phone: <strong className="font-mono">{enq.phone}</strong></span>
                    <a
                      href={`https://wa.me/${enq.phone?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 underline font-semibold"
                    >
                      Open in WhatsApp &rarr;
                    </a>
                  </div>
                  <p className="text-xs text-[#1F2A2E] bg-white p-3 border border-[#D9D3C7] rounded-[2px] leading-relaxed">
                    {enq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOTEL ROOMS INVENTORY & TARIFF MANAGER */}
      {activeTab === 'rates' && (
        <div className="bg-white border border-[#D9D3C7] rounded-[4px] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-[#D9D3C7] pb-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#1F2A2E]">Partner Hotel Inventory & Nightly Rates</h2>
              <p className="text-xs text-[#4A5B60]">Update room pricing in NPR and available room allocations.</p>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#728388] font-semibold">Select District:</span>
              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="p-1.5 border border-[#D9D3C7] bg-[#FAF7F0] rounded-[2px] text-xs font-semibold"
              >
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.nepali_name})</option>
                ))}
              </select>
            </div>
          </div>

          {roomsLoading ? (
            <div className="p-8 text-center text-xs text-[#4A5B60]">Loading partner properties...</div>
          ) : (
            <div className="space-y-6">
              {hotels.map(hotel => (
                <div key={hotel.id} className="border border-[#D9D3C7] rounded-[4px] p-4 bg-[#FAF7F0]/60 space-y-3">
                  <div className="flex justify-between items-baseline border-b border-[#D9D3C7] pb-2">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#1F2A2E]">{hotel.name}</h3>
                      <p className="text-xs text-[#728388]">{hotel.location_area} &bull; {hotel.contact_phone}</p>
                    </div>
                    <span className="text-xs text-[#4A5B60] font-medium">Partner Commission: {Number(hotel.commission_rate * 100).toFixed(0)}%</span>
                  </div>

                  <div className="space-y-2">
                    {hotel.hotel_rooms?.map(room => (
                      <div key={room.id} className="bg-white border border-[#D9D3C7] p-3 rounded-[4px] flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-sm font-serif text-[#1F2A2E] block">{room.room_type}</strong>
                          <span className="text-[#728388] text-[11px]">{room.description}</span>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <span className="text-sm font-semibold text-[#1F2A2E] block">{formatNPR(room.price_per_night_npr)}</span>
                            <span className="text-[10px] text-[#728388]">/ night</span>
                          </div>

                          <div className="text-right">
                            <span className={`text-xs font-bold block ${room.rooms_available === 0 ? 'text-red-700' : 'text-emerald-800'}`}>
                              {room.rooms_available === 0 ? 'Sold Out (0)' : `${room.rooms_available} Available`}
                            </span>
                          </div>

                          <button
                            onClick={() => handleOpenRoomEdit(room)}
                            className="px-3 py-1 bg-[#FAF7F0] hover:bg-[#E8E0D0] border border-[#D9D3C7] text-xs font-semibold rounded-[4px]"
                          >
                            Edit Rate / Allotment
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDIT ROOM MODAL */}
          {editingRoom && (
            <div className="fixed inset-0 z-50 bg-[#1F2A2E]/60 flex items-center justify-center p-4">
              <div className="bg-white border border-[#D9D3C7] max-w-md w-full p-6 rounded-[4px] shadow-xl space-y-4">
                <div className="flex justify-between items-start border-b border-[#D9D3C7] pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#728388] font-semibold">Inventory Adjustment</span>
                    <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">{editingRoom.room_type}</h3>
                  </div>
                  <button onClick={() => setEditingRoom(null)} className="text-xl">&times;</button>
                </div>

                {roomSaveSuccess && (
                  <p className="p-2 text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-[2px]">
                    {roomSaveSuccess}
                  </p>
                )}

                <form onSubmit={handleSaveRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#728388] mb-1">
                      Price per Night in NPR (रु)
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#728388] mb-1">
                      Rooms Available (0 = Sold out)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editAvailable}
                      onChange={(e) => setEditAvailable(Number(e.target.value))}
                      className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0]"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingRoom(null)}
                      className="px-4 py-2 border border-[#D9D3C7] text-xs font-semibold rounded-[4px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs font-semibold rounded-[4px]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
