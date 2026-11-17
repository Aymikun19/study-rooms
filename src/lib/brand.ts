import { Bell, ChartNoAxesColumn, MessagesSquare, Timer, UserRoundCheck, Link2 } from "lucide-react";

export const brand = {
  name: "StudyRooms",
  short: "Realtime study rooms",
  eyebrow: "Study together, from anywhere",
  tagline: "Study together, stay focused.",
  description:
    "Create a room for your course, invite your study group and work through shared Pomodoro sessions with live chat and presence.",
  cta: { href: "/login?mode=signup", label: "Open a study room" },
  proof: ["Realtime", "Shared timer", "Free"],
  features: [
    { icon: Timer, title: "Shared Pomodoro timer", text: "Everyone in the room sees the same focus and break countdown, kept in sync live." },
    { icon: MessagesSquare, title: "Live chat", text: "Message the room in real time, with timestamps and typing indicators." },
    { icon: UserRoundCheck, title: "Presence", text: "See who is in the room right now, so you know your group showed up." },
    { icon: Bell, title: "Phase alerts", text: "A sound and a browser notification when focus time ends or a break is over." },
    { icon: ChartNoAxesColumn, title: "Focus stats", text: "Track focus sessions completed today and this week." },
    { icon: Link2, title: "Invite by link", text: "Copy a room's link and drop it in your class group chat." },
  ],
  steps: [
    ["Create a room", "Name it after your course or topic."],
    ["Invite your group", "Share the room link. Everyone who joins shows up live."],
    ["Start the timer", "Focus together for 25 minutes, then take a break together."],
  ] as [string, string][],
  closing: "Exams are easier when you are not studying alone.",
  nav: [{ href: "/", label: "Rooms" }] as { href: string; label: string; public?: boolean }[],
  width: "max-w-6xl",
  repo: "https://github.com/Aymikun19/study-rooms",
  preview: null as string | null,
};
