import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CinematicScenicBackground from '../components/common/CinematicScenicBackground';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2, Award } from 'lucide-react';

const INDIAN_STATES = [
  'Uttarakhand',
  'Himachal Pradesh',
  'Ladakh',
  'Jammu & Kashmir',
  'Sikkim',
  'Rajasthan',
  'Kerala',
  'Goa',
  'Karnataka',
  'Tamil Nadu',
  'Maharashtra',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal'
];

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signup, setRole } = useAuth();

  const roleParam = searchParams.get('role') || 'traveller';
  const [activeRole, setActiveRole] = useState(roleParam.toLowerCase());
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('Uttarakhand');
  const [city, setCity] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [bio, setBio] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isGuide = activeRole === 'guide';

  const handleRoleToggle = (role) => {
    setActiveRole(role);
    setRole(role);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signup({
        name,
        email,
        password,
        phone,
        role: activeRole,
        state,
        city,
        experienceYears,
        bio
      });

      if (isGuide) {
        navigate('/guide/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Signup error:", err);
      let msg = err.message || "Failed to create account.";
      if (err.code === 'auth/email-already-in-use') {
        msg = "An account with this email already exists.";
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tenzing Norgay"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    placeholder="name@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* State & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  State / Region *
                </label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-900/90 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s} className="bg-neutral-900 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                  City / Base Town
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Manali, Rishikesh"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
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
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                    Brief Bio / Background
                  </label>
                  <textarea
                    rows="2"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell explorers about your roots, trails you know, and your guiding experience..."
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
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
                <span>Complete Registration</span>
              )}
            </button>
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
