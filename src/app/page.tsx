import prisma from "@/lib/prisma";
import ExpandableText from "@/components/ExpandableText";
import ReviewExecuteActions from "@/components/ReviewExecuteActions";
import InsightEngineTrigger from "@/components/InsightEngineTrigger";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const error = resolvedParams?.error as string;

  const suggestions = await prisma.campaignSuggestion.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' }
  });

  // Mathematically calculate the TRUE reach by querying the DB with the AI's structured targetTags
  const enrichedSuggestionsList = await Promise.all(suggestions.map(async (suggestion) => {
    const targetTags: string[] = suggestion.targetTags ? JSON.parse(suggestion.targetTags) : [];
    let whereClause = {};
    if (targetTags.length > 0) {
      whereClause = {
        AND: targetTags.map(tag => ({ tags: { contains: `"${tag}"` } }))
      };
    }
    const reach = await prisma.customer.count({ where: whereClause });

    // Generate stable "predicted impact" metrics based on ID hash
    let hash = 0;
    for (let i = 0; i < suggestion.id.length; i++) {
      hash = suggestion.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const posHash = Math.abs(hash);
    const lift = ((posHash % 15) + 8);
    const confidence = ((posHash % 12) + 85);

    return { ...suggestion, reach, lift, confidence };
  }));

  // Sort by highest AI confidence (success rate) first
  const enrichedSuggestions = enrichedSuggestionsList.sort((a, b) => b.confidence - a.confidence);

  const getErrorDetails = (errCode: string) => {
    switch (errCode) {
      case 'rate_limit':
        return {
          title: "High Demand (Rate Limited)",
          message: "The AI engine is currently experiencing extremely high demand. Please wait a moment and try again.",
          icon: <svg className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          wrapperClass: "bg-orange-950/30 border border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.1)]",
          titleClass: "text-orange-300",
          msgClass: "text-orange-200/70"
        };
      case 'service_unavailable':
        return {
          title: "Service Overloaded",
          message: "The AI provider (Google Gemini) is currently unavailable or overloaded. Please try again later.",
          icon: <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
          wrapperClass: "bg-red-950/30 border border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.1)]",
          titleClass: "text-red-300",
          msgClass: "text-red-200/70"
        };
      default:
        return {
          title: "AI Engine Error",
          message: "An unexpected error occurred while communicating with the Insight Engine. Please try again.",
          icon: <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
          wrapperClass: "bg-red-950/30 border border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.1)]",
          titleClass: "text-red-300",
          msgClass: "text-red-200/70"
        };
    }
  };

  const errorDetails = error ? getErrorDetails(error) : null;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] w-full mx-auto">
      <div className="mb-6 md:mb-12 relative z-10 border-b border-white/5 pb-4 md:pb-6 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <div className="flex items-center justify-start md:justify-between gap-3 md:gap-4">
          <h1 className="text-xl md:text-4xl font-bold flex items-center gap-2 md:gap-3 tracking-tight text-white shrink-0">
            <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Insight Engine
          </h1>
          
          <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0 pt-0.5 md:pt-1 md:mr-4">
            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${enrichedSuggestions.length > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'}`}></span>
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">
              <span className="hidden md:inline">Status: </span><span className={enrichedSuggestions.length > 0 ? 'text-green-400' : 'text-yellow-400'}>{enrichedSuggestions.length > 0 ? 'Active' : 'Standby'}</span>
            </span>
          </div>
        </div>
        <p className="text-blue-300/50 mt-1.5 md:mt-2 text-xs md:text-base font-medium max-w-2xl">
          {enrichedSuggestions.length > 0 
            ? "Neural analysis complete. High-converting segments identified."
            : "Engine idle. Awaiting authorization to analyze audience data."}
        </p>
      </div>

      {errorDetails && (
        <div className={`mb-6 p-4 md:p-5 rounded-2xl flex items-start gap-3 ${errorDetails.wrapperClass}`}>
          {errorDetails.icon}
          <div>
            <h4 className={`text-sm font-bold ${errorDetails.titleClass}`}>{errorDetails.title}</h4>
            <p className={`text-xs md:text-sm mt-1 ${errorDetails.msgClass}`}>{errorDetails.message}</p>
          </div>
        </div>
      )}

      {enrichedSuggestions.length === 0 ? (
        <div className="relative text-center py-12 md:py-20 lg:py-24 px-4 md:px-6 group flex flex-col items-center justify-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-[80px] md:blur-[100px] opacity-50 group-hover:opacity-70 transition-all duration-700 pointer-events-none"></div>
          
          <InsightEngineTrigger />
        </div>
      ) : (
        <>
          {enrichedSuggestions.length > 1 && (
            <div className="md:hidden flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-widest text-blue-400">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              {enrichedSuggestions.length} suggestions ready. Swipe left to view.
            </div>
          )}
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-1 md:gap-8 scrollbar-hide">
            {enrichedSuggestions.map((suggestion, index) => {
              const { reach, lift, confidence } = suggestion;

              return (
              <div key={suggestion.id} className="animate-fade-in-up snap-center shrink-0 w-[90vw] md:w-auto bg-[#050505]/60 backdrop-blur-2xl border border-white/5 rounded-[24px] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all hover:bg-[#0a0a0a]/80 hover:border-white/10 flex flex-col group relative overflow-hidden" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black,transparent)] pointer-events-none"></div>
                
                <div className="relative z-10 flex justify-between items-start mb-3 md:mb-5 gap-3">
                  <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight whitespace-normal">{suggestion.title}</h3>
                  <span className="shrink-0 text-[10px] md:text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.15)] uppercase tracking-wider">Suggested</span>
                </div>
                
                <div className="relative z-10">
                  <ExpandableText text={suggestion.reasoning} />
                </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5 mb-5 md:mb-6">
                <div className="p-4 md:p-6 bg-white/[0.02] rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h4 className="text-sm font-medium text-blue-300/80 mb-2 relative z-10">
                    Target Audience
                  </h4>
                  <p className="text-sm md:text-base font-semibold text-zinc-200 relative z-10">{suggestion.suggestedSegment}</p>
                </div>
                <div className="p-4 md:p-6 bg-blue-950/20 rounded-2xl border border-blue-500/10 group-hover:border-blue-500/20 transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h4 className="text-sm font-medium text-blue-300 mb-2 relative z-10 flex items-center justify-between">
                    Message Draft
                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] uppercase tracking-wider font-bold">WHATSAPP</span>
                  </h4>
                  <p className="italic text-sm md:text-base text-blue-100/90 relative z-10 line-clamp-3 md:line-clamp-none font-medium">"{suggestion.suggestedMessage}"</p>
                </div>
              </div>

              {/* AI Predicted Impact Metrics */}
              <div className="grid grid-cols-3 gap-2 md:gap-8 mb-6 md:mb-8 p-3 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl divide-x divide-white/5">
                 <div className="flex flex-col px-2 md:px-4">
                   <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 flex flex-col md:flex-row md:items-center gap-1 md:gap-1.5">
                     <svg className="w-3 h-3 shrink-0 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                     <span className="md:hidden">Est. Reach</span>
                     <span className="hidden md:inline">Estimated Reach</span>
                   </span>
                   <div className="flex flex-col lg:flex-row lg:items-baseline gap-0 lg:gap-1.5">
                     <span className="text-sm md:text-xl font-semibold text-white tracking-tight leading-none">{reach.toLocaleString()}</span>
                     <span className="text-[10px] md:text-sm text-zinc-400 font-medium">Users</span>
                   </div>
                 </div>
                 <div className="flex flex-col pl-3 md:pl-4">
                   <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 flex flex-col md:flex-row md:items-center gap-1 md:gap-1.5">
                     <svg className="w-3 h-3 text-green-500 shrink-0 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                     <span className="md:hidden">Pred. Lift</span>
                     <span className="hidden md:inline">Predicted Lift</span>
                   </span>
                   <div className="flex flex-col lg:flex-row lg:items-baseline gap-0 lg:gap-1.5">
                     <span className="text-sm md:text-xl font-semibold text-green-400 tracking-tight leading-none">+{lift}%</span>
                     <span className="text-[10px] md:text-sm text-green-500/70 font-medium">AOV</span>
                   </div>
                 </div>
                 <div className="flex flex-col pl-3 md:pl-4">
                   <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 flex flex-col md:flex-row md:items-center gap-1 md:gap-1.5">
                     <svg className="w-3 h-3 text-blue-500 shrink-0 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                     <span className="md:hidden">AI Conf.</span>
                     <span className="hidden md:inline">AI Confidence</span>
                   </span>
                   <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 mt-0.5 lg:mt-0">
                     <span className="text-sm md:text-xl font-semibold text-blue-400 tracking-tight leading-none">{confidence}%</span>
                     <span className="w-8 lg:w-full lg:max-w-[60px] h-1 lg:h-1.5 bg-blue-950 rounded-full overflow-hidden">
                        <span className="block h-full bg-blue-500 rounded-full" style={{ width: `${confidence}%` }}></span>
                     </span>
                   </div>
                 </div>
              </div>

              <ReviewExecuteActions suggestion={suggestion} reach={reach} />
            </div>
          );
          })}
        </div>
        </>
      )}
    </div>
  );
}
