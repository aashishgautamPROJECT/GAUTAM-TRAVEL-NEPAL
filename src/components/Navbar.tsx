import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import PrayerFlagStrip from './PrayerFlagStrip';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F0E6]/95 backdrop-blur-xs hairline-b">
      <PrayerFlagStrip />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand identity */}
        <Link to="/" className="flex flex-col group">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#1F2A2E] group-hover:text-[#2F5D7C] transition-colors">
              Gautam Travels
            </span>
            <span className="font-serif text-sm text-[#D98E2B] hidden sm:inline">
              गौतम ट्राभल्स
            </span>
          </div>
          <span className="text-[11px] tracking-widest uppercase text-[#4A5B60] font-sans font-medium">
            Pokhara &bull; Chitwan Travel Bureau
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "text-[#2F5D7C] border-b border-[#2F5D7C] pb-0.5" : "text-[#1F2A2E] hover:text-[#2F5D7C] transition-colors"
            }
          >
            {t('nav_home')}
          </NavLink>
          
          <div className="relative group">
            <span className="cursor-pointer text-[#1F2A2E] hover:text-[#2F5D7C] transition-colors flex items-center space-x-1">
              <span>{t('nav_districts')}</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <div className="absolute left-0 mt-2 w-52 bg-[#FAF7F0] border border-[#D9D3C7] shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1 z-50 rounded-[4px]">
              <Link to="/districts/pokhara" className="block px-4 py-2.5 text-sm text-[#1F2A2E] hover:bg-[#E8E0D0]">
                <span className="font-serif font-semibold">Pokhara</span>
                <span className="text-xs text-[#D98E2B] ml-2">पोखरा</span>
              </Link>
              <Link to="/districts/chitwan" className="block px-4 py-2.5 text-sm text-[#1F2A2E] hover:bg-[#E8E0D0]">
                <span className="font-serif font-semibold">Chitwan</span>
                <span className="text-xs text-[#D98E2B] ml-2">चितवन</span>
              </Link>
            </div>
          </div>

          <NavLink
            to="/plan"
            className={({ isActive }) =>
              isActive ? "text-[#2F5D7C] border-b border-[#2F5D7C] pb-0.5" : "text-[#1F2A2E] hover:text-[#2F5D7C] transition-colors"
            }
          >
            {t('nav_planner')}
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? "text-[#2F5D7C] border-b border-[#2F5D7C] pb-0.5" : "text-[#1F2A2E] hover:text-[#2F5D7C] transition-colors"
            }
          >
            {t('nav_about')}
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? "text-[#2F5D7C] border-b border-[#2F5D7C] pb-0.5" : "text-[#1F2A2E] hover:text-[#2F5D7C] transition-colors"
            }
          >
            {t('nav_contact')}
          </NavLink>
        </nav>

        {/* Right side: Language Switcher & Account */}
        <div className="hidden md:flex items-center space-x-6 text-sm">
          {/* Language Toggle */}
          <div className="flex items-center border border-[#D9D3C7] rounded-[4px] p-0.5 bg-[#FAF7F0]">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 text-xs font-medium rounded-[2px] transition-colors ${
                lang === 'en' ? 'bg-[#1F2A2E] text-[#F5F0E6]' : 'text-[#4A5B60] hover:text-[#1F2A2E]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ne')}
              className={`px-2 py-0.5 text-xs font-medium rounded-[2px] transition-colors ${
                lang === 'ne' ? 'bg-[#1F2A2E] text-[#F5F0E6]' : 'text-[#4A5B60] hover:text-[#1F2A2E]'
              }`}
            >
              नेपा
            </button>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/account"
                className="text-xs uppercase tracking-wider font-semibold text-[#1F2A2E] hover:text-[#2F5D7C]"
              >
                {t('nav_account')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-xs uppercase tracking-wider font-bold text-[#D98E2B] hover:text-[#C27C21] px-2 py-0.5 border border-[#D98E2B] rounded-[2px]"
                >
                  Admin Desk
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-xs text-[#728388] hover:text-red-700 underline"
              >
                {t('nav_signout')}
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs uppercase tracking-wider font-semibold text-[#1F2A2E] hover:text-[#2F5D7C]"
            >
              {t('nav_signin')}
            </Link>
          )}

          <Link
            to="/plan"
            className="px-4 py-2 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-medium rounded-[4px] transition-colors"
          >
            {t('start_planning')}
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center space-x-3 md:hidden">
          <button
            onClick={() => setLang(lang === 'en' ? 'ne' : 'en')}
            className="px-2 py-1 border border-[#D9D3C7] text-xs rounded-[4px] font-medium bg-white"
          >
            {lang === 'en' ? 'नेपाली' : 'English'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#1F2A2E] hover:text-[#2F5D7C] focus:outline-none"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F0] border-b border-[#D9D3C7] px-4 pt-3 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1F2A2E] py-1"
          >
            {t('nav_home')}
          </Link>
          <div className="pl-3 border-l-2 border-[#D9D3C7] space-y-2">
            <Link
              to="/districts/pokhara"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#4A5B60]"
            >
              Pokhara / पोखरा
            </Link>
            <Link
              to="/districts/chitwan"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-[#4A5B60]"
            >
              Chitwan / चितवन
            </Link>
          </div>
          <Link
            to="/plan"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1F2A2E] py-1"
          >
            {t('nav_planner')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1F2A2E] py-1"
          >
            {t('nav_about')}
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#1F2A2E] py-1"
          >
            {t('nav_contact')}
          </Link>
          
          <div className="pt-3 border-t border-[#D9D3C7] flex justify-between items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[#1F2A2E]"
                >
                  {t('nav_account')}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-bold text-[#D98E2B] px-2 py-0.5 border border-[#D98E2B] rounded-[2px]"
                  >
                    Admin Desk
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="text-xs text-red-700 underline"
                >
                  {t('nav_signout')}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#2F5D7C]"
              >
                {t('nav_signin')}
              </Link>
            )}
            <Link
              to="/plan"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 bg-[#2F5D7C] text-white text-xs rounded-[4px]"
            >
              {t('start_planning')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
