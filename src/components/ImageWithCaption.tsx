import { useState } from 'react';

interface ImageWithCaptionProps {
  src: string;
  alt?: string;
  caption?: string;
  credit?: string;
  className?: string;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
}

const fallbackMap: Record<string, string> = {
  'pokhara-phewa-lake.jpg': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'pokhara-sarangkot-sunrise.jpg': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  'pokhara-paragliding.jpg': 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=1200&q=80',
  'pokhara-world-peace-pagoda.jpg': 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=1200&q=80',
  'pokhara-tal-barahi.jpg': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
  'pokhara-devis-fall.jpg': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'chitwan-one-horned-rhino.jpg': 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80',
  'chitwan-rapti-canoe.jpg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'chitwan-tharu-village.jpg': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  'chitwan-elephant-breeding.jpg': 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
  'chitwan-tharu-dance.jpg': 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
  'chitwan-jungle-safari.jpg': 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=1200&q=80',
  'hotel-placeholder.jpg': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
};

export default function ImageWithCaption({
  src,
  alt,
  caption,
  credit,
  className = "",
  aspectRatio = "aspect-[16/10]",
  loading = "lazy"
}: ImageWithCaptionProps) {
  const [hasError, setHasError] = useState(false);

  const filename = src?.split('/')?.pop() || '';
  const onlineFallback = fallbackMap[filename] || fallbackMap['hotel-placeholder.jpg'];
  const finalSrc = hasError ? onlineFallback : src;

  return (
    <figure className={`flex flex-col ${className}`}>
      <div className={`relative overflow-hidden bg-[#E8E0D0] border border-[#D9D3C7] rounded-[4px] ${aspectRatio}`}>
        <img
          src={finalSrc}
          alt={alt || caption || "Nepal photography"}
          loading={loading}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-2 text-xs text-[#4A5B60] flex flex-col sm:flex-row justify-between items-baseline gap-1 font-sans">
          {caption && <span className="font-normal italic">{caption}</span>}
          {credit && <span className="text-[11px] text-[#728388] tracking-wide">{credit}</span>}
        </figcaption>
      )}
    </figure>
  );
}
