'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { deleteCampaign } from '@/app/campaigns/actions';

export default function CampaignActions({ campaign }: { campaign: any }) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteCampaign(campaign.id);
  };

  const infoModal = mounted && isInfoOpen ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" style={{ zIndex: 99999 }}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative">
        <h2 className="text-2xl font-bold text-white mb-2">Campaign Info</h2>
        <p className="text-zinc-400 text-sm mb-6">Review the details and message preview for this campaign.</p>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Segment</h4>
            <p className="text-sm text-zinc-200 bg-white/5 border border-white/10 p-3 rounded-xl font-medium">{campaign.segment?.name || 'Unknown'}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Message Preview</h4>
            <div className="flex flex-col gap-1.5 w-full max-w-[280px] md:max-w-sm mt-3">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider pl-1">SMS</span>
              <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3.5 rounded-2xl rounded-tl-[4px] text-sm font-medium shadow-[0_4px_15px_rgba(59,130,246,0.3)] border border-blue-400/20 leading-relaxed">
                {campaign.messageTemplate}
                {/* CSS Tail */}
                <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-[10px] border-t-blue-500 border-l-[10px] border-l-transparent drop-shadow-md"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button onClick={() => setIsInfoOpen(false)} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer">Close</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const deleteModal = mounted && isDeleteOpen ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" style={{ zIndex: 99999 }}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <h2 className="text-xl font-bold text-white mb-2">Delete Campaign</h2>
        <p className="text-sm text-zinc-400 mb-6">Are you sure you want to permanently delete <strong>{campaign.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setIsDeleteOpen(false)} disabled={isDeleting} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleDelete} disabled={isDeleting} className="px-5 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] transition-colors cursor-pointer disabled:opacity-50">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="flex items-center gap-3 md:gap-4 pr-1 md:pr-2">
        <button onClick={() => setIsInfoOpen(true)} className="text-[10px] md:text-xs font-bold text-blue-400/60 hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer">
          <svg className="w-4 h-4 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="hidden md:inline">Info</span>
        </button>
        <button onClick={() => setIsDeleteOpen(true)} className="text-[10px] md:text-xs font-bold text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer">
          <svg className="w-4 h-4 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          <span className="hidden md:inline">Delete</span>
        </button>
      </div>
      {infoModal}
      {deleteModal}
    </>
  );
}
