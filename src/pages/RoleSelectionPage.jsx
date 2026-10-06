import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CinematicScenicBackground from '../components/common/CinematicScenicBackground';
import { Compass, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const { setRole, currentUser, userProfile } = useAuth();

  const handleSelectRole = (role) => {
    setRole(role);
    if (role === 'traveller') {
      navigate('/explore');
    } else {
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

  return (
    <CinematicScenicBackground
      imageUrl="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85"
      overlayAlpha={0.65}
    >
      <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full px-6 py-12 md:py-16 text-center">
        
        {/* Top Header / Branding */}
        <div className="space-y-4 pt-4">
          <div className="inline-block relative">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full p-2 bg-white shadow-2xl ring-4 ring-emerald-400/40 flex items-center justify-center transform hover:scale-105 transition-transform">
              <img src="/app_logo.png" alt="The Locals" className="w-full h-full object-contain" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-widest text-white uppercase drop-shadow-md font-sans">
              THE LOCALS
            </h1>
            <p className="text-xs md:text-sm font-semibold tracking-widest text-emerald-300 uppercase mt-2">
              Authentic Guided Himalayan Expeditions
            </p>
          </div>

          <div className="inline-block">
            <span className="text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 border border-white/20 backdrop-blur-md uppercase">
              CHOOSE YOUR PORTAL
            </span>
          </div>
        </div>

        {/* Portal Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 max-w-3xl mx-auto w-full">
          
          {/* Card 1: Traveller / Explorer */}
          <div
            onClick={() => handleSelectRole('traveller')}
            className="group relative text-left rounded-3xl p-7 md:p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-sky-600/40 via-sky-900/60 to-black/70 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 uppercase">
                EXPLORE
              </span>
              <div className="w-10 h-10 rounded-full bg-sky-400/20 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
              Book an experience
            </h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Discover authentic guided expeditions, hidden valleys & verified local hosts.
            </p>

            <div className="flex items-center text-xs font-bold text-sky-300 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Enter as Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Guide / Host */}
          <div
            onClick={() => handleSelectRole('guide')}
            className="group relative text-left rounded-3xl p-7 md:p-8 cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-emerald-600/40 via-emerald-950/70 to-black/70 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 uppercase">
                HOST & GUIDE
              </span>
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
              Host an experience
            </h3>
            <p className="text-sm text-white/80 leading-relaxed mb-6">
              Create itineraries, host expeditions & lead travellers through your homeland.
            </p>

            <div className="flex items-center text-xs font-bold text-emerald-300 gap-1.5 group-hover:translate-x-1 transition-transform">
              <span>Enter Host Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Footer Brand Pillars */}
        <div className="pb-4">
          <p className="text-xs md:text-sm font-semibold tracking-wider text-white/70 uppercase">
            Offbeat ★ Immersive ★ Sustainable ★ Travel and Learn
          </p>
        </div>

      </div>
    </CinematicScenicBackground>
  );
}
