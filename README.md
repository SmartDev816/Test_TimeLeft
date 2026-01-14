# Timeleft Frontend Tech Test – Event List Back-Office

This is a small Next.js + TypeScript app implementing the **Event List** screen for a back-office used to manage social events.

The focus is on a clear, responsive UI, URL‑synced state, and good frontend structure.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18 + Tailwind CSS

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

By default Next.js uses port **3000**, but if it’s already taken it will fall back (for example to **3001**).  
Check the terminal output and open the printed URL, e.g.:

- `http://localhost:3000`
- or `http://localhost:3001`

### 3. Navigate to the Event List

- Home: `/`
- Event list page: `/events`

The home page has a “Go to events” button that links to `/events`.

## Features Implemented

- **Data fetching**
  - Server-side fetch from `https://cdn.timeleft.com/frontend-tech-test/events.json`.
  - Typed `Event` model in TypeScript.
  - Basic revalidation configured for the events list.

- **Event statistics**
  - Summary stats at the top of `/events`:
    - Total events
    - Upcoming events
    - Live events
    - Past events

- **Table UI**
  - Clean, responsive table listing:
    - ID
    - Type
    - Date/time
    - Zone
    - City
    - Status (with badges)
    - Booked
    - Capacity
    - Occupancy (percentage + small bar)
  - Empty state when filters match no events.

- **Filtering**
  - **Status filter**: all / upcoming / live / past.
  - **Search filter**: search by **type**, **city**, or **zone** (client-side).

- **Sorting**
  - Sort by:
    - **Date**
    - **Booked**
  - Click the column header to toggle **ascending / descending**.

- **Pagination**
  - Client-side pagination.
  - Page size options: **10 / 25 / 50** rows.
  - Compact page selector with Prev/Next and ellipsis when there are many pages.

- **URL sync**
  - All main view state is synced into URL search params:
    - `status`
    - `q` (search query)
    - `sort`
    - `dir`
    - `page`
    - `pageSize`
    - `eventId` (selected event in modal)
  - This means you can:
    - Refresh the page without losing state.
    - Share a URL and others will see the same view.

- **Event details modal**
  - Clicking a row opens a **modal** with event information:
    - Type, date, location (city, country).
    - ID, zone, booked/capacity, occupancy.
  - The selection is reflected in `eventId` in the URL.
  - Clicking outside or on “Close” clears `eventId` and hides the modal.
  - The content is intentionally simple (as per the test: UX only, no full details).

- **Loading states**
  - While loading events, `/events` shows a simple skeleton:
    - 4 placeholder stat cards.
    - A placeholder table block.

## UI / UX Notes

- **Layout**
  - App shell (`layout.tsx`) provides a simple back-office header with context chips.
  - Main content is centered with a max width for readability.

- **Styling**
  - Tailwind CSS with a small custom theme in `tailwind.config.mjs`.
  - Brand-inspired colors:
    - `accent` based on **tomato**.
    - `accentPowder` based on **powderblue**.
  - Cards and table use soft borders, shadows, and rounded corners for a modern admin feel.

- **Responsiveness**
  - Layout works down to small screens:
    - Table is horizontally scrollable.
    - Controls wrap nicely on narrow viewports.

## Project Structure (high level)

- `app/layout.tsx` – Root layout and header.
- `app/globals.css` – Global Tailwind setup and shared utility classes.
- `app/page.tsx` – Landing page with a short description and CTA to `/events`.
- `app/events/page.tsx` – Server component: fetches events and renders `EventsClient`.
- `app/events/EventsClient.tsx` – Client component: filters, sorting, pagination, URL sync, modal, and UI.

## Possible Improvements (if there were more time)

- Add unit tests for filtering, sorting, and pagination logic.
- Extract table, status badges, and pagination into reusable UI primitives.
- Add error handling UI around the data fetch (retry, friendly error states).
- Support server-side pagination if the dataset grows very large.


