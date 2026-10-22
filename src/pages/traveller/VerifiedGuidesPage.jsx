import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { userService } from '../../services/userService';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Star, 
  Award, 
  ArrowRight, 
  Users, 
  Loader2 
} from 'lucide-react';

const INDIAN_STATES = [
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

function getGuideZone(guide) {
  const state = (guide.state || '').toLowerCase();
  const city = (guide.city || '').toLowerCase();
  const bio = (guide.bio || '').toLowerCase();
  const text = `${state} ${city} ${bio}`;

  if (
    text.includes('assam') ||
    text.includes('meghalaya') ||
    text.includes('arunachal') ||
    text.includes('sikkim') ||
    text.includes('nagaland') ||
    text.includes('manipur') ||
    text.includes('mizoram') ||
    text.includes('tripura') ||
    text.includes('nepal') ||
    text.includes('bhutan')
  ) {
    return 'northeast';
  }

  if (
    text.includes('kerala') ||
    text.includes('tamil') ||
    text.includes('karnataka') ||
    text.includes('goa') ||
    text.includes('andhra') ||
    text.includes('telangana') ||
    text.includes('wayanad') ||
    text.includes('coorg')
  ) {
    return 'south';
  }

  if (
    text.includes('maharashtra') ||
    text.includes('gujarat') ||
    text.includes('pune') ||
    text.includes('mumbai') ||
    text.includes('sahyadri')
  ) {
    return 'west';
  }

  return 'north';
}

export default function VerifiedGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  useEffect(() => {
    const unsub = userService.subscribeVerifiedGuides(
      (data) => {
        setGuides(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading guides:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filteredGuides = guides.filter((g) => {
    const name = g.name || g.fullName || '';
    const bio = g.bio || '';
    const city = g.city || '';
    const state = g.state || '';
    const specialties = (g.specialties || []).join(' ');

    const matchesSearch = 
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialties.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = 
      selectedState === 'All' || 
      state.toLowerCase() === selectedState.toLowerCase();

    return matchesSearch && matchesState;
  });

  const northGuides = filteredGuides.filter((g) => getGuideZone(g) === 'north');
  const northeastGuides = filteredGuides.filter((g) => getGuideZone(g) === 'northeast');
  const southGuides = filteredGuides.filter((g) => getGuideZone(g) === 'south');
  const westGuides = filteredGuides.filter((g) => getGuideZone(g) === 'west');

  const ZONES = [
    {
      key: 'north',
      title: 'North Guides & Leads',
      tagline: 'Himachal, Uttarakhand, Ladakh, Jammu & Kashmir verified leads',
      emoji: '🏔️',
      items: northGuides,
    },
    {
      key: 'northeast',
      title: 'Northeast Guides & Leads',
      tagline: 'Sikkim, Nagaland, Meghalaya, Arunachal & Eastern Himalaya native hosts',
      emoji: '🌿',
      items: northeastGuides,
    },
    {
      key: 'south',
      title: 'South Guides & Leads',
      tagline: 'Western Ghats, Wayanad rainforests & Nilgiri naturalists',
      emoji: '🌊',
      items: southGuides,
    },
    {
      key: 'west',
      title: 'West Guides & Leads',
      tagline: 'Sahyadri mountain forts, Konkan coast & desert heritage',
      emoji: '🌅',
      items: westGuides,
    },
  ];

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-guide-headerNavy text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>

          <div className="relative max-w-2xl space-y-3">
            <span className="text-[11px] font-extrabold tracking-widest text-emerald-300 uppercase px-3 py-1 rounded-full bg-white/10 backdrop-blur-md inline-block">
              COMMUNITY DIRECTORY
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-sans tracking-tight">
              Verified Local Guides
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
              Meet native mountain leads, trail historians, and high-altitude instructors verified with government credentials across the zones of India.
            </p>
          </div>
        </div>

        {/* Search & State Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guide name, trail, or specialty..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-guide-cyan bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {INDIAN_STATES.slice(0, 10).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                  selectedState === st
                    ? 'bg-guide-primary text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ZONAL SECTIONS FOR VERIFIED GUIDES */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-guide-primary mx-auto" />
            <p className="text-xs text-neutral-500 font-semibold">Loading verified local guides...</p>
          </div>
        ) : filteredGuides.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8 max-w-md mx-auto space-y-3">
            <Users className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-base text-neutral-800">No Guides Found</h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or state selection.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {ZONES.map((zone) => {
              if (zone.items.length === 0 && (searchQuery || selectedState !== 'All')) {
                return null;
              }

              return (
                <section key={zone.key} className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-2xl bg-white shadow-xs border border-neutral-100">
                        {zone.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-sans">
                            {zone.title}
                          </h2>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {zone.items.length} {zone.items.length === 1 ? 'Guide' : 'Guides'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {zone.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {zone.items.length === 0 ? (
                    <div className="py-8 px-4 text-center bg-white/70 rounded-2xl border border-dashed border-neutral-200 text-xs text-neutral-400">
                      Guides in this zone are currently completing KYC verification. Check back shortly!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {zone.items.map((guide) => {
                        const guideName = guide.name || guide.fullName || 'Himalayan Host';
                        const avatar = guide.profilePicUrl || guide.profileImage;
                        const isVerified = guide.verified === true || guide.isVerified === true;

                        return (
                          <div
                            key={guide.uid}
                            className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs hover:border-neutral-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-guide-skyBlue text-guide-navy font-bold text-lg flex items-center justify-center flex-shrink-0 border-2 border-guide-primary/20 overflow-hidden">
                                  {avatar ? (
                                    <img src={avatar} alt={guideName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span>{guideName.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h3 className="font-bold text-base text-neutral-900 truncate">
                                      {guideName}
                                    </h3>
                                    {isVerified && (
                                      <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Aadhaar / Govt ID Verified">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                                    <span className="truncate">{guide.city ? `${guide.city}, ` : ''}{guide.state || 'Local Region'}</span>
                                  </div>

                                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                      <span>{(guide.rating || 5.0).toFixed(1)}</span>
                                    </div>
                                    <span className="text-neutral-300">•</span>
                                    <div className="flex items-center gap-1 text-neutral-600 font-medium">
                                      <Award className="w-3.5 h-3.5 text-guide-primary" />
                                      <span>{guide.experienceYears || 2} Yrs Exp</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {guide.bio && (
                                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                                  {guide.bio}
                                </p>
                              )}

                              {guide.specialties && guide.specialties.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {guide.specialties.slice(0, 3).map((spec) => (
                                    <span
                                      key={spec}
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                  {guide.specialties.length > 3 && (
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-400">
                                      +{guide.specialties.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="pt-2 border-t border-neutral-100">
                              <Link
                                to={`/guide-profile/${guide.uid}`}
                                className="w-full py-2.5 px-3 rounded-xl bg-neutral-50 hover:bg-guide-skyBlue text-neutral-700 hover:text-guide-navy text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>View Guide Profile & Itineraries</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
