# Binge — Project Guide

## What is this?

Binge is a social TV show ranking platform. Think Beli for TV — clean, minimal, mobile-first, TV shows only (no movies), with season-by-season ratings, social features and recommendations.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with a custom dark theme
- **State:** React Context — `lib/AppContext.tsx` (ratings, feed, watchlist, navigation, auth) and `lib/SocialContext.tsx` (friends, Currently Watching, rec requests, streaming services, predictions, spoiler shield, toasts)
- **Data:** Sample data in `lib/mockData.ts` + `lib/socialData.ts`; live TMDB via `/api/tmdb/*` (`lib/tmdb.ts`) when `TMDB_READ_TOKEN` is set; Supabase auth when `NEXT_PUBLIC_SUPABASE_*` is set (`lib/supabase.ts`, schema in `supabase/schema.sql`)
- **Fonts:** Geist + Geist Mono via Google Fonts

## Project Structure

```
app/
  layout.tsx          — Root layout (imports globals.css)
  page.tsx            — Entry point (wraps BingeApp in AppProvider)

components/
  BingeApp.tsx        — Main app shell, renders active tab + BottomNav
  BottomNav.tsx       — 5-tab bottom navigation (Feed, My Lists, +Add, What's Next, Profile)
  RatingBadge.tsx     — Reusable rating badge colored by score

  tabs/
    FeedTab.tsx       — Social feed (friends activity + community rankings)
    MyListsTab.tsx    — Personal ranked lists with genre filter + show expansion
    AddTab.tsx        — Multi-step flow: choose type → search → rate → confirm
    WhatsNextTab.tsx  — Recommendation engine with spin mechanic
    ProfileTab.tsx    — User profile, Mount Rushmore, stats, activity timeline

lib/
  types.ts            — All TypeScript interfaces and type aliases
  mockData.ts         — Sample users, shows, ratings, feed activities
  AppContext.tsx       — React Context provider for global state
  utils.ts            — Helpers: getRatingColor, timeAgo, getInitial

styles/
  globals.css         — Tailwind directives, fonts, animations, slider styles
```

## Design System

Newspaper look (think a national daily's app), TV only.

- **Theme:** colors are CSS variables in `styles/globals.css` — white paper, ink-black text, hairline rules (light by default; `.dark` on <html> for dark mode). Tailwind tokens read them.
- **Type:** Newsreader serif (`font-display`) for the masthead, show titles, headlines and quotes; Libre Franklin (`font-body`) for UI, labels and numbers.
- **Structure:** sections are separated by a black top rule with a small bold uppercase label, not boxed cards. Square corners everywhere (radius 0); circles only for avatars and dots.
- **Buttons:** solid ink (`bg-accent text-bg-primary`) or outlined; links/active text use `text-accent-light` (news blue).
- **Rating colors:** muted green (9+), olive (7.5+), ochre (6+), rust (4+), red (<4), shown as bold numerals in a thin colored box.
- No gradients, no emoji in the UI.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint with ESLint
```

## Architecture Decisions

- **Client-side tab navigation** instead of Next.js file-based routing — the app is meant to feel like a native mobile app with instant tab switches
- **React Context** for state instead of a state library — keeps it simple; state is just ratings, feed, and watchlist
- **Mock data** throughout — designed to be swapped for Supabase/TMDB API later
- **Mobile-first** — max-width 480px, centered layout

## Data layer notes

- TV only: there is no movie type. Look shows up with `getShow` from `lib/catalog.ts` (sample catalog + anything fetched from TMDB), never `shows.find(...)`.
- `useTitleExtras(show)` gives next-season status, streaming providers and similar titles (sample first, live TMDB when configured).
- Social math (friend ratings, Binge rating, also-liked, taste match, already-watched) lives in `lib/social.ts`.
- Wrapped math lives in `lib/wrapped.ts`.

## Next Steps

- Move ratings, watchlist, friends, Currently Watching, rec requests, notifications and predictions from sample state onto the Supabase tables in `supabase/schema.sql`
- Real push notifications (PWA install + web push), social login
- Name / trademark check before launch
