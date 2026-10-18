import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/common/BottomNav';
import Footer from '../../components/common/Footer';
import TravelPatternBackground from '../../components/common/TravelPatternBackground';
import { useAuth } from '../../context/AuthContext';
import { experienceService } from '../../services/experienceService';
import { storageService } from '../../services/storageService';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  MapPin, 
  Navigation, 
  Check, 
  X, 
  Loader2, 
  Sparkles,
  Layers,
  FileText,
  FileDown,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  DollarSign,
  Package,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import SearchableSelect from '../../components/common/SearchableSelect';

const CATEGORIES = ['Trek', 'Cultural', 'Offbeat', 'Heritage', 'Camping', 'Expedition', 'Wildlife', 'Spiritual'];
const COUNTRIES = ['India', 'Nepal', 'Bhutan', 'Tibet', 'Sri Lanka'];
const ALL_STATES = [
  'Nagaland', 'Arunachal Pradesh', 'Assam', 'Meghalaya', 'Sikkim', 'Manipur', 'Mizoram', 'Tripura',
  'Uttarakhand', 'Himachal Pradesh', 'Ladakh', 'Jammu & Kashmir',
  'Rajasthan', 'Kerala', 'Goa', 'Karnataka', 'Maharashtra', 'West Bengal',
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 'Jharkhand', 'Madhya Pradesh',
  'Odisha', 'Punjab', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Delhi (NCT)', 'Andaman & Nicobar Islands', 'Chandigarh', 'Puducherry',
  // Nepal Provinces
  'Bagmati (Kathmandu)', 'Gandaki (Pokhara)', 'Karnali', 'Koshi', 'Lumbini', 'Madhesh', 'Sudurpashchim',
  // Bhutan
  'Paro', 'Thimphu', 'Punakha'
];

export default function CreateEditExperiencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields (No hardcoded default numbers; clean empty state with faded placeholders)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [durationNights, setDurationNights] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Moderate');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [meetingPointMapsUrl, setMeetingPointMapsUrl] = useState('');

  // Media
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [customGalleryUrl, setCustomGalleryUrl] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // PDF Upload & Notice
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [customPdfUrl, setCustomPdfUrl] = useState('');
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [showSamplePdfModal, setShowSamplePdfModal] = useState(false);

  // Route Pins (Optional waypoints)
  const [routePins, setRoutePins] = useState([
    {
      id: 'pin_1',
      name: '',
      type: 'start',
      address: '',
      googleMapsUrl: ''
    }
  ]);

  // Load existing experience if editing
  useEffect(() => {
    if (!id) return;
    const fetchExp = async () => {
      try {
        const data = await experienceService.getExperienceById(id);
        if (data) {
          setTitle(data.title || '');
          setDescription(data.description || '');
          setCategory(data.category || '');
          setCountry(data.country || 'India');
          setState(data.state || '');
          setCity(data.city || '');
          setPrice(data.price !== undefined && data.price !== null ? data.price : '');
          setMaxGroupSize(data.maxGroupSize !== undefined && data.maxGroupSize !== null ? data.maxGroupSize : '');
          setDurationDays(data.durationDays !== undefined && data.durationDays !== null ? data.durationDays : '');
          setDurationNights(data.durationNights !== undefined && data.durationNights !== null ? data.durationNights : '');
          setFitnessLevel(data.fitnessLevel || 'Moderate');
          setMeetingPoint(data.meetingPoint || '');
          setMeetingPointMapsUrl(data.meetingPointMapsUrl || '');
          setCoverImage(data.coverImage || (data.images?.[0] || ''));
          setGalleryImages(data.galleryImages || data.images || []);
          if (data.pdfUrl) setPdfUrl(data.pdfUrl);
          if (data.pdfName) setPdfName(data.pdfName);
          if (data.routePins?.length) setRoutePins(data.routePins);
        }
      } catch (err) {
        console.error("Error loading experience for edit:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExp();
  }, [id]);

  // Cover Image Upload
  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const uid = currentUser?.uid || 'guide_uploads';
      const url = await storageService.uploadFile(file, `experiences/${uid}/cover`);
      setCoverImage(url);
    } catch (err) {
      console.error("Cover upload error:", err);
      alert(err.message || "Failed to upload cover photo. You can also paste an image URL directly.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Gallery Upload
  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uid = currentUser?.uid || 'guide_uploads';
      const urls = await storageService.uploadMultipleFiles(files, `experiences/${uid}/gallery`);
      setGalleryImages(prev => [...prev, ...urls]);
    } catch (err) {
      console.error("Gallery upload error:", err);
      alert(err.message || "Failed to upload gallery photos. You can also paste image URLs directly.");
    } finally {
      setUploadingGallery(false);
    }
  };

  // PDF Upload handler
  const handlePdfUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert("Please upload a valid PDF document (.pdf).");
      return;
    }
    setUploadingPdf(true);
    try {
      const uid = currentUser?.uid || 'guide_uploads';
      const url = await storageService.uploadFile(file, `experiences/${uid}/itinerary_pdfs`);
      setPdfUrl(url);
      setPdfName(file.name);
    } catch (err) {
      console.error("PDF upload error:", err);
      alert(err.message || "Failed to upload PDF. You can also paste an itinerary PDF URL directly below.");
    } finally {
      setUploadingPdf(false);
    }
  };

  // Route Pin Operations
  const addRoutePin = () => {
    setRoutePins([
      ...routePins,
      {
        id: `pin_${Date.now()}`,
        name: `Stop ${routePins.length + 1}`,
        type: 'stop',
        address: '',
        googleMapsUrl: ''
      }
    ]);
  };

  const removeRoutePin = (index) => {
    setRoutePins(routePins.filter((_, idx) => idx !== index));
  };

  const updateRoutePinField = (index, field, value) => {
    const updated = [...routePins];
    updated[index][field] = value;
    setRoutePins(updated);
  };

  // Submit & Save
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in as a host.");
      return;
    }
    if (!title || !description) {
      alert("Please provide at least a title and description.");
      return;
    }
    if (!pdfUrl) {
      const confirmContinue = window.confirm(
        "Notice: You haven't uploaded an Itinerary PDF brochure yet. We strongly recommend uploading the PDF containing the complete day-by-day plan, inclusions, exclusions, and rules.\n\nDo you want to proceed anyway?"
      );
      if (!confirmContinue) return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category: category || 'Offbeat',
        country: country || 'India',
        state: state.trim(),
        city: city.trim(),
        price: Number(price) || 0,
        maxGroupSize: Number(maxGroupSize) || 10,
        durationDays: Number(durationDays) || 1,
        durationNights: Number(durationNights) || 0,
        fitnessLevel,
        meetingPoint: meetingPoint.trim(),
        meetingPointMapsUrl: meetingPointMapsUrl.trim() || (meetingPoint.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingPoint.trim())}` : ''),
        coverImage: coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        images: galleryImages.length > 0 ? galleryImages : [coverImage].filter(Boolean),
        galleryImages,
        pdfUrl: pdfUrl || '',
        pdfName: pdfName || 'Itinerary_Document.pdf',
        routePins,
        guideId: currentUser.uid,
        guideName: userProfile?.name || currentUser.displayName || 'Verified Guide',
        guideImage: userProfile?.profilePicUrl || currentUser.photoURL || '',
        guideExperienceYears: userProfile?.experienceYears || 2,
        guidePhone: userProfile?.phone || '',
        status: 'active'
      };

      if (isEditing) {
        await experienceService.updateExperience(id, payload);
      } else {
        await experienceService.createExperience(payload);
      }

      navigate('/guide/dashboard');
    } catch (err) {
      console.error("Save experience error:", err);
      alert("Error saving itinerary: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bgLight flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-guide-primary" />
        <p className="text-xs text-neutral-500 font-semibold">Loading itinerary editor...</p>
      </div>
    );
  }

  return (
    <TravelPatternBackground>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen pb-24 md:pb-16 space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-guide-navy uppercase tracking-wider block">
                ITINERARY STUDIO · DIRECT PDF UPLOADER
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-sans text-neutral-900">
                {isEditing ? 'Edit Expedition Itinerary' : 'Create New Expedition'}
              </h1>
            </div>
          </div>

          <button
            onClick={handleSaveExperience}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Trip</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSaveExperience} className="space-y-8">
          
          {/* Section 1: Basic Expedition Details */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-guide-navy" />
              1. Basic Overview & Highlights
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Expedition Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hornbill Festival & Nagaland Magic"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-800 focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Story & Overview *
              </label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the journey highlights, cultural immersion, scenery, and what makes this expedition unforgettable..."
                className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700 focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <SearchableSelect
                  label="Category *"
                  value={category}
                  onChange={setCategory}
                  options={CATEGORIES}
                  placeholder="Select Category"
                  allowCustom={true}
                />
              </div>

              <div>
                <SearchableSelect
                  label="Country *"
                  value={country}
                  onChange={setCountry}
                  options={COUNTRIES}
                  placeholder="Select or type country..."
                  allowCustom={true}
                />
              </div>

              <div>
                <SearchableSelect
                  label="State / Province *"
                  value={state}
                  onChange={setState}
                  options={ALL_STATES}
                  placeholder="Select or type state/province..."
                  allowCustom={true}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                  Starting Base City / Hub *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Kohima, Pokhara, Rishikesh"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Base Price (₹ / Person) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Group Size Limit</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Duration Days</label>
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Duration Nights</label>
                <input
                  type="number"
                  min="0"
                  value={durationNights}
                  onChange={(e) => setDurationNights(e.target.value)}
                  placeholder="e.g. 4"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media & Photography */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-guide-navy" />
              2. Cover & Gallery Photography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cover Photo */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-3 bg-neutral-50/40">
                <span className="text-xs font-bold text-neutral-700 block">Cover Image</span>
                {coverImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 group">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      title="Remove Cover Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                    <p className="text-[11px] text-neutral-400">High-res landscape photograph</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="inline-block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors">
                    {uploadingCover ? 'Uploading...' : 'Upload Cover Photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e.target.files?.[0])} />
                  </label>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="url"
                      placeholder="Or paste cover image URL..."
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customCoverUrl.trim()) {
                          setCoverImage(customCoverUrl.trim());
                          setCustomCoverUrl('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>

              {/* Gallery Photos */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-3 bg-neutral-50/40">
                <span className="text-xs font-bold text-neutral-700 block">Gallery Photos ({galleryImages.length})</span>
                <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar min-h-[60px]">
                  {galleryImages.length === 0 ? (
                    <span className="text-[11px] text-neutral-400 m-auto">No gallery photos added yet</span>
                  ) : (
                    galleryImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200 group">
                        <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <label className="inline-block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors">
                    {uploadingGallery ? 'Uploading...' : 'Add Gallery Photos'}
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e.target.files)} />
                  </label>

                  <div className="flex gap-1.5 pt-1">
                    <input
                      type="url"
                      placeholder="Or paste gallery image URL..."
                      value={customGalleryUrl}
                      onChange={(e) => setCustomGalleryUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-[11px] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customGalleryUrl.trim()) {
                          setGalleryImages(prev => [...prev, customGalleryUrl.trim()]);
                          setCustomGalleryUrl('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-900 text-white text-[11px] font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: ITINERARY PDF UPLOAD & MANDATORY NOTICE */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-guide-navy" />
                  3. Upload Complete Itinerary Brochure (PDF)
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Directly upload your official brochure. Inclusions, day-wise schedule, pricing, packing & rules are included in the PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSamplePdfModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-guide-navy hover:bg-cyan-100 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-600" />
                <span>View Sample PDF Format</span>
              </button>
            </div>

            {/* MANDATORY NOTICE BANNER */}
            <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-white p-5 space-y-3.5">
              <div className="flex items-center gap-2 text-guide-navy">
                <Info className="w-5 h-5 flex-shrink-0 text-guide-primary" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">
                  Important Notice: What Your Uploaded PDF Must Contain
                </h4>
              </div>
              
              <p className="text-xs text-neutral-700 leading-relaxed">
                Rather than filling out separate forms, your uploaded PDF acts as the verified, complete document for travellers. Please ensure your PDF brochure includes the following sections (refer to the sample PDF):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-neutral-700">
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-neutral-200/70 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">1. Day-by-Day Detailed Plan</span>
                    <span className="text-[11px] text-neutral-500">Arrival, daily activities, trek hours, and overnight stay locations.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-neutral-200/70 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">2. Inclusions & Exclusions</span>
                    <span className="text-[11px] text-neutral-500">Vehicles, meals, stays, guides vs extra expenses & entry passes.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-neutral-200/70 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">3. Pricing Tiers & Booking Steps</span>
                    <span className="text-[11px] text-neutral-500">Double / Triple sharing costs, seat advance deposit & payment details.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-neutral-200/70 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">4. Things to Carry (Packing List)</span>
                    <span className="text-[11px] text-neutral-500">Clothing layers, trekking footwear, medication, luggage limits & powerbanks.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-neutral-200/70 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">5. Terms & Cancellation Policy</span>
                    <span className="text-[11px] text-neutral-500">Strict refund rules, vehicle regulations, safety guidelines & alcohol bans.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-neutral-200/70 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900 block">6. Local Trivia, Manners & FAQs</span>
                    <span className="text-[11px] text-neutral-500">Inner Line Permits (ILP), mountain manners, network, ATMs & host bios.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF UPLOAD BOX */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-neutral-700">
                Itinerary PDF Document *
              </label>

              {pdfUrl ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-emerald-950 block truncate max-w-md">
                        {pdfName || 'Itinerary_Brochure.pdf'}
                      </span>
                      <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                        PDF attached and ready for travellers
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View PDF</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => { setPdfUrl(''); setPdfName(''); }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border-2 border-dashed border-neutral-300 hover:border-guide-primary text-center space-y-4 transition-colors bg-neutral-50/50">
                  <div className="w-12 h-12 rounded-2xl bg-guide-primary/10 text-guide-primary mx-auto flex items-center justify-center">
                    <FileDown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800">
                      Upload your Full Itinerary Brochure (PDF)
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                      Travellers will directly read and download this verified document containing the full schedule, inclusions, pricing, and rules.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-guide-primary hover:bg-guide-headerDark text-white text-xs font-bold cursor-pointer transition-colors shadow-md">
                    {uploadingPdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading PDF Document...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Choose PDF File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={uploadingPdf}
                      className="hidden"
                      onChange={(e) => handlePdfUpload(e.target.files?.[0])}
                    />
                  </label>

                  <div className="pt-2">
                    <span className="text-[11px] text-neutral-400 block mb-1">Or paste an existing PDF URL:</span>
                    <div className="flex max-w-md mx-auto gap-2">
                      <input
                        type="url"
                        placeholder="https://.../itinerary.pdf"
                        value={customPdfUrl}
                        onChange={(e) => setCustomPdfUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customPdfUrl.trim()) {
                            setPdfUrl(customPdfUrl.trim());
                            setPdfName('Attached_Itinerary.pdf');
                            setCustomPdfUrl('');
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-neutral-800 text-white text-xs font-bold"
                      >
                        Attach
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Meeting Spot, Hotels & Google Maps */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-guide-navy" />
              4. Meeting Point, Hotels & Google Maps Locations
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                  Meeting Point / Pickup Spot *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={meetingPoint}
                    onChange={(e) => {
                      setMeetingPoint(e.target.value);
                      if (!meetingPointMapsUrl || meetingPointMapsUrl.includes('google.com/maps')) {
                        setMeetingPointMapsUrl(e.target.value.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.target.value.trim())}` : '');
                      }
                    }}
                    placeholder="e.g. Dimapur Airport / Kohima Clock Tower / Pokhara Lakeside"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 bg-white"
                  />
                  {meetingPoint.trim() && (
                    <a
                      href={meetingPointMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingPoint.trim())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors flex-shrink-0"
                      title="Open and preview this spot on Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Test on Google Maps 🗺️</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                  Google Maps Directions Link / Pin URL (Auto-Generated or Custom)
                </label>
                <input
                  type="url"
                  value={meetingPointMapsUrl}
                  onChange={(e) => setMeetingPointMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-4 py-2 rounded-xl border border-neutral-200 text-xs text-neutral-700 bg-neutral-50"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-guide-primary" />
                    Key Stopovers, Hotels & Camps (Connected to Google Maps)
                  </span>
                  <p className="text-[11px] text-neutral-400">Add hotels, base camps, or sightseeing points. Travellers can click any spot to open it on Google Maps.</p>
                </div>
                <button
                  type="button"
                  onClick={addRoutePin}
                  className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-guide-navy border border-cyan-200 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Location Pin</span>
                </button>
              </div>

              {routePins.map((pin, pIdx) => (
                <div key={pin.id || pIdx} className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select
                      value={pin.type || 'stop'}
                      onChange={(e) => updateRoutePinField(pIdx, 'type', e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold bg-white"
                    >
                      <option value="start">🚩 Start / Pickup Spot</option>
                      <option value="hotel">🏨 Hotel / Homestay</option>
                      <option value="camp">⛺ Overnight Camp</option>
                      <option value="stop">📸 Sightseeing / Waypoint</option>
                      <option value="end">🏁 Drop-off / Departure</option>
                    </select>

                    <input
                      type="text"
                      value={pin.name}
                      onChange={(e) => {
                        updateRoutePinField(pIdx, 'name', e.target.value);
                        if (!pin.googleMapsUrl || pin.googleMapsUrl.includes('google.com/maps')) {
                          updateRoutePinField(pIdx, 'googleMapsUrl', e.target.value.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.target.value.trim())}` : '');
                        }
                      }}
                      placeholder="Location Name (e.g. Hotel Japfu Kohima, Dzukou Base Camp)"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                    />

                    {pin.name.trim() && (
                      <a
                        href={pin.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pin.name.trim())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors flex-shrink-0"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-600" />
                        <span>Map 📍</span>
                      </a>
                    )}

                    {routePins.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoutePin(pIdx)}
                        className="text-neutral-400 hover:text-red-500 p-1.5 self-center"
                        title="Remove Location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={pin.googleMapsUrl || ''}
                      onChange={(e) => updateRoutePinField(pIdx, 'googleMapsUrl', e.target.value)}
                      placeholder="Google Maps link: https://maps.google.com/?q=... (Auto-filled or paste exact link)"
                      className="flex-1 px-3 py-1 rounded-lg border border-neutral-200 text-[11px] text-neutral-600 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/guide/dashboard')}
              className="px-6 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-bold text-xs hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-guide-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-guide-headerDark flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Itinerary...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update & Publish' : 'Save & Publish Expedition'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </main>

      {/* SAMPLE PDF FORMAT REFERENCE MODAL */}
      {showSamplePdfModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowSamplePdfModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-md">
                Standard Itinerary Reference
              </span>
              <h2 className="text-xl font-black text-neutral-900">
                Sample Itinerary PDF Architecture
              </h2>
              <p className="text-xs text-neutral-500">
                Reference layout based on the 19-Page "Hornbill Festival & Nagaland Magic" Guide Brochure.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <span className="font-extrabold text-neutral-900 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-guide-primary" />
                  Pages 1–9: Cover, Brief & Day-by-Day Flow
                </span>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li><strong>Cover:</strong> Title, dates, duration (e.g. 6N/7D), pickup & drop location, host contact & Instagram handle.</li>
                  <li><strong>Brief Itinerary:</strong> High-level summary of Day 1 through Day 7.</li>
                  <li><strong>Detailed Itinerary:</strong> Daily morning-to-night breakdown, hike duration, highlights, and overnight stay accommodation.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <span className="font-extrabold text-emerald-950 flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-emerald-700" />
                  Page 10: Inclusions & Exclusions Checklist
                </span>
                <p className="text-neutral-600">
                  Clearly separates included items (e.g., Tempo Traveller transport, 6-night stays, breakfasts, captains, local guides, sightseeing entry) from exclusions (extra meals, travel insurance, festival entry passes, emergency costs).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <span className="font-extrabold text-amber-950 flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  Page 11: Cost Per Person & Booking Terms
                </span>
                <p className="text-neutral-600">
                  Specifies room-sharing rates (Double sharing ₹52,999, Triple sharing ₹48,999), seat deposit advance amount (₹20,000), payment GPay & bank IFSC details, and strictly non-refundable cancellation terms.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
                <span className="font-extrabold text-sky-950 flex items-center gap-2 text-sm">
                  <ShieldAlert className="w-4 h-4 text-sky-700" />
                  Pages 12–19: Things to Carry, Rules, FAQs & Host Bio
                </span>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li><strong>Things to Carry:</strong> Trekking shoes, warm fleeces, rucksacks, headlamp, and power banks.</li>
                  <li><strong>Rules & Manners:</strong> Mountain etiquette, vehicle rules, alcohol/smoking bans, and local cultural trivia.</li>
                  <li><strong>FAQs:</strong> Permits required (ILP/FRO), network coverage (BSNL/Airtel), ATM availability, safety, and host introductions.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSamplePdfModal(false)}
                className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-bold text-xs"
              >
                Close & Return to Editor
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
