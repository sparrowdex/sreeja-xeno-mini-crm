'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InsightEngineTrigger() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const res = await fetch('/api/engine/run', { method: 'POST' });
      // The API returns a 303 redirect which fetch follows.
      // We push the final resolved URL to correctly update the browser's address bar.
      // This ensures that if we were on /?error=... and it succeeded, it navigates to / and clears the error.
      const finalUrl = new URL(res.url);
      router.push(finalUrl.pathname + finalUrl.search);
    } catch (err) {
      console.error(err);
    } finally {
      // Small delay to ensure router.refresh() has started updating the UI
      setTimeout(() => setPending(false), 500);
    }
  };

  if (pending) {
    return (
      <div className="w-full max-w-lg mx-auto px-6 flex flex-col items-center animate-fade-in-up">
        {/* Glowing Brain Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
          <svg className="w-16 h-16 text-blue-400 relative z-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Awakening Engine...</h3>
        <p className="text-blue-300/70 mb-10 text-center text-sm md:text-base max-w-sm leading-relaxed">
          Scanning your customer database to detect hidden patterns and generate high-converting segments.
        </p>
        
        {/* Indeterminate Scanning Bar */}
        <div className="w-full h-1 bg-blue-950 rounded-full overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <div className="absolute top-0 bottom-0 left-0 w-full bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
        </div>
        <div className="mt-4 text-[10px] text-blue-400 uppercase tracking-widest font-bold animate-pulse">
          Running Neural Analysis
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleRun} className="relative z-10 w-full max-w-xl mx-auto">

      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>Awaken the Insight Engine</h3>
      <p className="text-slate-300/70 text-sm md:text-base leading-relaxed mb-8 md:mb-8 animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
        Don't guess what your customers want. Let our proactive AI co-marketer analyze your entire database to detect hidden patterns, identify churn risks, and generate high-converting campaigns instantly.
      </p>
      <div className="mt-4 md:mt-6 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
        <button 
          type="submit" 
          className="relative overflow-hidden px-8 md:px-10 py-3 md:py-4 bg-black/40 text-blue-100 border border-white/10 backdrop-blur-xl hover:bg-[#050505]/80 font-bold rounded-full shadow-lg transition-all cursor-pointer text-sm md:text-base tracking-wide flex items-center gap-3 mx-auto group/btn"
        >
          {/* Default State: Bottom Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100 group-hover/btn:opacity-0 transition-opacity duration-500"></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-6 bg-gradient-to-t from-blue-500/40 to-transparent opacity-100 group-hover/btn:opacity-0 transition-opacity duration-500 blur-sm"></div>
          
          {/* Hover State: Top Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-6 bg-gradient-to-b from-blue-500/40 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          <svg className="relative z-10 w-5 h-5 text-blue-400 group-hover/btn:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="relative z-10">Run AI Analysis</span>
        </button>
      </div>
    </form>
  );
}
