import React from 'react';

/**
 * Clean, modern background container without noisy geometric watermarks.
 * Provides subtle neutral backdrop and standard layout flow.
 */
export default function TravelPatternBackground({
  children,
  backgroundColor = 'bg-neutral-bgLight',
  patternOpacity = 0,
  className = ''
}) {
  return (
    <div className={`relative min-h-screen w-full ${backgroundColor} ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
