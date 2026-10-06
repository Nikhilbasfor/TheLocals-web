import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { experienceService } from '../../services/experienceService';
import { bookingService } from '../../services/bookingService';
import { 
  LayoutDashboard, 
  Layers, 
  PlusCircle, 
  CalendarCheck, 
  IndianRupee, 
  Star, 
  ShieldCheck, 
  Clock, 
  Edit, 
  Trash2, 
  Eye, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function GuideDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const [experiences, setExperiences] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const unsubExp = experienceService.subscribeGuideExperiences(
      currentUser.uid,
      (data) => {
        setExperiences(data);
        setLoading(false);
      },
      (err) => {
        console.error("Guide exp error:", err);
        setLoading(false);
      }
    );

    const unsubBook = bookingService.subscribeGuideBookings(
      currentUser.uid,
      (data) => setBookings(data),
      (err) => console.error("Guide bookings error:", err)
    );

    return () => {
      unsubExp();
      unsubBook();
    };
  }, [currentUser]);

  const totalEarnings = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

  const handleDeleteExperience = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await experienceService.deleteExperience(id);
    } catch (err) {
      alert("Failed to delete experience: " + err.message);
    }
  };

  const handleToggleStatus = async (exp) => {
    const nextStatus = exp.status === 'active' ? 'draft' : 'active';
    try {
      await experienceService.updateExperience(exp.id, { status: nextStatus });
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-8">
        
        {/* Verification Alert Banner if pending */}
        {userProfile && !userProfile.verified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong>Host Verification Under Review:</strong> Your profile is currently being vetted by our safety lead.
              </div>
            </div>
            <Link
              to="/guide/onboarding"
              className="font-bold underline text-amber-800 hover:text-black self-start sm:self-auto"
            >
              Review KYC Details &gt;
            </Link>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900 tracking-tight">
                Host Portal Dashboard
              </h1>
              {userProfile?.verified ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Host
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Welcome back, {userProfile?.name || 'Local Host'}. Manage your itineraries, routes, and guest reservations.
            </p>
          </div>

          <Link
            to="/guide/create-experience"
            className="px-5 py-2.5 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Itinerary</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Expeditions</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-neutral-900 font-sans">{experiences.length}</span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Bookings</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-neutral-900 font-sans">{bookings.length}</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Payouts</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-neutral-900 font-sans">
                ₹{totalEarnings.toLocaleString('en-IN')}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Host Rating</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-neutral-900 font-sans">
                {Number(userProfile?.rating || 5.0).toFixed(1)}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </div>
          </div>

        </div>

        {/* My Expeditions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-neutral-900 font-sans">
              My Created Itineraries
            </h2>
            <span className="text-xs text-neutral-500">{experiences.length} total</span>
          </div>

          {loading ? (
            <div className="py-20 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-guide-primary mx-auto" />
              <p className="text-xs text-neutral-500">Loading your itineraries...</p>
            </div>
          ) : experiences.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-800">No Expeditions Created Yet</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Start hosting explorers by publishing your first authentic multi-day trail itinerary.
                </p>
              </div>
              <Link
                to="/guide/create-experience"
                className="inline-block px-5 py-2.5 rounded-xl bg-guide-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-guide-headerDark"
              >
                Create Itinerary
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div 
                  key={exp.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:border-neutral-300 transition-all space-y-3"
                >
                  <div className="relative aspect-[16/9] bg-neutral-100">
                    <img
                      src={exp.coverImage || (exp.images?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80')}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        exp.status === 'active' 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-neutral-800/80 text-white backdrop-blur-md'
                      }`}>
                        {exp.status || 'active'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
                      ₹{Number(exp.price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-4 pt-1 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        {exp.state || 'Himalayas'} • {exp.category || 'Trek'}
                      </span>
                      <h3 className="font-bold text-base text-neutral-900 truncate font-sans">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>

                    {/* Actions bar */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/guide/edit-experience/${exp.id}`}
                          className="flex items-center gap-1 font-bold text-guide-navy hover:underline"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <Link
                          to={`/experience/${exp.id}`}
                          target="_blank"
                          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-800"
                          title="Preview public page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(exp)}
                          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800"
                        >
                          {exp.status === 'active' ? 'Set Draft' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDeleteExperience(exp.id, exp.title)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
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
