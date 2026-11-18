"use client";

import { KeyRound, Lock } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { PasswordInput } from "@/components/kit/PasswordInput";
import { joinRoom, type FormState } from "../../actions";

export function JoinRoom({ roomId, name }: { roomId: string; name: string }) {
  const [state, action, pending] = useActionState(joinRoom.bind(null, roomId), {} as FormState);
  return (
    <form action={action} className="card mx-auto mt-8 grid w-full max-w-sm gap-5 p-8">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Lock size={22} aria-hidden /></span>
      <div>
        <h1 className="text-xl font-semibold">{name}</h1>
        <p className="mt-1 text-sm text-stone-500">This is a private room. Enter the password the room owner shared with you.</p>
      </div>
      <label className="field">
        <span>Room password</span>
        <PasswordInput name="password" required autoFocus autoComplete="off" />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button className="btn" disabled={pending}><KeyRound size={16} aria-hidden /> {pending ? "Checking…" : "Enter room"}</button>
      <Link href="/" className="text-center text-sm text-stone-500 hover:text-accent">Back to the lobby</Link>
    </form>
  );
}
