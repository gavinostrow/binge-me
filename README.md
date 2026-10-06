# Binge

Social TV ranking with friends: rate shows season by season, see what friends are watching, send each other picks, make predictions, and get a yearly and quarterly Wrapped.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

The app runs on built-in sample data until you add keys, so you can click through everything right away.

## Turn on real data

1. Copy `.env.example` to `.env.local`.
2. **TMDB** (shows, posters, next-season dates, where to stream): create a free account at themoviedb.org → Settings → API, and paste the **API Read Access Token** into `TMDB_READ_TOKEN`. Search, show pages, "Coming Back" and streaming logos switch to live data automatically.
3. **Supabase** (accounts and the database): create a project at supabase.com, then
   - paste the Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - open SQL Editor → New query → paste `supabase/schema.sql` → Run.

   Sign up and sign in then use real accounts. The tables for ratings, friends, requests, notifications and predictions are created by the schema; moving each feature from sample data onto those tables is the next step.
4. Restart `npm run dev`.

On Vercel, add the same variables under Project → Settings → Environment Variables.

## Features

- **TV only:** Binge is built for shows — every rating, list, recommendation and recap is about TV.
- **Show pages:** your rating, friends' average and the Binge-wide rating side by side (Binge rating hidden until 10+ ratings), next-season status (premiere date, renewed, airing, ended), where it's streaming, and "people who liked this also liked."
- **Currently Watching:** show + season on your profile and friends' profiles; "Finished Season N" jumps straight to rating that season.
- **Looking for something to watch:** ask friends from What's Next; they get notified and see a picker that flags titles you've already watched or have on your watchlist, with streaming logos.
- **Coming Back:** your shows with new seasons on the way, soonest first.
- **Streaming services:** pick yours in Settings; Binge highlights titles on your services and can filter What's Next to them.
- **Friends:** find people by username, invite by link, taste-match score on every profile.
- **Notifications:** in-app notification center (bell on the feed).
- **Spoiler shield:** blurs friends' reviews for seasons you haven't finished.
- **Predictions:** pick before episodes air; friends' picks stay hidden until the question locks; friends leaderboard.
- **Wrapped:** yearly and quarterly recaps (shows, seasons, hours, top 3 shows, top genre, platform, hot take, taste twin), shareable.
