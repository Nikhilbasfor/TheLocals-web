import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
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
  Phone, 
  KeyRound, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  User,
  MapPin,
  Award,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    login, 
    loginWithGoogle, 
    sendPhoneSms, 
    confirmPhoneLogin, 
    createOrCompleteUserProfile,
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
  
  // Auth Mode: 'otp' (default) vs 'email'
  const [authMode, setAuthMode] = useState('otp');

  // OTP Form State
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // General State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Profile Completion State (if first time user logs in via Phone or Google)
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionUid, setCompletionUid] = useState(null);
  const [complName, setComplName] = useState('');
  const [complEmail, setComplEmail] = useState('');
  const [complPhone, setComplPhone] = useState('');
  const [complCountry, setComplCountry] = useState('India');
  const [complState, setComplState] = useState('Uttarakhand');
  const [complCity, setComplCity] = useState('');
  const [complBio, setComplBio] = useState('');
  const [complExperience, setComplExperience] = useState(2);
  const [complLoading, setComplLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState(null);

  const isGuide = activeRole === 'guide';

  const handleRoleToggle = (role) => {
    const lower = role.toLowerCase();
    setActiveRole(lower);
    setRole(lower);
    setError(null);
    navigate(`/login?role=${lower}`, { replace: true });
  };

  const handleNavigationAfterLogin = (profile) => {
    if (activeRole === 'traveller') {
      const redirect = searchParams.get('redirect') || '/explore';
      navigate(redirect);
    } else {
      if (!profile?.verified) {
        navigate('/guide/onboarding');
      } else {
        navigate('/guide/dashboard');
      }
    }
  };

  // Google 1-Click Sign In
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await loginWithGoogle(activeRole);
      if (res.isNew) {
        // Needs basic profile completion (mandatory phone & location)
        setCompletionUid(res.user.uid);
        setComplName(res.initialData.name || '');
        setComplEmail(res.initialData.email || '');
        setComplPhone('');
        setShowCompletionModal(true);
      } else {
        handleNavigationAfterLogin(res.profile);
      }
    } catch (err) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError(null);
    setOtpSending(true);

    const clean = phoneNumber.trim().replace(/\D/g, '');
    const fullPhone = `${countryCode}${clean}`;

    try {
      const conf = await sendPhoneSms(fullPhone, 'recaptcha-container');
      setConfirmationResult(conf);
      setOtpSent(true);
    } catch (err) {
      console.error("SMS send error:", err);
      let msg = err.message || "Failed to send SMS OTP. Please check your phone number.";
      const errStr = String(err?.code || err?.message || '');
      if (errStr.includes('-39') || errStr.includes('quota-exceeded')) {
        msg = "Daily SMS quota exceeded. Please sign in using the 'Email & Password' or Google option.";
      } else if (errStr.includes('too-many-requests')) {
        msg = "Too many OTP requests in a short time. Please wait a few minutes or use Email / Google.";
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

  // Verify OTP and Sign In
  const handleVerifyOtpAndLogin = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      setError("Please enter the 6-digit SMS OTP code sent to your phone.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await confirmPhoneLogin(confirmationResult, enteredOtp.trim(), activeRole);
      
      if (res.isNew) {
        // First-time phone user: collect real name, email, location so no dummy data is stored
        setCompletionUid(res.user.uid);
        setComplPhone(res.initialData.phone || `${countryCode}${phoneNumber.trim().replace(/\D/g, '')}`);
        setComplName('');
        setComplEmail('');
        setShowCompletionModal(true);
      } else {
        handleNavigationAfterLogin(res.profile);
      }
    } catch (err) {
      console.error("OTP Login failed:", err);
      setError(err.message || "Failed to verify SMS OTP and sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Profile Completion (Mandatory Phone & Email uniqueness)
  const handleCompleteProfileSubmit = async (e) => {
    e.preventDefault();
    if (!complName.trim()) {
      setError("Please provide your full legal name.");
      return;
    }
    if (!complEmail.trim() || !complEmail.includes('@')) {
      setError("A valid email address is required so both your number and email are attached.");
      return;
    }
    if (!complPhone.trim() || complPhone.replace(/\D/g, '').length < 6) {
      setError("A valid mobile number is required.");
      return;
    }

    setComplLoading(true);
    setError(null);

    try {
      const profile = await createOrCompleteUserProfile(completionUid, {
        name: complName,
        email: complEmail,
        phone: complPhone,
        country: complCountry,
        state: complState,
        city: complCity,
        role: activeRole,
        experienceYears: complExperience,
        bio: complBio,
      });

      setShowCompletionModal(false);
      handleNavigationAfterLogin(profile);
    } catch (err) {
      console.error("Profile completion error:", err);
      setError(err.message || "Failed to complete profile.");
    } finally {
      setComplLoading(false);
    }
  };

  // Email and Password Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user, profile } = await login(email, password, activeRole);
      
      // If legacy account has NO phone number attached, prompt to attach mobile number
      if (!profile?.phone || profile.phone.trim() === '') {
        setCompletionUid(user.uid);
        setComplName(profile?.name || user.displayName || '');
        setComplEmail(user.email || email);
        setComplPhone('');
        setShowCompletionModal(true);
        setIsLoading(false);
        return;
      }

      handleNavigationAfterLogin(profile);
    } catch (err) {
      console.error("Login failed:", err);
      let msg = err.message || "Failed to sign in. Please verify your credentials.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError("Please enter your registered email address.");
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err);
      let msg = err.message || "Failed to send reset link.";
      if (err.code === 'auth/user-not-found') {
        msg = "No account found with this email.";
      }
      setResetError(msg);
    } finally {
      setResetLoading(false);
    }
  };

  const availableStates = complCountry === 'India' 
    ? INDIAN_STATES_AND_UTS 
    : complCountry === 'Nepal' 
      ? NEPAL_REGIONS 
      : complCountry === 'Bhutan' 
        ? BHUTAN_REGIONS 
        : ['All Regions'];

  return (
    <CinematicScenicBackground
      imageUrl={
        isGuide 
          ? "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85"
          : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85"
      }
      overlayAlpha={0.7}
    >
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 max-w-md mx-auto w-full">
        
        {/* Back button */}
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
        <div className="w-full rounded-3xl p-8 border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl text-white">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-full p-1 bg-white shadow-md mb-3 flex items-center justify-center">
              <img src="/app_logo.png" alt="The Locals" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-black tracking-wider uppercase font-sans">
              Welcome Back
            </h2>
            <p className="text-xs text-emerald-200 mt-1 uppercase tracking-wider font-semibold">
              {isGuide ? 'Guide & Host Sign In' : 'Explorer Sign In'}
            </p>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex rounded-xl p-1 bg-black/30 border border-white/10 mb-5">
            <button
              type="button"
              onClick={() => handleRoleToggle('traveller')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                !isGuide ? 'bg-sky-500 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Explorer
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('guide')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                isGuide ? 'bg-emerald-500 text-white shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              Host / Guide
            </button>
          </div>

          {/* Google 1-Click Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide bg-white text-neutral-900 hover:bg-neutral-100 transition-all flex items-center justify-center gap-3 shadow-md mb-4 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-white/15"></div>
            <span className="px-3 text-[10px] uppercase tracking-wider text-white/50 font-bold">Or sign in with</span>
            <div className="flex-1 border-t border-white/15"></div>
          </div>

          {/* Auth Method Switcher (OTP vs Email) */}
          <div className="flex border-b border-white/15 mb-5 pb-2 text-xs font-bold justify-center gap-6">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setError(null); }}
              className={`pb-1 transition-all ${authMode === 'otp' ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold' : 'text-white/60 hover:text-white'}`}
            >
              Mobile & OTP
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setError(null); }}
              className={`pb-1 transition-all ${authMode === 'email' ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold' : 'text-white/60 hover:text-white'}`}
            >
              Email & Password
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: OTP AUTHENTICATION */}
          {authMode === 'otp' && (
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  Mobile Number (with Country Code)
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={otpSent}
                    className="w-28 px-2 py-2.5 rounded-xl bg-neutral-900 border border-white/20 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {COUNTRY_LIST.map((c) => (
                      <option key={c.dialCode + c.code} value={c.dialCode}>
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
                <div className="space-y-4 animate-in fade-in duration-200">
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
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & Sign In</span>
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

              {/* Invisible Recaptcha Container */}
              <div id="recaptcha-container"></div>
            </form>
          )}

          {/* MODE 2: EMAIL & PASSWORD */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-white/70 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg mt-2 ${
                  isGuide
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In with Email</span>
                )}
              </button>
            </form>
          )}

          {/* Switch to Sign Up */}
          <div className="mt-6 text-center text-xs text-white/70">
            Don't have an account?{' '}
            <Link
              to={`/signup?role=${activeRole}`}
              className="font-bold text-white hover:text-emerald-300 underline underline-offset-4 ml-1"
            >
              Create Account
            </Link>
          </div>

        </div>

        {/* Profile Completion Modal (If First Time User with missing email or phone) */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl p-6 border border-white/20 bg-neutral-900/95 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold font-sans">Complete Your Account</h3>
                  <p className="text-[11px] text-white/60">Attach both email and phone for single unified login</p>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCompleteProfileSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={complName}
                      onChange={(e) => setComplName(e.target.value)}
                      placeholder="e.g. Tenzing Norgay"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                    Email Address * (Tied to Account)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={complEmail}
                      onChange={(e) => setComplEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                    Mobile Number * (Tied to Account)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={complPhone}
                      onChange={(e) => setComplPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                      State / Region *
                    </label>
                    <select
                      value={complState}
                      onChange={(e) => {
                        setComplState(e.target.value);
                        const cities = STATE_CITIES_MAP[e.target.value] || [];
                        setComplCity(cities[0] || '');
                      }}
                      className="w-full px-2 py-2 rounded-xl bg-neutral-800 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {availableStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                      City / Base Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={complCity}
                      onChange={(e) => setComplCity(e.target.value)}
                      placeholder="e.g. Dehradun / Paro"
                      className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {isGuide && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                        Years of Guiding Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={complExperience}
                        onChange={(e) => setComplExperience(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-1">
                        Bio / Local Roots
                      </label>
                      <textarea
                        rows="2"
                        value={complBio}
                        onChange={(e) => setComplBio(e.target.value)}
                        placeholder="Tell explorers about your roots and the trails you guide..."
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={complLoading}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {complLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save & Continue</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl p-6 border border-white/20 bg-neutral-900/95 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2 font-sans">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Reset Password
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                Enter your registered email address to receive a secure password reset link.
              </p>

              {resetSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 text-center">
                  <p className="font-bold">Reset Email Sent! 📩</p>
                  <p className="text-[11px] text-white/80">Please check your inbox (and spam folder) for the password reset instructions.</p>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="mt-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  {resetError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>{resetLoading ? 'Sending...' : 'Send Link'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </CinematicScenicBackground>
  );
}
