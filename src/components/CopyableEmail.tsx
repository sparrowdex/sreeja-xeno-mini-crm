"use client";

import { useState, useEffect, useRef } from "react";

export default function CopyableEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect touch devices (no hover capability)
    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsTouchDevice(mediaQuery.matches);

    // Optional: listen for changes if user switches input methods
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    // Dismiss tooltip on mobile when tapping outside
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (isTouchDevice && showTooltip && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isTouchDevice, showTooltip]);

  const performCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInteraction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTouchDevice) {
      if (!showTooltip) {
        // First tap: Show the custom tooltip
        setShowTooltip(true);
      } else {
        // Second tap: Perform the copy
        performCopy();
        setShowTooltip(false);
      }
    } else {
      // Desktop: Just copy directly since tooltip shows on hover
      performCopy();
    }
  };

  return (
    <div 
      className="relative min-w-0 block w-full mt-1" 
      ref={containerRef}
      onMouseEnter={() => !isTouchDevice && setShowTooltip(true)}
      onMouseLeave={() => !isTouchDevice && setShowTooltip(false)}
    >
      {/* Custom Tooltip */}
      <div 
        className={`absolute bottom-full mb-2 left-0 px-3 py-1.5 bg-[#0a0a0a] border border-white/10 rounded-full shadow-2xl text-[10px] text-zinc-200 font-semibold tracking-wide z-50 whitespace-nowrap transition-all duration-200 ${
          showTooltip && !copied ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-1 invisible"
        }`}
      >
        Click to copy
        {/* Tooltip Arrow Layering */}
        <div className="absolute top-full left-4 border-4 border-transparent border-t-white/10 -ml-1"></div>
        <div className="absolute top-[calc(100%-1.5px)] left-4 border-4 border-transparent border-t-[#0a0a0a] -ml-1"></div>
      </div>

      <button
        onClick={handleInteraction}
        className="min-w-0 text-xs text-blue-200/50 hover:text-blue-300 transition-colors text-left block w-full overflow-hidden"
      >
        {copied ? (
          <span className="text-green-400 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </span>
        ) : (
          <span className="block w-full truncate">{email}</span>
        )}
      </button>
    </div>
  );
}
