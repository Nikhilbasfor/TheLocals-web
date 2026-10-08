import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { experienceService } from '../../services/experienceService';
import { bookingService } from '../../services/bookingService';
import { 
  Compass, 
  Ticket, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  User, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Lightbulb, 
  Mountain,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function TravellerDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingExp, setLoadingExp] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Real-time experiences listener
  useEffect(() => {
    const unsubExp = experienceService.subscribeExperiences(
      (data) => {
        setExperiences(data);
        setLoadingExp(false);
      },
      (err) => {
        console.error("Dashboard experiences error:", err);
        setLoadingExp(false);
      }
    );
    return () => unsubExp();
  }, []);

  // Real-time user bookings listener
  useEffect(() => {
    if (!currentUser) {
      setLoadingBookings(false);
      return;
    }

    const unsubBookings = bookingService.subscribeUserBookings(
      currentUser.uid,
      (data) => {
        setBookings(data);
        setLoadingBookings(false);
      },
      (err) => {
        console.error("Dashboard bookings error:", err);
        setLoadingBookings(false);
      }
    );
    return () => unsubBookings();
  }, [currentUser]);

  // Active / upcoming booking
  const activeBookings = bookings.filter((b) => {
    const st = String(b.status || '').toLowerCase().trim();
    return st === 'confirmed' || st === 'approved' || st === 'pending';
  });
  const upcomingBooking = activeBookings.length > 0 ? activeBookings[0] : null;

  // Featured itineraries (first 4)
  const featuredItineraries = experiences.slice(0, 4);

  const userName = userProfile?.name || currentUser?.displayName || 'Explorer';

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="min-h-screen pb-24 md:pb-16 space-y-6">
        
        {/* User Greeting Hero Header Bar (matching traveller_dashboard_tab.dart) */}
        <div className="bg-traveller-forestDark text-white px-4 sm:px-6 lg:px-8 py-5 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Welcome back, {userName}!
              </h1>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Ready to conquer your next Himalayan frontier?
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-traveller-mint/15 border border-traveller-mint/40 text-traveller-mint text-xs font-bold shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Expedition Hub</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Scenic Hero Banner (matching _buildScenicHeroBanner) */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-neutral-200/60 h-48 sm:h-56 bg-neutral-900 group">
            <img
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80"
              alt="Himalayan Expedition"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-5 sm:p-7">
              <span className="text-[11px] font-extrabold tracking-widest text-emerald-300 uppercase mb-1 drop-shadow-sm">
                HANDCRAFTED LOCAL EXPEDITIONS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm font-sans">
                Authentic High-Altitude Trails &amp; Heritage Walks
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200/90 mt-1 max-w-xl font-normal drop-shadow-sm">
                Your personal hub for authentic guided expeditions, certified local hosts, and unforgettable Himalayan journeys.
              </p>
            </div>
          </div>

          {/* Quick Actions (matching _buildActionCard grid) */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-traveller-forestDark font-sans">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Explore Trips */}
              <Link
                to="/explore"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5 text-[#0284C7]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">Explore Trips</h4>
                  <p className="text-[11px] text-neutral-500 truncate">Find local guides</p>
                </div>
              </Link>

              {/* My Bookings */}
              <Link
                to="/bookings"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">My Bookings</h4>
                  <p className="text-[11px] text-neutral-500 truncate">View status</p>
                </div>
              </Link>

              {/* Saved Wishlist */}
              <Link
                to="/wishlist"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-red-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">Saved Wishlist</h4>
                  <p className="text-[11px] text-neutral-500 truncate">View favorites</p>
                </div>
              </Link>

              {/* Verified Guides */}
              <Link
                to="/guides"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 group"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#1B365D] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-[#1B365D]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">Verified Guides</h4>
                  <p className="text-[11px] text-neutral-500 truncate">Aadhaar checked</p>
                </div>
              </Link>

            </div>
          </section>

          {/* Upcoming Journey / Active Booking Section (matching _buildUpcomingBookingCard) */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-traveller-forestDark font-sans">
              Upcoming Expedition
            </h3>

            {loadingBookings ? (
              <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-traveller-mint mx-auto" />
                <p className="text-xs text-neutral-400 mt-2 font-medium">Checking active reservations...</p>
              </div>
            ) : upcomingBooking ? (
              <div className="bg-white rounded-2xl border border-emerald-300 shadow-sm p-5 space-y-4 hover:border-emerald-500 transition-all">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    upcomingBooking.status.toLowerCase() === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {upcomingBooking.status.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-neutral-900">
                    {upcomingBooking.numberOfTravelers || 1} Guests · ₹{Number(upcomingBooking.totalPrice || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <h4 className="text-base sm:text-lg font-bold text-traveller-forestDark font-sans">
                    {upcomingBooking.experienceTitle}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-neutral-600 mt-2 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      Guide: {upcomingBooking.guideName || 'Local Host'}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-neutral-700">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      {upcomingBooking.bookingDate}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-end">
                  <Link
                    to="/bookings"
                    className="text-xs font-bold text-traveller-mint hover:underline flex items-center gap-1"
                  >
                    <span>Manage Reservation</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              /* No Booking Card (matching _buildNoBookingCard) */
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-traveller-forestDark">
                  <Mountain className="w-6 h-6 text-traveller-forestDark" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-neutral-900">
                    No upcoming expeditions booked yet
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                    Explore multi-day itineraries crafted by verified local experts and secure your mountain spot.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-traveller-forestDark hover:bg-black text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <span>Browse Itineraries</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Featured Itineraries (matching _buildFeaturedItinerariesStream) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-traveller-forestDark font-sans">
                Featured Itineraries
              </h3>
              <Link
                to="/explore"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingExp ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-traveller-forestDark mx-auto" />
                <p className="text-xs text-neutral-500 font-medium">Loading featured expeditions...</p>
              </div>
            ) : featuredItineraries.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-500">
                No itineraries published yet. Check back shortly!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredItineraries.map((exp) => {
                  const img = exp.coverImage || (exp.images && exp.images.length > 0 ? exp.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80');
                  const duration = exp.durationDays > 0 ? `${exp.durationDays}D / ${exp.durationNights || exp.durationDays - 1}N` : 'Day Trip';

                  return (
                    <Link
                      key={exp.id}
                      to={`/experience/${exp.id}`}
                      className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col"
                    >
                      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden">
                        <img
                          src={img}
                          alt={exp.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {duration}
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-traveller-forestDark line-clamp-1 group-hover:text-emerald-700 transition-colors">
                            {exp.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-traveller-mint" />
                            <span className="truncate">{exp.city ? `${exp.city}, ` : ''}{exp.state || 'Himalayas'}</span>
                          </p>
                        </div>

                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">Per Person</span>
                          <span className="text-sm font-extrabold text-emerald-600 font-sans">
                            ₹{Number(exp.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Travel Tips Card (matching _buildTravelTipsCard) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#EFF6FF] border border-[#93C5FD] flex items-start sm:items-center gap-3.5 text-[#1E3A8A]">
            <div className="p-2 rounded-xl bg-blue-100 text-[#1D4ED8] shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#1E40AF]">Your Expedition Trip</h4>
              <p className="text-[11px] sm:text-xs text-[#1E3A8A] mt-0.5 leading-relaxed">
                Always carry waterproof layers, thermal gear, and stay hydrated at altitudes above 2,500m.
              </p>
            </div>
          </div>

        </div>

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
