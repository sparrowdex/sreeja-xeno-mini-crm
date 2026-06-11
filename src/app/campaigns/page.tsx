import prisma from "@/lib/prisma";
import AutoRefresh from "@/components/AutoRefresh";
import CampaignActions from "@/components/CampaignActions";
import Link from "next/link";

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      segment: true,
      communicationLogs: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const hasActiveCampaigns = campaigns.some(c => {
    const hasPendingLogs = c.communicationLogs.some(log => log.status.toLowerCase() === 'pending');
    if (hasPendingLogs) return true;
    
    // Fallback: If it has zero logs but is stuck in a sending state (initializing)
    if (c.communicationLogs.length === 0 && ['processing', 'sending', 'pending'].includes(c.status.toLowerCase())) return true;

    return false;
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] w-full mx-auto">
      <AutoRefresh intervalMs={4000} enabled={hasActiveCampaigns} />

      <div className="mb-6 md:mb-8 flex justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-xs md:text-base text-zinc-500 mt-1 md:mt-2 max-w-[200px] md:max-w-none leading-relaxed">Manage and track your marketing campaigns in real-time.</p>
        </div>
        <Link href="/" className="relative overflow-hidden w-11 h-11 md:w-auto md:h-auto md:px-8 md:py-3 flex-shrink-0 bg-black/40 text-blue-100 border border-white/10 backdrop-blur-xl hover:bg-[#050505]/80 font-bold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all cursor-pointer text-sm tracking-wide flex items-center justify-center md:gap-2.5 group">
          {/* Default State: Bottom Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500"></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 bottom-0 h-6 bg-gradient-to-t from-blue-500/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500 blur-sm"></div>
          
          {/* Hover State: Top Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute left-1/2 -translate-x-1/2 w-2/3 top-0 h-6 bg-gradient-to-b from-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          
          <svg className="relative z-10 w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-all duration-500 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden md:inline relative z-10">Create Campaign</span>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center px-6 py-16 md:py-32 relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
          
          {/* Internal Bright Gradient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-blue-600/30 to-blue-400/10 blur-[80px] rounded-full pointer-events-none"></div>

          <svg className="relative z-10 h-16 w-16 mb-6 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          
          <h3 className="text-2xl font-bold text-white relative z-10 tracking-tight">No active campaigns</h3>
          <p className="mt-3 text-sm md:text-base text-blue-200/70 max-w-xs md:max-w-sm relative z-10 font-medium leading-relaxed">
            Your campaign dashboard is empty. Get started by reviewing the <Link href="/" className="text-blue-300 font-semibold hover:text-blue-200 transition-colors cursor-pointer">Insight Engine</Link> feed to launch AI-optimized campaigns.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {campaigns.map(campaign => {
            const logs = campaign.communicationLogs;
            const total = logs.length;

            // Funnel logic: if something is 'clicked', it implies it was opened and delivered.
            const clicked = logs.filter(l => l.status === 'clicked').length;
            const opened = logs.filter(l => l.status === 'opened' || l.status === 'clicked').length;
            const delivered = logs.filter(l => l.status === 'delivered' || l.status === 'opened' || l.status === 'clicked').length;
            const failed = logs.filter(l => l.status === 'failed').length;

            const openedRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
            const clickedRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0;

            // Determine if it's still sending based on pending logs
            const pending = logs.filter(l => l.status === 'pending').length;
            const isCompleted = total > 0 && pending === 0;
            const displayStatus = isCompleted ? 'completed' : campaign.status;

            return (
              <div key={campaign.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col">
                <div className="flex justify-between items-start mb-4 md:mb-6 gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg md:text-xl text-white leading-tight">{campaign.name}</h3>
                    <p className="text-blue-200/70 text-xs md:text-sm mt-1">Targeting: <span className="font-medium text-blue-100">{campaign.segment.description}</span></p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row-reverse items-end md:items-center gap-2 md:gap-3 shrink-0">
                    <span className={`shrink-0 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-wider border ${displayStatus === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        displayStatus === 'sending' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 flex items-center gap-1.5 md:gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                          'bg-white/5 border-white/10 text-zinc-400'
                      }`}>
                      {displayStatus === 'sending' && (
                        <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-blue-500"></span>
                        </span>
                      )}
                      {displayStatus}
                    </span>
                    <div className="flex flex-row items-center gap-2 md:gap-3 mt-1 md:mt-0">
                      {displayStatus === 'completed' && (
                        <Link href={`/campaigns/${campaign.id}/report`} className="shrink-0 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-wider border bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="hidden sm:inline">Report</span>
                        </Link>
                      )}
                      <CampaignActions campaign={campaign} />
                    </div>
                  </div>
                </div>

                {/* Master Delivery Progress Bar */}
                <div className="mt-6 mb-5 md:mb-6">
                  <div className="flex justify-between items-end mb-2 px-1">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                       <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       Campaign Progress
                     </span>
                     <span className="text-xs font-bold text-blue-300">{delivered} / {total} Delivered</span>
                  </div>
                  <div className="h-2 md:h-2.5 w-full bg-black/40 rounded-full border border-white/5 relative shadow-inner">
                     <div 
                        className={`h-full rounded-full overflow-hidden transition-all duration-1000 ease-out relative ${isCompleted ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`} 
                        style={{ width: `${total > 0 ? (delivered / total) * 100 : 0}%` }}
                     >
                       {/* Animated highlight */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                     </div>
                  </div>
                </div>

                {/* Metrics Funnel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-auto">
                  <div className="bg-black/20 p-3 md:p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] md:text-xs font-semibold text-blue-200/50 uppercase tracking-wider">Total Sent</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2 text-white">{total}</p>
                    <p className="text-[9px] md:text-xs text-blue-200/50 mt-1">{pending} pending</p>
                  </div>

                  <div className="bg-black/20 p-3 md:p-4 rounded-xl border border-white/5">
                    <p className="text-[10px] md:text-xs font-semibold text-blue-200/50 uppercase tracking-wider">Delivered</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">{delivered}</p>
                    <p className="text-[9px] md:text-xs text-blue-200/50 mt-1">{failed > 0 ? `${failed} failed` : '100% success'}</p>
                  </div>

                  <div className="bg-black/20 p-3 md:p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] md:text-xs font-semibold text-blue-200/50 uppercase tracking-wider relative z-10">Opened</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)] relative z-10">{opened}</p>
                    <p className="text-[9px] md:text-xs text-blue-200/50 mt-1 relative z-10">{openedRate}% of delivered</p>
                    <div className="absolute bottom-0 left-0 h-1 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" style={{ width: `${openedRate}%` }}></div>
                  </div>

                  <div className="bg-black/20 p-3 md:p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-[10px] md:text-xs font-semibold text-blue-200/50 uppercase tracking-wider relative z-10">Clicked</p>
                    <p className="text-xl md:text-3xl font-bold mt-1 md:mt-2 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)] relative z-10">{clicked}</p>
                    <p className="text-[9px] md:text-xs text-blue-200/50 mt-1 relative z-10">{clickedRate}% of opened</p>
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ width: `${clickedRate}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
