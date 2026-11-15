-- Everything lives in the "studyrooms" schema so this app can share a Supabase project with others.
-- After running, add "studyrooms" under Supabase → Project Settings → Data API → Exposed schemas.
create schema if not exists studyrooms;
grant usage on schema studyrooms to anon, authenticated, service_role;
alter default privileges in schema studyrooms grant all on tables to anon, authenticated, service_role;
alter default privileges in schema studyrooms grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema studyrooms grant execute on functions to anon, authenticated, service_role;

-- StudyRooms schema.

create table studyrooms.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  topic text,
  created_by uuid not null references auth.users default auth.uid(),
  -- shared Pomodoro timer
  timer_mode text not null default 'focus' check (timer_mode in ('focus','break')),
  timer_duration_sec int not null default 1500,
  timer_started_at timestamptz,
  created_at timestamptz not null default now()
);

create table studyrooms.messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references studyrooms.rooms on delete cascade,
  user_id uuid not null references auth.users default auth.uid(),
  author text not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on studyrooms.messages (room_id, created_at desc);

alter table studyrooms.rooms enable row level security;
alter table studyrooms.messages enable row level security;

create policy "signed-in users see rooms" on studyrooms.rooms for select to authenticated using (true);
create policy "create rooms" on studyrooms.rooms for insert to authenticated with check (created_by = auth.uid());
-- Anyone in the room may start/stop the shared timer.
create policy "control timer" on studyrooms.rooms for update to authenticated using (true) with check (true);

create policy "read messages" on studyrooms.messages for select to authenticated using (true);
create policy "post as yourself" on studyrooms.messages for insert to authenticated with check (user_id = auth.uid());

-- Stream inserts/updates to clients.
alter publication supabase_realtime add table studyrooms.messages, studyrooms.rooms;

-- Table access is still governed by the RLS policies above.
grant all on all tables in schema studyrooms to anon, authenticated, service_role;
grant all on all sequences in schema studyrooms to anon, authenticated, service_role;
grant execute on all functions in schema studyrooms to anon, authenticated, service_role;
