import Link from 'next/link';
import { LogoIcon } from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden w-full h-full">
      {/* Background grids and blurs specific to login */}
      <div className="absolute inset-0 bg-black z-[-10]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] pointer-events-none z-[-5]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none z-[-5]"></div>

      <div className="relative z-10 w-full max-w-md p-6 md:p-8 bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.8)] text-center mx-4 animate-fade-in-up">
        <div className="mx-auto w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <LogoIcon className="w-8 h-8 text-blue-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight lowercase">xeno engine</h1>
        <p className="text-zinc-400 mb-8 font-medium">AI-Native CRM Prototype</p>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-8 text-left">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Authentication Note
          </h4>
          <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
            In a full production environment, this portal utilizes <strong className="text-white">Clerk</strong> for secure Enterprise Single Sign-On (SSO). Auth has been bypassed exclusively for this interactive recruiter demo to ensure frictionless evaluation.
          </p>
        </div>

        <Link href="/" className="group relative inline-flex items-center justify-center w-full px-8 py-4 text-sm font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 cursor-pointer">
          <span className="absolute -inset-0.5 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200 bg-gradient-to-r from-blue-400 to-blue-600"></span>
          <span className="relative flex items-center gap-2">
            Access Recruiter Demo
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
