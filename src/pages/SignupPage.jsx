import React, { useState, useEffect } from 'react';
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
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  Award,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    signup, 
    loginWithGoogle, 
    sendPhoneSms, 
    confirmPhoneSignup, 
    createOrCompleteUserProfile,
    findExistingUserByPhone,
    findExistingUserByEmail,
    setRole 
  } = useAuth();

  const roleParam = searchParams.get('role') || 'traveller';
  const [activeRole, setActiveRole] = useState(roleParam.toLowerCase());

  useEffect(() => {
    if (roleParam) {
      const lower = roleParam.toLowerCase();
      setActiveRole(lower);
      setRole(lower);
    }
  }, [roleParam, setRole]);

  // Method Switcher: 'otp' (verify phone first) vs 'email' (verify email & attach phone)
  const [signupMethod, setSignupMethod] = useState('otp');

  // Common Profile Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('India');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState('Uttarakhand');
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [experienceYears, setExperienceYears] = useState(2);
  const [bio, setBio] = useState('');

  // OTP Verification State (Method 1: OTP)
  // Step 1: phone verification, Step 2: basic details
  const [otpStep, setOtpStep] = useState(1); 
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [verifiedPhoneUser, setVerifiedPhoneUser] = useState(null);

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
    const lower = role.toLowerCase();
    setActiveRole(lower);
    setRole(lower);
    setError(null);
    navigate(`/signup?role=${lower}`, { replace: true });
  };

  const handleNavigationAfterSignup = () => {
    if (isGuide) {
      navigate('/guide/onboarding');
    } else {
      const redirect = searchParams.get('redirect') || '/explore';
      navigate(redirect);
    }
  };

  // Google 1-Click Signup
  const handleGoogleSignup = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle(activeRole);
      if (res.isNew) {
        // Pre-fill user data and move to basic details step
        setName(res.initialData.name || '');
        setEmail(res.initialData.email || '');
        setVerifiedPhoneUser(res.user);
        setOtpStep(2);
      } else {
        handleNavigationAfterSignup();
      }
    } catch (err) {
      console.error("Google sign up error:", err);
      setError(err.message || "Failed to sign up with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Send OTP for Phone Verification
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError(null);
    setOtpSending(true);

    const clean = phoneNumber.trim().replace(/\D/g, '');
    const fullPhone = `${countryCode}${clean}`;

    try {
      // Check if phone number is already registered
      const existingPhone = await findExistingUserByPhone(fullPhone);
      if (existingPhone) {
        setError(`This mobile number (${fullPhone}) is already registered with an existing account. Please sign in instead.`);
        setOtpSending(false);
        return;
      }

      const conf = await sendPhoneSms(fullPhone, 'recaptcha-signup-container');
      setConfirmationResult(conf);
      setOtpSent(true);
    } catch (err) {
      console.error("SMS send error:", err);
      let msg = err.message || "Failed to send SMS OTP. Please check your phone number.";
      const errStr = String(err?.code || err?.message || '');
      if (errStr.includes('-39') || errStr.includes('quota-exceeded')) {
        msg = "Daily SMS quota exceeded. Please sign up using the 'Email & Password' or Google option.";
      } else if (errStr.includes('too-many-requests')) {
        msg = "Too many OTP requests in a short time. Please wait a few minutes or use Email & Password.";
      } else if (errStr.includes('invalid-phone-number')) {
        msg = "Please enter a valid phone number with correct digits.";
      } else if (errStr.includes('reCAPTCHA')) {
        msg = "Security reCAPTCHA reset. Please tap 'Send Verification OTP' again.";
      }
      setError(msg);
    } finally {
      setOtpSending(false);
    }
  };

  // 2. Verify OTP -> Progress to Step 2 (Collect Basic Details)
  const handleVerifyOtpAndProceed = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      setError('Please enter the 6-digit SMS OTP code sent to your phone.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (confirmationResult && typeof confirmationResult.confirm === 'function') {
        const cred = await confirmationResult.confirm(enteredOtp.trim());
        setVerifiedPhoneUser(cred.user);
        setOtpStep(2); // Move to Step 2: Basic details
      } else {
        throw new Error("Security verification missing. Please request OTP again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid OTP code. Please enter the correct 6 digits.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Complete Registration after OTP Verification
  const handleCompletePhoneRegistration = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!email || !email.includes('@')) {
      setError("A valid email address is required so both your number and email are attached.");
      return;
    }

    const clean = phoneNumber.trim().replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${clean}`;
    const finalCity = isCustomCity ? customCity.trim() : (city || (availableCities[0] || 'Base Town'));

    setIsLoading(true);
    setError(null);

    try {
      const uid = verifiedPhoneUser ? verifiedPhoneUser.uid : null;
      if (!uid) throw new Error("Verification session expired. Please start again.");

      await createOrCompleteUserProfile(uid, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: verifiedPhoneUser.phoneNumber || fullPhoneNumber,
        country,
        role: activeRole,
        state,
        city: finalCity,
        experienceYears,
        bio: bio.trim(),
      });

      handleNavigationAfterSignup();
    } catch (err) {
      console.error("Phone registration error:", err);
      setError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Email & Password Registration (Mandatory Mobile Number)
  const handleEmailSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError("Please enter your full legal name.");
      return;
    }
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError("Mobile number is required so your account has both email and number attached.");
      return;
    }

    const clean = phoneNumber.trim().replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${clean}`;
    const finalCity = isCustomCity ? customCity.trim() : (city || (availableCities[0] || 'Base Town'));

    setIsLoading(true);
    setError(null);

    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: fullPhoneNumber,
        country,
        role: activeRole,
        state,
        city: finalCity,
        experienceYears,
        bio: bio.trim(),
      });

      handleNavigationAfterSignup();
    } catch (err) {
      console.error("Email signup error:", err);
      let msg = err.message || "Failed to create account.";
      if (err.code === 'auth/email-already-in-use') {
        msg = "This email address is already in use. Please sign in instead.";
      }
      setError(msg);
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
          <div className="flex rounded-xl p-1 bg-black/30 border border-white/10 mb-5">
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

          {/* Google 1-Click Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide bg-white text-neutral-900 hover:bg-neutral-100 transition-all flex items-center justify-center gap-3 shadow-md mb-4 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign up with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/15"></div>
            <span className="px-3 text-[10px] uppercase tracking-wider text-white/50 font-bold">Or register with</span>
            <div className="flex-1 border-t border-white/15"></div>
          </div>

          {/* Method Tabs: OTP First vs Email & Password */}
          <div className="flex border-b border-white/15 mb-5 pb-2 text-xs font-bold justify-center gap-6">
            <button
              type="button"
              onClick={() => { setSignupMethod('otp'); setError(null); }}
              className={`pb-1 transition-all ${signupMethod === 'otp' ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold' : 'text-white/60 hover:text-white'}`}
            >
              Verify via Mobile & OTP
            </button>
            <button
              type="button"
              onClick={() => { setSignupMethod('email'); setError(null); }}
              className={`pb-1 transition-all ${signupMethod === 'email' ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold' : 'text-white/60 hover:text-white'}`}
            >
              Email & Password
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= OPTION 1: MOBILE & OTP SIGNUP ================= */}
          {signupMethod === 'otp' && (
            <div>
              {otpStep === 1 ? (
                /* Step 1: Phone Entry & Verification */
                <form onSubmit={handleVerifyOtpAndProceed} className="space-y-4">
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
                    <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                      {/* Clean text with circular check icon (NOT in green banner) */}
                      <div className="flex items-center gap-2 py-1 px-0.5 text-xs text-white/90 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-white/70 flex-shrink-0" />
                        <span>OTP sent to {countryCode} {phoneNumber}</span>
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
                            placeholder="Type OTP here"
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
                          Change Number
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
                              <span>Verifying OTP...</span>
                            </>
                          ) : (
                            <span>Verify OTP & Continue</span>
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={otpSending}
                        onClick={handleSendOtp}
                        className="w-full py-2 text-center text-xs font-semibold text-white/70 hover:text-white transition"
                      >
                        {otpSending ? 'Sending New OTP...' : 'Resend Verification SMS OTP'}
                      </button>
                    </div>
                  )}

                  <div id="recaptcha-signup-container"></div>
                </form>
              ) : (
                /* Step 2: Basic Details (No dummy data!) */
                <form onSubmit={handleCompletePhoneRegistration} className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs flex items-center gap-2 text-white/90">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Phone verified: <strong>{verifiedPhoneUser?.phoneNumber || `${countryCode} ${phoneNumber}`}</strong></span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Tenzing Norgay"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Email Address (MANDATORY TO ATTACH EMAIL & PHONE) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Email Address * (Attached to this account)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                      Country *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setCountry(newCountry);
                        if (newCountry === 'India') setState('Uttarakhand');
                        else if (newCountry === 'Nepal') setState(NEPAL_REGIONS[0]);
                        else if (newCountry === 'Bhutan') setState(BHUTAN_REGIONS[0]);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {COUNTRY_LIST.map((c) => (
                        <option key={c.name} value={c.name} className="bg-neutral-900 text-white">
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State & City */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                        State / Region *
                      </label>
                      <select
                        value={state}
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
                          <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                        City / Base Town *
                      </label>
                      {!isCustomCity && availableCities.length > 0 ? (
                        <select
                          value={city || availableCities[0]}
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
                            <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>
                          ))}
                          <option value="__OTHER__" className="bg-neutral-900 text-emerald-400 font-bold">+ Other Base Town</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={customCity}
                          onChange={(e) => setCustomCity(e.target.value)}
                          placeholder="e.g. Manali, Paro, Thimphu"
                          className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      )}
                    </div>
                  </div>

                  {/* Guide Specific Inputs */}
                  {isGuide && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
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
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell explorers about your roots and the local trails you guide..."
                          className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-3 ${
                      isGuide
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                        : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Unified Profile...</span>
                      </>
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ================= OPTION 2: EMAIL & PASSWORD SIGNUP ================= */}
          {signupMethod === 'email' && (
            <form onSubmit={handleEmailSignupSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tenzing Norgay"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  Password * (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* MANDATORY Mobile Number with Country Code Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  Mobile Number (Tied to Account) *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
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
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Country Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  Country *
                </label>
                <select
                  value={country}
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

              {/* State & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    State / Region *
                  </label>
                  <select
                    value={state}
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
                      <option key={s} value={s} className="bg-neutral-900 text-white">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    City / Base Town *
                  </label>
                  {!isCustomCity && availableCities.length > 0 ? (
                    <select
                      value={city || availableCities[0]}
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
                        <option key={c} value={c} className="bg-neutral-900 text-white">{c}</option>
                      ))}
                      <option value="__OTHER__" className="bg-neutral-900 text-emerald-400 font-bold">+ Other Base Town</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="e.g. Manali, Rishikesh"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  )}
                </div>
              </div>

              {/* Guide Specific Inputs */}
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
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell explorers about your roots and the local trails you guide..."
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-3 ${
                  isGuide
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Unified Account</span>
                )}
              </button>
            </form>
          )}

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
