import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import ExperienceCard from '../../components/traveller/ExperienceCard';
import { experienceService } from '../../services/experienceService';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  Compass,
  X,
  Loader2
} from 'lucide-react';

const CATEGORIES = ['All', 'Trek', 'Cultural', 'Offbeat', 'Heritage', 'Camping', 'Expedition'];
const POPULAR_DESTINATIONS = ['All', 'Uttarakhand', 'Himachal Pradesh', 'Ladakh', 'Jammu & Kashmir', 'Sikkim'];

export default function ExploreHomePage() {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All');
  const [maxPrice, setMaxPrice] = useState(50000);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Subscribe to real-time experiences from Firestore
  useEffect(() => {
    const unsub = experienceService.subscribeExperiences(
      (data) => {
        setExperiences(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading experiences:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // Subscribe to user wishlist
  useEffect(() => {
    if (!currentUser) {
      setWishlistIds([]);
      return;
    }
    const unsub = wishlistService.subscribeWishlistIds(
      currentUser.uid,
      (ids) => setWishlistIds(ids),
      (err) => console.error("Wishlist sync error:", err)
    );
    return () => unsub();
  }, [currentUser]);

  // Filtered experiences
  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch = 
      !searchTerm ||
      exp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.state?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      exp.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesState = 
      selectedState === 'All' || 
      exp.state?.toLowerCase() === selectedState.toLowerCase();

    const matchesPrice = !maxPrice || Number(exp.price || 0) <= maxPrice;

    return matchesSearch && matchesCategory && matchesState && matchesPrice;
  });

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="min-h-screen pb-24 md:pb-16">
        
        {/* Hero Section */}
        <div className="relative bg-traveller-forestDark text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-md">
          {/* Subtle background photo overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-traveller-forestDark via-transparent to-transparent" />

          <div className="relative max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 inline-block">
              DISCOVER HIDDEN HERITAGE
            </span>

            <h1 className="text-3xl sm:text-5xl font-black font-sans tracking-tight">
              What's your next story?
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-normal">
              Book deep multi-day expeditions and intimate local journeys guided by native Himalayan residents.
            </p>

            {/* Floating Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 border border-neutral-200">
                <Search className="w-5 h-5 text-neutral-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by valley, trail, trek name or region..."
                  className="w-full px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="p-1 text-neutral-400 hover:text-neutral-600 mr-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors flex-shrink-0"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Drawer / Accordion if active */}
        {filterDrawerOpen && (
          <div className="bg-white border-b border-neutral-200 px-4 py-4 max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</label>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-44 accent-traveller-mint"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">State / Territory</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white"
                  >
                    {POPULAR_DESTINATIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedState('All');
                  setMaxPrice(50000);
                  setFilterDrawerOpen(false);
                }}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Destination Chips */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Destinations:
            </span>
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest}
                onClick={() => setSelectedState(dest)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full flex-shrink-0 transition-all ${
                  selectedState === dest
                    ? 'bg-traveller-forestDark text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-4 py-2 rounded-xl flex-shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-traveller-mint text-white shadow-xs'
                    : 'bg-white/80 hover:bg-white text-neutral-600 border border-neutral-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Expeditions Grid Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-sans">
                Featured Expeditions
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Showing {filteredExperiences.length} authentic journeys led by local hosts
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-traveller-forestDark mx-auto" />
              <p className="text-xs font-semibold text-neutral-500">Loading authentic experiences...</p>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8 max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-neutral-800">No Expeditions Found</h3>
              <p className="text-xs text-neutral-500">
                We couldn't find any trips matching your criteria. Try adjusting your filters or destination choice.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedState('All');
                }}
                className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-traveller-forestDark text-white hover:bg-black"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  isWishlisted={wishlistIds.includes(exp.id)}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
