import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="card w-full max-w-2xl overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[1.2fr,1fr]">
          <div className="p-7 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Timeleft · Internal
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Events back-office preview
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Explore how operations teams could monitor upcoming, live and
              past events, with filters, sorting, pagination and a quick
              event drawer.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accentSoft hover:shadow-md"
              >
                Go to events
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Built with Next.js & Tailwind
              </span>
            </div>
          </div>
          <div className="relative hidden bg-slate-950/95 px-6 py-6 text-xs text-slate-200 md:flex md:flex-col md:justify-between">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.3),_transparent_60%)]" />
            <div className="relative">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                What&apos;s inside
              </p>
              <ul className="mt-3 space-y-2.5 text-[13px] text-slate-100/90">
                <li>• URL-synced filters, sort and pagination.</li>
                <li>• Client-side stats, occupancy and status badges.</li>
                <li>• Modal navigation for quick event inspection.</li>
              </ul>
            </div>
            <div className="relative mt-4 rounded-xl border border-slate-800/80 bg-slate-900/70 p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                Hint
              </p>
              <p className="mt-1.5 text-[12px] text-slate-200">
                Use the filters on the events page, then refresh the browser
                or share the URL – the view will stay in sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


