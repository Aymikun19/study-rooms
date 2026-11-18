import { Bell, Lock, MessagesSquare, Paperclip, Timer, UserRoundCheck } from "lucide-react";

export const brand = {
  name: "StudyRooms",
  short: "Realtime study rooms",
  eyebrow: "Study together, from anywhere",
  tagline: "Study together, stay focused.",
  description:
    "Create a room for your course, invite your study group and work through shared Pomodoro sessions with live chat and presence.",
  cta: { href: "/login?mode=signup", label: "Open a study room" },
  proof: ["Public or private rooms", "Voice notes and files", "Free"],
  features: [
    { icon: Timer, title: "Adjustable shared timer", text: "Set focus and break lengths like an alarm clock. Everyone in the room sees the same countdown." },
    { icon: MessagesSquare, title: "Chat with voice notes", text: "Type, or hold a quick voice note. Timestamps and typing indicators keep it feeling live." },
    { icon: Lock, title: "Private rooms", text: "Lock a room with a password so only your study group can get in." },
    { icon: Paperclip, title: "Share files", text: "Drop slides, past questions and photos of your notes into the room, up to 10 MB each." },
    { icon: UserRoundCheck, title: "Presence", text: "See who is in the room right now, so you know your group showed up." },
    { icon: Bell, title: "Phase alerts", text: "A sound and a browser notification when focus time ends or a break is over." },
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
  preview: "/preview.webp" as string | null,
};
