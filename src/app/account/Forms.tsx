"use client";

import { Check, KeyRound, UserRound } from "lucide-react";
import { useActionState } from "react";
import { PasswordInput } from "@/components/kit/PasswordInput";
import { updateName, updatePassword, type AccountState } from "./actions";

function Result({ s }: { s: AccountState }) {
  if (s.error) return <p role="alert" className="text-sm text-red-600">{s.error}</p>;
  if (s.ok) return <p role="status" className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><Check size={15} aria-hidden /> {s.ok}</p>;
  return null;
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, {} as AccountState);
  return (
    <form action={action} className="card grid gap-4 p-6">
      <h2 className="flex items-center gap-2 font-semibold"><UserRound size={17} className="text-accent" aria-hidden /> Your name</h2>
      <label className="field"><span>Display name</span><input name="full_name" defaultValue={name} required minLength={2} maxLength={60} autoComplete="name" /></label>
      <div className="flex items-center gap-3"><button className="btn" disabled={pending}>{pending ? "Saving…" : "Save name"}</button><Result s={state} /></div>
    </form>
  );
}

export function PasswordForm({ highlight }: { highlight?: boolean }) {
  const [state, action, pending] = useActionState(updatePassword, {} as AccountState);
  return (
    <form action={action} className={`card grid gap-4 p-6 ${highlight ? "ring-2 ring-accent" : ""}`}>
      <h2 className="flex items-center gap-2 font-semibold"><KeyRound size={17} className="text-accent" aria-hidden /> {highlight ? "Set a new password" : "Change password"}</h2>
      <label className="field"><span>New password</span><PasswordInput name="password" required minLength={8} autoComplete="new-password" /></label>
      <label className="field"><span>Confirm new password</span><PasswordInput name="confirm" required minLength={8} autoComplete="new-password" /></label>
      <div className="flex items-center gap-3"><button className="btn" disabled={pending}>{pending ? "Saving…" : "Update password"}</button><Result s={state} /></div>
    </form>
  );
}
