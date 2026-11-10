import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidNepalPhone } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();

  const isSignUpDefault = searchParams.get('mode') === 'signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+977');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isSignUp) {
      if (!isValidNepalPhone(phone)) {
        setErrorMsg("Phone number must match Nepal format: +977 followed by 8 to 10 digits (e.g. +9779841234567).");
        setLoading(false);
        return;
      }

      const res = await signUp({ email, password, full_name: fullName, phone });
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
    } else {
      const res = await signIn({ email, password });
      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate(redirectUrl);
  };

  const handlePasswordReset = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your account email address above first.");
      return;
    }
    setResetSent(true);
    setErrorMsg('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#D9D3C7] p-8 rounded-[4px] shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#728388] font-semibold">
            Gautam Travels Portal
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#1F2A2E] mt-1">
            {isSignUp ? t('nav_signup') : t('nav_signin')}
          </h1>
          <p className="text-xs text-[#4A5B60] mt-1 font-sans">
            {isSignUp 
              ? "Create your guest account to manage plans and offline itineraries." 
              : "Sign in with your email and password to view active itineraries."}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-800 text-xs p-3 border border-red-200 rounded-[4px]">
            {errorMsg}
          </div>
        )}

        {resetSent && (
          <div className="bg-emerald-50 text-emerald-800 text-xs p-3 border border-emerald-200 rounded-[4px]">
            Password reset link has been dispatched to <strong>{email}</strong>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Suman Shakya"
                  className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
                  Nepal Phone (+977 followed by 8-10 digits)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] font-mono focus:border-[#2F5D7C]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#728388] mb-1 font-semibold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="traveler@example.com"
              className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs uppercase tracking-wider text-[#728388] font-semibold">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-[11px] text-[#2F5D7C] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 border border-[#D9D3C7] rounded-[4px] text-sm bg-[#FAF7F0] focus:border-[#2F5D7C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2F5D7C] hover:bg-[#244962] text-white text-xs uppercase tracking-wider font-semibold rounded-[4px] transition-colors"
          >
            {loading ? "Processing..." : (isSignUp ? "Register Account" : "Sign In")}
          </button>
        </form>



        <div className="pt-2 text-center text-xs text-[#4A5B60] border-t border-[#D9D3C7]">
          {isSignUp ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                className="text-[#2F5D7C] font-semibold underline"
              >
                Sign in here
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                className="text-[#2F5D7C] font-semibold underline"
              >
                Create one now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
