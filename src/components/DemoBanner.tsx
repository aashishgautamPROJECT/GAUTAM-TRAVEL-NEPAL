import { useState } from 'react';
import { isUsingDemoData } from '../lib/api';
import { supabaseUrl, setCustomSupabaseConfig, clearCustomSupabaseConfig } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';

export default function DemoBanner() {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.startsWith('https://') || !inputUrl.includes('.supabase.co')) {
      setErrorMsg('Please enter a valid Supabase Project URL (e.g. https://yourproject.supabase.co)');
      return;
    }
    if (!inputKey.startsWith('eyJ')) {
      setErrorMsg('Please enter a valid public anon key (starts with eyJ...)');
      return;
    }
    setCustomSupabaseConfig(inputUrl, inputKey);
  };

  return (
    <>
      <div className="bg-[#E8E0D0] text-[#1F2A2E] border-b border-[#D9D3C7] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-block w-2 h-2 rounded-full ${isUsingDemoData ? 'bg-[#D98E2B]' : 'bg-emerald-600'}`} />
            <span className="font-medium tracking-wide">
              {isUsingDemoData 
                ? 'Offline/Demo mode active. Live user bookings will not appear in Supabase Table Editor until connected.'
                : `Connected to live Supabase: ${supabaseUrl}`}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {isUsingDemoData ? (
              <button
                onClick={() => setShowModal(true)}
                className="px-2.5 py-0.5 bg-[#1F2A2E] hover:bg-[#2F5D7C] text-white text-[11px] font-semibold rounded-[2px] transition-colors"
              >
                Connect Supabase Project &rarr;
              </button>
            ) : (
              <button
                onClick={clearCustomSupabaseConfig}
                className="text-[11px] text-red-700 hover:underline"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#1F2A2E]/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D3C7] max-w-lg w-full p-6 rounded-[4px] shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#D9D3C7] pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#728388] font-semibold">Database Link</span>
                <h3 className="font-serif text-2xl font-semibold text-[#1F2A2E]">Connect Your Supabase Project</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-2xl leading-none">&times;</button>
            </div>

            <p className="text-xs text-[#4A5B60] leading-relaxed">
              To have every customer booking and contact enquiry appear in your Supabase <strong>Table Editor</strong>, paste your project credentials below (from <strong>Supabase &rarr; Project Settings &rarr; API</strong>):
            </p>

            {errorMsg && (
              <div className="p-2 text-xs bg-red-50 text-red-800 border border-red-200 rounded-[2px]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-[#728388] mb-1">
                  Project URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzproject.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-xs font-mono bg-[#FAF7F0] focus:border-[#2F5D7C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#728388] mb-1">
                  Project API Key (`anon` / `public`)
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="w-full p-2 border border-[#D9D3C7] rounded-[4px] text-xs font-mono bg-[#FAF7F0] focus:border-[#2F5D7C]"
                />
                <span className="text-[10px] text-[#728388] block mt-1">
                  Found under: Project Settings &rarr; Configuration &rarr; API &rarr; Project API keys (anon public)
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#D9D3C7]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#D9D3C7] text-xs font-semibold rounded-[4px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs font-semibold rounded-[4px]"
                >
                  Save & Connect Live Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

