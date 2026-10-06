import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { razorpayService } from '../../services/razorpayService';
import { 
  X, 
  Calendar, 
  Users, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';

export default function BookingModal({ experience, onClose }) {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [guestCount, setGuestCount] = useState(1);
  const [travellerName, setTravellerName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [travellerEmail, setTravellerEmail] = useState(userProfile?.email || currentUser?.email || '');
  const [travellerPhone, setTravellerPhone] = useState(userProfile?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const pricePerPerson = Number(experience.price) || 0;
  const maxGuests = experience.maxGroupSize || 8;
  const totalPrice = pricePerPerson * guestCount;

  const handleGuestsChange = (delta) => {
    const next = guestCount + delta;
    if (next >= 1 && next <= maxGuests) {
      setGuestCount(next);
    }
  };

  const handleBookingAndPayment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in as a traveller to book an expedition.");
      navigate('/login?role=traveller');
      return;
    }

    if (!startDate) {
      setError("Please choose a start date.");
      return;
    }

    if (!travellerPhone) {
      setError("Please enter a contact phone number for host coordination.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create booking record in Firestore (/bookings)
      const newBooking = await bookingService.createBooking({
        experienceId: experience.id,
        experienceTitle: experience.title,
        experienceImage: experience.coverImage || (experience.images?.[0] || ''),
        guideId: experience.guideId,
        guideName: experience.guideName || 'Verified Guide',
        travellerId: currentUser.uid,
        travellerName: travellerName || 'Explorer',
        travellerEmail: travellerEmail || currentUser.email,
        travellerPhone: travellerPhone,
        startDate: startDate,
        guestCount: guestCount,
        pricePerPerson: pricePerPerson,
        totalPrice: totalPrice,
        specialRequests: specialRequests,
        status: 'pending',
        paymentStatus: 'pending',
      });

      // 2. Launch Razorpay Web Checkout
      razorpayService.openCheckout({
        amount: totalPrice,
        bookingId: newBooking.id,
        experienceTitle: experience.title,
        travellerName: travellerName,
        travellerEmail: travellerEmail,
        travellerPhone: travellerPhone,
        onSuccess: async (razorpayResponse) => {
          // 3. Mark payment as paid in Firestore
          await bookingService.recordPaymentSuccess(newBooking.id, razorpayResponse.paymentId);
          setIsSubmitting(false);
          setBookingSuccess({
            ...newBooking,
            paymentId: razorpayResponse.paymentId
          });
        },
        onError: (err) => {
          console.warn("Razorpay error or cancelled:", err);
          setIsSubmitting(false);
          setError(err.message || "Payment was not completed. Your booking is held as pending.");
        }
      });
    } catch (err) {
      console.error("Booking error:", err);
      setIsSubmitting(false);
      setError(err.message || "Failed to initiate booking.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-traveller-forestDark text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">
              CONFIRM EXPEDITION
            </span>
            <h3 className="font-bold text-base sm:text-lg truncate max-w-xs sm:max-w-md font-sans">
              {experience.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* If booking was successfully paid and confirmed */}
        {bookingSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-neutral-900">Booking Confirmed!</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Your payment of ₹{totalPrice.toLocaleString('en-IN')} has been securely verified.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Booking Ref:</span>
                <span className="font-mono font-bold text-neutral-800">{bookingSuccess.id.substring(0, 10)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment ID:</span>
                <span className="font-mono font-bold text-neutral-800">{bookingSuccess.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date:</span>
                <span className="font-bold text-neutral-800">{startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Guests:</span>
                <span className="font-bold text-neutral-800">{guestCount} {guestCount === 1 ? 'Explorer' : 'Explorers'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
                className="flex-1 py-3 rounded-xl bg-traveller-forestDark text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors"
              >
                View in My Bookings
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleBookingAndPayment} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Date selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Expedition Start Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-traveller-mint"
                />
              </div>
            </div>

            {/* Guest count */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Number of Guests
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-traveller-mint" />
                  <span className="text-sm font-semibold text-neutral-800">
                    {guestCount} {guestCount === 1 ? 'Explorer' : 'Explorers'}
                  </span>
                  <span className="text-[11px] text-neutral-400">(Max {maxGuests})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGuestsChange(-1)}
                    disabled={guestCount <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-neutral-900">{guestCount}</span>
                  <button
                    type="button"
                    onClick={() => handleGuestsChange(1)}
                    disabled={guestCount >= maxGuests}
                    className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-30 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Lead Explorer Name
                </label>
                <input
                  type="text"
                  required
                  value={travellerName}
                  onChange={(e) => setTravellerName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-traveller-mint"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={travellerPhone}
                  onChange={(e) => setTravellerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-traveller-mint"
                />
              </div>
            </div>

            {/* Special requests */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1">
                Dietary & Special Requests (Optional)
              </label>
              <textarea
                rows="2"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Vegetarian meals, pickup request, gear query..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-traveller-mint"
              />
            </div>

            {/* Price calculation bill */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>₹{pricePerPerson.toLocaleString('en-IN')} × {guestCount} guest{guestCount > 1 ? 's' : ''}</span>
                <span>₹{(pricePerPerson * guestCount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Local Community Fund (Included)</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-sm text-neutral-900">
                <span>Total Amount</span>
                <span className="text-base text-traveller-forestDark font-sans">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Razorpay Trust note */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>100% Secure Checkout powered by Razorpay. Direct host payout.</span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-traveller-forestDark text-white font-bold text-sm uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{totalPrice.toLocaleString('en-IN')} with Razorpay</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
