import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDistrictBySlug, getHotelsForDistrict, getExperiencesForDistrict } from '../lib/api';
import { formatNPR } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { District, PartnerHotel, Experience } from '../types';
import ImageWithCaption from '../components/ImageWithCaption';
import HotelModal from '../components/HotelModal';
import NewarBorder from '../components/NewarBorder';

export default function DistrictDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();

  const [district, setDistrict] = useState<District | null>(null);
  const [hotels, setHotels] = useState<PartnerHotel[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalHotel, setActiveModalHotel] = useState<PartnerHotel | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const { data: dData } = await getDistrictBySlug(slug);
      if (dData) {
        setDistrict(dData);
        const [hRes, eRes] = await Promise.all([
          getHotelsForDistrict(dData.id),
          getExperiencesForDistrict(dData.id)
        ]);
        setHotels(hRes.data || []);
        setExperiences(eRes.data || []);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-[#4A5B60]">
        Loading district archives and partner listings...
      </div>
    );
  }

  if (!district) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-[#1F2A2E]">District Not Found</h2>
        <p className="text-sm text-[#4A5B60] mt-2">The requested region archive does not exist.</p>
        <Link to="/" className="inline-block mt-4 text-xs uppercase tracking-wider text-[#2F5D7C] underline font-semibold">
          Return to directory
        </Link>
      </div>
    );
  }

  const categories = [
    { key: 'all', label: t('all_categories') },
    { key: 'sightseeing', label: t('cat_sightseeing') },
    { key: 'adventure', label: t('cat_adventure') },
    { key: 'wildlife', label: t('cat_wildlife') },
    { key: 'culture', label: t('cat_culture') },
    { key: 'food', label: t('cat_food') },
    { key: 'transport', label: t('cat_transport') }
  ];

  const filteredExperiences = selectedCategory === 'all'
    ? experiences
    : experiences.filter(e => e.category === selectedCategory);

  return (
    <div className="relative pb-24 space-y-16">
      
      {/* Sticky Bottom Bar for instant planner launch */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xs border-t border-[#D9D3C7] py-3.5 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#728388] block font-semibold">
              Ready to schedule?
            </span>
            <span className="font-serif text-lg text-[#1F2A2E] font-semibold">
              {t('plan_my_stay')} {district.name} ({district.nepali_name})
            </span>
          </div>
          <Link
            to={`/plan?district=${district.id}`}
            className="px-5 py-2.5 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px] transition-colors"
          >
            Open Planner
          </Link>
        </div>
      </div>

      {/* District Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
              District Archive &bull; Gandaki & Narayani Basins
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#1F2A2E]">
              {district.name}
            </h1>
            <p className="text-base text-[#D98E2B] font-medium">{district.nepali_name}</p>
            <div className="inline-block bg-[#E8E0D0] px-3 py-1 text-xs text-[#4A5B60] rounded-[2px]">
              Optimal Travel Windows: <strong className="text-[#1F2A2E]">{district.best_months}</strong>
            </div>
            <p className="text-sm sm:text-base text-[#4A5B60] leading-relaxed font-sans pt-2">
              {district.description}
            </p>
          </div>

          <div className="lg:col-span-6">
            <ImageWithCaption
              src={district.cover_image_url}
              alt={district.name}
              caption={district.image_caption}
              credit={district.image_credit}
              aspectRatio="aspect-[16/10]"
              loading="eager"
            />
          </div>
        </div>
      </section>

      <NewarBorder />

      {/* Partner Hotels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
            01 / ACCOMMODATION
          </span>
          <h2 className="font-serif text-3xl font-semibold text-[#1F2A2E] mt-1">
            Partner Lodges in {district.name}
          </h2>
          <p className="text-xs text-[#4A5B60] font-sans mt-1">
            Properties verified for local community ownership, sustainable sanitation, and fair guide compensation.
          </p>
        </div>

        {hotels.length === 0 ? (
          <p className="text-sm text-[#4A5B60] italic">No active partner lodges currently registered in this district.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hotels.map((hotel) => (
              <div 
                key={hotel.id}
                className="bg-white border border-[#D9D3C7] rounded-[4px] overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <ImageWithCaption
                    src={hotel.image_url}
                    alt={hotel.name}
                    caption={hotel.image_caption}
                    credit={hotel.image_credit}
                    aspectRatio="aspect-[16/9]"
                  />
                  <div className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-[#1F2A2E]">{hotel.name}</h3>
                        {hotel.nepali_name && <p className="text-xs text-[#D98E2B] font-medium">{hotel.nepali_name}</p>}
                        <p className="text-xs text-[#4A5B60]">{hotel.location_area}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#728388] block">from</span>
                        <span className="text-base font-semibold text-[#1F2A2E]">
                          {formatNPR(hotel.lowest_price)}
                        </span>
                        <span className="text-[11px] text-[#4A5B60] block">/ {t('per_night')}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#4A5B60] leading-relaxed font-sans">
                      {hotel.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#E8E0D0] flex justify-between items-center mt-3">
                  <span className="text-xs text-[#728388] font-mono">
                    {hotel.contact_phone}
                  </span>
                  <button
                    onClick={() => setActiveModalHotel(hotel)}
                    className="px-4 py-2 bg-[#FAF7F0] hover:bg-[#E8E0D0] border border-[#D9D3C7] text-xs font-semibold rounded-[4px] transition-colors"
                  >
                    {t('view_rooms')} &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Things to Do / Experiences Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
              02 / EXPERIENCES & NATURE WALKS
            </span>
            <h2 className="font-serif text-3xl font-semibold text-[#1F2A2E] mt-1">
              Field Curations in {district.name}
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1 text-xs rounded-[4px] border transition-colors ${
                  selectedCategory === c.key
                    ? 'bg-[#1F2A2E] text-white border-[#1F2A2E]'
                    : 'bg-[#FAF7F0] text-[#4A5B60] border-[#D9D3C7] hover:border-[#1F2A2E]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white border border-[#D9D3C7] rounded-[4px] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <ImageWithCaption
                  src={exp.image_url}
                  alt={exp.title}
                  caption={exp.image_caption}
                  credit={exp.image_credit}
                  aspectRatio="aspect-[16/10]"
                />
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-[#1F2A2E] leading-snug">
                        {exp.title}
                      </h4>
                      {exp.nepali_title && <p className="text-xs text-[#D98E2B] font-medium">{exp.nepali_title}</p>}
                    </div>
                  </div>

                  <p className="text-xs text-[#4A5B60] leading-relaxed font-sans pt-1">
                    {exp.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#E8E0D0] mt-2 space-y-3">
                <div className="flex justify-between items-center text-xs text-[#4A5B60]">
                  <span>{t('duration')}: <strong className="text-[#1F2A2E]">{exp.duration_hours} {t('hours')}</strong></span>
                  <span className={`px-2 py-0.5 rounded-[2px] text-[10px] ${
                    exp.needs_booking ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {exp.needs_booking ? t('booking_required') : t('booking_optional')}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="font-serif text-lg font-semibold text-[#1F2A2E]">
                    {formatNPR(exp.price_npr)}
                  </span>
                  <Link
                    to={`/plan?district=${district.id}`}
                    className="text-xs uppercase tracking-wider text-[#2F5D7C] hover:underline font-semibold"
                  >
                    Add in Planner &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotel Detail Modal */}
      <HotelModal
        hotel={activeModalHotel}
        isOpen={Boolean(activeModalHotel)}
        onClose={() => setActiveModalHotel(null)}
      />
    </div>
  );
}
