-- StudyRooms schema.

create table public.rooms (
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

create table public.messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms on delete cascade,
  user_id uuid not null references auth.users default auth.uid(),
  author text not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index on public.messages (room_id, created_at desc);

alter table public.rooms enable row level security;
alter table public.messages enable row level security;

create policy "signed-in users see rooms" on public.rooms for select to authenticated using (true);
create policy "create rooms" on public.rooms for insert to authenticated with check (created_by = auth.uid());
-- Anyone in the room may start/stop the shared timer.
create policy "control timer" on public.rooms for update to authenticated using (true) with check (true);

create policy "read messages" on public.messages for select to authenticated using (true);
create policy "post as yourself" on public.messages for insert to authenticated with check (user_id = auth.uid());

-- Stream inserts/updates to clients.
alter publication supabase_realtime add table public.messages, public.rooms;
