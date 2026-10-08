import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { experienceService } from '../../services/experienceService';
import { 
  PlusCircle, 
  Layers, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Calendar,
  MapPin
} from 'lucide-react';

export default function GuideExperiencesPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' | 'requested' | 'rejected'

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsub = experienceService.subscribeGuideExperiences(
      currentUser.uid,
      currentUser.email || '',
      userProfile?.name || '',
      (data) => {
        setExperiences(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading guide experiences:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser, userProfile]);

  // Tab filtering mirroring BookYourGuide Flutter guide_experiences_tab.dart
  const approvedExps = experiences.filter((e) => {
    const s = String(e.status || '').toLowerCase().trim();
    return s === 'approved' || s === 'published' || s === 'active';
  });

  const pendingExps = experiences.filter((e) => {
    const s = String(e.status || '').toLowerCase().trim();
    return s === 'pending' || s === 'changes_requested' || s === 'draft' || s === '' || !e.status;
  });

  const rejectedExps = experiences.filter((e) => {
    const s = String(e.status || '').toLowerCase().trim();
    return s === 'rejected' || s === 'revoked';
  });

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await experienceService.deleteExperience(id);
    } catch (err) {
      alert("Failed to delete experience: " + err.message);
    }
  };

  const getVisibleList = () => {
    if (activeTab === 'approved') return approvedExps;
    if (activeTab === 'requested') return pendingExps;
    return rejectedExps;
  };

  const visibleList = getVisibleList();

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900 tracking-tight">
              Experiences
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Manage your curated itineraries, submitted trails, and live approval status.
            </p>
          </div>

          <Link
            to="/guide/create-experience"
            className="px-5 py-2.5 rounded-xl bg-guide-primary hover:bg-guide-headerDark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Itinerary</span>
          </Link>
        </div>

        {/* Tab Headers (matching guide_experiences_tab.dart) */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-1.5 flex gap-1 shadow-xs">
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'approved'
                ? 'bg-guide-headerNavy text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span>APPROVED</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'approved' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {approvedExps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requested')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'requested'
                ? 'bg-guide-headerNavy text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span>REQUESTED</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'requested' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {pendingExps.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'rejected'
                ? 'bg-guide-headerNavy text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span>REJECTED</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === 'rejected' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {rejectedExps.length}
            </span>
          </button>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-guide-primary mx-auto" />
            <p className="text-xs text-neutral-500 font-medium">Loading your itineraries...</p>
          </div>
        ) : visibleList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-800">
                {activeTab === 'approved' && 'No approved itineraries published yet.'}
                {activeTab === 'requested' && 'No requested itineraries waiting for admin approval.'}
                {activeTab === 'rejected' && 'No rejected itineraries.'}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                {activeTab === 'approved' && 'Once your submitted itineraries are vetted by our safety lead, they will appear here.'}
                {activeTab === 'requested' && 'New multi-day routes created will show up here until approved.'}
                {activeTab === 'rejected' && 'All your submitted itineraries are either active or in review.'}
              </p>
            </div>
            {activeTab !== 'approved' && (
              <Link
                to="/guide/create-experience"
                className="inline-block px-5 py-2.5 rounded-xl bg-guide-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-guide-headerDark transition-colors shadow-sm"
              >
                Create New Itinerary
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleList.map((exp) => {
              const status = String(exp.status || 'pending').toLowerCase().trim();
              const hasFeedback = Boolean(exp.rejectionReason || exp.feedback || status === 'changes_requested');
              const feedbackText = exp.rejectionReason || exp.feedback || "Please review itinerary requirements and update trail safety info.";
              const duration = exp.durationDays > 0 ? `${exp.durationDays}D / ${exp.durationNights || exp.durationDays - 1}N` : 'Day Trip';

              return (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all p-5 space-y-4"
                >
                  {/* Top Row: Duration/Price & Status Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-guide-headerNavy uppercase tracking-wider">
                      {duration} · ₹{Number(exp.price || 0).toLocaleString('en-IN')}
                    </span>

                    {/* Status Badge */}
                    {status === 'approved' || status === 'published' || status === 'active' ? (
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        APPROVED
                      </span>
                    ) : status === 'changes_requested' ? (
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        CHANGES REQUESTED
                      </span>
                    ) : status === 'rejected' || status === 'revoked' ? (
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-red-100 text-red-800 uppercase tracking-wider flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        REJECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        PENDING APPROVAL
                      </span>
                    )}
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 font-sans">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-guide-cyan" />
                      <span>{exp.city ? `${exp.city}, ` : ''}{exp.state || 'Himalayas'}</span>
                    </p>
                  </div>

                  {/* Admin Feedback Box if applicable */}
                  {hasFeedback && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>
                          {status === 'changes_requested' ? 'ADMIN REQUESTED CHANGES' : 'ADMIN FEEDBACK'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed pl-5">
                        {feedbackText}
                      </p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/experience/${exp.id}`}
                        target="_blank"
                        className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 flex items-center gap-1"
                        title="Preview Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(exp.id, exp.title)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 ml-2"
                        title="Delete Itinerary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link
                        to="/guide/bookings"
                        className="text-xs font-bold text-guide-headerNavy hover:bg-neutral-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Guests</span>
                      </Link>

                      <Link
                        to={`/guide/edit-experience/${exp.id}`}
                        className={`text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                          hasFeedback 
                            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                            : 'bg-guide-headerNavy hover:bg-black text-white'
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{hasFeedback ? 'Edit & Resubmit' : 'Edit Itinerary'}</span>
                      </Link>
                    </div>
                  </div>

                </div>
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
