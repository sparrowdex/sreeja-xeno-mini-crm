"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

const TAGS = [
  { id: "", label: "All Customers" },
  { id: "high-value", label: "High Value" },
  { id: "frequent-buyer", label: "Frequent Buyer" },
  { id: "churn-risk", label: "Churn Risk" },
  { id: "new-user", label: "New User" },
  { id: "discount-seeker", label: "Discount Seeker" },
];

export default function AudienceControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const initialSearch = searchParams.get("search") || "";
  const currentTag = searchParams.get("tag") || "";

  const [searchValue, setSearchValue] = useState(initialSearch);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  const updateUrl = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // Always reset to page 1 when filtering
    params.set("page", "1");
    router.push(pathname + "?" + params.toString());
  }, [searchParams, pathname, router]);

  // Handle Search Input (could debounce, but for prototype Enter key or onBlur is fine, let's do a simple form submit)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl("search", searchValue);
  };

  return (
    <div className="flex flex-col gap-4 mb-6 relative z-10">
      <form onSubmit={handleSearch} className="relative">
        <svg className="absolute left-4 top-3.5 h-5 w-5 text-zinc-400 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name or email... (Press Enter)" 
          className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
        />
      </form>

      {/* Horizontally scrollable tags */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 items-center">
        {TAGS.map(tag => {
          const isActive = currentTag === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => updateUrl("tag", tag.id)}
              className={`whitespace-nowrap px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-semibold tracking-wide capitalize transition-all flex-shrink-0 backdrop-blur-2xl ${
                isActive 
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                  : "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white shadow-sm"
              }`}
            >
              {tag.label}
            </button>
          )
        })}
      </div>
    </div>
  );
}
