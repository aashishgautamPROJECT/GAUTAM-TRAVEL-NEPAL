import { District, PartnerHotel, HotelRoom, Experience, Plan } from '../types';

export const fallbackDistricts: District[] = [
  {
    id: "dst-pokhara",
    name: "Pokhara",
    nepali_name: "पोखरा",
    slug: "pokhara",
    description: "Nestled beneath Machhapuchhre and the Annapurna sanctuary, Pokhara is Nepal's valley of tranquil waters and clean mountain air. From morning rowing on Phewa Lake to Sarangkot ridge sunrises, it blends quiet lakefront courtyards with accessible alpine views.",
    best_months: "September – November & March – May",
    cover_image_url: "/images/pokhara-phewa-lake.jpg",
    image_caption: "Phewa Lake with Annapurna reflected in the water",
    image_credit: "Photo: Saroj Thapa / Meridian Journeys",
    is_published: true
  },
  {
    id: "dst-chitwan",
    name: "Chitwan",
    nepali_name: "चितवन",
    slug: "chitwan",
    description: "The fertile floodplains of the Rapti and Narayani rivers shelter one of South Asia's greatest wildlife sanctuaries. Traverse river channels in silent hand-carved dugouts, track one-horned rhinos with certified local naturalists, and experience indigenous Tharu cultural heritage.",
    best_months: "October – March (optimal wildlife visibility)",
    cover_image_url: "/images/chitwan-one-horned-rhino.jpg",
    image_caption: "One-horned rhinoceros in grassland, Chitwan National Park",
    image_credit: "Photo: Dept of National Parks / B. Gurung",
    is_published: true
  }
];

export const fallbackRooms: HotelRoom[] = [
  // Phewa Lakeside Heritage Retreat
  {
    id: "rm-pkr-1",
    hotel_id: "htl-pkr-1",
    room_type: "Deluxe Lake Balcony Room",
    price_per_night_npr: 6800,
    rooms_available: 4,
    description: "Pine timber furnishings with private balcony facing the water."
  },
  {
    id: "rm-pkr-2",
    hotel_id: "htl-pkr-1",
    room_type: "Traditional Stone Suite",
    price_per_night_npr: 10500,
    rooms_available: 2,
    description: "Handcrafted slate accents with standalone copper bathtub."
  },
  // Sarangkot Ridge Inn
  {
    id: "rm-pkr-3",
    hotel_id: "htl-pkr-2",
    room_type: "Himalayan Sunrise Twin",
    price_per_night_npr: 4200,
    rooms_available: 5,
    description: "East-facing twin room facing the dawn light on Annapurna South."
  },
  {
    id: "rm-pkr-4",
    hotel_id: "htl-pkr-2",
    room_type: "Valley Crest Room",
    price_per_night_npr: 5600,
    rooms_available: 0, // Demonstrates sold-out handling
    description: "Private corner room facing Machhapuchhre peak (Sold out)."
  },
  // Rapti River Grassland Lodge
  {
    id: "rm-cht-1",
    hotel_id: "htl-cht-1",
    room_type: "Riverbank Tharu Cottage",
    price_per_night_npr: 7500,
    rooms_available: 3,
    description: "Clay-rendered cottage with woven reed ceiling directly above the riverbank."
  },
  {
    id: "rm-cht-2",
    hotel_id: "htl-cht-1",
    room_type: "Forest View Stilt Suite",
    price_per_night_npr: 11000,
    rooms_available: 1,
    description: "Elevated timber stilt suite with views across the rhino corridor."
  },
  // Barandabhar Forest Retreat
  {
    id: "rm-cht-3",
    hotel_id: "htl-cht-2",
    room_type: "Sal Canopy Standard",
    price_per_night_npr: 4800,
    rooms_available: 6,
    description: "Clean, natural brick room opening onto shaded sal forest gardens."
  }
];

export const fallbackHotels: PartnerHotel[] = [
  {
    id: "htl-pkr-1",
    district_id: "dst-pokhara",
    name: "Phewa Lakeside Heritage Retreat",
    nepali_name: "फेवा लेकसाइड हेरिटेज रिट्रिट",
    location_area: "Lakeside North, Pokhara-6",
    rating: 4.8,
    description: "Built with Gandaki river stones and seasoned pine, this boutique lodge borders the quieter northern shore of Phewa Lake. Features organic courtyard dining and direct wooden boat boarding.",
    contact_phone: "+97761463901",
    contact_email: "stay@phewaheritage.com.np",
    commission_rate: 0.12,
    image_url: "/images/pokhara-tal-barahi.jpg",
    image_caption: "Verandah overlooking Lake Phewa and Tal Barahi island sanctuary",
    image_credit: "Photo: Meridian Journeys Archive",
    is_active: true
  },
  {
    id: "htl-pkr-2",
    district_id: "dst-pokhara",
    name: "Sarangkot Ridge Inn & Eco Lodge",
    nepali_name: "सारङ्कोट रिज इन",
    location_area: "Sarangkot Viewpoint, Pokhara",
    rating: 4.6,
    description: "Perched 1,600 metres above the valley floor, this solar-powered inn offers clear sunrise panoramas across Dhaulagiri, Annapurna I, and Lamjung Himal.",
    contact_phone: "+97761490214",
    contact_email: "host@sarangkotridge.com.np",
    commission_rate: 0.10,
    image_url: "/images/pokhara-sarangkot-sunrise.jpg",
    image_caption: "Sunrise over the Annapurna range from Sarangkot",
    image_credit: "Photo: Meridian Journeys Archive",
    is_active: true
  },
  {
    id: "htl-cht-1",
    district_id: "dst-chitwan",
    name: "Rapti River Grassland Lodge",
    nepali_name: "राप्ती रिभर ग्रासल्याण्ड लज",
    location_area: "Old Sauraha, Chitwan",
    rating: 4.9,
    description: "Reflecting traditional Tharu architectural wisdom with unbaked mud plaster and thatch roofs, this lodge borders the Rapti River buffer zone where rhinos frequently graze at dusk.",
    contact_phone: "+97756580120",
    contact_email: "reservations@raptiriverlodge.np",
    commission_rate: 0.12,
    image_url: "/images/chitwan-rapti-canoe.jpg",
    image_caption: "Canoe on the Rapti River at dawn",
    image_credit: "Photo: Chitwan Ecotourism Council",
    is_active: true
  },
  {
    id: "htl-cht-2",
    district_id: "dst-chitwan",
    name: "Barandabhar Forest Retreat",
    nepali_name: "बरन्डाभार फरेस्ट रिट्रिट",
    location_area: "Meghauli Buffer Corridor, Chitwan",
    rating: 4.7,
    description: "An eco-certified partner base tucked into the subtropical forest corridor. Guided nature walks start straight from the courtyard with strict single-use plastic prohibition.",
    contact_phone: "+97756591044",
    contact_email: "concierge@barandabharretreat.com",
    commission_rate: 0.10,
    image_url: "/images/hotel-placeholder.jpg",
    image_caption: "Photo coming soon",
    image_credit: "Partner archive in progress",
    is_active: true
  }
];

export const fallbackExperiences: Experience[] = [
  // Pokhara
  {
    id: "exp-pkr-1",
    district_id: "dst-pokhara",
    title: "Phewa Lake Dawn Crossing & Ridge Hike to Shanti Stupa",
    nepali_title: "फेवा डुङ्गा सयर तथा शान्ति स्तूप पदयात्रा",
    category: "sightseeing",
    description: "Board a traditional wooden dunga across Phewa Lake at first light. Ascend through Raniban forest to the white dome of the World Peace Pagoda for quiet panoramic views.",
    duration_hours: 3.5,
    price_npr: 2400,
    needs_booking: true,
    image_url: "/images/pokhara-world-peace-pagoda.jpg",
    image_caption: "World Peace Pagoda (Shanti Stupa) on the hill above the lake",
    image_credit: "Photo: Meridian Journeys Archive",
    is_published: true
  },
  {
    id: "exp-pkr-2",
    district_id: "dst-pokhara",
    title: "Tandem Paragliding Descent from Sarangkot Ridge",
    nepali_title: "सारङ्कोट प्याराग्लाइडिङ उडान",
    category: "adventure",
    description: "Launch with an experienced certified Nepali tandem pilot from 1,600m. Catch thermals alongside Himalayan griffons before touching down gently on the lake shore.",
    duration_hours: 1.5,
    price_npr: 8500,
    needs_booking: true,
    image_url: "/images/pokhara-paragliding.jpg",
    image_caption: "Paragliders over Pokhara valley",
    image_credit: "Photo: Nepal Civil Aviation Authority Partner",
    is_published: true
  },
  {
    id: "exp-pkr-3",
    district_id: "dst-pokhara",
    title: "Tal Barahi Temple Visit & Baidam Heritage Walk",
    nepali_title: "ताल बाराही मन्दिर दर्शन तथा पैदल यात्रा",
    category: "culture",
    description: "Visit the two-tier pagoda temple dedicated to Goddess Durga on a small island in Phewa Lake, followed by a walk through historic lakeside village alleys.",
    duration_hours: 2.0,
    price_npr: 800,
    needs_booking: false,
    image_url: "/images/pokhara-tal-barahi.jpg",
    image_caption: "Tal Barahi temple on its island in Phewa Lake",
    image_credit: "Photo: Saroj Thapa",
    is_published: true
  },
  {
    id: "exp-pkr-4",
    district_id: "dst-pokhara",
    title: "Patale Chhango (Devi's Fall) & Gupteshwor Sacred Cave",
    nepali_title: "पातले छाँगो (डेभिज फल) तथा गुप्तेश्वर गुफा",
    category: "sightseeing",
    description: "Witness the waters of Pardi Khola vanish underground into limestone shafts, then explore Gupteshwor Mahadev cave where mineral stalactites enshrine Shiva.",
    duration_hours: 2.5,
    price_npr: 1200,
    needs_booking: false,
    image_url: "/images/pokhara-devis-fall.jpg",
    image_caption: "Devi's Fall waterfall plunging through subterranean stone",
    image_credit: "Photo: Meridian Journeys",
    is_published: true
  },
  {
    id: "exp-pkr-5",
    district_id: "dst-pokhara",
    title: "Artisan Himalayan Coffee Tasting & Farm Dialogue",
    nepali_title: "स्थानीय कफी स्वाद तथा जैविक फार्म भ्रमण",
    category: "food",
    description: "Explore shade-grown Arabica plantations on Kaski hillsides, with cupping and roast insights led by a local Pokhara roaster.",
    duration_hours: 3.0,
    price_npr: 1900,
    needs_booking: true,
    image_url: "/images/pokhara-sarangkot-sunrise.jpg",
    image_caption: "Kaski foothills where high-altitude Arabica flourishes",
    image_credit: "Photo: Meridian Journeys Archive",
    is_published: true
  },

  // Chitwan
  {
    id: "exp-cht-1",
    district_id: "dst-chitwan",
    title: "Rapti River Hand-Carved Dugout Canoe Safari",
    nepali_title: "राप्ती नदी काठको डुङ्गा सफारी",
    category: "wildlife",
    description: "Drift soundlessly down the misted river at sunrise in a traditional dugout. Spot critically endangered fish-eating gharials and marsh muggers resting on sandbars.",
    duration_hours: 2.5,
    price_npr: 2200,
    needs_booking: true,
    image_url: "/images/chitwan-rapti-canoe.jpg",
    image_caption: "Canoe on the Rapti River at dawn",
    image_credit: "Photo: Chitwan Ecotourism Council",
    is_published: true
  },
  {
    id: "exp-cht-2",
    district_id: "dst-chitwan",
    title: "Open Jeep Deep Jungle Safari through Sal Forest",
    nepali_title: "खुल्ला जीप जङ्गल सफारी",
    category: "wildlife",
    description: "Traverse core trails of Chitwan National Park in an open-top 4x4 accompanied by a certified park tracker, observing rhinos, spotted deer, wild boars, and rich birdlife.",
    duration_hours: 4.5,
    price_npr: 4500,
    needs_booking: true,
    image_url: "/images/chitwan-jungle-safari.jpg",
    image_caption: "Jeep safari through sal forest",
    image_credit: "Photo: Park Tracker Association",
    is_published: true
  },
  {
    id: "exp-cht-3",
    district_id: "dst-chitwan",
    title: "Authentic Tharu Village Cultural Walk & Mud Craft",
    nepali_title: "थारू गाउँको सांस्कृतिक पदयात्रा",
    category: "culture",
    description: "Walk between ancestral clay-rendered homes in Bachhauli. Learn how Tharu communities have harmonized with the wild lowlands for generations.",
    duration_hours: 3.0,
    price_npr: 1600,
    needs_booking: false,
    image_url: "/images/chitwan-tharu-village.jpg",
    image_caption: "Traditional Tharu house with clay walls and grass roof",
    image_credit: "Photo: Tharu Indigenous Cultural Forum",
    is_published: true
  },
  {
    id: "exp-cht-4",
    district_id: "dst-chitwan",
    title: "Evening Tharu Stick & Fire Dance (Danda Nach)",
    nepali_title: "थारू लाठी नाच (दाँडा नाच)",
    category: "culture",
    description: "A ceremonial performance celebrating harvest, vigilance, and community solidarity, accompanied by traditional dholak rhythms in Sauraha.",
    duration_hours: 1.5,
    price_npr: 800,
    needs_booking: true,
    image_url: "/images/chitwan-tharu-dance.jpg",
    image_caption: "Tharu cultural dance performance",
    image_credit: "Photo: Sauraha Cultural Group",
    is_published: true
  },
  {
    id: "exp-cht-5",
    district_id: "dst-chitwan",
    title: "Educational Elephant Breeding Centre & Care Dialogue",
    nepali_title: "हात्ती प्रजनन् केन्द्र तथा संरक्षण विमर्श",
    category: "wildlife",
    description: "An educational visit to the Sauraha breeding sanctuary with a dedicated naturalist exploring anti-poaching patrol practices and elephant health.",
    duration_hours: 2.0,
    price_npr: 950,
    needs_booking: false,
    image_url: "/images/chitwan-elephant-breeding.jpg",
    image_caption: "Elephants at the breeding centre in Sauraha",
    image_credit: "Photo: Dept of National Parks",
    is_published: true
  }
];

export const fallbackPlans: Plan[] = [
  {
    id: "pln-demo-8419",
    district_id: "dst-pokhara",
    district_name: "Pokhara",
    nights: 3,
    start_date: "2026-11-20",
    status: "confirmed",
    total_npr: 25200,
    created_at: "2026-11-01T08:30:00Z",
    customer_name: "Aarati Sharma",
    customer_phone: "+9779841234567"
  }
];
