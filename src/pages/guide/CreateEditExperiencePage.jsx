import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Clock, 
  MapPin, 
  Navigation, 
  Check, 
  X, 
  Loader2, 
  Bed, 
  Utensils, 
  Car,
  Sparkles,
  Layers
} from 'lucide-react';

const CATEGORIES = ['Trek', 'Cultural', 'Offbeat', 'Heritage', 'Camping', 'Expedition'];
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
  'Maharashtra'
];

export default function CreateEditExperiencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Trek');
  const [state, setState] = useState('Uttarakhand');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState(3500);
  const [maxGroupSize, setMaxGroupSize] = useState(8);
  const [durationDays, setDurationDays] = useState(3);
  const [durationNights, setDurationNights] = useState(2);
  const [fitnessLevel, setFitnessLevel] = useState('Moderate');
  const [meetingPoint, setMeetingPoint] = useState('');

  // Media
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Inclusions & Exclusions & Things to carry
  const [inclusions, setInclusions] = useState([
    'Certified local mountain guide',
    'Tented camp accommodation',
    'Wholesome mountain meals'
  ]);
  const [newInclusion, setNewInclusion] = useState('');

  const [exclusions, setExclusions] = useState([
    'Personal gear & sleeping bag',
    'Personal travel insurance'
  ]);
  const [newExclusion, setNewExclusion] = useState('');

  const [thingsToCarry, setThingsToCarry] = useState([
    'Trekking boots',
    'Warm jacket',
    'Water bottle',
    'Headlamp'
  ]);
  const [newThing, setNewThing] = useState('');

  // Deep multi-day itinerary days
  const [days, setDays] = useState([
    {
      dayNumber: 1,
      dayTitle: 'Basecamp Arrival & Acclimatization',
      accommodation: 'Homestay / Alpine Tents',
      overnightStay: 'Camp 1 (2,400m)',
      mealsIncluded: ['Dinner'],
      transportInfo: 'Jeep transfer from base station',
      activities: [
        {
          time: '02:00 PM',
          activityTitle: 'Briefing & Gear Check',
          location: 'Basecamp',
          description: 'Meet the team and pack gear',
          highlight: 'Sunset ridgeline view',
          instruction: 'Hydrate well'
        }
      ]
    }
  ]);

  // Route Pins
  const [routePins, setRoutePins] = useState([
    {
      id: 'pin_1',
      name: 'Trailhead Start',
      type: 'start',
      address: 'Base Village Trail Gate',
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
          setCategory(data.category || 'Trek');
          setState(data.state || 'Uttarakhand');
          setCity(data.city || '');
          setPrice(data.price || 3500);
          setMaxGroupSize(data.maxGroupSize || 8);
          setDurationDays(data.durationDays || 3);
          setDurationNights(data.durationNights || 2);
          setFitnessLevel(data.fitnessLevel || 'Moderate');
          setMeetingPoint(data.meetingPoint || '');
          setCoverImage(data.coverImage || (data.images?.[0] || ''));
          setGalleryImages(data.galleryImages || data.images || []);
          if (data.inclusions?.length) setInclusions(data.inclusions);
          if (data.exclusions?.length) setExclusions(data.exclusions);
          if (data.thingsToCarry?.length) setThingsToCarry(data.thingsToCarry);
          if (data.days?.length) setDays(data.days);
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
    if (!file || !currentUser) return;
    setUploadingCover(true);
    try {
      const url = await storageService.uploadFile(file, `experiences/${currentUser.uid}/cover`);
      setCoverImage(url);
    } catch (err) {
      alert("Failed to upload cover: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Gallery Upload
  const handleGalleryUpload = async (files) => {
    if (!files || files.length === 0 || !currentUser) return;
    setUploadingGallery(true);
    try {
      const urls = await storageService.uploadMultipleFiles(files, `experiences/${currentUser.uid}/gallery`);
      setGalleryImages(prev => [...prev, ...urls]);
    } catch (err) {
      alert("Failed to upload gallery: " + err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  // Day Operations
  const addDay = () => {
    const nextNum = days.length + 1;
    setDays([
      ...days,
      {
        dayNumber: nextNum,
        dayTitle: `Expedition Day ${nextNum}`,
        accommodation: 'Camp / Teahouse',
        overnightStay: `Camp ${nextNum}`,
        mealsIncluded: ['Breakfast', 'Dinner'],
        transportInfo: 'Trek on foot',
        activities: [
          {
            time: '07:30 AM',
            activityTitle: 'Morning Ridge Hike',
            location: 'Trail Path',
            description: 'Ascend towards the pass',
            highlight: 'Panoramic Himalayan views',
            instruction: 'Keep warm layers accessible'
          }
        ]
      }
    ]);
  };

  const removeDay = (index) => {
    const filtered = days.filter((_, idx) => idx !== index);
    // Renumber days
    const renumbered = filtered.map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setDays(renumbered);
  };

  const updateDayField = (index, field, value) => {
    const updated = [...days];
    updated[index][field] = value;
    setDays(updated);
  };

  // Activity Operations within Day
  const addActivityToDay = (dayIndex) => {
    const updated = [...days];
    const currentActivities = updated[dayIndex].activities || [];
    updated[dayIndex].activities = [
      ...currentActivities,
      {
        time: '12:00 PM',
        activityTitle: 'Activity Stop',
        location: 'Trail Point',
        description: '',
        highlight: '',
        instruction: ''
      }
    ];
    setDays(updated);
  };

  const removeActivityFromDay = (dayIndex, actIndex) => {
    const updated = [...days];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, idx) => idx !== actIndex);
    setDays(updated);
  };

  const updateActivityField = (dayIndex, actIndex, field, value) => {
    const updated = [...days];
    updated[dayIndex].activities[actIndex][field] = value;
    setDays(updated);
  };

  // Route Pin Operations
  const addRoutePin = () => {
    setRoutePins([
      ...routePins,
      {
        id: `pin_${Date.now()}`,
        name: `Waypoint ${routePins.length + 1}`,
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

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        state,
        city,
        price: Number(price) || 0,
        maxGroupSize: Number(maxGroupSize) || 8,
        durationDays: Number(durationDays) || 1,
        durationNights: Number(durationNights) || 0,
        fitnessLevel,
        meetingPoint,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        images: galleryImages.length > 0 ? galleryImages : [coverImage].filter(Boolean),
        galleryImages,
        inclusions,
        exclusions,
        thingsToCarry,
        days,
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
                ITINERARY STUDIO
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
              1. Basic Overview & Pitch
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
                placeholder="e.g. 5-Day Secrets of Har Ki Dun Valley"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-800 focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                Story & Description *
              </label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the trail, historical context, why this trip is offbeat, and what explorers will experience..."
                className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700 focus:ring-2 focus:ring-guide-cyan focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">State / Territory</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold bg-white"
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Base Town / Valley</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Sankri, Leh"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Price (₹ / Person) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Max Group Limit</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Days</label>
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Nights</label>
                <input
                  type="number"
                  min="0"
                  value={durationNights}
                  onChange={(e) => setDurationNights(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media & Gallery */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-guide-navy" />
              2. Cover & Gallery Photography
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cover Photo */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-3">
                <span className="text-xs font-bold text-neutral-700 block">Cover Image</span>
                {coverImage ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="py-4">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                    <p className="text-[11px] text-neutral-400">High-res landscape photography</p>
                  </div>
                )}
                <label className="inline-block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingCover ? 'Uploading...' : 'Upload Cover Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCoverUpload(e.target.files?.[0])} />
                </label>
              </div>

              {/* Gallery Photos */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 text-center space-y-3">
                <span className="text-xs font-bold text-neutral-700 block">Gallery Photos ({galleryImages.length})</span>
                <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar min-h-[60px]">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="relative w-16 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <label className="inline-block px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold cursor-pointer transition-colors">
                  {uploadingGallery ? 'Uploading...' : 'Add Gallery Photos'}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e.target.files)} />
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Deep Multi-Day Itinerary Builder */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-guide-navy" />
                  3. Day-by-Day Expedition Itinerary
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Break down your multi-day schedule with basecamp stays, meals, and activities.
                </p>
              </div>

              <button
                type="button"
                onClick={addDay}
                className="px-3.5 py-1.5 rounded-xl bg-guide-skyBlue text-guide-navy font-bold text-xs flex items-center gap-1.5 hover:bg-sky-100"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Day</span>
              </button>
            </div>

            <div className="space-y-6">
              {days.map((day, dayIdx) => (
                <div key={dayIdx} className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-guide-primary text-white text-xs font-bold flex items-center justify-center">
                        D{day.dayNumber || dayIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={day.dayTitle}
                        onChange={(e) => updateDayField(dayIdx, 'dayTitle', e.target.value)}
                        placeholder={`Day ${dayIdx + 1} Title`}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-800 bg-white"
                      />
                    </div>

                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(dayIdx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Day metadata inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Stay / Accommodation</label>
                      <input
                        type="text"
                        value={day.accommodation}
                        onChange={(e) => updateDayField(dayIdx, 'accommodation', e.target.value)}
                        placeholder="e.g. Alpine Tents / Village Homestay"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Overnight Base</label>
                      <input
                        type="text"
                        value={day.overnightStay}
                        onChange={(e) => updateDayField(dayIdx, 'overnightStay', e.target.value)}
                        placeholder="e.g. Seema Camp (2,600m)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">Transport</label>
                      <input
                        type="text"
                        value={day.transportInfo}
                        onChange={(e) => updateDayField(dayIdx, 'transportInfo', e.target.value)}
                        placeholder="e.g. 6-Hour Trek on foot"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Activities within this day */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-700">Activities & Schedule</span>
                      <button
                        type="button"
                        onClick={() => addActivityToDay(dayIdx)}
                        className="text-[11px] font-bold text-guide-navy hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Stop</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(day.activities || []).map((act, actIdx) => (
                        <div key={actIdx} className="p-3 rounded-xl bg-white border border-neutral-200 flex items-start gap-2">
                          <input
                            type="text"
                            value={act.time}
                            onChange={(e) => updateActivityField(dayIdx, actIdx, 'time', e.target.value)}
                            placeholder="08:00 AM"
                            className="w-20 px-2 py-1 rounded border border-neutral-200 text-[11px] font-semibold text-center"
                          />
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={act.activityTitle}
                              onChange={(e) => updateActivityField(dayIdx, actIdx, 'activityTitle', e.target.value)}
                              placeholder="Activity Title (e.g. Acclimatization Walk)"
                              className="w-full px-2 py-1 rounded border border-neutral-200 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={act.description}
                              onChange={(e) => updateActivityField(dayIdx, actIdx, 'description', e.target.value)}
                              placeholder="Details & instructions"
                              className="w-full px-2 py-1 rounded border border-neutral-200 text-[11px]"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeActivityFromDay(dayIdx, actIdx)}
                            className="text-neutral-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Route Pins & Waypoints */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-guide-navy" />
                  4. Trail Waypoints & Route Pins
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pin trailheads, camps, mountain passes, and end points.
                </p>
              </div>

              <button
                type="button"
                onClick={addRoutePin}
                className="px-3 py-1.5 rounded-xl bg-guide-skyBlue text-guide-navy font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Waypoint</span>
              </button>
            </div>

            <div className="space-y-3">
              {routePins.map((pin, pIdx) => (
                <div key={pin.id || pIdx} className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
                  <select
                    value={pin.type || 'stop'}
                    onChange={(e) => updateRoutePinField(pIdx, 'type', e.target.value)}
                    className="px-2 py-1 rounded-lg border border-neutral-200 text-xs font-bold bg-white"
                  >
                    <option value="start">Start</option>
                    <option value="stop">Stop</option>
                    <option value="overnight">Overnight Camp</option>
                    <option value="highlight">Highlight</option>
                    <option value="end">End</option>
                  </select>

                  <input
                    type="text"
                    value={pin.name}
                    onChange={(e) => updateRoutePinField(pIdx, 'name', e.target.value)}
                    placeholder="Waypoint Name (e.g. Govindghat)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold bg-white"
                  />

                  <input
                    type="text"
                    value={pin.googleMapsUrl}
                    onChange={(e) => updateRoutePinField(pIdx, 'googleMapsUrl', e.target.value)}
                    placeholder="Google Maps URL (Optional)"
                    className="w-48 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white hidden sm:block"
                  />

                  {routePins.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoutePin(pIdx)}
                      className="text-neutral-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Inclusions / Exclusions */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="font-bold text-base text-neutral-900">
              5. Logistics Checklist (Inclusions & Exclusions)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Inclusions */}
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Inclusions</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    placeholder="e.g. Forest entry permits"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInclusion.trim()) {
                        setInclusions([...inclusions, newInclusion.trim()]);
                        setNewInclusion('');
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1 pt-1">
                  {inclusions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-700 bg-white p-2 rounded-lg border border-neutral-100">
                      <span>✓ {item}</span>
                      <button type="button" onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-2">
                <span className="text-xs font-bold text-rose-800 uppercase block">Exclusions</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    placeholder="e.g. Mules / Porter for personal bags"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newExclusion.trim()) {
                        setExclusions([...exclusions, newExclusion.trim()]);
                        setNewExclusion('');
                      }
                    }}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1 pt-1">
                  {exclusions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-neutral-700 bg-white p-2 rounded-lg border border-neutral-100">
                      <span>✕ {item}</span>
                      <button type="button" onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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

      <BottomNav />
      <Footer />
    </TravelPatternBackground>
  );
}
