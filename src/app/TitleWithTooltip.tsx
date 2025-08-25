import React, { useState } from "react";

interface TitleWithTooltipProps {
  title: string;
  tooltip: string;
}

export function TitleWithTooltip({ title, tooltip }: TitleWithTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Touch handlers for mobile
  const handleTouchStart = () => setShowTooltip(true);
  const handleTouchEnd = () => setShowTooltip(false);

  return (
    <div className="relative flex flex-col items-center">
      <h1
        className="text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
      >
        {title}
      </h1>
      {showTooltip && tooltip && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg transition-all duration-300 opacity-100 scale-100 z-10 animate-fade-in whitespace-nowrap"
          style={{ pointerEvents: "none" }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
