import { PartnerHotel, HotelRoom } from '../types';
import ImageWithCaption from './ImageWithCaption';
import { formatNPR } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface HotelModalProps {
  hotel: PartnerHotel | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom?: (hotel: PartnerHotel, room: HotelRoom) => void;
}

export default function HotelModal({ hotel, isOpen, onClose, onSelectRoom }: HotelModalProps) {
  const { t } = useLanguage();
  if (!isOpen || !hotel) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1F2A2E]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#FAF7F0] border border-[#D9D3C7] w-full max-w-3xl rounded-[4px] shadow-xl overflow-hidden my-8"
        role="dialog" 
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#D9D3C7] flex justify-between items-start bg-[#F5F0E6]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#4A5B60]">Partner Hotel Details</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1F2A2E]">
              {hotel.name}
            </h3>
            {hotel.nepali_name && (
              <p className="text-sm text-[#D98E2B] font-medium">{hotel.nepali_name}</p>
            )}
            <p className="text-xs text-[#4A5B60] mt-1">{hotel.location_area}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#4A5B60] hover:text-[#1F2A2E] text-2xl leading-none p-1 focus:outline-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <ImageWithCaption
            src={hotel.image_url}
            caption={hotel.image_caption || `${hotel.name} courtyard and rooms`}
            credit={hotel.image_credit || "Photo: Meridian Journeys partner archive"}
            aspectRatio="aspect-[21/9]"
          />

          <div>
            <h4 className="font-serif text-lg text-[#1F2A2E] font-semibold mb-2">About this Partner Lodge</h4>
            <p className="text-sm text-[#4A5B60] leading-relaxed font-sans">
              {hotel.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 px-4 bg-[#F5F0E6] border border-[#D9D3C7] rounded-[4px] text-xs">
            <div>
              <span className="text-[#728388] block uppercase tracking-wider text-[10px]">Direct Contact Phone</span>
              <span className="font-medium text-[#1F2A2E] font-mono">{hotel.contact_phone}</span>
            </div>
            <div>
              <span className="text-[#728388] block uppercase tracking-wider text-[10px]">Verification Email</span>
              <span className="font-medium text-[#1F2A2E]">{hotel.contact_email}</span>
            </div>
          </div>

          {/* Rooms */}
          <div>
            <h4 className="font-serif text-xl text-[#1F2A2E] font-semibold mb-3">Room Types & Nightly Rates</h4>
            <div className="space-y-3">
              {hotel.hotel_rooms && hotel.hotel_rooms.length > 0 ? (
                hotel.hotel_rooms.map((room) => {
                  const isSoldOut = room.rooms_available <= 0;
                  return (
                    <div
                      key={room.id}
                      className={`p-4 border rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSoldOut 
                          ? 'bg-[#E8E0D0]/50 border-[#D9D3C7]/60 opacity-60' 
                          : 'bg-white border-[#D9D3C7]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-serif text-lg font-medium text-[#1F2A2E]">{room.room_type}</h5>
                          {isSoldOut && (
                            <span className="text-[10px] bg-[#728388] text-white px-2 py-0.5 rounded-[2px] uppercase tracking-wider">
                              {t('sold_out')}
                            </span>
                          )}
                        </div>
                        {room.description && (
                          <p className="text-xs text-[#4A5B60] font-sans">{room.description}</p>
                        )}
                        {!isSoldOut && (
                          <span className="text-xs text-emerald-800 font-medium">
                            {room.rooms_available} rooms available
                          </span>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2">
                        <div className="text-right">
                          <span className="text-base font-semibold text-[#1F2A2E]">
                            {formatNPR(room.price_per_night_npr)}
                          </span>
                          <span className="text-xs text-[#4A5B60] ml-1">/ {t('per_night')}</span>
                        </div>

                        {onSelectRoom && (
                          <button
                            disabled={isSoldOut}
                            onClick={() => {
                              onSelectRoom(hotel, room);
                              onClose();
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-[4px] transition-colors ${
                              isSoldOut
                                ? 'bg-[#D9D3C7] text-[#728388] cursor-not-allowed'
                                : 'bg-[#2F5D7C] hover:bg-[#244962] text-white'
                            }`}
                          >
                            {isSoldOut ? t('sold_out') : "Select for Itinerary"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#4A5B60] italic">No rooms currently listed for this partner.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F5F0E6] border-t border-[#D9D3C7] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold border border-[#D9D3C7] hover:bg-[#E8E0D0] rounded-[4px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
