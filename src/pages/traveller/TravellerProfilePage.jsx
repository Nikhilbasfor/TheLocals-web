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
  LogOut, 
  Edit3, 
  Repeat, 
  ShieldCheck, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function TravellerProfilePage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile, logout, setRole } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [city, setCity] = useState(userProfile?.city || '');
  const [state, setState] = useState(userProfile?.state || 'Uttarakhand');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const url = await storageService.uploadFile(file, `profiles/${currentUser.uid}`);
      await updateUserProfile({ profilePicUrl: url, profileImage: url });
    } catch (err) {
      alert("Failed to upload profile photo: " + err.message);
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
        bio,
        city,
        state,
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

  const handleSwitchToGuide = () => {
    setRole('guide');
    if (!userProfile?.onboardingComplete) {
      navigate('/guide/onboarding');
    } else {
      navigate('/guide/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!currentUser) {
    return (
      <TravelPatternBackground>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center max-w-sm space-y-4">
            <User className="w-12 h-12 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-lg text-neutral-800">Sign in to view Profile</h3>
            <button
              onClick={() => navigate('/login?role=traveller')}
              className="w-full py-2.5 rounded-xl bg-traveller-forestDark text-white text-xs font-bold uppercase tracking-wider"
            >
              Sign In
            </button>
          </div>
        </div>
      </TravelPatternBackground>
    );
  }

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar with Camera upload button */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-traveller-lightMint border-4 border-white shadow-lg flex items-center justify-center text-traveller-forestDark font-black text-2xl">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : userProfile?.profilePicUrl ? (
                  <img src={userProfile.profilePicUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{(userProfile?.name || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>

              <label 
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-traveller-forestDark text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-black transition-colors"
                title="Change Avatar"
              >
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-black text-neutral-900 font-sans">
                    {userProfile?.name || 'Himalayan Explorer'}
                  </h1>
                  <p className="text-xs text-neutral-500 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{currentUser.email}</span>
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
                {userProfile?.bio || "Conscious mountain explorer passionate about authentic trails and local culture."}
              </p>

              {/* Badges */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-3 flex-wrap text-xs text-neutral-500">
                {userProfile?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    {userProfile.phone}
                  </span>
                )}
                {userProfile?.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    {userProfile.city ? `${userProfile.city}, ` : ''}{userProfile.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Form if open */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="pt-6 border-t border-neutral-100 space-y-4">
              <h3 className="font-bold text-sm text-neutral-900">Update Profile Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Full Name</label>
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
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Bio</label>
                <textarea
                  rows="2"
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
                  className="px-5 py-2 rounded-xl bg-traveller-forestDark text-white text-xs font-bold uppercase tracking-wider"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
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

        {/* Portal Switcher & Logout actions */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Account Options</h3>

          <div className="space-y-3">
            {/* Host Portal Card */}
            <div 
              onClick={handleSwitchToGuide}
              className="p-4 rounded-2xl border border-neutral-200 hover:border-guide-navy/40 hover:bg-neutral-50/50 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-guide-skyBlue text-guide-navy flex items-center justify-center">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Host an Experience</h4>
                  <p className="text-xs text-neutral-500">Become a local guide, publish trails & host expeditions</p>
                </div>
              </div>
              <span className="text-xs font-bold text-guide-navy">Switch &gt;</span>
            </div>

            {/* Logout */}
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
                  <p className="text-xs text-red-400">Log out of your account on this device</p>
                </div>
              </div>
            </button>
          </div>
        </div>

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
