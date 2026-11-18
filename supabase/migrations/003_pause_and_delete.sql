-- 003: pausing focus (the break runs while focus is paused) and deleting rooms.

alter table studyrooms.rooms
  add column if not exists focus_remaining_sec int check (focus_remaining_sec is null or focus_remaining_sec > 0);

-- Only the person who created a room can delete it. Messages and memberships go with it (on delete cascade).
drop policy if exists "creators delete rooms" on studyrooms.rooms;
create policy "creators delete rooms" on studyrooms.rooms for delete to authenticated using (created_by = auth.uid());

-- The room creator can remove every file in the room; anyone can remove files they uploaded themselves.
drop policy if exists "remove room files" on storage.objects;
create policy "remove room files" on storage.objects for delete to authenticated
  using (
    bucket_id = 'room-files'
    and (
      (storage.foldername(name))[2] = auth.uid()::text
      or exists (select 1 from studyrooms.rooms r where r.id = ((storage.foldername(name))[1])::uuid and r.created_by = auth.uid())
    )
  );

-- Let open rooms hear about deletions so everyone inside is sent back to the lobby.
alter table studyrooms.rooms replica identity full;
