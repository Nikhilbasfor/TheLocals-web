import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import CinematicScenicBackground from '../components/common/CinematicScenicBackground';
import { COUNTRY_LIST } from '../data/geoData';
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
  ShieldCheck
} from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, sendPhoneSms, confirmPhoneLogin, setRole } = useAuth();

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
        msg = "Daily SMS quota exceeded or carrier blocked this region. Please sign in using the 'Email & Password' tab, or contact support.";
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

  const handleVerifyOtpAndLogin = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length < 6) {
      setError("Please enter the 6-digit SMS OTP code sent to your phone.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user, profile } = await confirmPhoneLogin(confirmationResult, enteredOtp.trim(), activeRole);
      
      if (activeRole === 'traveller') {
        const redirect = searchParams.get('redirect') || '/explore';
        navigate(redirect);
      } else {
        // Requirement 14: If guide is not approved by admin, navigate to Documents Under Review screen directly
        if (!profile?.verified) {
          navigate('/guide/onboarding');
        } else {
          navigate('/guide/dashboard');
        }
      }
    } catch (err) {
      console.error("OTP Login failed:", err);
      setError(err.message || "Failed to verify SMS OTP and sign in.");
    } finally {
      setIsLoading(false);
    }
  };

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
      
      if (activeRole === 'traveller') {
        const redirect = searchParams.get('redirect') || '/explore';
        navigate(redirect);
      } else {
        // Requirement 14: If guide is not verified by admin, navigate to review screen directly
        if (!profile?.verified) {
          navigate('/guide/onboarding');
        } else {
          navigate('/guide/dashboard');
        }
      }
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

          {/* Auth Method Switcher (OTP vs Email) */}
          <div className="flex border-b border-white/15 mb-5 pb-2 text-xs font-bold justify-center gap-6">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setError(null); }}
              className={`pb-1 transition-all ${authMode === 'otp' ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold' : 'text-white/60 hover:text-white'}`}
            >
              Mobile & OTP Login
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

          {/* MODE 1: OTP AUTHENTICATION (DEFAULT) */}
          {authMode === 'otp' && (
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5">
                  Mobile Number (with Country Code)
                </label>
                <div className="flex gap-2">
                  {/* Country Code Dropdown (Requirement 12) */}
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
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SMS OTP Sent to {countryCode} {phoneNumber}</span>
                    </div>
                    <p className="text-[11px] text-white/80">
                      Please enter the 6-digit verification code sent to your phone:
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

          {/* MODE 2: EMAIL & PASSWORD (ALTERNATIVE) */}
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
                    className="absolute right-3.5 top-3 text-white/50 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email || '');
                      setResetSuccess(false);
                      setResetError(null);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-emerald-200 hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
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
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* Switch to Signup */}
          <div className="mt-6 text-center text-xs text-white/70">
            Don't have an account yet?{' '}
            <Link
              to={`/signup?role=${activeRole}`}
              className="font-bold text-white hover:text-emerald-300 underline underline-offset-4 ml-1"
            >
              Create Account
            </Link>
          </div>

        </div>

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
