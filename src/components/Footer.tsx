import { Link } from 'react-router-dom';
import PrayerFlagStrip from './PrayerFlagStrip';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1F2A2E] text-[#F5F0E6] hairline-t mt-20">
      <PrayerFlagStrip />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <span className="font-serif text-2xl tracking-tight text-white block">
              Gautam Travels
            </span>
            <p className="text-xs text-[#D9D3C7] leading-relaxed font-sans">
              Registered in Nepal under Department of Tourism No. 2841/079. Curating district-focused, conservation-first journeys across the Gandaki and Narayani river basins.
            </p>
            <div className="text-xs text-[#D98E2B] font-medium">
              Nepal Government Licensed Agency
            </div>
          </div>

          {/* Districts */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Destinations</h4>
            <ul className="space-y-2 text-sm text-[#E8E0D0]">
              <li>
                <Link to="/districts/pokhara" className="hover:text-white transition-colors">
                  Pokhara Valley & Annapurna (पोखरा)
                </Link>
              </li>
              <li>
                <Link to="/districts/chitwan" className="hover:text-white transition-colors">
                  Chitwan National Park & Sauraha (चितवन)
                </Link>
              </li>
              <li>
                <Link to="/plan" className="hover:text-white transition-colors text-[#D98E2B]">
                  Plan Custom Itinerary &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Agency & Policies</h4>
            <ul className="space-y-2 text-sm text-[#E8E0D0]">
              <li><Link to="/about" className="hover:text-white transition-colors">Our Ethos & Licensing</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Baidam & Sauraha Desks</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Booking</Link></li>
            </ul>
          </div>

          {/* Direct Support */}
          <div>
            <h4 className="font-serif text-lg text-white mb-4">Direct Desks</h4>
            <div className="space-y-2 text-xs text-[#E8E0D0] font-sans">
              <p>
                <span className="text-[#728388] block text-[11px] uppercase tracking-wider">Pokhara Desk (Lakeside-6):</span>
                +977 61 463901
              </p>
              <p>
                <span className="text-[#728388] block text-[11px] uppercase tracking-wider">Direct WhatsApp / Mobile:</span>
                +977 984 1234567
              </p>
              <p>
                <span className="text-[#728388] block text-[11px] uppercase tracking-wider">Official Email:</span>
                inquiries@gautamtravels.com.np
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#4A5B60]/40 flex flex-col sm:flex-row justify-between items-center text-xs text-[#728388]">
          <p>&copy; {currentYear} Gautam Travels Pvt. Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Handcrafted with Lokta aesthetics for travelers honoring Nepal.
          </p>
        </div>
      </div>
    </footer>
  );
}
