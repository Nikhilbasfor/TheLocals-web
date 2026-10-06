import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award, 
  MapPin, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';

const INDIAN_STATES = [
  'Uttarakhand',
  'Himachal Pradesh',
  'Ladakh',
  'Jammu & Kashmir',
  'Sikkim',
  'Rajasthan',
  'Kerala',
  'Goa',
  'Karnataka',
  'Maharashtra',
  'West Bengal'
];

const SPECIALTY_OPTIONS = [
  'High Altitude Trekking',
  'Alpine Flora & Foraging',
  'Cultural & Heritage Walks',
  'Bird Watching & Wildlife',
  'Camping & Bushcraft',
  'Rock Climbing & Mountaineering',
  'River Rafting & Kayaking',
  'Village Homestays & Cooking'
];

export default function GuideOnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile } = useAuth();

  // If already verified or onboarding complete, step 5 is the status screen
  const initialStep = (userProfile?.onboardingComplete && !userProfile?.verified) ? 5 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Form State
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [state, setState] = useState(userProfile?.state || 'Uttarakhand');
  const [city, setCity] = useState(userProfile?.city || '');
  
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || 2);
  const [specialties, setSpecialties] = useState(userProfile?.specialties || []);
  const [languages, setLanguages] = useState(userProfile?.languages || ['Hindi', 'English']);
  
  const [aadhaarNumber, setAadhaarNumber] = useState(userProfile?.aadhaarNumber || '');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(userProfile?.aadhaarFrontUrl || '');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState(userProfile?.aadhaarBackUrl || '');
  
  const [birthState, setBirthState] = useState(userProfile?.birthState || 'Uttarakhand');
  const [bio, setBio] = useState(userProfile?.bio || '');

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const toggleSpecialty = (item) => {
    if (specialties.includes(item)) {
      setSpecialties(specialties.filter(s => s !== item));
    } else {
      setSpecialties([...specialties, item]);
    }
  };

  const handleUploadAadhaar = async (file, side) => {
    if (!file || !currentUser) return;
    try {
      if (side === 'front') setUploadingFront(true);
      else setUploadingBack(true);

      const url = await storageService.uploadFile(file, `verification/${currentUser.uid}`);
      if (side === 'front') setAadhaarFrontUrl(url);
      else setAadhaarBackUrl(url);
    } catch (err) {
      alert("Failed to upload document: " + err.message);
    } finally {
      if (side === 'front') setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const handleSubmitVerification = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateUserProfile({
        name: fullName,
        fullName: fullName,
        phone,
        state,
        city,
        experienceYears: Number(experienceYears) || 0,
        specialties,
        languages,
        aadhaarNumber,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        birthState,
        bio,
        role: 'guide',
        onboardingComplete: true,
        verified: false, // under review by admin
      });
      setCurrentStep(5);
    } catch (err) {
      console.error("KYC submission error:", err);
      setError(err.message || "Failed to submit verification details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-8">
        
        {/* Step Indicator Header (Steps 1 to 4) */}
        {currentStep <= 4 && (
          <div className="space-y-4 text-center">
            <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              LOCAL HOST VERIFICATION • STEP {currentStep} OF 4
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900">
              {currentStep === 1 && "Personal & Base Location"}
              {currentStep === 2 && "Guiding Skills & Expertise"}
              {currentStep === 3 && "Government ID & KYC Verification"}
              {currentStep === 4 && "Native Roots & Mountain Story"}
            </h1>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              The Locals prioritizes safety and local heritage by verifying all mountain leads.
            </p>

            {/* Stepper dots */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === step 
                      ? 'w-8 bg-guide-primary' 
                      : currentStep > step 
                        ? 'w-2 bg-emerald-500' 
                        : 'w-2 bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As per Government ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Base Town / Village *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Sankri, Joshimath, Leh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Operating State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-white"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!fullName || !phone) {
                    alert("Please fill your full legal name and phone.");
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Experience & Specialties */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Guiding Experience (Years) *
              </label>
              <input
                type="number"
                min="0"
                max="45"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-2">
                Your Guiding Specialties (Choose all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPECIALTY_OPTIONS.map((spec) => {
                  const isChecked = specialties.includes(spec);
                  return (
                    <button
                      type="button"
                      key={spec}
                      onClick={() => toggleSpecialty(spec)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        isChecked 
                          ? 'border-guide-primary bg-guide-skyBlue text-guide-navy shadow-xs font-bold' 
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <span>{spec}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-guide-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2"
              >
                <span>Continue to KYC</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Identity & Aadhaar Verification */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Aadhaar Number (12 Digits) *
              </label>
              <input
                type="text"
                maxLength="12"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="1234 5678 9012"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Photo */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-3">
                <span className="text-xs font-bold text-neutral-700 block">Aadhaar Front Photo</span>
                {aadhaarFrontUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200">
                    <img src={aadhaarFrontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-[11px] text-neutral-400">Clear photo of Aadhaar Front</p>
                  </div>
                )}
                <label className="inline-block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingFront ? 'Uploading...' : 'Choose Front File'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadAadhaar(e.target.files?.[0], 'front')} />
                </label>
              </div>

              {/* Back Photo */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-3">
                <span className="text-xs font-bold text-neutral-700 block">Aadhaar Back Photo</span>
                {aadhaarBackUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200">
                    <img src={aadhaarBackUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Uploaded</span>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-[11px] text-neutral-400">Clear photo with address</p>
                  </div>
                )}
                <label className="inline-block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingBack ? 'Uploading...' : 'Choose Back File'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadAadhaar(e.target.files?.[0], 'back')} />
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2"
              >
                <span>Continue to Step 4</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Native Roots & Bio */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Native State / Homeland Roots *
              </label>
              <select
                value={birthState}
                onChange={(e) => setBirthState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-white"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Your Guiding Bio & Story *
              </label>
              <textarea
                rows="4"
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your connection to the trails, indigenous stories, and what makes your expeditions special..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitVerification}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting KYC...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Under Verification / Pending Approval Status Screen */}
        {currentStep === 5 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-100">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-amber-700 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                VERIFICATION IN PROGRESS
              </span>
              <h2 className="text-2xl font-black font-sans text-neutral-900">
                Documents Under Review
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
                Thank you, <strong>{userProfile?.name || fullName}</strong>! Your guide onboarding details and government ID documents have been submitted to our community safety team.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Onboarding Profile Completed</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>ID Document Captured</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-semibold">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Review turnaround: Typically 24-48 hours</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/guide/dashboard')}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark"
              >
                Go to Host Dashboard
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50"
              >
                View Explorer Feed
              </button>
            </div>
          </div>
        )}

      </main>

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
