import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  EXPERIENCE_SPECIALTIES
} from '../../data/geoData';
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
  AlertCircle,
  Plus,
  X,
  RefreshCw,
  Lock,
  Compass
} from 'lucide-react';

export default function GuideOnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile, switchRole } = useAuth();

  // If already onboarding complete, step 4 is the status screen
  const initialStep = (userProfile?.onboardingComplete && !userProfile?.verified) ? 4 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Pre-populate details from registered userProfile (NO REDUNDANT STEP 1!)
  const fullName = userProfile?.name || '';
  const country = userProfile?.country || 'India';
  const fullPhone = userProfile?.phone || '';
  const state = userProfile?.state || 'Uttarakhand';
  const city = userProfile?.city || '';

  // Step 1: Experience, Specialties & Bio
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || 2);
  const [specialties, setSpecialties] = useState(userProfile?.specialties || []);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [selectedSpecialtyDropdown, setSelectedSpecialtyDropdown] = useState('');
  const [languages, setLanguages] = useState(userProfile?.languages || ['Hindi', 'English']);
  const [bio, setBio] = useState(userProfile?.bio || '');

  // Step 2: KYC Documents
  const [aadhaarNumber, setAadhaarNumber] = useState(userProfile?.aadhaarNumber || '');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(userProfile?.aadhaarFrontUrl || '');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState(userProfile?.aadhaarBackUrl || '');
  
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleAddSpecialtyFromDropdown = (e) => {
    const val = e.target.value;
    if (!val) return;
    if (!specialties.includes(val)) {
      setSpecialties([...specialties, val]);
    }
    setSelectedSpecialtyDropdown('');
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialtyInput.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties([...specialties, trimmed]);
      setCustomSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (item) => {
    setSpecialties(specialties.filter((s) => s !== item));
  };

  const handleUploadAadhaar = async (file, side) => {
    if (!file || !currentUser) return;
    try {
      if (side === 'front') setUploadingFront(true);
      else setUploadingBack(true);
      
      const downloadUrl = await storageService.uploadAadhaar(currentUser.uid, file, side);
      if (side === 'front') {
        setAadhaarFrontUrl(downloadUrl);
      } else {
        setAadhaarBackUrl(downloadUrl);
      }
    } catch (err) {
      console.error("KYC Upload error:", err);
      alert(err.message || "Failed to upload ID document. Please try again.");
    } finally {
      if (side === 'front') setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!aadhaarNumber || aadhaarNumber.length < 6) {
      setError("Please provide a valid Government ID / Aadhaar number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUserProfile({
        experienceYears: Number(experienceYears) || 0,
        specialties,
        languages,
        aadhaarNumber,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        bio: bio.trim(),
        role: 'guide',
        onboardingComplete: true,
        verified: false,
        isVerified: false,
        submittedAt: Date.now()
      });

      setCurrentStep(4);
    } catch (err) {
      console.error("KYC Submit error:", err);
      setError("Failed to submit verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status check for locked step 4
  const handleCheckStatus = async () => {
    if (!currentUser) return;
    setStatusChecking(true);
    setStatusMessage(null);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const isApproved = data.verified === true || data.isVerified === true;
        if (isApproved) {
          setStatusMessage({ type: 'success', text: 'Congratulations! Your guide profile has been approved! Redirecting to host dashboard...' });
          setTimeout(() => {
            navigate('/guide/dashboard');
          }, 1500);
        } else if (data.rejectionReason) {
          setStatusMessage({ type: 'error', text: `Admin Revision Required: ${data.rejectionReason}` });
        } else {
          setStatusMessage({ type: 'pending', text: 'Verification in progress. Our safety team typically verifies documents within 24 hours.' });
        }
      }
    } catch (err) {
      console.error("Check status error:", err);
      setStatusMessage({ type: 'error', text: 'Failed to refresh status. Please check your internet.' });
    } finally {
      setStatusChecking(false);
    }
  };

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 min-h-screen pb-24 md:pb-16">
        
        {/* Onboarding Wizard Header */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-[11px] font-extrabold tracking-widest text-guide-primary uppercase bg-guide-skyBlue px-3.5 py-1 rounded-full border border-guide-primary/20 inline-block">
            HOST VERIFICATION PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900">
            {currentStep === 4 ? 'KYC Verification Status' : 'Guide KYC & Specialization'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            {currentStep === 4 
              ? 'Your account is under community safety review before host features unlock.'
              : 'Add your guiding specialties and upload your identity documents to get verified.'}
          </p>
        </div>

        {/* Step Progress Pills (Steps 1 to 3) */}
        {currentStep < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2">
              <span className={currentStep >= 1 ? 'text-guide-primary font-black' : ''}>1. Specialties & Experience</span>
              <span className={currentStep >= 2 ? 'text-guide-primary font-black' : ''}>2. KYC ID Documents</span>
              <span className={currentStep >= 3 ? 'text-guide-primary font-black' : ''}>3. Review & Submit</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep === step 
                      ? 'w-10 bg-guide-primary' 
                      : currentStep > step 
                        ? 'w-4 bg-emerald-500' 
                        : 'w-2 bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: EXPERIENCE & SPECIALTIES */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Auto-filled Identity Card */}
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {(fullName || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">{fullName || 'Host Member'}</p>
                  <p className="text-neutral-500">{fullPhone} • {city ? `${city}, ` : ''}{state}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                ✓ Registered Account
              </span>
            </div>

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
                placeholder="e.g. 3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            {/* Experience-oriented Specialties Dropdown & Tag List */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                  Guiding Specialties (Select from list) *
                </label>
                <p className="text-[11px] text-neutral-500 mb-2">
                  Choose the unique experiences you host and lead travelers through:
                </p>
                <select
                  value={selectedSpecialtyDropdown}
                  onChange={handleAddSpecialtyFromDropdown}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-white text-neutral-800"
                >
                  <option value="">-- Choose a Guiding Specialty to Add --</option>
                  {EXPERIENCE_SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec} disabled={specialties.includes(spec)}>
                      {spec} {specialties.includes(spec) ? '(Added)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Specialties Chips */}
              {specialties.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase text-neutral-400">Selected Specialties:</span>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-guide-skyBlue text-guide-navy text-xs font-bold border border-guide-primary/30"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialty(spec)}
                          className="p-0.5 rounded-full hover:bg-black/10 text-neutral-500 hover:text-black"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Specialty Input */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                  Don't see your specialty? Add a custom one:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSpecialtyInput}
                    onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSpecialty();
                      }
                    }}
                    placeholder="e.g. Traditional Pottery & Clay Craft"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSpecialty}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hometown Roots Bio */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Brief Bio / Hometown Roots
              </label>
              <textarea
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell travelers about your roots, community knowledge, and the local trails you guide..."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs sm:text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (specialties.length === 0) {
                    alert("Please select or add at least one guiding specialty.");
                    return;
                  }
                  setCurrentStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2 shadow-md"
              >
                <span>Continue to KYC Documents</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY & KYC DOCUMENTS */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                Government ID / Aadhaar / Passport Number *
              </label>
              <input
                type="text"
                required
                maxLength="20"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="12-digit Aadhaar / Passport / Voter ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none tracking-widest font-mono"
              />
            </div>

            {/* Document Upload Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
                <span className="block text-xs font-bold text-neutral-700">ID Front Side Photo</span>
                {aadhaarFrontUrl ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Document Uploaded
                  </span>
                ) : (
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer">
                    {uploadingFront ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadAadhaar(e.target.files[0], 'front')}
                    />
                  </label>
                )}
              </div>

              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-2">
                <FileText className="w-8 h-8 text-neutral-400 mx-auto" />
                <span className="block text-xs font-bold text-neutral-700">ID Back Side Photo</span>
                {aadhaarBackUrl ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Document Uploaded
                  </span>
                ) : (
                  <label className="inline-block px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold cursor-pointer">
                    {uploadingBack ? 'Uploading...' : 'Choose File'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUploadAadhaar(e.target.files[0], 'back')}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!aadhaarNumber || aadhaarNumber.length < 6) {
                    alert("Please enter your Government ID number.");
                    return;
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2 shadow-md"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & FINAL SUBMISSION */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-3">
              Review Verification Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Legal Name:</span>
                <p className="font-semibold text-neutral-800 text-sm">{fullName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Verified Phone:</span>
                <p className="font-semibold text-neutral-800 text-sm">{fullPhone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Location:</span>
                <p className="font-semibold text-neutral-800 text-sm">{city ? `${city}, ` : ''}{state}, {country}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Guiding Experience:</span>
                <p className="font-semibold text-neutral-800 text-sm">{experienceYears} Years</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">ID Number:</span>
                <p className="font-semibold text-neutral-800 text-sm font-mono">{aadhaarNumber}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-neutral-400 uppercase font-bold text-xs">Guiding Specialties:</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialties.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                Upon submission, your profile documents will be reviewed by admin. Host dashboard and itinerary creation will unlock once approved.
              </span>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
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

        {/* STEP 4: UNDER REVIEW / LOCKED STATUS SCREEN */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-100">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-amber-700 uppercase bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200 inline-block">
                VERIFICATION IN PROGRESS
              </span>
              <h2 className="text-2xl font-black font-sans text-neutral-900">
                Documents Under Review
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
                Thank you, <strong>{fullName}</strong>! Your guide onboarding details and government ID documents have been submitted to our community safety team.
              </p>
            </div>

            {/* Host Content Locked Notice */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white text-left text-xs space-y-2 shadow-md">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>Host Portal & Itineraries Locked</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Host dashboard, itinerary creation, and bookings will remain locked until your verification is approved from the admin section. Once approved, you will have complete access.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Onboarding Profile Completed</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Government ID Captured ({aadhaarNumber || 'Verified'})</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-semibold">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Review turnaround: Typically 24-48 hours</span>
              </div>
            </div>

            {/* Status message banner if any */}
            {statusMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : statusMessage.type === 'error'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {statusMessage.text}
              </div>
            )}

            {/* Action buttons: Check Status + Switch to Traveller View */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCheckStatus}
                disabled={statusChecking}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {statusChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Refresh / Check Approval Status</span>
              </button>
              <button
                onClick={() => {
                  switchRole('traveller');
                  navigate('/explore');
                }}
                className="px-6 py-3 rounded-xl border border-neutral-300 text-neutral-800 font-bold text-xs hover:bg-neutral-50 flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Explore as Traveller</span>
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
