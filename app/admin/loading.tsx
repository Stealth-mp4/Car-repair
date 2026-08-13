/**
 * Console loading state.
 *
 * It lives at /admin rather than inside (console) because `loading.tsx` only
 * covers the segments BELOW it, and the slow part — loadAdminData — runs in the
 * (console) layout itself. Which also means the real sidebar and topbar are not
 * mounted yet, so this file has to draw the frame as well as the content;
 * without it the skeleton renders full-bleed and sits off-centre against the
 * dashboard that replaces it.
 *
 * The block sizes below mirror app/admin/(console)/page.tsx exactly — same
 * four tiles, same 7/5 split, same 3-up and 2-up rows — so nothing shifts when
 * the data lands.
 */

function Block({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-media border border-line bg-black-raised ${className}`} />
  );
}

export default function AdminLoading() {
  return (
    <div
      className="min-h-svh bg-black"
      style={{ ["--admin-pad" as string]: "clamp(1rem, 2.5vw, 2rem)" } as React.CSSProperties}
      aria-hidden="true"
    >
      {/* Sidebar rail — matches Sidebar's lg:w-64 so the content offset agrees. */}
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-black lg:block">
        <div className="h-16 border-b border-line" />
        <div className="space-y-2 p-4">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-input bg-line/60" />
          ))}
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Topbar — same h-16 and border as the real one. */}
        <div className="flex h-16 items-center gap-3 border-b border-line bg-black px-[var(--admin-pad)]">
          <div className="ml-auto h-10 w-full max-w-sm animate-pulse rounded-full bg-line/60" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-line/60" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-line/60" />
        </div>

        <main className="space-y-4 px-[var(--admin-pad)] py-6 pb-16">
          <p role="status" className="sr-only">
            Loading the console…
          </p>

          {/* Title + date range */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="h-9 w-48 animate-pulse rounded-full bg-line/60" />
              <div className="h-4 w-64 animate-pulse rounded-full bg-line/40" />
            </div>
            <div className="h-10 w-56 animate-pulse rounded-input bg-line/60" />
          </div>

          {/* StatRow */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Block key={i} className="h-[9.5rem]" />
            ))}
          </div>

          {/* Revenue chart + recent appointments */}
          <div className="grid gap-4 xl:grid-cols-12">
            <Block className="h-[26rem] min-w-0 xl:col-span-7" />
            <Block className="h-[26rem] min-w-0 xl:col-span-5" />
          </div>

          {/* Donut + top services + recent customers */}
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <Block className="h-80" />
            <Block className="h-80" />
            <Block className="h-80 min-w-0 lg:col-span-2 xl:col-span-1" />
          </div>

          {/* Activity + upcoming */}
          <div className="grid gap-4 xl:grid-cols-2">
            <Block className="h-72" />
            <Block className="h-72" />
          </div>
        </main>
      </div>
    </div>
  );
}
