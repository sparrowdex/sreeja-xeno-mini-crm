"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  if (pathname === '/login' || pathname === '/marketing') return null;
  const navItems = [
    { name: "Insights Feed", href: "/", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> },
    { name: "Audience", href: "/audience", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> },
    { name: "Campaigns", href: "/campaigns", icon: <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg> }
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 z-50">
        <Logo iconClassName="w-6 h-6 text-blue-500" textClassName="text-xl font-bold text-white tracking-tight lowercase" />
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
          </svg>
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar Content */}
      <div className={`fixed md:static top-16 md:top-0 left-0 right-0 transform ${isMobileOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 md:translate-y-0 md:opacity-100"} transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] z-40 ${isDesktopCollapsed ? "md:w-20" : "md:w-64"} bg-[#050505]/95 md:bg-black/40 backdrop-blur-2xl md:backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 text-zinc-300 h-[calc(100vh-64px)] md:h-full flex flex-col`}>
        
        {/* Desktop Header with Collapse Toggle */}
        <div className={`h-[89px] border-b border-white/5 hidden md:flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ${isDesktopCollapsed ? "justify-center" : "px-6 justify-between"}`}>
          <div className={`flex items-center gap-2 transition-all duration-300 ${isDesktopCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
            <Logo iconClassName="w-7 h-7 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" textClassName="text-2xl font-bold text-white tracking-tight lowercase" />
            <div className="flex flex-col justify-center border-l border-white/10 pl-2 ml-1">
              <span className="text-[9px] text-blue-200/50 uppercase tracking-widest font-semibold">Proactive</span>
              <span className="text-[9px] text-blue-200/50 uppercase tracking-widest font-semibold">CRM</span>
            </div>
          </div>
          <button onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)} className="text-zinc-500 hover:text-white transition-colors shrink-0 p-2">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDesktopCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
             </svg>
          </button>
        </div>

        <nav className="flex-1 p-4 relative flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          <GlassFilter />
          
          {/* Active Sliding Liquid Glass Pill */}
          <div 
            className={`absolute left-4 right-4 h-12 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full z-0 ${
              navItems.findIndex(i => i.href === '/' ? pathname === '/' : pathname.startsWith(i.href)) >= 0 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              top: `${16 + Math.max(0, navItems.findIndex(i => i.href === '/' ? pathname === '/' : pathname.startsWith(i.href))) * 56}px` 
            }}
          >
            <div className="absolute inset-0 z-0 h-full w-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)] bg-white/[0.02]" />
            <div 
              className="absolute inset-0 isolate -z-10 h-full w-full overflow-hidden rounded-full" 
              style={{ backdropFilter: 'url(#container-glass) blur(20px)', WebkitBackdropFilter: 'url(#container-glass) blur(20px)' }} 
            />
          </div>

          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`h-12 rounded-full transition-all duration-300 flex items-center gap-3 relative z-10 ${isDesktopCollapsed ? "justify-center" : "px-5"} ${
                  isActive
                    ? "text-blue-300 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    : "text-zinc-400 hover:text-white font-medium"
                  }`}
                title={isDesktopCollapsed ? item.name : undefined}
              >
                {item.icon}
                {!isDesktopCollapsed && (
                  <span className="whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent flex flex-col gap-2 mt-auto md:mt-0">
          <div className={`group relative flex items-center gap-3 rounded-xl cursor-help transition-all duration-300 ${isDesktopCollapsed ? "justify-center p-1 bg-transparent border-transparent" : "p-3 bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10"}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              M
            </div>
            {!isDesktopCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">Marketer</p>
                <p className="text-xs text-blue-200/70 truncate">marketer@xeno.in</p>
              </div>
            )}

            {/* Auth Explainer Tooltip */}
            <div className={`absolute bottom-full mb-4 w-[280px] p-4 bg-[#111] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 ${isDesktopCollapsed ? "left-14" : "left-0"}`}>
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Authentication Stub
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                Auth was deliberately omitted to keep this prototype focused entirely on the core CRM workflows and AI Insight Engine logic.
              </p>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
                  In a full production environment, this would integrate seamlessly with <strong className="text-white">Clerk Auth</strong> for robust B2B user management, organizations, and JWT sessions, secured at the Edge via Next.js Middleware.
                </p>
              </div>
              {/* Tooltip arrow */}
              <div className={`absolute top-full border-8 border-transparent border-t-[#111] ${isDesktopCollapsed ? "left-4" : "left-6"}`} />
            </div>
          </div>

          {/* Log Out Button */}
          <Link 
            href="/login"
            className={`flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 transition-all duration-300 ${isDesktopCollapsed ? "justify-center p-2" : "px-4 py-2.5"}`}
            title="Log Out"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {!isDesktopCollapsed && <span className="font-semibold text-sm">Log Out</span>}
          </Link>
        </div>
      </div>
    </>
  );
}

function GlassFilter() {
  return (
    <svg className="hidden h-0 w-0 absolute">
      <defs>
        <filter
          id="container-glass"
          x="-20%" y="-20%" width="140%" height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
