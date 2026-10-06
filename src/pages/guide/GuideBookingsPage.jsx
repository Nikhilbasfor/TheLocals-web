import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { 
  CalendarCheck, 
  Calendar, 
  Users, 
  Phone, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Loader2 
} from 'lucide-react';

export default function GuideBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsub = bookingService.subscribeGuideBookings(
      currentUser.uid,
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (err) => {
        console.error("Guide bookings error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
    } catch (err) {
      alert("Failed to update booking status: " + err.message);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900 tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="w-7 h-7 text-guide-primary" />
              Incoming Traveller Reservations
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Manage guest bookings, accept dates, and coordinate meeting points
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'pending', 'confirmed', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize transition-all ${
                  filter === tab
                    ? 'bg-guide-primary text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-guide-primary mx-auto" />
            <p className="text-xs text-neutral-500">Loading reservations...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 max-w-md mx-auto space-y-3 my-8">
            <CalendarCheck className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-base text-neutral-800">No Reservations Found</h3>
            <p className="text-xs text-neutral-500">
              When travellers book your expeditions, their contact info and details will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => (
              <div 
                key={b.id}
                className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block">Expedition</span>
                    <h3 className="font-bold text-base text-neutral-900 font-sans">{b.experienceTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : b.status === 'completed'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status}
                    </span>

                    {b.paymentStatus === 'paid' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Paid ₹{Number(b.totalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-neutral-600">
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-400 uppercase text-[10px] block">Explorer Details</span>
                    <p className="font-bold text-neutral-900">{b.travellerName || 'Explorer'}</p>
                    {b.travellerPhone && (
                      <p className="flex items-center gap-1.5 text-neutral-600">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <a href={`tel:${b.travellerPhone}`} className="hover:underline">{b.travellerPhone}</a>
                      </p>
                    )}
                    {b.travellerEmail && (
                      <p className="flex items-center gap-1.5 text-neutral-600">
                        <Mail className="w-3.5 h-3.5 text-sky-600" />
                        <a href={`mailto:${b.travellerEmail}`} className="hover:underline">{b.travellerEmail}</a>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-neutral-400 uppercase text-[10px] block">Schedule</span>
                    <p className="flex items-center gap-1.5 font-semibold text-neutral-800">
                      <Calendar className="w-3.5 h-3.5 text-guide-navy" />
                      Date: {b.startDate || 'Coordinated'}
                    </p>
                    <p className="flex items-center gap-1.5 text-neutral-600">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      Party: {b.guestCount} {b.guestCount === 1 ? 'Explorer' : 'Explorers'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-neutral-400 uppercase text-[10px] block">Notes & Requests</span>
                    <p className="italic text-neutral-500">
                      {b.specialRequests || 'No special requests provided.'}
                    </p>
                  </div>
                </div>

                {/* Guide Action Controls */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2 text-xs">
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Reservation</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                        className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'completed')}
                      className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Trip Completed</span>
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
