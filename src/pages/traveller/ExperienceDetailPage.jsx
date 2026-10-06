import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import ItineraryTimeline from '../../components/traveller/ItineraryTimeline';
import RouteMapSection from '../../components/traveller/RouteMapSection';
import ReviewSection from '../../components/traveller/ReviewSection';
import BookingModal from '../../components/traveller/BookingModal';
import { experienceService } from '../../services/experienceService';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ShieldCheck, 
  Check, 
  X as CloseIcon, 
  Backpack, 
  Activity, 
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';

export default function ExperienceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Subscribe to experience data
  useEffect(() => {
    if (!id) return;
    const unsub = experienceService.subscribeExperienceById(
      id,
      (data) => {
        setExperience(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching experience detail:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  // Wishlist state check
  useEffect(() => {
    if (!currentUser || !id) return;
    const unsub = wishlistService.subscribeWishlistIds(
      currentUser.uid,
      (ids) => setIsWishlisted(ids.includes(id)),
      (err) => console.error("Wishlist check error:", err)
    );
    return () => unsub();
  }, [currentUser, id]);

  const handleWishlistToggle = async () => {
    if (!currentUser) {
      alert("Please sign in to save this experience to your wishlist.");
      navigate('/login?role=traveller');
      return;
    }
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      await wishlistService.toggleWishlist(currentUser.uid, id, isWishlisted);
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      setIsWishlisted(!next);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: experience?.title || 'The Locals Expedition',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bgLight flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-traveller-forestDark" />
        <p className="text-xs font-semibold text-neutral-500">Loading expedition details...</p>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-neutral-bgLight flex items-center justify-center flex-col gap-4 p-6 text-center">
        <h2 className="text-xl font-bold text-neutral-800">Expedition Not Found</h2>
        <p className="text-xs text-neutral-500">This itinerary may have been removed or is currently being updated by the host.</p>
        <Link to="/explore" className="px-4 py-2 rounded-xl bg-traveller-forestDark text-white text-xs font-bold">
          Back to Explore
        </Link>
      </div>
    );
  }

  const galleryImages = [
    experience.coverImage,
    ...(experience.images || []),
    ...(experience.galleryImages || [])
  ].filter(Boolean);

  const imagesToDisplay = galleryImages.length > 0 
    ? galleryImages 
    : ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'];

  const durationLabel = experience.durationDays > 0 
    ? `${experience.durationDays} Days / ${experience.durationNights || experience.durationDays - 1} Nights`
    : (experience.duration || 'Day Experience');

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-20 space-y-8">
        
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-xs"
              title="Share Expedition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleWishlistToggle}
              className="p-2 rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors shadow-xs"
              title="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-600'}`} />
            </button>
          </div>
        </div>

        {/* Hero Gallery Section */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-neutral-900 shadow-lg">
            <img
              src={imagesToDisplay[activeImageIdx] || imagesToDisplay[0]}
              alt={experience.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white space-y-1">
              <span className="text-[11px] font-bold tracking-wider px-3 py-1 rounded-full bg-traveller-mint text-white uppercase inline-block shadow-md">
                {experience.category || 'Trek'}
              </span>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black font-sans text-white drop-shadow-md">
                {experience.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{experience.city ? `${experience.city}, ` : ''}{experience.state}</span>
              </p>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {imagesToDisplay.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
              {imagesToDisplay.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImageIdx === idx ? 'border-traveller-mint scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content & Booking Sticky Widget Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Duration</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-1">
                  <Clock className="w-4 h-4 text-traveller-mint" />
                  {durationLabel}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Group Limit</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-1">
                  <Users className="w-4 h-4 text-sky-500" />
                  Max {experience.maxGroupSize || 8}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Fitness Level</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-1">
                  <Activity className="w-4 h-4 text-amber-500" />
                  {experience.fitnessLevel || 'Moderate'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Rating</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  {Number(experience.rating || 4.9).toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            {/* Guide Profile Card */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-traveller-lightMint text-traveller-forestDark font-bold text-lg flex items-center justify-center border-2 border-traveller-mint/40 overflow-hidden shadow-xs">
                  {experience.guideImage ? (
                    <img src={experience.guideImage} alt={experience.guideName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(experience.guideName || 'G').charAt(0)}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Local Guide
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-neutral-900 mt-0.5">
                    Hosted by {experience.guideName || 'Native Himalayan Guide'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {experience.guideExperienceYears ? `${experience.guideExperienceYears} years guiding experience` : 'Native valley resident & mountain lead'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description / Story */}
            <div className="space-y-3 bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <h3 className="font-bold text-lg text-neutral-900 font-sans">
                About this Expedition
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {experience.description || 'Join our guided expedition through scenic ridgelines, alpine meadows, and historic mountain hamlets.'}
              </p>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inclusions */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  What's Included
                </h4>
                <ul className="space-y-2 text-xs text-neutral-600">
                  {(experience.inclusions && experience.inclusions.length > 0) ? (
                    experience.inclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Certified local mountain guide</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Camp accommodation & sleeping gear</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>Wholesome local mountain meals</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <CloseIcon className="w-4 h-4 text-red-500" />
                  What's Excluded
                </h4>
                <ul className="space-y-2 text-xs text-neutral-600">
                  {(experience.exclusions && experience.exclusions.length > 0) ? (
                    experience.exclusions.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CloseIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <CloseIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>Personal trekking clothing & boots</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CloseIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>Travel insurance</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Things to Carry */}
            {experience.thingsToCarry && experience.thingsToCarry.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Backpack className="w-4 h-4 text-amber-600" />
                  Things to Carry
                </h4>
                <div className="flex flex-wrap gap-2">
                  {experience.thingsToCarry.map((thing, idx) => (
                    <span key={idx} className="text-xs px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-700 font-medium">
                      • {thing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-Day Itinerary Timeline Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-neutral-900 font-sans">
                Day-by-Day Expedition Itinerary
              </h3>
              <ItineraryTimeline 
                days={experience.days} 
                legacyItinerary={experience.itinerary} 
              />
            </div>

            {/* Route Pins & Waypoints Section */}
            {experience.routePins && experience.routePins.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
                <RouteMapSection routePins={experience.routePins} />
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <ReviewSection 
                experienceId={experience.id} 
                currentRating={experience.rating || 5.0} 
                currentReviewCount={experience.reviewCount || 0} 
              />
            </div>

          </div>

          {/* Right Sticky Booking Widget (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl p-6 border border-neutral-200 shadow-xl space-y-5">
              <div>
                <span className="text-xs text-neutral-400 font-medium">Price per Explorer</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-neutral-900 font-sans">
                    ₹{Number(experience.price || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium">/ person</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Duration:</span>
                  <span className="font-bold text-neutral-800">{durationLabel}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Base Location:</span>
                  <span className="font-bold text-neutral-800">{experience.state}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Max Group:</span>
                  <span className="font-bold text-neutral-800">{experience.maxGroupSize || 8} people</span>
                </div>
              </div>

              <button
                onClick={() => setBookingModalOpen(true)}
                className="w-full py-3.5 rounded-xl bg-traveller-forestDark text-white font-bold text-sm uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                <span>Book This Expedition</span>
              </button>

              <p className="text-[11px] text-neutral-400 text-center leading-normal">
                Direct booking with native guide. Free cancellation up to 7 days before trip date.
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* Mobile Floating Bottom Bar with Price + CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-3 md:hidden flex items-center justify-between shadow-2xl safe-area-pb">
        <div>
          <span className="text-[10px] text-neutral-400 uppercase font-bold block">Starting From</span>
          <span className="text-lg font-black text-neutral-900 font-sans">
            ₹{Number(experience.price || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={() => setBookingModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-traveller-forestDark text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-black"
        >
          Book Now
        </button>
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          experience={experience}
          onClose={() => setBookingModalOpen(false)}
        />
      )}

      <Footer />
    </TravelPatternBackground>
  );
}
