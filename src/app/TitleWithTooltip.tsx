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
      <div className="flex items-center mb-8">
        <h1
          className="text-4xl font-bold text-gray-900 dark:text-gray-100 cursor-pointer"
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
        <button
          aria-label="Reload page"
          className="ml-3 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => window.location.reload()}
        >
          {/* Tabler Icons refresh icon (counter-clockwise circular arrow) - https://tabler.io/icons */}
          <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-refresh"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
        </button>
      </div>
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
