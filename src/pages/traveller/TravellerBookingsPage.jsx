import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { 
  Ticket, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  CreditCard,
  Compass,
  Loader2,
  Plane,
  ShieldCheck
} from 'lucide-react';

export default function TravellerBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsub = bookingService.subscribeUserBookings(
      currentUser.uid,
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        console.error("User bookings load error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.updateBookingStatus(bookingId, 'cancelled');
    } catch (err) {
      alert("Failed to cancel booking: " + err.message);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const upcomingCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'confirmed') return b.status === 'confirmed';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const getStatusBadge = (status, paymentStatus) => {
    if (status === 'confirmed') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Confirmed
        </span>
      );
    }
    if (status === 'cancelled') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Cancelled
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          Completed
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending Confirmation
      </span>
    );
  };

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 min-h-screen pb-24 md:pb-16 space-y-4 sm:space-y-6">
        
        {/* Responsive Header (Laptop & Phone) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl sm:text-3xl font-black font-sans text-neutral-900 tracking-tight flex items-center gap-2 sm:gap-2.5">
              <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700 flex-shrink-0" />
              <span>My Bookings</span>
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Track upcoming trips, verified host coordination & booking receipts
            </p>
          </div>

          <Link
            to="/explore"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-traveller-forestDark text-white hover:bg-black transition-colors self-start sm:self-auto flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover More Trips</span>
          </Link>
        </div>

        {/* Filter Status Pills (Clean laptop aesthetic with proper mobile spacing) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: `All (${bookings.length})` },
            { id: 'confirmed', label: `Upcoming (${upcomingCount})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
            { id: 'cancelled', label: `Cancelled (${cancelledCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-bold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-traveller-forestDark text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-traveller-forestDark mx-auto" />
            <p className="text-xs text-neutral-500 font-semibold">Loading your bookings...</p>
          </div>
        ) : !currentUser ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200 max-w-md mx-auto space-y-3 my-8">
            <Ticket className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-base text-neutral-800">Sign in to view your bookings</h3>
            <p className="text-xs text-neutral-500">Log in to view upcoming expeditions, dates, and payments.</p>
            <Link to="/login?role=traveller" className="inline-block px-5 py-2.5 rounded-xl bg-traveller-forestDark text-white text-xs font-bold uppercase tracking-wider">
              Sign In
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8 max-w-md mx-auto space-y-3 my-4 sm:my-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 font-sans">
              No {activeTab === 'all' ? '' : activeTab === 'confirmed' ? 'Upcoming ' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} `}Bookings Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              {activeTab === 'all' 
                ? "You haven't reserved any expeditions yet. Explore journeys and start planning!" 
                : `No ${activeTab} reservations found in your account.`}
            </p>
            <Link to="/explore" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-traveller-forestDark text-white text-xs font-bold hover:bg-black transition-colors">
              Explore Trips
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div 
                key={b.id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs hover:border-neutral-300 transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              >
                {/* Left info & image */}
                <div className="flex items-start gap-4">
                  {b.experienceImage && (
                    <img 
                      src={b.experienceImage} 
                      alt={b.experienceTitle}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-neutral-200" 
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(b.status, b.paymentStatus)}
                      {b.paymentStatus === 'paid' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Paid via Razorpay
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-neutral-900 font-sans">
                      <Link to={`/experience/${b.experienceId}`} className="hover:text-traveller-mint">
                        {b.experienceTitle}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-neutral-500 flex-wrap pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-traveller-mint" />
                        {b.startDate || b.bookingDate || 'Date coordinated'}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-sky-500" />
                        {b.guestCount || b.numberOfTravelers || 1} {(b.guestCount || b.numberOfTravelers) === 1 ? 'Guest' : 'Guests'}
                      </span>
                      <span className="text-neutral-400">
                        Host: <strong className="text-neutral-700">{b.guideName || 'Verified Guide'}</strong>
                      </span>
                    </div>

                    {b.paymentId && (
                      <p className="text-[10px] text-neutral-400 font-mono pt-0.5">
                        Payment Ref: {b.paymentId}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right price & cancel actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 gap-3">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-neutral-400 font-medium block">Total Paid</span>
                    <span className="text-lg font-black text-neutral-900 font-sans">
                      ₹{Number(b.totalPrice || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
