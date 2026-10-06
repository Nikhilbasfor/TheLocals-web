import React from 'react';

/**
 * A cinematic living backdrop featuring a smooth Ken Burns pan movement
 * across lush green mountain ridges with frosted glassmorphism overlays.
 * Matches Flutter's CinematicScenicBackground widget.
 */
export default function CinematicScenicBackground({
  children,
  imageUrl = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
  overlayAlpha = 0.60,
  className = ''
}) {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden flex flex-col ${className}`}>
      {/* Background Image with Ken Burns Zoom & Pan Animation */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-kenburns scale-110 pointer-events-none transition-transform duration-1000"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />

      {/* Cinematic Dark Vignette & Gradient Overlays */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90 pointer-events-none"
        style={{ opacity: overlayAlpha }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
