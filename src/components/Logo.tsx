export function LogoIcon({ className = "w-6 h-6 text-blue-500" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      {/* Connected bridge (Bottom-Left to Top-Right) */}
      <path d="M6 18L18 6" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="6" cy="18" r="4.2" />
      <circle cx="18" cy="6" r="4.2" />
      
      {/* Disconnected standalone dots */}
      <circle cx="6" cy="6" r="4.2" />
      <circle cx="18" cy="18" r="4.2" />
    </svg>
  );
}

export default function Logo({ 
  iconClassName = "w-6 h-6 text-blue-500", 
  textClassName = "text-xl font-bold text-white tracking-tight lowercase" 
}: { 
  iconClassName?: string;
  textClassName?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon className={iconClassName} />
      <span className={textClassName}>xeno</span>
    </div>
  );
}
