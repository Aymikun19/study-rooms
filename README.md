<img src="public/logo.svg" alt="" width="64" height="64">

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

## Private rooms, voice notes and files

Run `supabase/migrations/002_private_rooms_media.sql` after `schema.sql`. It adds:

- Public and private rooms. Private room passwords are hashed with bcrypt (`pgcrypto`) in a table no client can read, joins go through `join_room()` and are rate-limited to 8 wrong attempts per 10 minutes.
- Room membership enforced by row-level security on messages, timer updates and the `room-files` storage bucket.
- Voice notes (recorded with `MediaRecorder`, up to 2 minutes) and file sharing (up to 10 MB), served through signed URLs that expire after an hour.
- Per-room focus and break lengths, edited from an alarm-style timer editor and synced to everyone in the room.
