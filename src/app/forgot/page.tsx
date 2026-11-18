"use client";

import { KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { sendReset, type ForgotState } from "./actions";

export default function Forgot() {
  const [state, action, pending] = useActionState(sendReset, {} as ForgotState);
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="card grid w-full max-w-sm gap-5 p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
          {state.sent ? <MailCheck size={22} aria-hidden /> : <KeyRound size={22} aria-hidden />}
        </span>
        {state.sent ? (
          <div role="status">
            <h1 className="text-xl font-semibold">Check your inbox</h1>
            <p className="mt-1 text-sm text-stone-500">If an account uses that email, a link to set a new password is on its way. Open it in this browser.</p>
          </div>
        ) : (
          <form action={action} className="grid gap-4">
            <div>
              <h1 className="text-xl font-semibold">Forgot your password?</h1>
              <p className="mt-1 text-sm text-stone-500">Enter your email and we will send you a link to set a new one.</p>
            </div>
            <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" autoFocus /></label>
            {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
            <button className="btn" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        <Link href="/login" className="text-center text-sm text-stone-500 hover:text-accent">Back to sign in</Link>
      </div>
    </div>
  );
}
