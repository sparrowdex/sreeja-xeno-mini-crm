'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ReviewExecuteActions({ suggestion, reach }: { suggestion: any, reach: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExecute = () => {
    // We let the native form submit happen
    setIsExecuting(true);
  };

  const reviewModal = mounted && isOpen ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" style={{ zIndex: 99999 }}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-900/20 to-transparent">
          <h2 className="text-xl font-bold text-white mb-1">Review Pending Campaign</h2>
          <p className="text-sm text-zinc-400">Final approval required before initiating bulk delivery.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Target Audience</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{suggestion.suggestedSegment}</span>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{reach.toLocaleString()} Users</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              Message Payload
              <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] uppercase font-bold">WhatsApp</span>
            </span>
            <div className="p-4 bg-[#111] border border-white/10 rounded-xl relative ml-2">
               {/* iPhone SMS Tail */}
               <div className="absolute top-4 -left-[5px] w-2.5 h-2.5 bg-[#111] border-l border-b border-white/10 transform rotate-45"></div>
               <p className="text-sm text-zinc-200 leading-relaxed relative z-10 font-medium">"{suggestion.suggestedMessage}"</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex justify-end gap-3 mt-2">
          <button onClick={() => setIsOpen(false)} disabled={isExecuting} className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">
            Cancel
          </button>
          <form action="/api/campaigns/execute" method="POST" onSubmit={handleExecute}>
            <input type="hidden" name="suggestionId" value={suggestion.id} />
            <button type="submit" disabled={isExecuting} className="relative overflow-hidden px-6 py-2.5 text-sm font-bold bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 hover:border-blue-400 text-white rounded-full shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 group">
              <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
              <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-6 bg-gradient-to-t from-blue-400/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500 blur-sm"></div>
              
              <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-6 bg-gradient-to-b from-blue-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative z-10 flex items-center gap-2">
                {isExecuting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initiating Run...
                  </>
                ) : 'Approve & Send to All'}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex gap-2 md:gap-4 justify-end border-t border-white/5 pt-4 md:pt-6 mt-auto relative z-20">
      <form action="/api/campaigns/dismiss" method="POST" className="inline-block">
        <input type="hidden" name="suggestionId" value={suggestion.id} />
        <button type="submit" className="px-4 md:px-6 py-2 md:py-2.5 text-xs md:text-sm text-zinc-400 hover:bg-white/5 hover:text-white font-semibold rounded-xl transition-colors cursor-pointer">
          Dismiss
        </button>
      </form>
      <button onClick={() => setIsOpen(true)} className="relative overflow-hidden px-6 md:px-8 py-2 md:py-2.5 bg-black/40 text-blue-100 border border-white/10 backdrop-blur-xl hover:bg-[#050505]/80 font-bold rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-all cursor-pointer text-xs md:text-sm tracking-wide flex items-center group">
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-6 bg-gradient-to-t from-blue-500/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500 blur-sm"></div>
        
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-6 bg-gradient-to-b from-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        <span className="relative z-10">Review & Execute</span>
      </button>
      {reviewModal}
    </div>
  );
}
