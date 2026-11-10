/**
 * Subtle geometric divider inspired by Newar woodcarving and Tharu relief patterns.
 * Minimalist, respectful, and hairline-fine.
 */
export default function NewarBorder({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full flex items-center justify-center my-10 ${className}`} aria-hidden="true">
      <div className="flex-1 h-[1px] bg-[#D9D3C7]" />
      <div className="px-4 flex items-center space-x-2 opacity-50">
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none" className="text-[#1F2A2E]">
          <path d="M0 6L6 0L12 6L6 12L0 6Z" fill="currentColor" fillOpacity="0.4"/>
          <path d="M16 6L22 0L28 6L22 12L16 6Z" fill="currentColor" fillOpacity="0.4"/>
          <circle cx="14" cy="6" r="1.5" fill="currentColor" />
        </svg>
      </div>
      <div className="flex-1 h-[1px] bg-[#D9D3C7]" />
    </div>
  );
}
