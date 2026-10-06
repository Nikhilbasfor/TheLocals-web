import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Award, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Repeat, 
  Edit3,
  Loader2 
} from 'lucide-react';

export default function GuideProfilePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile, logout, setRole } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [state, setState] = useState(userProfile?.state || 'Uttarakhand');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || 2);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploadingAvatar(true);
    try {
      const url = await storageService.uploadFile(file, `profiles/${currentUser.uid}`);
      await updateUserProfile({ profilePicUrl: url, profileImage: url });
    } catch (err) {
      alert("Failed to upload photo: " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        fullName: name,
        phone,
        city,
        state,
        bio,
        experienceYears: Number(experienceYears) || 0,
      });
      setIsEditing(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchToTraveller = () => {
    setRole('traveller');
    navigate('/explore');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-6">
        
        {/* Verification Status Card */}
        <div className={`p-5 rounded-3xl border ${
          userProfile?.verified 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        } flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            {userProfile?.verified ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-sm">
                {userProfile?.verified ? 'Government KYC Verified Guide' : 'Identity Verification Under Review'}
              </h4>
              <p className="text-xs opacity-80">
                {userProfile?.verified 
                  ? 'Your credentials & Aadhaar records are active.' 
                  : 'Safety team is reviewing your uploaded documents.'}
              </p>
            </div>
          </div>

          {!userProfile?.verified && (
            <button
              onClick={() => navigate('/guide/onboarding')}
              className="text-xs font-bold underline hover:opacity-100"
            >
              KYC Status &gt;
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-guide-skyBlue border-4 border-white shadow-lg flex items-center justify-center text-guide-navy font-black text-2xl">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : userProfile?.profilePicUrl ? (
                  <img src={userProfile.profilePicUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(userProfile?.name || 'G').charAt(0).toUpperCase()}</span>
                )}
              </div>

              <label 
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-guide-primary text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-guide-headerDark transition-colors"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Guide details */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-neutral-900 font-sans">
                    {userProfile?.name || 'Verified Mountain Lead'}
                  </h1>
                  <p className="text-xs text-neutral-500 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{currentUser?.email}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 self-center sm:self-auto transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>
              </div>

              {/* Bio */}
              <p className="text-xs text-neutral-600 pt-2 leading-relaxed">
                {userProfile?.bio || "Native Himalayan lead leading explorers across ancient trails and high passes."}
              </p>

              {/* Stats badges */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3 flex-wrap text-xs text-neutral-500">
                <span className="flex items-center gap-1 font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {userProfile?.experienceYears || 2} Years Guiding
                </span>
                {userProfile?.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    {userProfile.city ? `${userProfile.city}, ` : ''}{userProfile.state}
                  </span>
                )}
                {userProfile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {userProfile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Specialties Chips */}
          {userProfile?.specialties && userProfile.specialties.length > 0 && (
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Specialties</span>
              <div className="flex flex-wrap gap-1.5">
                {userProfile.specialties.map((s, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="pt-6 border-t border-neutral-100 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900">Edit Host Profile</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">City / Base Village</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Guiding Bio</label>
                <textarea
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-guide-primary text-white text-xs font-bold uppercase tracking-wider"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-3">
          <button
            onClick={handleSwitchToTraveller}
            className="w-full p-4 rounded-2xl border border-neutral-200 hover:border-traveller-mint/40 hover:bg-neutral-50 text-neutral-800 transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-traveller-lightMint text-traveller-forestDark flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Switch to Traveller View</h4>
                <p className="text-xs text-neutral-500">Explore expeditions as a traveler</p>
              </div>
            </div>
            <span className="text-xs font-bold text-traveller-forestDark">&gt;</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl border border-red-100 hover:bg-red-50 text-red-600 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Sign Out</h4>
                <p className="text-xs text-red-400">Log out of your host account</p>
              </div>
            </div>
          </button>
        </div>

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
