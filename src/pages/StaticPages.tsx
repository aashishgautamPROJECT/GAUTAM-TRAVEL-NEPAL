import React, { useState } from 'react';
import { submitEnquiry } from '../lib/api';
import { isValidNepalPhone } from '../lib/utils';
import ImageWithCaption from '../components/ImageWithCaption';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
          Department of Tourism Reg. No. 2841/079
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#1F2A2E] mt-1">
          Our Practice & Field Philosophy
        </h1>
        <p className="text-sm text-[#4A5B60] font-sans mt-3 leading-relaxed">
          Gautam Travels (गौतम ट्राभल्स) was founded in Pokhara with a distinct conviction: travellers deserve direct access to licensed local naturalists and community-owned lodges without predatory intermediary margins or fabricated marketing narratives.
        </p>
      </div>

      <ImageWithCaption
        src="/images/pokhara-sarangkot-sunrise.jpg"
        alt="Sunrise over Annapurna from Sarangkot"
        caption="Sunrise over the Annapurna range from Sarangkot, where our founder first mapped walking corridors"
        credit="Photo: Gautam Travels Archive"
        aspectRatio="aspect-[21/9]"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#4A5B60] leading-relaxed">
        <div className="space-y-3">
          <h3 className="font-serif text-2xl font-semibold text-[#1F2A2E]">01. District-by-District Immersion</h3>
          <p>
            Rather than rushing visitors across five towns in four days, we advocate deep stays in single river basins. Pokhara's lacustrine quiet and Chitwan's subtropical lowlands each require multiple sunrises to truly appreciate.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-2xl font-semibold text-[#1F2A2E]">02. Conservation & Guide Integrity</h3>
          <p>
            Every single safari and hike booked through our planner is led by APPI/CIVL or National Park certified guides who live in the valley. A transparent share of each booking directly supports indigenous buffer-zone communities.
          </p>
        </div>
      </div>

      <div className="bg-[#FAF7F0] border border-[#D9D3C7] p-6 rounded-[4px] space-y-3">
        <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">Licensing & Accreditation</h3>
        <p className="text-xs text-[#4A5B60] leading-relaxed">
          Gautam Travels Pvt. Ltd. is an authorized tour and trekking agency under the Ministry of Culture, Tourism and Civil Aviation (Nepal), member of the Nepal Association of Tour and Travel Agents (NATTA), and compliant with Nepal Rastra Bank foreign exchange regulations.
        </p>
      </div>
    </div>
  );
}

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+977');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');
    setPhoneError('');

    if (!isValidNepalPhone(phone)) {
      setPhoneError("Phone number must match Nepal format: +977 followed by 8 to 10 digits.");
      return;
    }

    setLoading(true);
    const res = await submitEnquiry({ name, email, phone, message });
    setLoading(false);
    setFeedback(res.message);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
          Direct Desks &bull; Pokhara & Chitwan
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#1F2A2E] mt-1">
          Contact Our Regional Planners
        </h1>
        <p className="text-sm text-[#4A5B60] font-sans mt-3">
          We welcome direct telephone consultations, WhatsApp queries, and in-person visits to our lakeside desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact info cards */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D9D3C7] p-6 rounded-[4px] space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">Pokhara Lakeside Desk</h3>
            <p className="text-xs text-[#4A5B60] leading-relaxed">
              Baidam Road, Pokhara-6, Gandaki Province, Nepal<br />
              Telephone: <strong className="text-[#1F2A2E] font-mono">+977 61 463901</strong><br />
              Hours: 07:00 – 19:30 (Daily)
            </p>
          </div>

          <div className="bg-white border border-[#D9D3C7] p-6 rounded-[4px] space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">Chitwan Sauraha Desk</h3>
            <p className="text-xs text-[#4A5B60] leading-relaxed">
              Hattisar Way, Sauraha, Chitwan, Bagmati Province, Nepal<br />
              Direct / WhatsApp: <strong className="text-[#1F2A2E] font-mono">+977 984 1234567</strong><br />
              Hours: 06:30 – 18:00 (Daily)
            </p>
          </div>

          <div className="bg-[#FAF7F0] border border-[#D9D3C7] p-4 rounded-[4px] text-xs space-y-2">
            <span className="font-semibold text-[#1F2A2E] block">Instant WhatsApp Support:</span>
            <a
              href="https://wa.me/9779841234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-[#2A7246] text-white rounded-[4px] font-semibold hover:bg-emerald-800"
            >
              Chat on WhatsApp (+977 9841234567) &rarr;
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-[#D9D3C7] p-6 rounded-[4px] space-y-4">
          <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">Send an Enquiry</h3>
          
          {feedback && (
            <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-[4px]">
              {feedback}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Nepal Phone Number (+977 followed by 8-10 digits)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] font-mono focus:border-[#2F5D7C]"
              />
              {phoneError && <p className="text-xs text-red-700 mt-1">{phoneError}</p>}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                Message / Custom Itinerary Question
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let us know your preferred dates or specific wildlife/lake interests..."
                className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px] transition-colors"
            >
              {loading ? "Sending..." : "Submit Enquiry"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm text-[#4A5B60] leading-relaxed">
      <h1 className="font-serif text-4xl text-[#1F2A2E] font-semibold">Privacy Policy</h1>
      <p className="text-xs text-[#728388]">Last Updated: November 2026</p>
      
      <p>
        Gautam Travels Pvt. Ltd. respects the privacy of our travellers. We collect only necessary information required to secure partner lodge rooms, register park permits, and execute field activities safely.
      </p>

      <h2 className="font-serif text-2xl text-[#1F2A2E] pt-2">1. Data Collected</h2>
      <p>
        We collect contact names, email addresses, and Nepal telephone numbers (+977 format) solely for itinerary coordination and safety confirmations.
      </p>

      <h2 className="font-serif text-2xl text-[#1F2A2E] pt-2">2. Payment Security</h2>
      <p>
        We do not store credit or debit card numbers on our servers. All digital transactions are authorized directly through certified payment gateways (eSewa, Khalti, or authorized merchant banking portals).
      </p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-sm text-[#4A5B60] leading-relaxed">
      <h1 className="font-serif text-4xl text-[#1F2A2E] font-semibold">Terms of Booking</h1>
      <p className="text-xs text-[#728388]">Last Updated: November 2026</p>

      <h2 className="font-serif text-2xl text-[#1F2A2E] pt-2">1. Itinerary Confirmation</h2>
      <p>
        Creating a plan generates a pending booking reference. Room allocations and certified guide schedules are held for 48 hours awaiting payment confirmation.
      </p>

      <h2 className="font-serif text-2xl text-[#1F2A2E] pt-2">2. Pricing Transparency</h2>
      <p>
        All listed tariffs are quoted in Nepali Rupees (रु) and include standard VAT and municipal tourism taxes. If weather conditions prevent aerial sports (e.g. Sarangkot paragliding), options for rescheduling or direct refunds are honored.
      </p>
    </div>
  );
}
