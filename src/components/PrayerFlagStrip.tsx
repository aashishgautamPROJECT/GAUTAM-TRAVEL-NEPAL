/**
 * Thin prayer flag strip (blue, white, red, green, yellow)
 * Used strictly as a refined hairline element, never as a large block.
 */
export default function PrayerFlagStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`h-[3px] w-full flex overflow-hidden ${className}`} aria-hidden="true">
      <div className="flex-1 bg-[#1C5B8B]" title="Blue (Sky / Space)" />
      <div className="flex-1 bg-[#F5F0E6] border-t border-b border-[#D9D3C7]" title="White (Air / Wind)" />
      <div className="flex-1 bg-[#A82E2E]" title="Red (Fire)" />
      <div className="flex-1 bg-[#2A7246]" title="Green (Water)" />
      <div className="flex-1 bg-[#E6A728]" title="Yellow (Earth)" />
    </div>
  );
}
