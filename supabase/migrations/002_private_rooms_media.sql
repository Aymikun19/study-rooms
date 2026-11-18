-- 002: private rooms with passwords, room membership, voice notes and file sharing, custom timer lengths.
-- Run after schema.sql.

-- Rooms: visibility and per-room timer lengths
alter table studyrooms.rooms
  add column if not exists visibility text not null default 'public' check (visibility in ('public', 'private')),
  add column if not exists focus_minutes int not null default 25 check (focus_minutes between 1 and 180),
  add column if not exists break_minutes int not null default 5 check (break_minutes between 1 and 60);

-- Password hashes live in their own table with no policies, so no client can ever read them.
create table if not exists studyrooms.room_secrets (
  room_id uuid primary key references studyrooms.rooms on delete cascade,
  password_hash text not null
);
alter table studyrooms.room_secrets enable row level security;

create table if not exists studyrooms.room_members (
  room_id uuid not null references studyrooms.rooms on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
alter table studyrooms.room_members enable row level security;
drop policy if exists "see your memberships" on studyrooms.room_members;
create policy "see your memberships" on studyrooms.room_members for select to authenticated using (user_id = auth.uid());

-- Failed password attempts, for rate limiting
create table if not exists studyrooms.join_attempts (
  id bigint generated always as identity primary key,
  room_id uuid not null references studyrooms.rooms on delete cascade,
  user_id uuid not null,
  at timestamptz not null default now()
);
alter table studyrooms.join_attempts enable row level security;
create index if not exists join_attempts_lookup on studyrooms.join_attempts (user_id, room_id, at desc);

-- Who may read and post in a room: anyone for public rooms, members for private ones.
create or replace function studyrooms.can_access(p_room uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from studyrooms.rooms r
    where r.id = p_room
      and (r.visibility = 'public'
           or r.created_by = auth.uid()
           or exists (select 1 from studyrooms.room_members m where m.room_id = r.id and m.user_id = auth.uid()))
  );
$$;

create or replace function studyrooms.create_room(
  p_name text, p_topic text, p_visibility text, p_password text, p_focus int default 25, p_break int default 5
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare rid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if coalesce(trim(p_name), '') = '' then raise exception 'Give the room a name'; end if;
  if p_visibility not in ('public', 'private') then raise exception 'Invalid visibility'; end if;
  if p_visibility = 'private' and char_length(coalesce(p_password, '')) < 4 then
    raise exception 'Private rooms need a password of at least 4 characters';
  end if;
  insert into studyrooms.rooms (name, topic, created_by, visibility, focus_minutes, break_minutes, timer_duration_sec)
  values (trim(p_name), nullif(trim(p_topic), ''), auth.uid(), p_visibility, p_focus, p_break, p_focus * 60)
  returning id into rid;
  insert into studyrooms.room_members (room_id, user_id) values (rid, auth.uid());
  if p_visibility = 'private' then
    insert into studyrooms.room_secrets (room_id, password_hash) values (rid, extensions.crypt(p_password, extensions.gen_salt('bf')));
  end if;
  return rid;
end;
$$;

-- Returns 'ok', 'wrong' or 'locked' (too many wrong attempts in 10 minutes).
create or replace function studyrooms.join_room(p_room uuid, p_password text)
returns text
language plpgsql security definer set search_path = ''
as $$
declare h text; fails int;
begin
  if auth.uid() is null then raise exception 'Sign in first'; end if;
  if studyrooms.can_access(p_room) then
    insert into studyrooms.room_members (room_id, user_id) values (p_room, auth.uid()) on conflict do nothing;
    return 'ok';
  end if;
  select count(*) into fails from studyrooms.join_attempts
  where room_id = p_room and user_id = auth.uid() and at > now() - interval '10 minutes';
  if fails >= 8 then return 'locked'; end if;
  select password_hash into h from studyrooms.room_secrets where room_id = p_room;
  if h is not null and h = extensions.crypt(coalesce(p_password, ''), h) then
    insert into studyrooms.room_members (room_id, user_id) values (p_room, auth.uid()) on conflict do nothing;
    return 'ok';
  end if;
  insert into studyrooms.join_attempts (room_id, user_id) values (p_room, auth.uid());
  return 'wrong';
end;
$$;

revoke all on function studyrooms.create_room(text, text, text, text, int, int) from public, anon;
revoke all on function studyrooms.join_room(uuid, text) from public, anon;
grant execute on function studyrooms.create_room(text, text, text, text, int, int) to authenticated;
grant execute on function studyrooms.join_room(uuid, text) to authenticated;
grant execute on function studyrooms.can_access(uuid) to authenticated;

-- Messages: voice notes and files
alter table studyrooms.messages
  add column if not exists kind text not null default 'text' check (kind in ('text', 'voice', 'file')),
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text,
  add column if not exists attachment_size int,
  add column if not exists duration_sec int;
alter table studyrooms.messages drop constraint if exists messages_body_check;
alter table studyrooms.messages add constraint messages_body_check
  check (char_length(body) <= 1000 and (kind <> 'text' or char_length(body) >= 1));

-- Tighten policies to room access
drop policy if exists "read messages" on studyrooms.messages;
drop policy if exists "post as yourself" on studyrooms.messages;
create policy "read messages" on studyrooms.messages for select to authenticated using (studyrooms.can_access(room_id));
create policy "post as yourself" on studyrooms.messages for insert to authenticated
  with check (user_id = auth.uid() and studyrooms.can_access(room_id));

drop policy if exists "control timer" on studyrooms.rooms;
create policy "control timer" on studyrooms.rooms for update to authenticated
  using (studyrooms.can_access(id)) with check (studyrooms.can_access(id));
-- Rooms are created through create_room() so private rooms always get a password.
drop policy if exists "create rooms" on studyrooms.rooms;

-- Private storage for voice notes and files: room-files/<room_id>/<user_id>/<file>
insert into storage.buckets (id, name, public, file_size_limit)
values ('room-files', 'room-files', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = 10485760;

drop policy if exists "room members read room files" on storage.objects;
create policy "room members read room files" on storage.objects for select to authenticated
  using (bucket_id = 'room-files' and studyrooms.can_access(((storage.foldername(name))[1])::uuid));

drop policy if exists "room members upload own files" on storage.objects;
create policy "room members upload own files" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'room-files'
    and (storage.foldername(name))[2] = auth.uid()::text
    and studyrooms.can_access(((storage.foldername(name))[1])::uuid)
  );

grant all on all tables in schema studyrooms to anon, authenticated, service_role;
grant all on all sequences in schema studyrooms to anon, authenticated, service_role;
