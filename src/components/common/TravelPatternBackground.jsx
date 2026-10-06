import React from 'react';

/**
 * A textured background with subtle watermarks of travel iconography
 * (mountain peaks, pine trees, compass, tents, hiking trails).
 * Matches Flutter's TravelPatternBackground widget.
 */
export default function TravelPatternBackground({
  children,
  backgroundColor = 'bg-neutral-bgLight',
  patternOpacity = 0.05,
  className = ''
}) {
  return (
    <div className={`relative min-h-screen w-full ${backgroundColor} ${className}`}>
      {/* SVG Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: patternOpacity,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='140' viewBox='0 0 140 140' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%230D3B2E' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Mountain Peak --%3E%3Cpath d='M20 50 L35 25 L50 50 Z'/%3E%3Cpath d='M30 33 L35 30 L40 33'/%3E%3C!-- Pine Tree --%3E%3Cpath d='M90 40 L97 30 L104 40 Z'/%3E%3Cpath d='M88 48 L97 36 L106 48 Z'/%3E%3Cline x1='97' y1='48' x2='97' y2='54'/%3E%3C!-- Tent --%3E%3Cpath d='M30 110 L45 92 L60 110 Z'/%3E%3Cline x1='45' y1='92' x2='45' y2='110'/%3E%3C!-- Compass Rose --%3E%3Ccircle cx='100' cy='105' r='12'/%3E%3Cline x1='100' y1='90' x2='100' y2='120'/%3E%3Cline x1='85' y1='105' x2='115' y2='105'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '140px 140px'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
