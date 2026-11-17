import { Search } from "lucide-react";

export function RoomSearch({ q }: { q: string }) {
  return (
    <form role="search" className="relative">
      <label htmlFor="room-q" className="sr-only">Search rooms</label>
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
      <input id="room-q" name="q" defaultValue={q} placeholder="Search rooms by name or topic" className="input pl-9" />
    </form>
  );
}
