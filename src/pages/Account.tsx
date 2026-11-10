import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPlans } from '../lib/api';
import { formatNPR, formatDate, isValidNepalPhone } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { Plan } from '../types';

export default function Account() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+977');
  const [preferredLang, setPreferredLang] = useState('en');
  const [preferredCurrency, setPreferredCurrency] = useState('NPR');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/account');
      return;
    }

    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '+977');
      setPreferredLang(profile.preferred_language || 'en');
      setPreferredCurrency(profile.preferred_currency || 'NPR');
    }

    async function loadPlans() {
      const { data } = await getUserPlans(user.id);
      if (data) setPlans(data);
    }
    loadPlans();
  }, [user, profile, navigate]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('');
    setPhoneError('');

    if (!isValidNepalPhone(phone)) {
      setPhoneError("Phone must match Nepal format: +977 followed by 8 to 10 digits.");
      return;
    }

    setSaving(true);
    const res = await updateProfile({
      full_name: fullName,
      phone,
      preferred_language: preferredLang,
      preferred_currency: preferredCurrency
    });

    setSaving(false);
    if (!res.error) {
      setSaveMessage("Profile saved successfully.");
      setLang(preferredLang as any);
    } else {
      setSaveMessage("Error updating profile: " + res.error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-[2px] text-xs bg-emerald-100 text-emerald-900 font-medium">Confirmed</span>;
      case 'pending_payment':
        return <span className="px-2 py-0.5 rounded-[2px] text-xs bg-amber-100 text-amber-900 font-medium">Pending Payment</span>;
      case 'paid':
        return <span className="px-2 py-0.5 rounded-[2px] text-xs bg-blue-100 text-blue-900 font-medium">Paid</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-[2px] text-xs bg-red-100 text-red-900 font-medium">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-[2px] text-xs bg-gray-100 text-gray-800 font-medium">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
          Customer Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1F2A2E] mt-1">
          {t('nav_account')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Profile Settings */}
        <div className="lg:col-span-5 bg-white border border-[#D9D3C7] p-6 rounded-[4px] space-y-4">
          <h2 className="font-serif text-xl font-semibold text-[#1F2A2E]">Profile Details</h2>
          <p className="text-xs text-[#4A5B60]">
            Update your traveller credentials and language preference.
          </p>

          {saveMessage && (
            <div className="p-2.5 text-xs bg-[#FAF7F0] border border-[#D9D3C7] rounded-[4px] text-[#1F2A2E]">
              {saveMessage}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#E8E0D0]/50 text-[#728388] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Nepal Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] font-mono focus:border-[#2F5D7C]"
              />
              {phoneError && <p className="text-xs text-red-700 mt-1">{phoneError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                  Language
                </label>
                <select
                  value={preferredLang}
                  onChange={(e) => setPreferredLang(e.target.value)}
                  className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-xs bg-[#FAF7F0]"
                >
                  <option value="en">English</option>
                  <option value="ne">नेपाली (Nepali)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                  Currency
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-xs bg-[#FAF7F0]"
                >
                  <option value="NPR">NPR (रु)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px]"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="text-xs text-red-700 hover:underline"
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>

        {/* User Plans List */}
        <div className="lg:col-span-7 bg-white border border-[#D9D3C7] p-6 rounded-[4px] space-y-4">
          <div className="flex justify-between items-baseline border-b border-[#D9D3C7] pb-3">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#1F2A2E]">My Journey Plans</h2>
              <p className="text-xs text-[#4A5B60]">All itineraries logged under your account.</p>
            </div>
            <button
              onClick={() => navigate('/plan')}
              className="text-xs uppercase tracking-wider text-[#2F5D7C] font-semibold hover:underline"
            >
              + Create New Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#4A5B60] italic">
              No holiday plans currently scheduled.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {plans.map((p) => (
                <div key={p.id} className="border border-[#D9D3C7] rounded-[4px] p-4 bg-[#FAF7F0] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#1F2A2E]">{p.id}</span>
                      <h4 className="font-serif text-lg font-semibold text-[#1F2A2E]">
                        {p.district_name || 'Nepal District Stay'}
                      </h4>
                    </div>
                    {getStatusBadge(p.status)}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#4A5B60] pt-1">
                    <div>
                      <span className="text-[#728388] block text-[10px] uppercase">Duration:</span>
                      <strong>{p.nights} nights</strong>
                    </div>
                    <div>
                      <span className="text-[#728388] block text-[10px] uppercase">Start Date:</span>
                      <strong>{formatDate(p.start_date)}</strong>
                    </div>
                    <div>
                      <span className="text-[#728388] block text-[10px] uppercase">Total NPR:</span>
                      <strong className="text-[#2F5D7C]">{formatNPR(p.total_npr)}</strong>
                    </div>
                  </div>

                  {p.items && p.items.length > 0 && (
                    <div className="border-t border-[#D9D3C7] pt-2 mt-2 text-[11px] text-[#4A5B60] space-y-1">
                      <span className="font-medium text-[#1F2A2E]">Scheduled components:</span>
                      {p.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>&bull; Day {it.day_number}: {it.item_type === 'hotel' ? (it.hotel_name ? `${it.hotel_name} (${it.room_type})` : 'Partner Hotel Room') : (it.experience_title || 'Local Field Experience')}</span>
                          <span>{formatNPR(it.price_npr)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
