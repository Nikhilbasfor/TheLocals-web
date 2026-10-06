import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Utensils, 
  Bed, 
  Car, 
  Clock, 
  MapPin, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function ItineraryTimeline({ days = [], legacyItinerary = [] }) {
  // By default, open the first day
  const [openDays, setOpenDays] = useState({ 1: true });

  const toggleDay = (dayNum) => {
    setOpenDays(prev => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  // If new deep multi-day itinerary days exist
  if (days && days.length > 0) {
    return (
      <div className="space-y-4">
        {days.map((day, idx) => {
          const dayNum = day.dayNumber || idx + 1;
          const isOpen = !!openDays[dayNum];
          const activities = day.activities || day.timelineItems || [];

          return (
            <div 
              key={dayNum}
              className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs transition-all"
            >
              {/* Day Accordion Header */}
              <button
                type="button"
                onClick={() => toggleDay(dayNum)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-center gap-3.5 flex-1 pr-4">
                  <div className="w-9 h-9 rounded-xl bg-traveller-forestDark text-white font-extrabold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                    D{dayNum}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-traveller-mint block">
                      Day {dayNum}
                    </span>
                    <h4 className="font-bold text-neutral-900 text-sm sm:text-base">
                      {day.dayTitle || `Expedition Day ${dayNum}`}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-400">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Day Expanded Content */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-neutral-100 space-y-4 bg-neutral-50/30">
                  
                  {/* Day Metadata Chips (Accommodation, Meals, Transport, Overnight) */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {day.accommodation && (
                      <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60">
                        <Bed className="w-3.5 h-3.5 text-sky-600" />
                        <span>Stay: {day.accommodation}</span>
                      </div>
                    )}
                    {day.overnightStay && (
                      <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/60">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Base: {day.overnightStay}</span>
                      </div>
                    )}
                    {day.mealsIncluded && day.mealsIncluded.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Meals: {day.mealsIncluded.join(', ')}</span>
                      </div>
                    )}
                    {day.transportInfo && (
                      <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                        <Car className="w-3.5 h-3.5 text-amber-600" />
                        <span>{day.transportInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  {day.highlights && day.highlights.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-neutral-500">Highlights:</span>
                      {day.highlights.map((h, i) => (
                        <span key={i} className="text-xs bg-white px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Activities Timeline */}
                  {activities.length > 0 && (
                    <div className="relative pl-6 space-y-4 pt-2 border-l-2 border-emerald-200 ml-3">
                      {activities.map((act, actIdx) => (
                        <div key={actIdx} className="relative group">
                          {/* Dot on timeline */}
                          <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-traveller-mint shadow-xs group-hover:scale-125 transition-transform" />

                          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-sm text-neutral-900">
                                {act.activityTitle || act.title || 'Stop'}
                              </h5>
                              {act.time && (
                                <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  {act.time}
                                </span>
                              )}
                            </div>

                            {act.location && (
                              <p className="text-xs text-neutral-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-traveller-mint" />
                                {act.location}
                              </p>
                            )}

                            {act.description && (
                              <p className="text-xs text-neutral-600 leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            {act.highlight && (
                              <p className="text-xs text-amber-800 bg-amber-50/70 p-2 rounded-lg font-medium">
                                ★ {act.highlight}
                              </p>
                            )}

                            {act.instruction && (
                              <p className="text-xs text-neutral-500 italic flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 text-neutral-400" />
                                {act.instruction}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback to Legacy Flat Itinerary Steps
  if (legacyItinerary && legacyItinerary.length > 0) {
    return (
      <div className="relative pl-6 space-y-4 border-l-2 border-emerald-200 ml-3">
        {legacyItinerary.map((step, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-traveller-mint shadow-xs" />
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-800">
                  {step.location || `Stop ${idx + 1}`}
                </span>
                {step.time && (
                  <span className="text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {step.time}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">
      Full day-by-day itinerary will be customized directly by your local host upon booking.
    </div>
  );
}
