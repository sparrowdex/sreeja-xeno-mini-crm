'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { updateCustomer, deleteCustomer } from '@/app/audience/actions';

export default function CustomerActions({ customer }: { customer: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteCustomer(customer.id);
    // Modal unmounts automatically if customer is deleted from the list
  };

  const editModal = mounted && isOpen ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ zIndex: 99999 }}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <h2 className="text-xl font-bold text-white mb-4">Edit Customer</h2>
        <form action={async (formData) => {
          await updateCustomer(customer.id, formData);
          setIsOpen(false);
        }} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</label>
            <input name="name" defaultValue={customer.name} required className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phone</label>
            <input name="phone" defaultValue={customer.phone || ''} className="w-full mt-1.5 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors shadow-inner" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-colors cursor-pointer">Save Changes</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;

  const deleteModal = mounted && showDeleteConfirm ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{ zIndex: 99999 }}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-fade-in-up">
        <h2 className="text-xl font-bold text-white mb-2">Delete Customer</h2>
        <p className="text-sm text-zinc-400 mb-6">Are you sure you want to permanently delete <strong>{customer.name}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">Cancel</button>
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
      <div className="flex gap-1.5 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-opacity">
        <button onClick={() => setIsOpen(true)} title="Edit Customer" className="p-1.5 text-zinc-400 md:hover:text-blue-400 active:text-blue-400 bg-white/5 rounded-lg border border-white/10 md:hover:bg-white/10 active:bg-white/10 transition-colors shadow-sm cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
        <button onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting} title="Delete Customer" className="p-1.5 text-zinc-400 md:hover:text-red-400 active:text-red-400 bg-white/5 rounded-lg border border-white/10 md:hover:bg-white/10 active:bg-white/10 transition-colors shadow-sm disabled:opacity-50 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      {editModal}
      {deleteModal}
    </>
  )
}
