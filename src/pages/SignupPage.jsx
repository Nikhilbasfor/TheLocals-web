import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CinematicScenicBackground from '../components/common/CinematicScenicBackground';
import { 
  COUNTRY_LIST, 
  INDIAN_STATES_AND_UTS, 
  NEPAL_REGIONS, 
  BHUTAN_REGIONS, 
  STATE_CITIES_MAP 
} from '../data/geoData';
import { 
  User, 
  Phone, 
  MapPin, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  Award,
  KeyRound,
  CheckCircle2,
  Globe
} from 'lucide-react';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signupWithPhoneOtp, setRole } = useAuth();

  const roleParam = searchParams.get('role') || 'traveller';
  const [activeRole, setActiveRole] = useState(roleParam.toLowerCase());
  
  // Basic Form State
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState('Uttarakhand');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [experienceYears, setExperienceYears] = useState(2);
  const [bio, setBio] = useState('');

  // OTP Verification State
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isGuide = activeRole === 'guide';

  // Available states based on country
  const availableStates = country === 'India'
    ? INDIAN_STATES_AND_UTS
    : country === 'Nepal'
      ? NEPAL_REGIONS
      : country === 'Bhutan'
        ? BHUTAN_REGIONS
        : ['All Regions'];

  // Available cities based on selected state
  const availableCities = STATE_CITIES_MAP[state] || [];

  const handleRoleToggle = (role) => {
    setActiveRole(role);
    setRole(role);
    setError(null);
  };

  const handleSendOtp = () => {
    if (!name || name.trim().length < 2) {
      setError("Please provide your full legal name.");
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError(null);
    setOtpSending(true);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpSent(true);
      setOtpSending(false);
    }, 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim() !== generatedOtp) {
      setError('Invalid OTP code. Please enter the 6-digit code sent to your phone.');
      return;
    }

    const finalCity = isCustomCity ? customCity.trim() : (city || (availableCities[0] || 'Base Town'));

    setIsLoading(true);
    setError(null);

    const fullPhoneNumber = `${countryCode} ${phoneNumber.trim()}`;

    try {
      await signupWithPhoneOtp({
        name: name.trim(),
        phone: fullPhoneNumber,
        country,
        role: activeRole,
        state,
        city: finalCity,
        experienceYears,
        bio
      });

      if (isGuide) {
        navigate('/guide/onboarding');
      } else {
        const redirect = searchParams.get('redirect') || '/explore';
        navigate(redirect);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CinematicScenicBackground
      imageUrl={
        isGuide
          ? "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85"
          : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85"
      }
      overlayAlpha={0.75}
    >
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 max-w-lg mx-auto w-full">
        
        {/* Back Link */}
        <div className="w-full mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal Selection</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="w-full rounded-3xl p-6 md:p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black tracking-wider uppercase font-sans">
              Create Your Account
            </h2>
            <p className="text-xs text-emerald-200 mt-1 uppercase tracking-wider font-semibold">
              {isGuide ? 'Join our verified guide & host network' : 'Begin your Himalayan discovery journey'}
            </p>
          </div>

          {/* Role Pill */}
          <div className="flex rounded-xl p-1 bg-black/30 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => handleRoleToggle('traveller')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isGuide ? 'bg-sky-500 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Explorer / Traveller
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('guide')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isGuide ? 'bg-emerald-500 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Local Host / Guide
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  disabled={otpSent}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tenzing Norgay"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Country Selector Dropdown (Requirement 11) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Country *
              </label>
              <div className="relative">
                <select
                  value={country}
                  disabled={otpSent}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setCountry(newCountry);
                    const matched = COUNTRY_LIST.find((c) => c.name === newCountry);
                    if (matched) setCountryCode(matched.dialCode);
                    if (newCountry === 'India') setState('Uttarakhand');
                    else if (newCountry === 'Nepal') setState(NEPAL_REGIONS[0]);
                    else if (newCountry === 'Bhutan') setState(BHUTAN_REGIONS[0]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {COUNTRY_LIST.map((c) => (
                    <option key={c.name} value={c.name} className="bg-neutral-900 text-white">
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Number with Country Code Dropdown (Requirement 12) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Mobile Number (for OTP Verification) *
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  disabled={otpSent}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-28 px-2 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {COUNTRY_LIST.map((c) => (
                    <option key={c.dialCode + c.code} value={c.dialCode} className="bg-neutral-900 text-white">
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    disabled={otpSent}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Cascading State & City Dropdowns (Requirement 11) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  State / Region *
                </label>
                <div className="relative">
                  <select
                    value={state}
                    disabled={otpSent}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setState(newState);
                      const cities = STATE_CITIES_MAP[newState] || [];
                      if (cities.length > 0) {
                        setCity(cities[0]);
                        setIsCustomCity(false);
                      } else {
                        setIsCustomCity(true);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {availableStates.map((s) => (
                      <option key={s} value={s} className="bg-neutral-900 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  City / Base Town *
                </label>
                <div className="relative">
                  {!isCustomCity && availableCities.length > 0 ? (
                    <select
                      value={city || availableCities[0]}
                      disabled={otpSent}
                      onChange={(e) => {
                        if (e.target.value === '__OTHER__') {
                          setIsCustomCity(true);
                          setCustomCity('');
                        } else {
                          setCity(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c} className="bg-neutral-900 text-white">
                          {c}
                        </option>
                      ))}
                      <option value="__OTHER__" className="bg-neutral-900 text-emerald-400 font-bold">+ Other Base Town</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled={otpSent}
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="e.g. Manali, Rishikesh"
                      className="w-full pl-3 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Guide specific inputs */}
            {isGuide && (
              <div className="space-y-3 pt-1 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Years of Guiding Experience
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      min="0"
                      max="40"
                      disabled={otpSent}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Brief Bio / Roots in the Homeland
                  </label>
                  <textarea
                    rows="2"
                    disabled={otpSent}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell explorers about your roots and the local trails you guide..."
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* OTP VERIFICATION SECTION */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-3 ${
                  isGuide
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                }`}
              >
                {otpSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send Verification OTP</span>
                )}
              </button>
            ) : (
              <div className="space-y-4 pt-2 border-t border-white/15 animate-in fade-in duration-150">
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OTP Sent to {countryCode} {phoneNumber}</span>
                  </div>
                  <p className="text-[11px] text-white/80">
                    Enter code <span className="font-mono font-black text-sm bg-black/40 px-2 py-0.5 rounded text-white tracking-widest">{generatedOtp}</span> to verify registration:
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength="6"
                      required
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setEnteredOtp(''); }}
                    className="px-4 py-2.5 rounded-xl border border-white/20 text-xs font-semibold hover:bg-white/10"
                  >
                    Edit Info
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                      isGuide
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Creating...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-white/70">
            Already registered?{' '}
            <Link
              to={`/login?role=${activeRole}`}
              className="font-bold text-white hover:text-emerald-300 underline underline-offset-4 ml-1"
            >
              Sign In
            </Link>
          </div>

        </div>

      </div>
    </CinematicScenicBackground>
  );
}
