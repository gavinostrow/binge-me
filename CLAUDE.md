# Binge — Project Guide

## What is this?

Binge is a social movie and TV show ranking platform. Think Letterboxd meets Beli — dark, minimal, mobile-first, built for both movies AND TV shows with social features and recommendations.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with a custom dark theme
- **State:** React Context (`lib/AppContext.tsx`) for global app state
- **Data:** Mock data in `lib/mockData.ts` (no backend yet)
- **Fonts:** Outfit (display/headings) + Karla (body text) via Google Fonts

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
  mockData.ts         — Mock users, movies, shows, ratings, feed activities
  AppContext.tsx       — React Context provider for global state
  utils.ts            — Helpers: getRatingColor, timeAgo, getInitial

styles/
  globals.css         — Tailwind directives, fonts, animations, slider styles
```

## Design System

- **Background:** #0D0D12 (primary), #15151D (surface), #1C1C28 (elevated), #252533 (hover)
- **Text:** #E8E4DC (primary), #9994A8 (secondary), #5E586E (muted)
- **Accent:** #8B5CF6 (purple), #D4A843 (gold)
- **Rating colors:** green (9+), yellow-green (8+), yellow (7+), orange (6+), red (<6)

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

## Next Steps (not yet implemented)

- **Backend:** Supabase for auth, database, and realtime
- **TMDB API:** Replace mock movie/show search with real API
- **Auth:** Email/password, then social login
- **Friends system:** Follow/unfollow, taste match calculation
- **PWA:** Service worker for offline + home screen install
