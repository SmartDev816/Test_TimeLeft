import { Suspense } from "react";
import { EventsClient } from "./EventsClient";

export const revalidate = 120;

const EVENTS_URL =
  "https://cdn.timeleft.com/frontend-tech-test/events.json";

export type EventStatus = "upcoming" | "live" | "past";

export interface Event {
  id: string;
  type: string;
  date: string;
  zone: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
      country: {
        id: number;
        name: string;
      };
    };
  };
  booked: number;
  capacity: number;
  status: EventStatus;
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch(EVENTS_URL, {
    next: { revalidate },
    // Ensure we always hit the CDN and let Next cache it
    cache: "force-cache"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch events");
  }

  return res.json();
}

async function EventsPageInner() {
  const events = await fetchEvents();

  return <EventsClient initialEvents={events} />;
}

export default function EventsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
            Events
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage event health across zones and cities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-accentPowder/40 px-3 py-1 font-medium text-slate-800">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live preview
          </span>
          <span className="hidden md:inline text-[11px] uppercase tracking-[0.18em]">
            /events
          </span>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="card flex flex-col gap-6 p-6">
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
          </div>
        }
      >
        <EventsPageInner />
      </Suspense>
    </section>
  );
}


