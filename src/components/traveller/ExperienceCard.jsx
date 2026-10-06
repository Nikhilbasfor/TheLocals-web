import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Clock, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../services/wishlistService';

export default function ExperienceCard({ 
  experience, 
  isWishlisted = false,
  onWishlistToggle 
}) {
  const { currentUser } = useAuth();
  const [saved, setSaved] = useState(isWishlisted);
  const [isToggling, setIsToggling] = useState(false);

  const {
    id,
    title = 'Himalayan Expedition',
    coverImage,
    images = [],
    state = 'Uttarakhand',
    city = '',
    price = 0,
    durationDays = 0,
    durationNights = 0,
    duration = '',
    category = 'Trek',
    rating = 4.9,
    reviewCount = 0,
    guideName = 'Local Host',
    guideImage,
    verified = true,
  } = experience;

  const displayImage = coverImage || (images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');

  const durationLabel = durationDays > 0 
    ? `${durationDays}D / ${durationNights || durationDays - 1}N`
    : (duration || 'Day Trip');

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("Please sign in to save experiences to your wishlist.");
      return;
    }
    if (isToggling) return;

    setIsToggling(true);
    const nextSavedState = !saved;
    setSaved(nextSavedState);

    try {
      await wishlistService.toggleWishlist(currentUser.uid, id, saved);
      if (onWishlistToggle) onWishlistToggle(id, nextSavedState);
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      setSaved(!nextSavedState); // rollback on error
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Link 
      to={`/experience/${id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-neutral-200/80 hover:border-neutral-300 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Cover Image & Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Category & Duration Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 uppercase">
            {category}
          </span>
          <span className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-traveller-forestDark/80 text-emerald-300 backdrop-blur-md border border-emerald-400/30 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {durationLabel}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleHeartClick}
          aria-label="Save to Wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center transition-transform hover:scale-110 shadow-md"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              saved ? 'fill-red-500 text-red-500' : 'text-neutral-700'
            }`} 
          />
        </button>

        {/* Rating chip on image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{Number(rating).toFixed(1)}</span>
          {reviewCount > 0 && (
            <span className="text-white/60 font-normal">({reviewCount})</span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2.5">
        
        {/* Location & Guide */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1 truncate max-w-[170px]">
            <MapPin className="w-3.5 h-3.5 text-traveller-mint flex-shrink-0" />
            <span className="truncate">{city ? `${city}, ${state}` : state}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span className="truncate max-w-[90px]">{guideName}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base text-neutral-900 group-hover:text-traveller-forestDark transition-colors line-clamp-2 leading-snug font-sans">
          {title}
        </h3>

        {/* Price & Booking Call */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-neutral-900 font-sans">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">/ person</span>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-traveller-lightMint text-traveller-forestDark border border-traveller-mint/20 group-hover:bg-traveller-mint group-hover:text-white transition-colors">
            View Details
          </span>
        </div>

      </div>
    </Link>
  );
}
