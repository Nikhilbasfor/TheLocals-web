import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CinematicScenicBackground from '../components/common/CinematicScenicBackground';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, setRole } = useAuth();

  const roleParam = searchParams.get('role') || 'traveller';
  const [activeRole, setActiveRole] = useState(roleParam.toLowerCase());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { user, profile } = await login(email, password, activeRole);
      
      if (activeRole === 'traveller') {
        navigate('/dashboard');
      } else {
        if (!profile?.onboardingComplete) {
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
          <div className="flex rounded-xl p-1 bg-black/30 border border-white/10 mb-6">
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

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
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

      </div>
    </CinematicScenicBackground>
  );
}
