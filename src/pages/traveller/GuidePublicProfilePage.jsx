import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import ExperienceCard from '../../components/traveller/ExperienceCard';
import { userService } from '../../services/userService';
import { experienceService } from '../../services/experienceService';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Star, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Layers, 
  Compass, 
  Globe, 
  Loader2 
} from 'lucide-react';

export default function GuidePublicProfilePage() {
  const { guideId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [guide, setGuide] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guideId) return;

    const fetchData = async () => {
      try {
        let guideData = await userService.getGuideById(guideId);
        const expData = await experienceService.getExperiencesByGuide(
          guideId, 
          guideData?.email || (guideId.includes('@') ? guideId : ''), 
          guideData?.name || guideData?.fullName || guideId
        );

        if (!guideData && expData.length > 0) {
          const first = expData[0];
          guideData = {
            uid: guideId,
            name: first.guideName || 'Local Guide',
            profilePicUrl: first.guideImage || '',
            state: first.state || 'Himalayas',
            city: first.city || '',
            rating: first.guideRating || 5.0,
            experienceYears: first.guideExperienceYears || 2,
            verified: true,
            bio: `Verified local guide for ${first.title} and authentic Himalayan expeditions.`
          };
        }

        setGuide(guideData);
        setExperiences(expData);
      } catch (err) {
        console.error("Error loading guide public profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guideId]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = wishlistService.subscribeWishlistIds(
      currentUser.uid,
      (ids) => setWishlistIds(ids),
      () => {}
    );
    return () => unsub();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bgLight flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-guide-primary" />
        <p className="text-xs text-neutral-500 font-semibold">Loading host profile...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-neutral-bgLight flex items-center justify-center flex-col gap-3 p-6 text-center">
        <h2 className="text-lg font-bold text-neutral-800">Guide Profile Not Found</h2>
        <Link to="/guides" className="text-xs font-bold px-4 py-2 bg-guide-primary text-white rounded-xl">
          Back to Verified Guides
        </Link>
      </div>
    );
  }

  const guideName = guide.name || guide.fullName || 'Himalayan Host';
  const avatar = guide.profilePicUrl || guide.profileImage;
  const isVerified = guide.verified === true || guide.isVerified === true;

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-8">
        
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Hero Guide Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Header Banner */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-guide-headerNavy to-traveller-forestDark relative flex items-center justify-end px-8">
            <Compass className="w-32 h-32 text-white/10" />
          </div>

          <div className="px-6 sm:px-8 pb-8 pt-0 -mt-16 sm:-mt-20 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
              
              {/* Avatar + Main info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-guide-skyBlue text-guide-navy font-bold text-3xl flex items-center justify-center shadow-xl overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={guideName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{guideName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900">
                      {guideName}
                    </h1>
                    {isVerified && (
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-700" title="Aadhaar Verified Lead">
                        <ShieldCheck className="w-5 h-5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-traveller-mint" />
                    <span>{guide.city ? `${guide.city}, ` : ''}{guide.state || 'Himalayan Ridge'}</span>
                  </p>
                </div>
              </div>

              {/* Quick Contact Buttons */}
              <div className="flex items-center gap-2">
                {guide.phone && (
                  <a
                    href={`tel:${guide.phone}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-bold text-xs hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Host</span>
                  </a>
                )}
                {guide.email && (
                  <a
                    href={`mailto:${guide.email}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200/60 font-bold text-xs hover:bg-sky-100 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-600" />
                    <span>Email</span>
                  </a>
                )}
              </div>
            </div>

            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Experience</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1 mt-0.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {guide.experienceYears || 2} Years Guiding
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Host Rating</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {Number(guide.rating || 5.0).toFixed(1)} / 5.0
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Expeditions</span>
                <span className="text-sm font-bold text-neutral-800 flex items-center gap-1 mt-0.5">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  {experiences.length} Hosted
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Languages</span>
                <span className="text-xs font-bold text-neutral-800 flex items-center gap-1 mt-0.5 truncate">
                  <Globe className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{(guide.languages || ['Hindi', 'English']).join(', ')}</span>
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-sm text-neutral-900 font-sans">About {guideName}</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {guide.bio || "Native Himalayan lead specializing in authentic ridge trails, offbeat valleys, and safe mountain expeditions."}
              </p>
            </div>

            {/* Specialties */}
            {guide.specialties && guide.specialties.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Expertise & Specialties</span>
                <div className="flex flex-wrap gap-2">
                  {guide.specialties.map((s, idx) => (
                    <span key={idx} className="text-xs font-medium px-3 py-1 rounded-xl bg-neutral-100 text-neutral-700">
                      ★ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Hosted Expeditions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-sans text-neutral-900">
              Expeditions Hosted by {guideName} ({experiences.length})
            </h2>
          </div>

          {experiences.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 text-xs text-neutral-500">
              This host has not published active expeditions yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
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
