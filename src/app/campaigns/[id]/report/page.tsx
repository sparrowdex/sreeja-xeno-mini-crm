import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import RetryButton from "@/components/RetryButton";

export default async function CampaignReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: {
      segment: true,
      communicationLogs: {
        where: { status: 'failed' },
        include: { customer: true }
      }
    }
  });

  if (!campaign) notFound();

  const failedLogs = campaign.communicationLogs;

  // Deterministic error reason generator for the prototype
  const getErrorReason = (id: string) => {
    const reasons = [
      "ERR_INVALID_NUMBER: Number disconnected or unreachable",
      "ERR_CARRIER_BLOCK: Blocked by carrier for spam violation",
      "ERR_OPT_OUT: User has globally opted out of communications",
      "ERR_BOUNCE: Hard bounce from receiving mail server",
      "ERR_TIMEOUT: Gateway timeout when attempting delivery"
    ];
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return reasons[sum % reasons.length];
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/campaigns" className="text-zinc-500 hover:text-white transition-colors bg-white/5 border border-white/10 rounded-full p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Delivery Report</h1>
          </div>
          <p className="text-xs md:text-base text-zinc-500">Failed delivery diagnostics for <span className="text-white font-medium">{campaign.name}</span></p>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/20">
           <div className="pr-4">
             <h3 className="font-semibold text-lg text-white">Failed Deliveries</h3>
             <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-sm">{failedLogs.length} messages failed to deliver to the target audience.</p>
           </div>
           <div className="flex flex-row items-center gap-3 w-full sm:w-auto justify-start sm:justify-end shrink-0 mt-2 sm:mt-0">
             <div className={`px-3 md:px-4 py-2 rounded-xl font-bold tracking-widest uppercase text-[10px] md:text-xs border whitespace-nowrap ${failedLogs.length > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
               {failedLogs.length} Failed
             </div>
             <RetryButton campaignId={campaign.id} disabled={failedLogs.length === 0} />
           </div>
        </div>
        
        {failedLogs.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 mx-auto bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Perfect Delivery</h3>
            <p className="text-zinc-400 mt-2 text-lg">No failed deliveries were recorded for this campaign.</p>
          </div>
        ) : (
          <div className="overflow-visible">
            <table className="w-full table-fixed text-left text-sm text-zinc-300">
              <thead className="text-xs text-zinc-500 uppercase bg-black/40 border-b border-white/5">
                <tr>
                  <th className="px-3 md:px-6 py-4 font-semibold tracking-wider w-[30%] md:w-[25%] lg:w-[20%]">Customer</th>
                  <th className="px-3 md:px-6 py-4 font-semibold tracking-wider hidden md:table-cell md:w-[25%] lg:w-[20%]">Contact</th>
                  <th className="px-3 md:px-6 py-4 font-semibold tracking-wider hidden md:table-cell md:w-[15%] lg:w-[10%]">Channel</th>
                  <th className="px-3 md:px-6 py-4 font-semibold tracking-wider w-[70%] md:w-[35%] lg:w-[35%]">Error Reason</th>
                  <th className="px-3 md:px-6 py-4 font-semibold tracking-wider text-right hidden lg:table-cell lg:w-[15%]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {failedLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 md:px-6 py-4 truncate">
                      <span className="font-medium text-white">{log.customer.name}</span>
                    </td>
                    <td className="px-3 md:px-6 py-4 font-mono text-xs text-zinc-400 hidden md:table-cell truncate">
                      {log.channel === 'email' ? log.customer.email : (log.customer.phone || 'N/A')}
                    </td>
                    <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                      <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs uppercase tracking-wider text-zinc-400">
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 relative group hover:z-50">
                      <span className="text-red-400 text-[10px] md:text-xs font-mono bg-red-500/10 border border-red-500/20 px-1.5 py-1 rounded block truncate w-full cursor-help">
                        {getErrorReason(log.id)}
                      </span>
                      
                      {/* Custom Tooltip */}
                      <div className="absolute bottom-[80%] left-1/2 -translate-x-1/2 mb-1 w-max max-w-[200px] md:max-w-xs bg-zinc-800 text-zinc-200 text-[10px] md:text-xs rounded-lg px-3 py-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] whitespace-normal break-words pointer-events-none border border-white/10 leading-relaxed">
                        {getErrorReason(log.id)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-zinc-800 drop-shadow-md"></div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 text-right text-xs text-zinc-500 hidden lg:table-cell whitespace-nowrap">
                      {new Date(log.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
