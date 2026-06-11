import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xeno AI-Native CRM",
  description: "Proactive CRM for intelligent marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex h-screen overflow-hidden bg-black text-zinc-100 selection:bg-blue-500/30 relative">
        {/* Fixed Background Gradient - Shiny Crow's Feather (Nurebairo) */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-800 via-slate-950 to-black -z-20" />
        
        {/* Paper Texture Overlay */}
        <div className="fixed inset-0 opacity-20 mix-blend-overlay pointer-events-none -z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        
        {/* Faint Logo Pattern concentrated at the bottom */}
        <div className="fixed inset-0 -z-10 opacity-[0.15] [mask-image:linear-gradient(to_top,rgba(0,0,0,1)_0%,transparent_50%)] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2360a5fa' stroke='%2360a5fa'%3E%3Cpath d='M6 18L18 6' stroke-width='4.5' stroke-linecap='round'/%3E%3Ccircle cx='6' cy='18' r='4.2' stroke='none'/%3E%3Ccircle cx='18' cy='6' r='4.2' stroke='none'/%3E%3Ccircle cx='6' cy='6' r='4.2' stroke='none'/%3E%3Ccircle cx='18' cy='18' r='4.2' stroke='none'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px', backgroundPosition: 'center' }} />
        
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden h-full w-full pt-16 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  );
}
