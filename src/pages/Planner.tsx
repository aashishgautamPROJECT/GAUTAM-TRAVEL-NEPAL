import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getDistricts, getHotelsForDistrict, getExperiencesForDistrict, createBookingPlan } from '../lib/api';
import { formatNPR, addDays, formatDate, isValidNepalPhone } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { District, PartnerHotel, HotelRoom, Experience, PlanItem, Plan } from '../types';

export default function Planner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  // Multi-step (1 to 6)
  const [currentStep, setCurrentStep] = useState(1);

  // Data Collections
  const [districts, setDistricts] = useState<District[]>([]);
  const [hotels, setHotels] = useState<PartnerHotel[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState<Plan | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Planner selections
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [nights, setNights] = useState(3);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Hotel Selection
  const [wantsHotel, setWantsHotel] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<PartnerHotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

  // Experiences Selection: map of expId -> { experience, dayNumber }
  const [selectedExperiences, setSelectedExperiences] = useState<Record<string, { experience: Experience; dayNumber: number }>>({});

  // Contact Form & Payment Options
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('+977');
  const [contactEmail, setContactEmail] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'esewa' | 'khalti' | 'card' | 'bank'>('esewa');
  const [phoneError, setPhoneError] = useState('');

  // Pre-fill user profile info if logged in
  useEffect(() => {
    if (profile || user) {
      if (profile?.full_name) setContactName(profile.full_name);
      if (profile?.phone) setContactPhone(profile.phone);
      if (user?.email) setContactEmail(user.email);
    }
  }, [profile, user]);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      const { data: dData } = await getDistricts();
      if (dData && dData.length > 0) {
        setDistricts(dData);
        // Check query param
        const queryDistrict = searchParams.get('district');
        const matched = dData.find(d => d.id === queryDistrict || d.slug === queryDistrict);
        const activeDistrictId = matched ? matched.id : dData[0].id;
        setSelectedDistrictId(activeDistrictId);

        const qDate = searchParams.get('date');
        if (qDate) setStartDate(qDate);

        const qNights = searchParams.get('nights');
        if (qNights) setNights(Number(qNights));

        await loadDistrictDetails(activeDistrictId);
      }
      setLoading(false);
    }
    init();
  }, [searchParams]);

  const loadDistrictDetails = async (distId: string) => {
    const [hRes, eRes] = await Promise.all([
      getHotelsForDistrict(distId),
      getExperiencesForDistrict(distId)
    ]);
    setHotels(hRes.data || []);
    setExperiences(eRes.data || []);
    // Reset selection if district changes
    setSelectedHotel(null);
    setSelectedRoom(null);
    setSelectedExperiences({});
  };

  const handleDistrictChange = async (distId: string) => {
    setSelectedDistrictId(distId);
    setLoading(true);
    await loadDistrictDetails(distId);
    setLoading(false);
  };

  // Calculations
  const endDate = addDays(startDate, nights);
  const activeDistrict = districts.find(d => d.id === selectedDistrictId);

  const hotelTotal = (wantsHotel && selectedRoom) ? selectedRoom.price_per_night_npr * nights : 0;
  
  const experiencesTotal = Object.values(selectedExperiences).reduce(
    (sum, item) => sum + (item.experience.price_npr || 0),
    0
  );

  const grandTotalNPR = hotelTotal + experiencesTotal;

  // Toggle experience selection
  const handleToggleExperience = (exp: Experience) => {
    setSelectedExperiences(prev => {
      const copy = { ...prev };
      if (copy[exp.id]) {
        delete copy[exp.id];
      } else {
        copy[exp.id] = { experience: exp, dayNumber: 1 };
      }
      return copy;
    });
  };

  const handleAssignDay = (expId: string, day: number) => {
    setSelectedExperiences(prev => {
      if (!prev[expId]) return prev;
      return {
        ...prev,
        [expId]: {
          ...prev[expId],
          dayNumber: Number(day)
        }
      };
    });
  };

  // Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Phone validation
    if (!isValidNepalPhone(contactPhone)) {
      setPhoneError("Phone number must follow Nepal format: +977 followed by 8 to 10 digits (e.g. +9779841234567).");
      return;
    }
    setPhoneError('');

    const planItems: PlanItem[] = [];
    if (wantsHotel && selectedRoom) {
      planItems.push({
        item_type: 'hotel',
        hotel_room_id: selectedRoom.id,
        day_number: 1,
        price_npr: hotelTotal,
        hotel_name: selectedHotel?.name,
        room_type: selectedRoom.room_type
      });
    }

    Object.values(selectedExperiences).forEach(entry => {
      planItems.push({
        item_type: 'experience',
        experience_id: entry.experience.id,
        day_number: entry.dayNumber,
        price_npr: entry.experience.price_npr,
        experience_title: entry.experience.title
      });
    });

    const payload = {
      customer_id: user?.id || null,
      district_id: selectedDistrictId,
      district_name: activeDistrict?.name,
      nights,
      start_date: startDate,
      total_npr: grandTotalNPR,
      items: planItems,
      customer_name: contactName,
      customer_phone: contactPhone,
      customer_email: contactEmail,
      payment_provider: paymentProvider
    };

    const res = await createBookingPlan(payload);
    if (res.data) {
      setBookingSuccess(res.data);
    } else {
      setSubmitError("There was a problem initiating your plan. Please check your network and try again.");
    }
  };

  const stepsList = [
    { num: 1, name: "Destination" },
    { num: 2, name: "Nights & Dates" },
    { num: 3, name: "Hotel" },
    { num: 4, name: "Experiences" },
    { num: 5, name: "Review Plan" },
    { num: 6, name: "Contact & Settle" }
  ];

  if (bookingSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white border border-[#D9D3C7] p-8 rounded-[4px] shadow-xs space-y-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 flex items-center justify-center rounded-full text-xl font-bold">
            ✓
          </div>
          <span className="text-xs uppercase tracking-widest text-[#728388] block font-semibold">
            Itinerary Created &bull; Pending Payment Authorization
          </span>
          <h2 className="font-serif text-3xl font-semibold text-[#1F2A2E]">
            Dhanyabad, {contactName || 'Traveller'}!
          </h2>
          <p className="text-sm text-[#4A5B60] leading-relaxed font-sans">
            Your journey plan for <strong>{activeDistrict?.name} ({activeDistrict?.nepali_name})</strong> has been logged with booking reference:
          </p>
          <div className="bg-[#FAF7F0] p-4 border border-[#D9D3C7] rounded-[4px] flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-[#4A5B60] font-semibold">Plan Reference Code:</span>
            <span className="font-mono text-xl font-bold text-[#1F2A2E]">{bookingSuccess.id}</span>
          </div>

          <div className="text-xs space-y-2 text-[#4A5B60] border-t border-[#D9D3C7] pt-4">
            <p><strong>Total NPR Payable:</strong> {formatNPR(grandTotalNPR)}</p>
            <p><strong>Chosen Provider:</strong> {paymentProvider.toUpperCase()}</p>
            <p className="leading-relaxed">
              <strong>Next Step:</strong> Our team will confirm partner allotments and send an SMS/WhatsApp verification to <strong>{contactPhone}</strong> with direct {paymentProvider === 'esewa' ? 'eSewa merchant payment QR' : paymentProvider === 'khalti' ? 'Khalti direct invoice' : paymentProvider === 'bank' ? 'Himalayan Bank official transfer coordinates' : 'secure international card invoice'}.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/account')}
              className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
            >
              View in My Account
            </button>
            <button
              onClick={() => {
                setBookingSuccess(null);
                setCurrentStep(1);
              }}
              className="px-6 py-2.5 border border-[#D9D3C7] hover:bg-[#FAF7F0] text-xs uppercase tracking-wider font-semibold rounded-[4px]"
            >
              Plan Another Stay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
          Interactive Itinerary Architect
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F2A2E] mt-1">
          Plan Your Stay in Nepal
        </h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-10 overflow-x-auto pb-2">
        <div className="flex items-center min-w-[580px] justify-between border-b border-[#D9D3C7] pb-4">
          {stepsList.map((step) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                onClick={() => setCurrentStep(step.num)}
                className="flex items-center space-x-2 text-left focus:outline-none group"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCurrent 
                    ? 'bg-[#2F5D7C] text-white' 
                    : isCompleted 
                    ? 'bg-[#1F2A2E] text-[#F5F0E6]' 
                    : 'bg-[#E8E0D0] text-[#728388]'
                }`}>
                  {isCompleted ? '✓' : step.num}
                </span>
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  isCurrent ? 'text-[#2F5D7C] font-bold' : isCompleted ? 'text-[#1F2A2E]' : 'text-[#728388]'
                }`}>
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Step Content */}
        <div className="lg:col-span-8 bg-white border border-[#D9D3C7] p-6 sm:p-8 rounded-[4px]">
          
          {/* STEP 1: DESTINATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs text-[#D98E2B] uppercase tracking-wider font-semibold">Step 01</span>
                <h2 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Choose your district</h2>
                <p className="text-xs text-[#4A5B60] font-sans mt-1">
                  Select one geographic valley base for this journey. You can design additional districts sequentially.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {districts.map((d) => {
                  const isSelected = selectedDistrictId === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleDistrictChange(d.id)}
                      className={`cursor-pointer p-4 border rounded-[4px] transition-all ${
                        isSelected 
                          ? 'border-[#2F5D7C] bg-[#FAF7F0] ring-1 ring-[#2F5D7C]' 
                          : 'border-[#D9D3C7] hover:border-[#1F2A2E]'
                      }`}
                    >
                      <div className="aspect-[16/9] mb-3 overflow-hidden rounded-[2px] bg-[#E8E0D0]">
                        <img src={d.cover_image_url} alt={d.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">{d.name}</h3>
                        <span className="text-xs text-[#D98E2B] font-medium">{d.nepali_name}</span>
                      </div>
                      <p className="text-xs text-[#4A5B60] mt-1 line-clamp-2">{d.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  Continue to Nights & Dates &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NIGHTS & DATES */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs text-[#D98E2B] uppercase tracking-wider font-semibold">Step 02</span>
                <h2 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Duration & Start Date</h2>
                <p className="text-xs text-[#4A5B60] font-sans mt-1">
                  How many nights will you reside in {activeDistrict?.name}?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    Arrival Check-in Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] bg-[#FAF7F0] text-sm focus:border-[#2F5D7C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    Number of Nights (1 to 14)
                  </label>
                  <select
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] bg-[#FAF7F0] text-sm focus:border-[#2F5D7C]"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Night' : 'Nights'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-[#FAF7F0] p-4 border border-[#D9D3C7] rounded-[4px] text-xs space-y-1">
                <p><strong>Scheduled Departure Check-out:</strong> {formatDate(endDate)}</p>
                <p className="text-[#4A5B60]">Total stay: {nights} nights / {nights + 1} daytime excursions.</p>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 border border-[#D9D3C7] text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  Continue to Lodging &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HOTEL CHOICE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs text-[#D98E2B] uppercase tracking-wider font-semibold">Step 03</span>
                <h2 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Book a partner hotel now?</h2>
                <p className="text-xs text-[#4A5B60] font-sans mt-1">
                  You can secure lodging directly or proceed strictly with day excursions.
                </p>
              </div>

              {/* Yes / No Radio */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className={`flex-1 p-4 border rounded-[4px] cursor-pointer flex items-center space-x-3 ${
                  wantsHotel ? 'border-[#2F5D7C] bg-[#FAF7F0]' : 'border-[#D9D3C7]'
                }`}>
                  <input
                    type="radio"
                    name="wantsHotel"
                    checked={wantsHotel}
                    onChange={() => setWantsHotel(true)}
                    className="accent-[#2F5D7C]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#1F2A2E] block">Yes, add partner hotel</span>
                    <span className="text-xs text-[#4A5B60]">Reserved for all {nights} nights</span>
                  </div>
                </label>

                <label className={`flex-1 p-4 border rounded-[4px] cursor-pointer flex items-center space-x-3 ${
                  !wantsHotel ? 'border-[#2F5D7C] bg-[#FAF7F0]' : 'border-[#D9D3C7]'
                }`}>
                  <input
                    type="radio"
                    name="wantsHotel"
                    checked={!wantsHotel}
                    onChange={() => {
                      setWantsHotel(false);
                      setSelectedHotel(null);
                      setSelectedRoom(null);
                    }}
                    className="accent-[#2F5D7C]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#1F2A2E] block">No, I have my own lodging</span>
                    <span className="text-xs text-[#4A5B60]">You can still add a hotel later</span>
                  </div>
                </label>
              </div>

              {wantsHotel && (
                <div className="space-y-6 pt-4">
                  <h3 className="font-serif text-lg font-semibold text-[#1F2A2E]">
                    Select a Lodge & Room Type
                  </h3>

                  <div className="space-y-4">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="border border-[#D9D3C7] rounded-[4px] p-4 bg-[#FAF7F0]/60">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                          <div>
                            <h4 className="font-serif text-xl font-semibold text-[#1F2A2E]">{hotel.name}</h4>
                            <p className="text-xs text-[#4A5B60]">{hotel.location_area}</p>
                          </div>
                          <span className="text-xs text-[#728388]">Direct Partner</span>
                        </div>

                        {/* Room Types inside Hotel */}
                        <div className="space-y-2 mt-2">
                          {hotel.hotel_rooms?.map((room) => {
                            const isSoldOut = room.rooms_available <= 0;
                            const isSelected = selectedRoom?.id === room.id;

                            return (
                              <div
                                key={room.id}
                                className={`p-3 border rounded-[4px] flex flex-col sm:flex-row justify-between sm:items-center gap-3 ${
                                  isSelected 
                                    ? 'border-[#2F5D7C] bg-white ring-1 ring-[#2F5D7C]' 
                                    : isSoldOut 
                                    ? 'border-[#D9D3C7]/60 bg-[#E8E0D0]/50 opacity-60' 
                                    : 'border-[#D9D3C7] bg-white hover:border-[#1F2A2E]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-[#1F2A2E]">{room.room_type}</span>
                                    {isSoldOut && (
                                      <span className="text-[10px] bg-[#728388] text-white px-1.5 py-0.5 rounded-[2px]">
                                        {t('sold_out')}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#4A5B60]">{room.description}</p>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                  <div className="text-right">
                                    <span className="text-sm font-semibold text-[#1F2A2E]">
                                      {formatNPR(room.price_per_night_npr)}
                                    </span>
                                    <span className="text-[10px] text-[#4A5B60] block">
                                      &times; {nights} nights = {formatNPR(room.price_per_night_npr * nights)}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    disabled={isSoldOut}
                                    onClick={() => {
                                      setSelectedHotel(hotel);
                                      setSelectedRoom(room);
                                    }}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors ${
                                      isSelected
                                        ? 'bg-[#2F5D7C] text-white'
                                        : isSoldOut
                                        ? 'bg-[#D9D3C7] text-[#728388] cursor-not-allowed'
                                        : 'bg-[#FAF7F0] hover:bg-[#E8E0D0] text-[#1F2A2E] border border-[#D9D3C7]'
                                    }`}
                                  >
                                    {isSelected ? 'Selected' : 'Choose Room'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 border border-[#D9D3C7] text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  Continue to Experiences &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: EXPERIENCES */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs text-[#D98E2B] uppercase tracking-wider font-semibold">Step 04</span>
                <h2 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Select Local Experiences</h2>
                <p className="text-xs text-[#4A5B60] font-sans mt-1">
                  Add verified activities and assign each to a specific day during your stay (Day 1 to {nights}).
                </p>
              </div>

              <div className="space-y-4">
                {experiences.map((exp) => {
                  const isSelected = Boolean(selectedExperiences[exp.id]);
                  const currentDay = selectedExperiences[exp.id]?.dayNumber || 1;

                  return (
                    <div
                      key={exp.id}
                      className={`p-4 border rounded-[4px] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected 
                          ? 'border-[#2F5D7C] bg-[#FAF7F0] ring-1 ring-[#2F5D7C]' 
                          : 'border-[#D9D3C7] bg-white hover:border-[#1F2A2E]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleExperience(exp)}
                            className="accent-[#2F5D7C] w-4 h-4 cursor-pointer"
                          />
                          <h4 className="font-serif text-lg font-semibold text-[#1F2A2E]">{exp.title}</h4>
                        </div>
                        {exp.nepali_title && <p className="text-xs text-[#D98E2B] font-medium ml-6">{exp.nepali_title}</p>}
                        <p className="text-xs text-[#4A5B60] ml-6 max-w-xl">{exp.description}</p>
                        <div className="flex gap-3 text-[11px] text-[#728388] ml-6 pt-1">
                          <span>Duration: <strong>{exp.duration_hours}h</strong></span>
                          <span>&bull;</span>
                          <span>Category: <strong>{exp.category}</strong></span>
                          <span>&bull;</span>
                          <span className={exp.needs_booking ? 'text-amber-800' : 'text-emerald-800'}>
                            {exp.needs_booking ? 'Booking required' : 'Flexible entry'}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2">
                        <span className="text-base font-semibold text-[#1F2A2E]">
                          {formatNPR(exp.price_npr)}
                        </span>

                        {isSelected && (
                          <div className="flex items-center space-x-2 text-xs">
                            <label className="text-[#728388]">Schedule on:</label>
                            <select
                              value={currentDay}
                              onChange={(e) => handleAssignDay(exp.id, Number(e.target.value))}
                              className="border border-[#D9D3C7] rounded-[2px] p-1 bg-white text-xs"
                            >
                              {Array.from({ length: nights }, (_, i) => i + 1).map((d) => (
                                <option key={d} value={d}>Day {d}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 border border-[#D9D3C7] text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  Review Itinerary &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW PLAN */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs text-[#D98E2B] uppercase tracking-wider font-semibold">Step 05</span>
                <h2 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Day-by-Day Plan Review</h2>
                <p className="text-xs text-[#4A5B60] font-sans mt-1">
                  Inspect your schedule breakdown. You can return to any step above to adjust.
                </p>
              </div>

              {/* Day breakdown */}
              <div className="space-y-4">
                {Array.from({ length: nights }, (_, i) => i + 1).map((dayNum) => {
                  const dayExperiences = Object.values(selectedExperiences).filter(e => e.dayNumber === dayNum);
                  
                  return (
                    <div key={dayNum} className="border border-[#D9D3C7] rounded-[4px] p-4 bg-[#FAF7F0]">
                      <div className="flex justify-between items-baseline border-b border-[#D9D3C7] pb-2 mb-2">
                        <h4 className="font-serif text-lg font-semibold text-[#1F2A2E]">
                          Day {dayNum} &bull; {formatDate(addDays(startDate, dayNum - 1))}
                        </h4>
                        <span className="text-xs text-[#728388]">
                          {dayNum === 1 ? 'Check-in & Welcome' : dayNum === nights ? 'Final Excursion Day' : 'Full Expedition Day'}
                        </span>
                      </div>

                      {/* Hotel for this day */}
                      {wantsHotel && selectedRoom && (
                        <div className="text-xs text-[#4A5B60] py-1 flex justify-between">
                          <span>Lodging: <strong>{selectedHotel?.name}</strong> ({selectedRoom.room_type})</span>
                          <span>{formatNPR(selectedRoom.price_per_night_npr)}</span>
                        </div>
                      )}

                      {/* Experiences for this day */}
                      {dayExperiences.length > 0 ? (
                        dayExperiences.map(item => (
                          <div key={item.experience.id} className="text-xs text-[#1F2A2E] py-1 flex justify-between">
                            <span>Field Experience: <strong>{item.experience.title}</strong></span>
                            <span>{formatNPR(item.experience.price_npr)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#728388] italic py-1">Open relaxation or self-directed exploration.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#E8E0D0] p-4 rounded-[4px] border border-[#D9D3C7] text-xs text-[#4A5B60] space-y-1">
                <p><strong>Pricing Note:</strong> All tariffs are listed in Nepali Rupees (रु) inclusive of government tourist taxes. Room allocations and guide slots are held pending payment authorization.</p>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 border border-[#D9D3C7] text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-6 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  Proceed to Contact & Settle &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: CONTACT & PAYMENT */}
          {currentStep === 6 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div>
                <span className="text-xs text-[#D98E2B] uppercase tracking-wider font-semibold">Step 06</span>
                <h2 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Contact Details & Settlement</h2>
                <p className="text-xs text-[#4A5B60] font-sans mt-1">
                  {!user ? "Please provide your contact information or sign in to save this to your account." : "Logged in as registered customer."}
                </p>
              </div>

              {!user && (
                <div className="bg-[#FAF7F0] p-3 border border-[#D9D3C7] rounded-[4px] text-xs flex justify-between items-center">
                  <span className="text-[#4A5B60]">Have a Gautam Travels account?</span>
                  <button
                    type="button"
                    onClick={() => navigate('/login?redirect=/plan')}
                    className="text-[#2F5D7C] font-semibold underline"
                  >
                    Log In First
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Gurung"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    Nepal Phone Number (+977 followed by 8 to 10 digits)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+9779841234567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] font-mono focus:border-[#2F5D7C]"
                  />
                  {phoneError && (
                    <p className="text-xs text-red-700 mt-1 font-medium">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="traveler@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
                  />
                </div>

                {/* Payment Options */}
                <div className="pt-2">
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-2 font-semibold">
                    Preferred Settlement Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'esewa', label: 'eSewa Mobile', note: 'Direct QR / ID' },
                      { id: 'khalti', label: 'Khalti Wallet', note: 'Fast SMS authorization' },
                      { id: 'card', label: 'Visa / MasterCard', note: 'International cards' },
                      { id: 'bank', label: 'Bank Wire', note: 'Himalayan Bank transfer' }
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`p-3 border rounded-[4px] cursor-pointer flex flex-col justify-between ${
                          paymentProvider === opt.id 
                            ? 'border-[#2F5D7C] bg-[#FAF7F0] ring-1 ring-[#2F5D7C]' 
                            : 'border-[#D9D3C7] bg-white hover:border-[#1F2A2E]'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="paymentProvider"
                            checked={paymentProvider === opt.id}
                            onChange={() => setPaymentProvider(opt.id as any)}
                            className="accent-[#2F5D7C]"
                          />
                          <span className="text-xs font-semibold text-[#1F2A2E]">{opt.label}</span>
                        </div>
                        <span className="text-[10px] text-[#728388] mt-1">{opt.note}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {submitError && (
                  <p className="text-xs text-red-700 bg-red-50 p-2.5 border border-red-200 rounded-[4px]">
                    {submitError}
                  </p>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 border border-[#D9D3C7] text-xs uppercase tracking-wider font-semibold rounded-[4px]"
                >
                  &larr; Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px] transition-colors"
                >
                  Confirm Plan & Initiate Settlement ({formatNPR(grandTotalNPR)})
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Sidebar Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF7F0] border border-[#D9D3C7] p-6 rounded-[4px] space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#728388] block font-semibold">
              Itinerary Summary
            </span>

            <div className="border-b border-[#D9D3C7] pb-3">
              <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">
                {activeDistrict?.name} ({activeDistrict?.nepali_name})
              </h3>
              <p className="text-xs text-[#4A5B60] mt-0.5">
                {nights} nights &bull; {formatDate(startDate)} &rarr; {formatDate(endDate)}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#4A5B60]">
                <span>Partner Hotel:</span>
                <span className="font-medium text-[#1F2A2E]">{wantsHotel && selectedRoom ? selectedRoom.room_type : "None selected"}</span>
              </div>
              {wantsHotel && selectedRoom && (
                <div className="flex justify-between text-[#4A5B60]">
                  <span>Nightly Hotel Cost:</span>
                  <span>{formatNPR(hotelTotal)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#4A5B60] border-t border-[#D9D3C7] pt-2">
                <span>Selected Experiences ({Object.keys(selectedExperiences).length}):</span>
                <span>{formatNPR(experiencesTotal)}</span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-[#1F2A2E] border-t-2 border-[#1F2A2E] pt-2">
                <span>Total NPR Payable:</span>
                <span className="text-[#2F5D7C]">{formatNPR(grandTotalNPR)}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-[#728388] leading-relaxed">
                Prices calculated directly in NPR with verified room allocations. No surprise international conversion surcharges.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
