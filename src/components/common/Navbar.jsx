import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home,
  Compass, 
  Ticket, 
  Heart, 
  User, 
  LayoutDashboard, 
  Layers, 
  CalendarCheck, 
  LogOut, 
  PlusCircle, 
  Menu, 
  X,
  Repeat,
  Users
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { currentUser, userProfile, isGuide, setRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handlePortalSwitch = () => {
    if (isGuide) {
      setRole('traveller');
      navigate(currentUser ? '/dashboard' : '/explore');
    } else {
      setRole('guide');
      if (currentUser) {
        if (!userProfile?.onboardingComplete) {
          navigate('/guide/onboarding');
        } else {
          navigate('/guide/dashboard');
        }
      } else {
        navigate('/login?role=guide');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  // Determine home link
  const homePath = isGuide 
    ? "/guide/dashboard" 
    : (currentUser ? "/dashboard" : "/");

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-cardBorder">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo (Links to Dashboard as requested) */}
        <Link to={homePath} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden p-1 bg-white shadow-sm border border-neutral-200 group-hover:scale-105 transition-transform">
            <img src="/app_logo.png" alt="The Locals" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-wider text-neutral-textMain font-sans flex items-center gap-2">
              THE LOCALS
              <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase ${
                isGuide 
                  ? 'bg-guide-primary text-white' 
                  : 'bg-traveller-mint/15 text-traveller-forestDark border border-traveller-mint/30'
              }`}>
                {isGuide ? 'HOST PORTAL' : 'TRAVELLER'}
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {!isGuide ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/dashboard') ? 'text-traveller-forestDark font-extrabold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <Home className="w-4 h-4 text-traveller-mint" />
                Dashboard
              </Link>
              <Link
                to="/explore"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/explore') ? 'text-traveller-forestDark font-extrabold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <Compass className="w-4 h-4 text-traveller-mint" />
                Explore
              </Link>
              <Link
                to="/bookings"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/bookings') ? 'text-traveller-forestDark font-extrabold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <Ticket className="w-4 h-4 text-traveller-mint" />
                Bookings
              </Link>
              <Link
                to="/wishlist"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/wishlist') ? 'text-traveller-forestDark font-extrabold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <Heart className="w-4 h-4 text-red-500" />
                Wishlist
              </Link>
              <Link
                to="/guides"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/guides') ? 'text-traveller-forestDark font-extrabold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-700" />
                Verified Guides
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/guide/dashboard"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/guide/dashboard') ? 'text-guide-cyan font-bold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/guide/experiences"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/guide/experiences') ? 'text-guide-cyan font-bold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <Layers className="w-4 h-4" />
                Experiences
              </Link>
              <Link
                to="/guide/bookings"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  isActive('/guide/bookings') ? 'text-guide-cyan font-bold' : 'text-neutral-textMuted hover:text-neutral-textMain'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                Traveller Bookings
              </Link>
              <Link
                to="/guide/create-experience"
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-guide-primary text-white hover:bg-guide-headerDark transition-colors shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Itinerary
              </Link>
            </>
          )}
        </nav>

        {/* Action Controls & Auth Dropdown */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Switch Role Button */}
          <button
            onClick={handlePortalSwitch}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-300 hover:border-neutral-400 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors"
            title={isGuide ? "Switch to Explorer/Traveller view" : "Switch to Guide/Host portal"}
          >
            <Repeat className="w-3.5 h-3.5 text-neutral-500" />
            <span>{isGuide ? "Traveller View" : "Host a Trip"}</span>
          </button>

          {/* User Account / Profile */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-neutral-200 hover:border-neutral-300 transition-all bg-white shadow-xs"
              >
                <span className="text-xs font-semibold text-neutral-700 hidden lg:inline max-w-[100px] truncate">
                  {userProfile?.name || 'Explorer'}
                </span>
                <div className="w-8 h-8 rounded-full overflow-hidden bg-traveller-lightMint flex items-center justify-center border border-traveller-mint/40 text-traveller-forestDark font-bold text-xs">
                  {userProfile?.profilePicUrl ? (
                    <img src={userProfile.profilePicUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(userProfile?.name || 'U').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs text-neutral-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-neutral-800 truncate">{userProfile?.name || currentUser.email}</p>
                    <p className="text-xs text-neutral-500 truncate">{currentUser.email}</p>
                  </div>

                  <Link 
                    to={isGuide ? "/guide/profile" : "/profile"} 
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-neutral-400" />
                    My Profile
                  </Link>

                  <button
                    onClick={handlePortalSwitch}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors sm:hidden"
                  >
                    <Repeat className="w-4 h-4 text-neutral-400" />
                    {isGuide ? "Switch to Traveller View" : "Switch to Host View"}
                  </button>

                  <div className="border-t border-neutral-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-red hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={`/login?role=${isGuide ? 'guide' : 'traveller'}`}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                to={`/signup?role=${isGuide ? 'guide' : 'traveller'}`}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg bg-traveller-forestDark text-white hover:bg-black transition-colors shadow-sm"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {!isGuide ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Home className="w-4 h-4 text-traveller-mint" />
                Dashboard
              </Link>
              <Link
                to="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Compass className="w-4 h-4 text-traveller-mint" />
                Explore Expeditions
              </Link>
              <Link
                to="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Ticket className="w-4 h-4 text-traveller-mint" />
                My Bookings
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Heart className="w-4 h-4 text-red-500" />
                Saved Wishlist
              </Link>
              <Link
                to="/guides"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Users className="w-4 h-4 text-indigo-700" />
                Verified Guides
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/guide/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <LayoutDashboard className="w-4 h-4 text-guide-cyan" />
                Host Dashboard
              </Link>
              <Link
                to="/guide/experiences"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <Layers className="w-4 h-4 text-guide-cyan" />
                Experiences
              </Link>
              <Link
                to="/guide/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <CalendarCheck className="w-4 h-4 text-guide-cyan" />
                Traveller Bookings
              </Link>
              <Link
                to="/guide/create-experience"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-guide-primary"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Itinerary
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handlePortalSwitch();
              }}
              className="flex items-center gap-2 text-xs font-semibold text-neutral-700 py-2"
            >
              <Repeat className="w-4 h-4 text-neutral-500" />
              {isGuide ? "Switch to Traveller View" : "Host an Experience"}
            </button>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-neutral-400 hover:text-neutral-700"
            >
              Choose Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
