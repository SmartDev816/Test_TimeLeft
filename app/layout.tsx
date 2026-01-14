import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Events | Timeleft Back-Office",
  description: "Back-office event list for Timeleft frontend tech test"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-shell font-sans text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8 md:py-8">
          <header className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 md:text-2xl">
                Timeleft Back-Office
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Events management · Frontend technical test
              </p>
            </div>
            <div className="hidden items-center gap-3 text-xs text-slate-500 md:flex">
              <span className="inline-flex items-center gap-1 rounded-full bg-accentPowder/30 px-3 py-1 font-medium text-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Events
              </span>
              <span className="rounded-full border border-dashed border-slate-200 bg-white px-3 py-1">
                Back-office preview
              </span>
            </div>
          </header>
          <main className="flex-1 pb-8">{children}</main>
        </div>
      </body>
    </html>
  );
}


