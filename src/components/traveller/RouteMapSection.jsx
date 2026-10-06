import React from 'react';
import { MapPin, Navigation, ExternalLink, Flag, Compass } from 'lucide-react';

const PIN_STYLES = {
  start: { label: 'Start Point', bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-300' },
  stop: { label: 'Waypoint', bg: 'bg-sky-500', text: 'text-sky-700', border: 'border-sky-300' },
  overnight: { label: 'Overnight Camp', bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-300' },
  highlight: { label: 'Scenic Highlight', bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-300' },
  end: { label: 'End Point', bg: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-300' },
};

export default function RouteMapSection({ routePins = [] }) {
  if (!routePins || routePins.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-neutral-900 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-traveller-mint" />
          Expedition Route & Waypoints
        </h3>
        <span className="text-xs text-neutral-400 font-medium">
          {routePins.length} {routePins.length === 1 ? 'Pin' : 'Pins'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {routePins.map((pin, idx) => {
          const type = pin.type || 'stop';
          const style = PIN_STYLES[type] || PIN_STYLES.stop;
          const mapsUrl = pin.googleMapsUrl || 
            (pin.lat && pin.lng ? `https://www.google.com/maps/search/?api=1&query=${pin.lat},${pin.lng}` : null);

          return (
            <div 
              key={pin.id || idx}
              className="p-3.5 rounded-xl border border-neutral-200 bg-white shadow-xs flex items-start gap-3 hover:border-neutral-300 transition-colors"
            >
              {/* Type Pin Icon */}
              <div className={`w-8 h-8 rounded-lg ${style.bg} text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs`}>
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>
                    {style.label}
                  </span>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-traveller-forestDark flex items-center gap-0.5 text-[11px]"
                      title="Open in Google Maps"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <h5 className="font-bold text-sm text-neutral-900 truncate">
                  {pin.name || 'Waypoint'}
                </h5>

                {pin.address && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {pin.address}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
