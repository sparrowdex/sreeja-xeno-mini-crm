'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetryButton({ campaignId, disabled }: { campaignId: string, disabled: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleRetry = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      await fetch(`/api/campaigns/${campaignId}/retry`, { method: 'POST' });
      // Go back to campaigns page to watch it send!
      router.push('/campaigns');
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  if (disabled) return null;

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-blue-900/20 border border-blue-500/30 rounded-xl p-1 backdrop-blur-md shadow-[0_0_15px_rgba(37,99,235,0.2)] animate-in fade-in zoom-in duration-200">
        <span className="text-[10px] md:text-xs text-blue-200 ml-2 font-semibold tracking-wide whitespace-nowrap">Retry all?</span>
        <button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Yes</button>
        <button onClick={() => setShowConfirm(false)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">No</button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setShowConfirm(true)} 
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-500 text-white p-2 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50"
      title="Retry Failed Messages"
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 md:h-4 md:w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      ) : (
        <svg className="w-5 h-5 md:w-4 md:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      )}
      <span className="hidden md:inline">{isLoading ? 'Retrying...' : 'Retry Failed Messages'}</span>
    </button>
  );
}
