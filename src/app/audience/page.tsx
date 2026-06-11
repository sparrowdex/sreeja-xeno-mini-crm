import prisma from "@/lib/prisma";
import CopyableEmail from "@/components/CopyableEmail";
import AudienceControls from "@/components/AudienceControls";
import Pagination from "@/components/Pagination";
import CustomerActions from "@/components/CustomerActions";
import AutoCyclingTags from "@/components/AutoCyclingTags";

export default async function AudiencePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = (resolvedParams?.search as string) || "";
  const tag = (resolvedParams?.tag as string) || "";
  const pageStr = (resolvedParams?.page as string) || "1";

  const currentPage = Math.max(1, parseInt(pageStr) || 1);
  const take = 24;
  const skip = (currentPage - 1) * take;

  // Build Prisma where clause dynamically
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } }
    ];
  }

  if (tag) {
    // In SQLite, tags are stored as JSON strings like '["high-value", "discount-seeker"]'
    // So we can use a basic string contains search
    where.tags = { contains: `"${tag}"` };
  }

  // Fetch paginated data and total count concurrently
  const [customers, totalCustomers] = await Promise.all([
    prisma.customer.findMany({
      where,
      take,
      skip,
      include: {
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count({ where })
  ]);

  const totalPages = Math.ceil(totalCustomers / take);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] w-full mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl font-bold text-white">
          Audience
        </h1>
        <p className="text-zinc-400 mt-2 text-sm">
          Showing <span className="text-white font-medium">{customers.length}</span> of <span className="text-white font-medium">{totalCustomers}</span> customers.
        </p>
      </div>

      <AudienceControls />

      {customers.length === 0 ? (
        <div className="text-center py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
          <svg className="mx-auto h-12 w-12 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-4 text-sm font-semibold text-white">No customers found</h3>
          <p className="mt-1 text-xs text-zinc-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {customers.map((customer, index) => {
            let tags: string[] = customer.tags ? JSON.parse(customer.tags) : [];
            if (tag && tags.includes(tag)) {
              tags = [tag, ...tags.filter(t => t !== tag)];
            }
            const initials = customer.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return (
              <div
                key={customer.id}
                className="min-w-0 animate-fade-in-up bg-[#050505]/60 backdrop-blur-2xl border border-white/5 rounded-[24px] p-4 md:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-0.5 flex flex-col gap-3 md:gap-4 group/card"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-sm flex items-center justify-center shrink-0">
                    <span className="font-bold text-white text-xs md:text-sm tracking-widest">{initials}</span>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm md:text-base truncate">{customer.name}</h3>
                    <CopyableEmail email={customer.email} />
                  </div>

                  <div className="flex flex-col items-end shrink-0 border-l border-white/5 pl-2 md:pl-4">
                    <span className="text-[9px] md:text-[10px] font-bold text-blue-200/50 uppercase tracking-widest">Orders</span>
                    <span className="text-sm md:text-lg font-bold text-white">{customer._count.orders}</span>
                  </div>
                </div>

                {/* Footer: Tags and Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto -mx-4 px-4 md:mx-0 md:px-0">
                  
                  {/* Mobile View: Auto-cycling Tags */}
                  <div className="flex md:hidden flex-1 min-w-0 pr-4">
                    <AutoCyclingTags tags={tags} />
                  </div>

                  {/* Desktop View: All Tags with Hover Expansion */}
                  <div className="hidden md:flex flex-1 min-w-0 pr-4 relative group/taglist cursor-default">
                    {/* Compact View (Masked) */}
                    <div className="flex gap-2 overflow-hidden flex-1 [mask-image:linear-gradient(to_right,white_85%,transparent_100%)]">
                      {tags.map(t => (
                        <span
                          key={t}
                          className="px-2.5 py-1 text-xs font-semibold capitalize text-zinc-300 bg-white/5 border border-white/10 rounded-full shrink-0 flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                          {t.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                    
                    {/* Expanded Hover Tooltip */}
                    {tags.length > 1 && (
                      <div className="absolute bottom-full left-0 mb-3 p-3 bg-[#111] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/taglist:opacity-100 group-hover/taglist:visible transition-all duration-300 z-50 flex flex-wrap gap-2 w-max max-w-[280px]">
                        <h4 className="w-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Customer Segments</h4>
                        {tags.map(t => (
                          <span
                            key={`hover-${t}`}
                            className="px-2.5 py-1 text-xs font-semibold capitalize text-white bg-blue-500/10 border border-blue-500/20 rounded-full shrink-0 flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            {t.replace('-', ' ')}
                          </span>
                        ))}
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-6 border-8 border-transparent border-t-[#111]" />
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <CustomerActions customer={customer} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
