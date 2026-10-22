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
  ExternalLink,
  Bed,
  Utensils,
  Clock,
  Compass,
  Luggage
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

  // Itinerary Mode: 'both' | 'days' | 'pdf'
  const [itineraryMode, setItineraryMode] = useState('both');

  // Form Fields
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

  // Day-by-Day Itinerary Data
  const [days, setDays] = useState([
    {
      dayNumber: 1,
      dayTitle: 'Arrival & Expedition Briefing',
      accommodation: 'Local Homestay / Eco Lodge',
      accommodationMapsUrl: '',
      overnightStay: '',
      mealsIncluded: ['Dinner'],
      transportInfo: 'Pickup from base hub',
      activities: [
        {
          time: '02:00 PM',
          activityTitle: 'Welcome, Orientation & Route Walkthrough',
          location: 'Base Camp / Homestay',
          description: 'Meet your local host, inspect trekking gear, enjoy local herbal tea, and review safety guidelines.'
        }
      ]
    }
  ]);

  // Inclusions, Exclusions & Things to Carry
  const [inclusions, setInclusions] = useState([
    'Certified local host and safety guides',
    'All accommodations (homestays / alpine tents)',
    'Nutritious local traditional meals & trail tea',
    'Inner Line Permits and entry forest passes'
  ]);
  const [newInclusion, setNewInclusion] = useState('');

  const [exclusions, setExclusions] = useState([
    'Personal gear, backpack & sleeping bag',
    'Personal travel & medical insurance',
    'Festival tickets & camera passes',
    'Tips and personal emergency expenses'
  ]);
  const [newExclusion, setNewExclusion] = useState('');

  const [thingsToCarry, setThingsToCarry] = useState([
    'Sturdy trekking boots with ankle support',
    'Warm fleece jacket & rain poncho',
    'Headlamp / flashlight with extra batteries',
    'Reusable 1L water bottle & thermos flask',
    'Personal medication & first-aid essentials',
    'Power bank and valid Government Photo ID'
  ]);
  const [newThing, setNewThing] = useState('');

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
          if (data.days?.length) setDays(data.days);
          if (data.inclusions?.length) setInclusions(data.inclusions);
          if (data.exclusions?.length) setExclusions(data.exclusions);
          if (data.thingsToCarry?.length) setThingsToCarry(data.thingsToCarry);

          // Configure mode based on what exists
          const hasDaysData = data.days && data.days.length > 0 && data.days.some(d => d.dayTitle?.trim() || d.activities?.length > 0);
          const hasPdfData = Boolean(data.pdfUrl);
          if (hasDaysData && hasPdfData) {
            setItineraryMode('both');
          } else if (hasDaysData) {
            setItineraryMode('days');
          } else if (hasPdfData) {
            setItineraryMode('pdf');
          } else {
            setItineraryMode('both');
          }
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

  // Day Operations
  const addDay = () => {
    const nextNum = days.length + 1;
    setDays(prev => [
      ...prev,
      {
        dayNumber: nextNum,
        dayTitle: `Expedition Day ${nextNum}`,
        accommodation: 'Homestay / Alpine Tents',
        accommodationMapsUrl: '',
        overnightStay: '',
        mealsIncluded: ['Breakfast', 'Dinner'],
        transportInfo: '',
        activities: [
          {
            time: '08:00 AM',
            activityTitle: 'Morning Exploration',
            location: 'Trail Path',
            description: 'Begin daily hike, cultural immersion or sightseeing with local guide.'
          }
        ]
      }
    ]);
    if (Number(durationDays) < nextNum) {
      setDurationDays(nextNum);
    }
  };

  const removeDay = (dayIndex) => {
    const filtered = days.filter((_, idx) => idx !== dayIndex);
    const renumbered = filtered.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(renumbered);
    if (Number(durationDays) > renumbered.length) {
      setDurationDays(renumbered.length || 1);
    }
  };

  const updateDayField = (dayIndex, field, value) => {
    setDays(prev => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], [field]: value };
      return updated;
    });
  };

  const toggleDayMeal = (dayIndex, meal) => {
    setDays(prev => {
      const updated = [...prev];
      const currentMeals = updated[dayIndex].mealsIncluded || [];
      const nextMeals = currentMeals.includes(meal)
        ? currentMeals.filter(m => m !== meal)
        : [...currentMeals, meal];
      updated[dayIndex] = { ...updated[dayIndex], mealsIncluded: nextMeals };
      return updated;
    });
  };

  // Activity Operations within Day
  const addActivityToDay = (dayIndex) => {
    setDays(prev => {
      const updated = [...prev];
      const currentActivities = updated[dayIndex].activities || [];
      updated[dayIndex] = {
        ...updated[dayIndex],
        activities: [
          ...currentActivities,
          {
            time: '12:00 PM',
            activityTitle: '',
            location: '',
            description: ''
          }
        ]
      };
      return updated;
    });
  };

  const removeActivityFromDay = (dayIndex, activityIndex) => {
    setDays(prev => {
      const updated = [...prev];
      const currentActivities = updated[dayIndex].activities || [];
      updated[dayIndex] = {
        ...updated[dayIndex],
        activities: currentActivities.filter((_, i) => i !== activityIndex)
      };
      return updated;
    });
  };

  const updateActivityField = (dayIndex, activityIndex, field, value) => {
    setDays(prev => {
      const updated = [...prev];
      const currentActivities = [...(updated[dayIndex].activities || [])];
      currentActivities[activityIndex] = {
        ...currentActivities[activityIndex],
        [field]: value
      };
      updated[dayIndex] = {
        ...updated[dayIndex],
        activities: currentActivities
      };
      return updated;
    });
  };

  // Inclusions & Exclusions & Things To Carry Handlers
  const handleAddInclusion = (e) => {
    e?.preventDefault();
    if (newInclusion.trim()) {
      setInclusions(prev => [...prev, newInclusion.trim()]);
      setNewInclusion('');
    }
  };

  const handleAddExclusion = (e) => {
    e?.preventDefault();
    if (newExclusion.trim()) {
      setExclusions(prev => [...prev, newExclusion.trim()]);
      setNewExclusion('');
    }
  };

  const handleAddThing = (e) => {
    e?.preventDefault();
    if (newThing.trim()) {
      setThingsToCarry(prev => [...prev, newThing.trim()]);
      setNewThing('');
    }
  };

  // Submit & Save
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in as a host.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      alert("Please provide at least a title and overview story.");
      return;
    }

    const hasDaysFilled = days.some(d => d.dayTitle?.trim() || (d.activities && d.activities.some(a => a.activityTitle?.trim())));
    const hasPdfAttached = Boolean(pdfUrl?.trim());

    if (!hasDaysFilled && !hasPdfAttached) {
      const proceed = window.confirm(
        "Notice: You haven't added any Day-by-Day schedule details or uploaded an Itinerary PDF brochure.\n\nWe recommend providing at least one format so travellers understand the journey plan. Do you want to submit anyway?"
      );
      if (!proceed) return;
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
        durationDays: Number(durationDays) || (days.length > 0 ? days.length : 1),
        durationNights: Number(durationNights) || 0,
        fitnessLevel,
        meetingPoint: meetingPoint.trim(),
        meetingPointMapsUrl: meetingPointMapsUrl.trim() || (meetingPoint.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meetingPoint.trim())}` : ''),
        coverImage: coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        images: galleryImages.length > 0 ? galleryImages : [coverImage].filter(Boolean),
        galleryImages,
        pdfUrl: pdfUrl || '',
        pdfName: pdfName || (pdfUrl ? 'Itinerary_Document.pdf' : ''),
        days: days,
        inclusions: inclusions,
        exclusions: exclusions,
        thingsToCarry: thingsToCarry,
        routePins: routePins,
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
              className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-guide-navy uppercase tracking-wider block">
                THE LOCALS · ITINERARY STUDIO
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

          {/* DAY-BY-DAY ROUTINE & SCHEDULE BUILDER */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-guide-navy" />
                  Day-by-Day Routine & Schedule Maker
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Structure each day with titles, accommodation details, meals included, and specific activity timelines.
                </p>
              </div>

              <button
                type="button"
                onClick={addDay}
                className="px-4 py-2 rounded-xl bg-guide-primary hover:bg-guide-headerDark text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Day</span>
              </button>
            </div>

              {/* Day Cards List */}
              <div className="space-y-6">
                {days.map((day, dayIdx) => (
                  <div key={dayIdx} className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 space-y-4">
                    {/* Day Title Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="w-8 h-8 rounded-xl bg-guide-navy text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 shadow-xs">
                          D{day.dayNumber || dayIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={day.dayTitle}
                          onChange={(e) => updateDayField(dayIdx, 'dayTitle', e.target.value)}
                          placeholder={`Day ${day.dayNumber || dayIdx + 1} Title (e.g. Drive to Basecamp & Acclimatization)`}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 bg-white"
                        />
                      </div>

                      {days.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDay(dayIdx)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center gap-1 text-xs font-semibold self-end sm:self-center transition-colors"
                          title="Remove Day"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Day</span>
                        </button>
                      )}
                    </div>

                    {/* Accommodation & Lodging Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1 flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-guide-navy" />
                          Stay / Accommodation
                        </label>
                        <input
                          type="text"
                          value={day.accommodation}
                          onChange={(e) => {
                            updateDayField(dayIdx, 'accommodation', e.target.value);
                            if (!day.accommodationMapsUrl || day.accommodationMapsUrl.includes('google.com/maps')) {
                              updateDayField(dayIdx, 'accommodationMapsUrl', e.target.value.trim() ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.target.value.trim())}` : '');
                            }
                          }}
                          placeholder="e.g. Hotel Japfu Kohima / Alpine Tents / Village Homestay"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1 flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                          Stay Google Maps Link (Auto or Custom)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={day.accommodationMapsUrl || ''}
                            onChange={(e) => updateDayField(dayIdx, 'accommodationMapsUrl', e.target.value)}
                            placeholder="https://maps.google.com/?q=..."
                            className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-700"
                          />
                          {day.accommodation && (
                            <a
                              href={day.accommodationMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.accommodation)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-50 transition-colors flex-shrink-0"
                              title="Test lodging on Google Maps"
                            >
                              <ExternalLink className="w-3 h-3 text-emerald-600" />
                              <span>Map</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meals Included Chips */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1.5 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                        Meals Included for Day {day.dayNumber || dayIdx + 1}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Breakfast', 'Lunch', 'Dinner', 'Evening Tea & Snacks'].map((meal) => {
                          const isSelected = (day.mealsIncluded || []).includes(meal);
                          return (
                            <button
                              key={meal}
                              type="button"
                              onClick={() => toggleDayMeal(dayIdx, meal)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                              }`}
                            >
                              {isSelected ? `✓ ${meal}` : `+ ${meal}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Activities Timeline Inside Day */}
                    <div className="pt-3 border-t border-neutral-200/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-guide-navy" />
                          Activity Timeline ({day.activities?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addActivityToDay(dayIdx)}
                          className="px-3 py-1 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-guide-navy text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Activity</span>
                        </button>
                      </div>

                      {(!day.activities || day.activities.length === 0) ? (
                        <p className="text-[11px] text-neutral-400 italic bg-white p-3 rounded-xl border border-neutral-200">
                          No activities added for this day yet. Click "Add Activity" above.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {day.activities.map((act, actIdx) => (
                            <div key={actIdx} className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2 shadow-2xs">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={act.time}
                                  onChange={(e) => updateActivityField(dayIdx, actIdx, 'time', e.target.value)}
                                  placeholder="Time (e.g. 08:30 AM)"
                                  className="w-28 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-700 bg-neutral-50"
                                />
                                <input
                                  type="text"
                                  value={act.activityTitle}
                                  onChange={(e) => updateActivityField(dayIdx, actIdx, 'activityTitle', e.target.value)}
                                  placeholder="Activity Title (e.g. Guided Nature Trail to Dzukou Lily Ridge)"
                                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-800"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeActivityFromDay(dayIdx, actIdx)}
                                  className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg transition-colors"
                                  title="Remove Activity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={act.location || ''}
                                  onChange={(e) => updateActivityField(dayIdx, actIdx, 'location', e.target.value)}
                                  placeholder="Location / Spot (e.g. Jakhama Trailhead)"
                                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600"
                                />
                                <input
                                  type="text"
                                  value={act.description || ''}
                                  onChange={(e) => updateActivityField(dayIdx, actIdx, 'description', e.target.value)}
                                  placeholder="Short briefing or instructions for travellers..."
                                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              {/* Inclusions, Exclusions & Packing Checklist */}
              <div className="pt-4 border-t border-neutral-200 space-y-6">
                <div>
                  <h4 className="font-extrabold text-sm text-neutral-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-guide-navy" />
                    Inclusions, Exclusions & Things to Carry Checklist
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Provide the clear items that travellers need to pack and know beforehand.
                  </p>
                </div>

                {/* What's Included */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    What's Included ({inclusions.length})
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {inclusions.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-950 shadow-2xs">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => setInclusions(inclusions.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInclusion}
                      onChange={(e) => setNewInclusion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInclusion(); } }}
                      placeholder="Add included item (e.g. Certified local guide, tent accommodation)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddInclusion}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* What's Excluded */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    What's Excluded ({exclusions.length})
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {exclusions.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-rose-300 text-xs font-semibold text-rose-950 shadow-2xs">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => setExclusions(exclusions.filter((_, i) => i !== idx))}
                          className="hover:text-rose-600 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExclusion}
                      onChange={(e) => setNewExclusion(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddExclusion(); } }}
                      placeholder="Add excluded item (e.g. Personal gear, airfare, festival pass)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddExclusion}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Things to Carry */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Luggage className="w-4 h-4 text-amber-600" />
                    Things to Carry / Packing List ({thingsToCarry.length})
                  </span>

                  <div className="flex flex-wrap gap-2">
                    {thingsToCarry.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-950 shadow-2xs">
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => setThingsToCarry(thingsToCarry.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newThing}
                      onChange={(e) => setNewThing(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddThing(); } }}
                      placeholder="Add essential item (e.g. Trekking shoes, powerbank, rain poncho)..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddThing}
                      className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

          {/* Section: ITINERARY PDF UPLOAD (OPTIONAL) */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-guide-navy" />
                    Itinerary Brochure (PDF)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                    Optional
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Attach a ready-made PDF brochure if you have one. Travellers can download and view this document directly.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSamplePdfModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-guide-navy hover:bg-cyan-100 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-600" />
                <span>View Sample PDF Format</span>
              </button>
            </div>

            {/* PDF UPLOAD BOX */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase text-neutral-700">
                Itinerary PDF Document (Optional)
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
