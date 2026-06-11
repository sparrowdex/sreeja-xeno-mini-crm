"use client";

import { useState, useEffect } from "react";

export default function AutoCyclingTags({ tags }: { tags: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (tags.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tags.length);
    }, 2500); // 2.5 seconds per tag
    return () => clearInterval(interval);
  }, [tags.length]);

  if (tags.length === 0) return null;

  return (
    <div className="relative flex-1 min-w-0 h-7 overflow-hidden flex items-center">
      {tags.map((tag, index) => {
        let positionClass = "opacity-0 translate-y-4 pointer-events-none"; // Wait below
        
        if (index === currentIndex) {
          positionClass = "opacity-100 translate-y-0 z-10"; // Active center
        } else if (index === (currentIndex - 1 + tags.length) % tags.length) {
          positionClass = "opacity-0 -translate-y-4 pointer-events-none"; // Exited above
        }

        return (
          <div
            key={tag}
            className={`absolute left-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-full ${positionClass}`}
          >
            <span className="inline-flex max-w-full px-2.5 py-1 text-[10px] font-semibold capitalize text-zinc-300 bg-white/5 border border-white/10 rounded-full items-center gap-1.5 shadow-sm truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shrink-0"></span>
              <span className="truncate">{tag.replace('-', ' ')}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
