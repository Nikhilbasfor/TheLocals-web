import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import ExperienceCard from '../../components/traveller/ExperienceCard';
import { useAuth } from '../../context/AuthContext';
import { wishlistService } from '../../services/wishlistService';
import { experienceService } from '../../services/experienceService';
import { Heart, Compass, Loader2 } from 'lucide-react';

export default function WishlistPage() {
  const { currentUser } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to wishlist IDs
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubWishlist = wishlistService.subscribeWishlistIds(
      currentUser.uid,
      (ids) => setWishlistIds(ids),
      (err) => console.error("Wishlist error:", err)
    );

    return () => unsubWishlist();
  }, [currentUser]);

  // Subscribe to all experiences so we match saved ones in real-time
  useEffect(() => {
    const unsubExp = experienceService.subscribeExperiences(
      (data) => {
        setExperiences(data);
        setLoading(false);
      },
      (err) => {
        console.error("Exp error:", err);
        setLoading(false);
      }
    );
    return () => unsubExp();
  }, []);

  const savedExperiences = experiences.filter((exp) => wishlistIds.includes(exp.id));

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-6">
        
        {/* Header */}
        <div className="pb-4 border-b border-neutral-200">
          <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            Saved Wishlist
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Expeditions and local journeys you've saved for your future Himalayan trips
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-traveller-forestDark mx-auto" />
            <p className="text-xs text-neutral-500 font-semibold">Loading your saved trips...</p>
          </div>
        ) : !currentUser ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-neutral-200 max-w-md mx-auto space-y-3 my-8">
            <Heart className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-base text-neutral-800">Sign in to view your wishlist</h3>
            <p className="text-xs text-neutral-500">Save scenic expeditions and view them across all your devices.</p>
            <Link to="/login?role=traveller" className="inline-block px-5 py-2.5 rounded-xl bg-traveller-forestDark text-white text-xs font-bold uppercase tracking-wider">
              Sign In
            </Link>
          </div>
        ) : savedExperiences.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 max-w-md mx-auto space-y-3 my-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-800">Your Wishlist is Empty</h3>
            <p className="text-xs text-neutral-500">
              Explore hidden Himalayan valleys and click the heart icon on any expedition to save it here.
            </p>
            <Link to="/explore" className="inline-block px-4 py-2 rounded-xl bg-traveller-forestDark text-white text-xs font-bold">
              Explore Expeditions
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedExperiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                isWishlisted={true}
              />
            ))}
          </div>
        )}

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
