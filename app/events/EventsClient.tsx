"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Event, EventStatus } from "./page";

type SortKey = "date" | "booked";
type SortDirection = "asc" | "desc";

interface EventsClientProps {
  initialEvents: Event[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

function getStatusCounts(events: Event[]) {
  return events.reduce(
    (acc, e) => {
      acc.total += 1;
      acc[e.status] += 1;
      return acc;
    },
    {
      total: 0,
      upcoming: 0,
      live: 0,
      past: 0
    } as Record<"total" | EventStatus, number>
  );
}

function useSyncedSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (updater: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(searchParams?.toString());
    updater(sp);
    router.replace(
      sp.toString() ? `${pathname}?${sp.toString()}` : pathname,
      { scroll: false }
    );
  };

  return { searchParams, update };
}

export function EventsClient({ initialEvents }: EventsClientProps) {
  const { searchParams, update } = useSyncedSearchParams();

  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Hydrate state from URL on mount
  useEffect(() => {
    if (!searchParams) return;
    const status = searchParams.get("status");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    const dir = searchParams.get("dir");
    const p = searchParams.get("page");
    const size = searchParams.get("pageSize");
    const selected = searchParams.get("eventId");

    if (status === "upcoming" || status === "live" || status === "past") {
      setStatusFilter(status);
    }
    if (status === "all") {
      setStatusFilter("all");
    }
    if (q) setQuery(q);
    if (sort === "booked" || sort === "date") setSortKey(sort);
    if (dir === "asc" || dir === "desc") setSortDirection(dir);
    if (p && !Number.isNaN(Number(p))) setPage(Math.max(1, Number(p)));
    if (size && !Number.isNaN(Number(size))) {
      const n = Number(size);
      if (n === 10 || n === 25 || n === 50) setPageSize(n);
    }
    if (selected) setSelectedEventId(selected);
  }, [searchParams]);

  // Derived data
  const filteredAndSorted = useMemo(() => {
    let result = [...initialEvents];

    if (statusFilter !== "all") {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((e) => {
        const zone = e.zone?.name ?? "";
        const city = e.zone?.city?.name ?? "";
        const type = e.type ?? "";
        return (
          zone.toLowerCase().includes(q) ||
          city.toLowerCase().includes(q) ||
          type.toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortKey === "date") {
        comp = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === "booked") {
        comp = a.booked - b.booked;
      }
      return sortDirection === "asc" ? comp : -comp;
    });

    return result;
  }, [initialEvents, statusFilter, query, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const counts = useMemo(() => getStatusCounts(initialEvents), [initialEvents]);
  const selectedEvent = useMemo(
    () => initialEvents.find((e) => e.id === selectedEventId) ?? null,
    [initialEvents, selectedEventId]
  );

  const handleStatusChange = (value: EventStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
    update((sp) => {
      if (value === "all") sp.delete("status");
      else sp.set("status", value);
      sp.set("page", "1");
    });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
    update((sp) => {
      if (value) sp.set("q", value);
      else sp.delete("q");
      sp.set("page", "1");
    });
  };

  const handleSortChange = (key: SortKey) => {
    const nextDirection: SortDirection =
      key === sortKey && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDirection(nextDirection);
    update((sp) => {
      sp.set("sort", key);
      sp.set("dir", nextDirection);
    });
  };

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(clamped);
    update((sp) => {
      sp.set("page", String(clamped));
    });
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
    update((sp) => {
      sp.set("pageSize", String(value));
      sp.set("page", "1");
    });
  };

  const handleRowClick = (eventId: string) => {
    setSelectedEventId(eventId);
    update((sp) => {
      sp.set("eventId", eventId);
    });
  };

  const handleCloseModal = () => {
    setSelectedEventId(null);
    update((sp) => {
      sp.delete("eventId");
    });
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard
          label="Total events"
          value={counts.total}
          tone="default"
        />
        <StatCard
          label="Upcoming"
          value={counts.upcoming}
          tone="info"
        />
        <StatCard
          label="Live"
          value={counts.live}
          tone="success"
        />
        <StatCard
          label="Past"
          value={counts.past}
          tone="muted"
        />
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap items-center gap-3 px-4 py-3 md:px-5 md:py-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-xs">
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by type, city, or zone…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none ring-1 ring-transparent transition focus:border-accent focus:ring-accent/30"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              handleStatusChange(e.target.value as EventStatus | "all")
            }
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium uppercase tracking-wide text-slate-700 shadow-sm outline-none ring-1 ring-transparent transition hover:border-slate-300 focus:border-accent focus:ring-accent/40"
          >
            <option value="all">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="past">Past</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm outline-none ring-1 ring-transparent transition hover:border-slate-300 focus:border-accent focus:ring-accent/40"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50/90">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <Th>ID</Th>
                <Th>Type</Th>
                <Th
                  sortable
                  active={sortKey === "date"}
                  direction={sortDirection}
                  onClick={() => handleSortChange("date")}
                >
                  Date
                </Th>
                <Th>Zone</Th>
                <Th>City</Th>
                <Th>Status</Th>
                <Th
                  sortable
                  active={sortKey === "booked"}
                  direction={sortDirection}
                  align="right"
                  onClick={() => handleSortChange("booked")}
                >
                  Booked
                </Th>
                <Th align="right">Capacity</Th>
                <Th align="right">Occupancy</Th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No events match your current filters.
                  </td>
                </tr>
              ) : (
                paginated.map((event) => {
                  const occupancy =
                    event.capacity > 0
                      ? Math.round((event.booked / event.capacity) * 100)
                      : 0;
                  const isHigh = occupancy >= 85;

                  return (
                    <tr
                      key={event.id}
                      className="cursor-pointer border-b border-slate-100 bg-white text-slate-800 transition hover:bg-slate-50"
                      onClick={() => handleRowClick(event.id)}
                    >
                      <Td className="font-mono text-xs text-slate-500">
                        {event.id}
                      </Td>
                      <Td>{event.type}</Td>
                      <Td>{formatDate(event.date)}</Td>
                      <Td>{event.zone?.name}</Td>
                      <Td>{event.zone?.city?.name}</Td>
                      <Td>
                        <StatusBadge status={event.status} />
                      </Td>
                      <Td align="right">{event.booked}</Td>
                      <Td align="right">{event.capacity}</Td>
                      <Td align="right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`text-xs ${
                              isHigh ? "text-emerald-600" : "text-slate-500"
                            }`}
                          >
                            {occupancy}%
                          </span>
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 md:flex-row md:px-5">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-900">
              {paginated.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900">
              {(currentPage - 1) * pageSize + paginated.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900">
              {filteredAndSorted.length}
            </span>{" "}
            events
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300 hover:bg-slate-50"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const value = i + 1;
                // Only show a small window of pages around the current one
                if (
                  value !== 1 &&
                  value !== totalPages &&
                  Math.abs(value - currentPage) > 1
                ) {
                  if (
                    (value === 2 && currentPage > 3) ||
                    (value === totalPages - 1 &&
                      currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={value}
                        className="px-1 text-slate-400"
                      >
                        …
                      </span>
                    );
                  }
                  return null;
                }

                const isActive = value === currentPage;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handlePageChange(value)}
                    className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full border px-2 text-xs font-medium transition ${
                      isActive
                        ? "border-accent bg-accent text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={currentPage === totalPages || paginated.length === 0}
              onClick={() => handlePageChange(currentPage + 1)}
              className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={handleCloseModal}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 md:text-lg">
                  {selectedEvent.type}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(selectedEvent.date)} ·{" "}
                  {selectedEvent.zone.city.name},{" "}
                  {selectedEvent.zone.city.country.name}
                </p>
              </div>
              <StatusBadge status={selectedEvent.status} />
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="text-xs text-slate-500">
                This is a placeholder for the event details. In a real
                implementation, this modal would surface operational details:
                staffing, bookings breakdown, hosts, and logistics.
              </p>
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <div className="text-slate-500">Event ID</div>
                  <div className="font-mono text-slate-800">
                    {selectedEvent.id}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Zone</div>
                  <div className="text-slate-800">
                    {selectedEvent.zone.name} ·{" "}
                    {selectedEvent.zone.city.name}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Booked</div>
                  <div className="text-slate-800">
                    {selectedEvent.booked} / {selectedEvent.capacity}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Occupancy</div>
                  <div className="text-slate-800">
                    {selectedEvent.capacity > 0
                      ? `${Math.round(
                          (selectedEvent.booked /
                            selectedEvent.capacity) *
                            100
                        )}%`
                      : "–"}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  tone: "default" | "info" | "success" | "muted";
}

function StatCard({ label, value, tone }: StatCardProps) {
  const toneClasses: Record<StatCardProps["tone"], string> = {
    default: "from-accentPowder/40 via-white to-white",
    info: "from-sky-50 via-accentPowder/40 to-white",
    success: "from-emerald-50 via-emerald-100/60 to-white",
    muted: "from-slate-100 to-white"
  };

  return (
    <div className="card overflow-hidden p-[1px]">
      <div
        className={`h-full rounded-2xl bg-gradient-to-br ${toneClasses[tone]} p-4`}
      >
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

interface ThProps {
  children: React.ReactNode;
  align?: "left" | "right";
  sortable?: boolean;
  active?: boolean;
  direction?: SortDirection;
  onClick?: () => void;
}

function Th({
  children,
  align = "left",
  sortable,
  active,
  direction,
  onClick
}: ThProps) {
  const alignClass = align === "right" ? "text-right" : "text-left";
  const content = (
    <div className={`flex items-center gap-1 ${alignClass}`}>
      <span>{children}</span>
      {sortable && (
        <span
          className={`text-[10px] ${
            active ? "text-accent" : "text-slate-400"
          }`}
        >
          {direction === "desc" ? "↓" : "↑"}
        </span>
      )}
    </div>
  );

  return (
    <th
      className={`px-4 py-3 text-[11px] font-semibold ${alignClass} ${
        sortable
          ? "cursor-pointer select-none hover:bg-slate-100"
          : ""
      }`}
      onClick={sortable ? onClick : undefined}
    >
      {content}
    </th>
  );
}

interface TdProps {
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

function Td({ children, align = "left", className }: TdProps) {
  const alignClass = align === "right" ? "text-right" : "text-left";
  return (
    <td
      className={`whitespace-nowrap px-4 py-3 text-xs text-slate-800 ${alignClass} ${className ?? ""}`}
    >
      {children}
    </td>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const config: Record<
    EventStatus,
    { label: string; className: string }
  > = {
    upcoming: {
      label: "Upcoming",
      className:
        "bg-accentPowder/40 text-slate-800 border-accentPowder/60"
    },
    live: {
      label: "Live",
      className:
        "bg-accent/10 text-accent border-accent/40"
    },
    past: {
      label: "Past",
      className:
        "bg-slate-100 text-slate-700 border-slate-300"
    }
  };

  const cfg = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}


