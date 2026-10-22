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
  MapPin, 
  Sparkles, 
  SlidersHorizontal,
  Compass,
  X,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Footprints,
  Layers,
  ChevronDown
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Trek',
  'Cultural',
  'Offbeat',
  'Heritage',
  'Camping',
  'Expedition',
  'Wildlife & Nature',
  'Culinary',
  'Wellness'
];

const POPULAR_STATES = [
  'All',
  'Uttarakhand',
  'Himachal Pradesh',
  'Ladakh',
  'Jammu & Kashmir',
  'Sikkim',
  'Arunachal Pradesh',
  'Meghalaya',
  'Assam',
  'Nagaland',
  'Kerala',
  'Karnataka',
  'Goa',
  'Maharashtra',
  'Rajasthan',
  'Nepal',
  'Bhutan'
];

const POPULAR_DESTINATIONS = [
  'All',
  'Ladakh & Zanskar',
  'Spiti Valley',
  'Parvati & Tirthan Valley',
  'Kashmir Valley',
  'Garhwal (Kedarkantha, Har Ki Dun)',
  'Kumaon (Pindari, Munsiyari)',
  'Dzukou Valley (Nagaland)',
  'Ziro Valley (Arunachal)',
  'Meghalaya Living Roots & Cherrapunji',
  'Sikkim & Dzongri',
  'Wayanad & Western Ghats',
  'Munnar & Idukki (Kerala)',
  'Sahyadris (Maharashtra)',
  'Jaisalmer & Thar Desert'
];

// Zonal classification helper
function getExpeditionZone(exp) {
  const state = (exp.state || '').toLowerCase();
  const country = (exp.country || '').toLowerCase();
  const location = (exp.location || '').toLowerCase();
  const city = (exp.city || '').toLowerCase();
  const text = `${state} ${country} ${location} ${city}`;

  // Northeast
  if (
    text.includes('assam') ||
    text.includes('meghalaya') ||
    text.includes('arunachal') ||
    text.includes('sikkim') ||
    text.includes('nagaland') ||
    text.includes('manipur') ||
    text.includes('mizoram') ||
    text.includes('tripura') ||
    text.includes('dzukou') ||
    text.includes('ziro') ||
    text.includes('kaziranga') ||
    text.includes('cherrapunji') ||
    text.includes('shillong') ||
    text.includes('tawang') ||
    text.includes('nepal') ||
    text.includes('bhutan')
  ) {
    return 'northeast';
  }

  // South
  if (
    text.includes('kerala') ||
    text.includes('tamil') ||
    text.includes('karnataka') ||
    text.includes('goa') ||
    text.includes('andhra') ||
    text.includes('telangana') ||
    text.includes('wayanad') ||
    text.includes('munnar') ||
    text.includes('coorg') ||
    text.includes('ooty') ||
    text.includes('kodaikanal') ||
    text.includes('western ghats')
  ) {
    return 'south';
  }

  // West
  if (
    text.includes('maharashtra') ||
    text.includes('gujarat') ||
    text.includes('mumbai') ||
    text.includes('pune') ||
    text.includes('sahyadri') ||
    text.includes('kutch') ||
    text.includes('daman')
  ) {
    return 'west';
  }

  // North (default for Northern & Himalayan regions)
  return 'north';
}

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
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100000);
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
    const searchTarget = `${exp.title || ''} ${exp.description || ''} ${exp.location || ''} ${exp.city || ''} ${exp.state || ''} ${exp.country || ''} ${exp.guideName || ''}`.toLowerCase();
    
    const matchesSearch = !searchTerm || searchTarget.includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      (exp.category && exp.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesState = 
      selectedState === 'All' || 
      (exp.state && exp.state.toLowerCase() === selectedState.toLowerCase()) ||
      (exp.country && exp.country.toLowerCase() === selectedState.toLowerCase());

    const matchesDestination =
      selectedDestination === 'All' ||
      searchTarget.includes(selectedDestination.toLowerCase().split(' ')[0]);

    const matchesPrice = !maxPrice || Number(exp.price || 0) <= maxPrice;

    return matchesSearch && matchesCategory && matchesState && matchesDestination && matchesPrice;
  });

  // Zonal groups
  const northeastExpeditions = filteredExperiences.filter((e) => getExpeditionZone(e) === 'northeast');
  const northExpeditions = filteredExperiences.filter((e) => getExpeditionZone(e) === 'north');
  const southExpeditions = filteredExperiences.filter((e) => getExpeditionZone(e) === 'south');
  const westExpeditions = filteredExperiences.filter((e) => getExpeditionZone(e) === 'west');

  const ZONES = [
    {
      key: 'north',
      title: 'North Expeditions',
      tagline: 'Himachal, Uttarakhand, Ladakh, Jammu & Kashmir high altitude trails',
      emoji: '🏔️',
      items: northExpeditions,
    },
    {
      key: 'northeast',
      title: 'Northeast Expeditions',
      tagline: 'Sikkim, Nagaland, Meghalaya, Arunachal & indigenous Himalayan frontiers',
      emoji: '🌿',
      items: northeastExpeditions,
    },
    {
      key: 'south',
      title: 'South Expeditions',
      tagline: 'Western Ghats, Wayanad rainforests, Nilgiris & coastal homestays',
      emoji: '🌊',
      items: southExpeditions,
    },
    {
      key: 'west',
      title: 'West Expeditions',
      tagline: 'Sahyadri mountain forts, Rann of Kutch & heritage routes',
      emoji: '🌅',
      items: westExpeditions,
    },
  ];

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="min-h-screen pb-24 md:pb-16">
        
        {/* Hero Section */}
        <div className="relative bg-traveller-forestDark text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-md">
          {/* Background photo overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-traveller-forestDark via-transparent to-transparent" />

          <div className="relative max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-emerald-300 uppercase px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 inline-block">
              DISCOVER HIDDEN EXPERIENCES
            </span>

            <h1 className="text-3xl sm:text-5xl font-black font-sans tracking-tight">
              What's your next story?
            </h1>

            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-normal leading-relaxed">
              Book curated, immersive experiences and intimate journeys led and guided by THE LOCALS.
            </p>

            {/* Floating Search Bar */}
            <div className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 border border-neutral-200">
                <Search className="w-5 h-5 text-neutral-400 ml-3 flex-shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by experiences or location"
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
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex-shrink-0 ${
                    filterDrawerOpen 
                      ? 'bg-traveller-mint text-white' 
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Drawer / Accordion */}
        {filterDrawerOpen && (
          <div className="bg-white border-b border-neutral-200 px-4 py-6 max-w-7xl mx-auto animate-in slide-in-from-top-2 duration-150 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              
              {/* Filter 1: Max Price Slider */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase text-neutral-500">Max Price</label>
                  <span className="text-xs font-extrabold text-traveller-forestDark">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-traveller-mint cursor-pointer"
                />
              </div>

              {/* Filter 2: State / Territory Dropdown */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">State / Territory</label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-traveller-mint"
                  >
                    {POPULAR_STATES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter 3: Destinations Dropdown */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">Destinations</label>
                <div className="relative">
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-traveller-mint"
                  >
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <option key={dest} value={dest}>{dest}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filter 4: Category Dropdown */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-traveller-mint"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100">
              <span className="text-xs text-neutral-500">
                Showing {filteredExperiences.length} filtered results
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedState('All');
                  setSelectedDestination('All');
                  setMaxPrice(100000);
                  setFilterDrawerOpen(false);
                }}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Destination Chips */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Popular States:
            </span>
            {POPULAR_STATES.slice(0, 10).map((dest) => (
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

        {/* ZONAL SECTIONS OF INDIA FOR EXPEDITIONS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-traveller-forestDark mx-auto" />
              <p className="text-xs font-semibold text-neutral-500">Loading authentic expeditions across India...</p>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8 max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-neutral-800">No Expeditions Found</h3>
              <p className="text-xs text-neutral-500">
                We couldn't find any trips matching your criteria. Try adjusting your search term or filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                  setSelectedState('All');
                  setSelectedDestination('All');
                  setMaxPrice(100000);
                }}
                className="mt-2 text-xs font-bold px-4 py-2 rounded-xl bg-traveller-forestDark text-white hover:bg-black"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-14">
              {ZONES.map((zone) => {
                // If filters are active, show zone if it has items; otherwise render all zones
                if (zone.items.length === 0 && (searchTerm || selectedState !== 'All' || selectedCategory !== 'All' || selectedDestination !== 'All')) {
                  return null;
                }

                return (
                  <section key={zone.key} className="space-y-4">
                    {/* Zone Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-2xl bg-white shadow-xs border border-neutral-100">
                          {zone.emoji}
                        </span>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-sans">
                              {zone.title}
                            </h2>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-traveller-lightMint text-traveller-forestDark border border-traveller-mint/30">
                              {zone.items.length} {zone.items.length === 1 ? 'Expedition' : 'Expeditions'}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {zone.tagline}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Zone Expeditions Grid */}
                    {zone.items.length === 0 ? (
                      <div className="py-8 px-4 text-center bg-white/70 rounded-2xl border border-dashed border-neutral-200 text-xs text-neutral-400">
                        New local hosts in {zone.title} are onboarding soon. Check back shortly!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {zone.items.map((exp) => (
                          <ExperienceCard
                            key={exp.id}
                            experience={exp}
                            isWishlisted={wishlistIds.includes(exp.id)}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          {/* WHY CHOOSE THE LOCALS SECTION */}
          <section className="mt-20 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs font-extrabold tracking-widest text-emerald-400 uppercase bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-500/30 inline-block">
                  WHY CHOOSE THE LOCALS
                </span>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-sans">
                  Conscious Exploration Led by Native Voices
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
                  We are not another mass-commercial travel agency. Here is why our project is fundamentally different:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Solid Point 1 */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">100% Native & Verified Local Hosts</h4>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-11">
                    Every expedition is led by born-and-raised indigenous mountain residents, certified guides, and elder trail storytellers with generational knowledge. Never outsourced city contractors.
                  </p>
                </div>

                {/* Solid Point 2 */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Intimate Micro-Groups & Slow Travel</h4>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-11">
                    Strict group caps of 2 to 8 explorers ensure deep cultural immersion, respectful footprint on fragile mountain ecosystems, and meaningful relationships with host families.
                  </p>
                </div>

                {/* Solid Point 3 */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Direct Grassroots Economic Impact</h4>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-11">
                    Over 85% of expedition payments stay directly inside the remote valleys with homestay cooks, mountain porters, muleteers, and local artisan families, keeping remote communities alive.
                  </p>
                </div>

                {/* Solid Point 4 */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white">Uncommercialized Secret Trails</h4>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed pl-11">
                    Escape overcrowded mass-tourism routes. Discover hidden sacred ridges, ancestral forager paths, forgotten monastic valleys, and authentic community harvest festivals.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-white/10">
                <p className="text-xs font-semibold text-emerald-300 tracking-wider uppercase">
                  Locals ★ Offbeat ★ Immersive ★ Slow and Sustainable
                </p>
              </div>
            </div>
          </section>

        </div>

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
