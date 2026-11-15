# StudyRooms

Realtime virtual study rooms. Join a room for your course, chat with classmates, see who's online, and run a **shared Pomodoro timer** that stays in sync for everyone.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase Realtime](https://img.shields.io/badge/Supabase-Realtime-3ecf8e) ![Tests](https://img.shields.io/badge/tests-vitest-yellow)

## Features

- **Live chat**: new messages stream in through Supabase Realtime (Postgres changes)
- **Presence**: an "online now" list using Realtime Presence that updates as people join and leave
- **Shared Pomodoro**: anyone can start a 25/5 timer, and every client shows the same countdown

## How the shared timer stays in sync

Each client stores only `timer_started_at` and `timer_duration_sec` in the `rooms` row, not a ticking counter. Every client derives the remaining time from `now - started_at` (`src/lib/timer.ts`, unit tested). Late joiners and tabs that were asleep therefore show the right time without a server ticking every second, and starting or resetting is a single row update broadcast to everyone.

One Realtime channel per room carries message inserts, timer updates and presence.

## Run it

```bash
# run supabase/schema.sql (it also adds the tables to the supabase_realtime publication)
cp .env.example .env.local
npm install && npm run dev
npm test
```

## Database schema

All tables live in their own Postgres schema, `studyrooms`, rather than `public`, so this app can share one Supabase project with my other demo apps. After running `supabase/schema.sql`, add `studyrooms` under **Supabase → Project Settings → Data API → Exposed schemas**. The app selects it through `db: { schema }` in `src/lib/supabase/config.ts`.
