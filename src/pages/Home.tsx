import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDistricts } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { District } from '../types';
import ImageWithCaption from '../components/ImageWithCaption';
import NewarBorder from '../components/NewarBorder';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Bar States
  const [selectedDistrict, setSelectedDistrict] = useState('dst-pokhara');
  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today.toISOString().split('T')[0];
  });
  const [nights, setNights] = useState(3);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await getDistricts();
      if (data && data.length > 0) {
        setDistricts(data);
        setSelectedDistrict(data[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/plan?district=${selectedDistrict}&date=${checkInDate}&nights=${nights}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Editorial Hero */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#728388] font-sans font-semibold">
              Independent Nepal Travel Studio
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] text-[#1F2A2E]">
              {t('hero_headline')}
            </h1>
            <p className="text-base sm:text-lg text-[#4A5B60] font-sans font-light leading-relaxed max-w-xl">
              {t('hero_sub')}
            </p>

            {/* Quick Search Form */}
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-white border border-[#D9D3C7] p-5 rounded-[4px] shadow-xs space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    {t('destination')}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#D9D3C7] text-sm p-2.5 rounded-[4px] focus:outline-none focus:border-[#2F5D7C]"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.nepali_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    {t('check_in')}
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#D9D3C7] text-sm p-2 rounded-[4px] focus:outline-none focus:border-[#2F5D7C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                    {t('nights')}
                  </label>
                  <select
                    value={nights}
                    onChange={(e) => setNights(Number(e.target.value))}
                    className="w-full bg-[#FAF7F0] border border-[#D9D3C7] text-sm p-2 rounded-[4px] focus:outline-none focus:border-[#2F5D7C]"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? t('night_singular') : t('night_plural')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold py-3 rounded-[4px] transition-colors"
              >
                {t('start_planning')}
              </button>
            </form>
          </div>

          {/* Large Hero Image */}
          <div className="lg:col-span-6">
            <ImageWithCaption
              src="/images/pokhara-phewa-lake.jpg"
              alt="Phewa Lake with Annapurna reflected in the water"
              caption="Phewa Lake with Annapurna reflected in the water"
              credit="Photo: Saroj Thapa / Meridian Journeys Archive"
              aspectRatio="aspect-[4/3]"
              loading="eager"
            />
          </div>

        </div>
      </section>

      {/* Honest Trust Strip */}
      <section className="bg-[#FAF7F0] hairline-y py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <span className="w-1.5 h-1.5 bg-[#D98E2B] rounded-full" />
              <span className="text-sm font-medium text-[#1F2A2E]">{t('trust_guides')}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <span className="w-1.5 h-1.5 bg-[#D98E2B] rounded-full" />
              <span className="text-sm font-medium text-[#1F2A2E]">{t('trust_pricing')}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <span className="w-1.5 h-1.5 bg-[#D98E2B] rounded-full" />
              <span className="text-sm font-medium text-[#1F2A2E]">{t('trust_support')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 01: Choose a District */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-[#728388] font-sans font-semibold">
            {t('choose_district_tag')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F2A2E] mt-1">
            {t('choose_district_title')}
          </h2>
          <p className="text-sm text-[#4A5B60] max-w-2xl font-sans mt-2">
            {t('choose_district_sub')}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#4A5B60]">Loading published districts...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {districts.map((district) => (
              <div 
                key={district.id}
                className="bg-white border border-[#D9D3C7] rounded-[4px] overflow-hidden flex flex-col justify-between group hover:border-[#1F2A2E] transition-colors"
              >
                <div>
                  <ImageWithCaption
                    src={district.cover_image_url}
                    alt={district.name}
                    caption={district.image_caption}
                    credit={district.image_credit}
                    aspectRatio="aspect-[16/10]"
                  />
                  <div className="p-6 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <h3 className="font-serif text-2xl font-semibold text-[#1F2A2E] group-hover:text-[#2F5D7C] transition-colors">
                          {district.name}
                        </h3>
                        <span className="text-xs text-[#D98E2B] font-medium">
                          {district.nepali_name}
                        </span>
                      </div>
                      <span className="text-xs bg-[#E8E0D0] px-2.5 py-1 rounded-[2px] text-[#4A5B60]">
                        Best: {district.best_months}
                      </span>
                    </div>

                    <p className="text-sm text-[#4A5B60] leading-relaxed font-sans">
                      {district.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-[#E8E0D0] mt-4">
                  <Link
                    to={`/districts/${district.slug}`}
                    className="text-xs uppercase tracking-wider font-semibold text-[#2F5D7C] hover:underline"
                  >
                    Explore District Lodges & Walks &rarr;
                  </Link>

                  <Link
                    to={`/plan?district=${district.id}`}
                    className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-[#E8E0D0] border border-[#D9D3C7] text-xs rounded-[4px] font-medium"
                  >
                    Start Itinerary
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <NewarBorder />

      {/* Section 02: How Planning Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#728388] font-sans font-semibold">
            {t('how_it_works_tag')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1F2A2E] mt-1">
            {t('how_it_works_title')}
          </h2>
          <p className="text-sm text-[#4A5B60] font-sans mt-2">
            A linear, thoughtful planning process that directly respects your time and local communities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-white border border-[#D9D3C7] rounded-[4px] relative">
            <span className="font-serif text-2xl text-[#D98E2B] font-light block mb-2">01</span>
            <h3 className="font-serif text-xl font-semibold text-[#1F2A2E] mb-2">{t('step1_title')}</h3>
            <p className="text-xs text-[#4A5B60] leading-relaxed font-sans">{t('step1_desc')}</p>
          </div>

          <div className="p-6 bg-white border border-[#D9D3C7] rounded-[4px] relative">
            <span className="font-serif text-2xl text-[#D98E2B] font-light block mb-2">02</span>
            <h3 className="font-serif text-xl font-semibold text-[#1F2A2E] mb-2">{t('step2_title')}</h3>
            <p className="text-xs text-[#4A5B60] leading-relaxed font-sans">{t('step2_desc')}</p>
          </div>

          <div className="p-6 bg-white border border-[#D9D3C7] rounded-[4px] relative">
            <span className="font-serif text-2xl text-[#D98E2B] font-light block mb-2">03</span>
            <h3 className="font-serif text-xl font-semibold text-[#1F2A2E] mb-2">{t('step3_title')}</h3>
            <p className="text-xs text-[#4A5B60] leading-relaxed font-sans">{t('step3_desc')}</p>
          </div>

          <div className="p-6 bg-white border border-[#D9D3C7] rounded-[4px] relative">
            <span className="font-serif text-2xl text-[#D98E2B] font-light block mb-2">04</span>
            <h3 className="font-serif text-xl font-semibold text-[#1F2A2E] mb-2">{t('step4_title')}</h3>
            <p className="text-xs text-[#4A5B60] leading-relaxed font-sans">{t('step4_desc')}</p>
          </div>

        </div>

        <div className="text-center mt-12">
          <Link
            to="/plan"
            className="inline-block px-8 py-3.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-widest font-semibold rounded-[4px] transition-colors"
          >
            Create Your Custom Nepal Plan
          </Link>
        </div>
      </section>
    </div>
  );
}
