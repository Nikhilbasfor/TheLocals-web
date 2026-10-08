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
  PlusCircle, 
  Layers, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  BellRing, 
  ShieldCheck, 
  Plane, 
  IndianRupee,
  Loader2,
  User,
  Check
} from 'lucide-react';

export default function GuideDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubExp = experienceService.subscribeGuideExperiences(
      currentUser.uid,
      currentUser.email || '',
      userProfile?.name || '',
      (data) => {
        setExperiences(data);
        setLoading(false);
      },
      (err) => {
        console.error("Guide exp error:", err);
        setLoading(false);
      }
    );

    const unsubBook = bookingService.subscribeGuideBookings(
      currentUser.uid,
      (data) => setBookings(data),
      (err) => console.error("Guide bookings error:", err)
    );

    return () => {
      unsubExp();
      unsubBook();
    };
  }, [currentUser, userProfile]);

  // Experiences counts
  const approvedExp = experiences.filter((e) => {
    const s = String(e.status || '').toLowerCase().trim();
    return s === 'approved' || s === 'published' || s === 'active';
  }).length;

  const pendingExp = experiences.filter((e) => {
    const s = String(e.status || '').toLowerCase().trim();
    return s === 'pending' || s === 'changes_requested' || s === 'draft' || s === '' || !e.status;
  }).length;

  // Bookings counts and revenue (matching guide_dashboard_tab.dart)
  const pendingBookings = bookings.filter((b) => String(b.status || '').toLowerCase().trim() === 'pending');
  const upcomingBookings = bookings.filter((b) => {
    const s = String(b.status || '').toLowerCase().trim();
    return s === 'confirmed' || s === 'approved';
  }).length;
  const completedBookings = bookings.filter((b) => String(b.status || '').toLowerCase().trim() === 'completed').length;

  let totalRevenue = 0;
  for (const b of bookings) {
    const st = String(b.status || '').toLowerCase().trim();
    if (st === 'confirmed' || st === 'approved' || st === 'completed' || b.paymentStatus === 'paid') {
      totalRevenue += Number(b.totalPrice || 0);
    }
  }

  // Quick accept pending booking
  const handleAcceptBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await bookingService.updateBookingStatus(bookingId, 'confirmed');
    } catch (err) {
      alert("Failed to confirm booking: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const guideName = userProfile?.name || currentUser?.displayName || currentUser?.email || 'Local Guide';
  const initial = guideName.charAt(0).toUpperCase();

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-8">
        
        {/* Verification Alert Banner if KYC not yet complete */}
        {userProfile && !userProfile.verified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong>Host Verification Under Review:</strong> Your guide credentials are being vetted by our safety lead.
              </div>
            </div>
            <Link
              to="/guide/onboarding"
              className="font-bold underline text-amber-800 hover:text-black self-start sm:self-auto"
            >
              Review KYC Details &gt;
            </Link>
          </div>
        )}

        {/* Welcome Banner (matching guide_dashboard_tab.dart) */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-guide-headerNavy via-[#1E3A5F] to-[#2C4A7C] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-inner">
              {initial}
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-white/70 uppercase">
                Guide Dashboard
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-sans tracking-tight text-white mt-0.5">
                {guideName}
              </h1>
            </div>
          </div>

          <Link
            to="/guide/create-experience"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm self-stretch sm:self-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Itinerary</span>
          </Link>
        </div>

        {/* Stats Grid (matching guide_dashboard_tab.dart _buildStatCard) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Bookings Revenue */}
          <Link
            to="/guide/bookings"
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Bookings Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-emerald-600 font-sans">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
            </div>
          </Link>

          {/* New Requests */}
          <Link
            to="/guide/bookings"
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-red-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">New Requests</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
                pendingBookings.length > 0 ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-500'
              }`}>
                <BellRing className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-2xl font-black font-sans ${pendingBookings.length > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                {pendingBookings.length}
              </span>
            </div>
          </Link>

          {/* Active Experiences */}
          <Link
            to="/guide/experiences"
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-guide-navy hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Active Experiences</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-guide-headerNavy flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-guide-headerNavy font-sans block">
                {approvedExp} Published
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {pendingExp} Pending
              </span>
            </div>
          </Link>

          {/* Upcoming Trips */}
          <Link
            to="/guide/bookings"
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Upcoming Trips</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plane className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-indigo-700 font-sans block">
                {upcomingBookings} Trips
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                {completedBookings} Completed
              </span>
            </div>
          </Link>

        </div>

        {/* Pending Booking Requests Preview section (matching Flutter guide_dashboard_tab.dart) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-guide-headerNavy font-sans">
              Pending Booking Requests
            </h2>
            {pendingBookings.length > 0 && (
              <Link
                to="/guide/bookings"
                className="text-xs font-bold text-guide-headerNavy hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-neutral-200">
              <Loader2 className="w-6 h-6 animate-spin text-guide-headerNavy mx-auto" />
              <p className="text-xs text-neutral-500">Loading requests...</p>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-sm sm:text-base text-neutral-800">
                No pending booking requests
              </h3>
              <p className="text-xs text-neutral-500">
                New bookings from travelers will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-neutral-300 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                      <User className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-neutral-900 font-sans line-clamp-1">
                        {b.experienceTitle}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {b.travellerName} · {b.bookingDate} · ₹{Number(b.totalPrice || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleAcceptBooking(b.id)}
                      disabled={actionLoading === b.id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      {actionLoading === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Accept</span>
                    </button>
                    <Link
                      to="/guide/bookings"
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Shortcut to Manage Experiences */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base text-neutral-900">
              Manage Your Expeditions &amp; Itineraries
            </h3>
            <p className="text-xs text-neutral-500">
              Check your approved trails, resubmit requested adjustments, or add new routes.
            </p>
          </div>
          <Link
            to="/guide/experiences"
            className="px-5 py-2.5 rounded-xl bg-guide-headerNavy hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shrink-0"
          >
            <span>Go to Experiences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
