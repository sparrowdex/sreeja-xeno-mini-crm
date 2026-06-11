"use client";

import { useState, useRef, useEffect } from "react";

export default function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    
    const checkTruncation = () => {
      // Only measure truncation when text is clamped
      if (!expanded) {
        setIsTruncated(el.scrollHeight > el.clientHeight);
      }
    };

    // Give the DOM a microtick to render the text before measuring
    setTimeout(checkTruncation, 0);
    
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [text, expanded]);
  
  return (
    <div className="mb-5 md:mb-8 relative">
      <p 
        ref={textRef}
        className={`text-blue-100/70 text-sm md:text-base leading-relaxed font-medium transition-all duration-300 ${expanded ? '' : 'line-clamp-2'}`}
      >
        {text}
      </p>
      
      {(isTruncated || expanded) && (
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="mt-1 mx-auto block p-2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          aria-label={expanded ? "Show less" : "Read more"}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      )}
    </div>
  );
}
