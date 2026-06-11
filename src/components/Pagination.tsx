"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export default function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updatePage = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(pathname + "?" + params.toString());
  }, [searchParams, pathname, router]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
      <button 
        onClick={() => updatePage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Previous
      </button>
      
      <span className="text-xs font-medium text-zinc-400 tracking-wide">
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        onClick={() => updatePage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-sm font-medium text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next
      </button>
    </div>
  );
}
