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
  COUNTRY_LIST,
  INDIAN_STATES_AND_UTS,
  NEPAL_REGIONS,
  BHUTAN_REGIONS,
  STATE_CITIES_MAP,
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
  Lock
} from 'lucide-react';

export default function GuideOnboardingPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile, updateUserProfile } = useAuth();

  // If already verified or onboarding complete, step 5 is the status screen
  const initialStep = (userProfile?.onboardingComplete && !userProfile?.verified) ? 5 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Form State
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [country, setCountry] = useState(userProfile?.country || 'India');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState(() => {
    const existing = userProfile?.phone || '';
    return existing.replace(/^\+\d+\s*/, '');
  });
  const [state, setState] = useState(userProfile?.state || 'Uttarakhand');
  const [city, setCity] = useState(userProfile?.city || '');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || 2);
  const [specialties, setSpecialties] = useState(userProfile?.specialties || []);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [selectedSpecialtyDropdown, setSelectedSpecialtyDropdown] = useState('');
  const [languages, setLanguages] = useState(userProfile?.languages || ['Hindi', 'English']);
  
  const [aadhaarNumber, setAadhaarNumber] = useState(userProfile?.aadhaarNumber || '');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(userProfile?.aadhaarFrontUrl || '');
  const [aadhaarBackUrl, setAadhaarBackUrl] = useState(userProfile?.aadhaarBackUrl || '');
  
  const [birthState, setBirthState] = useState(userProfile?.birthState || '');
  const [bio, setBio] = useState(userProfile?.bio || '');

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  // Available states based on country
  const availableStates = country === 'India'
    ? INDIAN_STATES_AND_UTS
    : country === 'Nepal'
      ? NEPAL_REGIONS
      : country === 'Bhutan'
        ? BHUTAN_REGIONS
        : ['Default Region'];

  // Available cities based on selected state
  const availableCities = STATE_CITIES_MAP[state] || [];

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

    const fullPhoneNumber = `${phoneCode} ${rawPhone.trim()}`;
    const finalCity = isCustomCity ? customCity.trim() : city;

    try {
      await updateUserProfile({
        name: fullName.trim(),
        country,
        phone: fullPhoneNumber,
        state,
        city: finalCity,
        experienceYears: Number(experienceYears) || 0,
        specialties,
        languages,
        aadhaarNumber,
        aadhaarFrontUrl,
        aadhaarBackUrl,
        birthState: birthState || state,
        bio: bio.trim(),
        onboardingComplete: true,
        verified: false,
        isVerified: false,
        submittedAt: Date.now()
      });

      setCurrentStep(5);
    } catch (err) {
      console.error("KYC Submit error:", err);
      setError("Failed to submit verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status check for locked step 5
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
            HOST ONBOARDING PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-sans text-neutral-900">
            {currentStep === 5 ? 'KYC Verification Status' : 'Guide Registration & Verification'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
            {currentStep === 5 
              ? 'Your account is under community safety review before host features unlock.'
              : 'Join our certified local community. Step-by-step verified onboarding.'}
          </p>
        </div>

        {/* Step Progress Pills (Only on steps 1-4) */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2">
              <span className={currentStep >= 1 ? 'text-guide-primary' : ''}>1. Location & Bio</span>
              <span className={currentStep >= 2 ? 'text-guide-primary' : ''}>2. Experience</span>
              <span className={currentStep >= 3 ? 'text-guide-primary' : ''}>3. KYC Documents</span>
              <span className={currentStep >= 4 ? 'text-guide-primary' : ''}>4. Review</span>
            </div>
            <div className="flex gap-2">
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

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Personal Info & Cascading Location */}
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

            {/* Country Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Country *</label>
              <select
                value={country}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setCountry(newCountry);
                  const matched = COUNTRY_LIST.find((c) => c.name === newCountry);
                  if (matched) setPhoneCode(matched.dialCode);
                  if (newCountry === 'India') setState('Uttarakhand');
                  else if (newCountry === 'Nepal') setState(NEPAL_REGIONS[0]);
                  else if (newCountry === 'Bhutan') setState(BHUTAN_REGIONS[0]);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-white font-medium"
              >
                {COUNTRY_LIST.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number with Country Code Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Phone Number *</label>
              <div className="flex gap-2">
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="w-32 px-2.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-neutral-50 font-bold"
                >
                  {COUNTRY_LIST.map((c) => (
                    <option key={c.dialCode + c.code} value={c.dialCode}>
                      {c.flag} {c.dialCode}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={rawPhone}
                  onChange={(e) => setRawPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
                />
              </div>
            </div>

            {/* Cascading State & City Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Operating State / Region *</label>
                <select
                  value={state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setState(newState);
                    const cities = STATE_CITIES_MAP[newState] || [];
                    if (cities.length > 0) {
                      setCity(cities[0]);
                      setIsCustomCity(false);
                    } else {
                      setIsCustomCity(true);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-white"
                >
                  {availableStates.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">Base Town / Village *</label>
                {!isCustomCity && availableCities.length > 0 ? (
                  <select
                    value={city}
                    onChange={(e) => {
                      if (e.target.value === '__OTHER__') {
                        setIsCustomCity(true);
                        setCustomCity('');
                      } else {
                        setCity(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none bg-white"
                  >
                    {availableCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__OTHER__">+ Other Base Town (Type below)</option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="Enter base town or village name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
                    />
                    {availableCities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setIsCustomCity(false)}
                        className="text-[11px] text-guide-primary hover:underline"
                      >
                        Choose from state city dropdown
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!fullName.trim() || !rawPhone.trim()) {
                    alert("Please provide your full legal name and phone number.");
                    return;
                  }
                  if (isCustomCity && !customCity.trim()) {
                    alert("Please provide your base town name.");
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

        {/* Step 2: Experience & Specialties (Requirement 13) */}
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
                placeholder="e.g. 3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            {/* Experience-oriented Specialties Dropdown & Tag List */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-600 mb-1">
                  Guiding Specialties (Select from dropdown) *
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
                onClick={() => {
                  if (specialties.length === 0) {
                    alert("Please select or add at least one guiding specialty.");
                    return;
                  }
                  setCurrentStep(3);
                }}
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
                Government ID / Aadhaar Number *
              </label>
              <input
                type="text"
                required
                maxLength="16"
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
                <span className="block text-xs font-bold text-neutral-700">ID Front Side</span>
                {aadhaarFrontUrl ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
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
                <span className="block text-xs font-bold text-neutral-700">ID Back Side</span>
                {aadhaarBackUrl ? (
                  <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
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
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!aadhaarNumber) {
                    alert("Please enter your Government ID number.");
                    return;
                  }
                  setCurrentStep(4);
                }}
                className="px-6 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Summary & Final Submission */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-neutral-900 border-b pb-3">
              Review Registration Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Legal Name:</span>
                <p className="font-semibold text-neutral-800 text-sm">{fullName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Phone:</span>
                <p className="font-semibold text-neutral-800 text-sm">{phoneCode} {rawPhone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Location:</span>
                <p className="font-semibold text-neutral-800 text-sm">{isCustomCity ? customCity : city}, {state}, {country}</p>
              </div>
              <div className="space-y-1">
                <span className="text-neutral-400 uppercase font-bold">Experience:</span>
                <p className="font-semibold text-neutral-800 text-sm">{experienceYears} Years</p>
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
                Upon submission, your profile documents will be locked under review. Host dashboard and itinerary features will unlock once approved by admin.
              </span>
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

        {/* Step 5: Under Verification / Pending Approval Locked Status Screen (Requirement 14) */}
        {currentStep === 5 && (
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
                Thank you, <strong>{userProfile?.name || fullName}</strong>! Your guide onboarding details and government ID documents have been submitted to our community safety team.
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
                <span>Government ID Captured</span>
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

            {/* Action buttons: No "Go to Host Dashboard" button! Only Refresh Status & Explorer Feed */}
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
