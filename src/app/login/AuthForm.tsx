"use client";

import { useActionState, useState } from "react";
import { PasswordInput } from "@/components/kit/PasswordInput";
import { authenticate, type AuthState } from "./actions";

export function AuthForm({ next, initialMode = "signin" }: { next: string; initialMode?: "signin" | "signup" }) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [state, action, pending] = useActionState(authenticate, {} as AuthState);
  return (
    <form action={action} className="grid w-full max-w-sm gap-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-1 text-sm text-stone-500">{mode === "signin" ? "Sign in to pick up where you left off." : "It takes less than a minute."}</p>
      </div>
      <div role="tablist" aria-label="Sign in or sign up" className="grid grid-cols-2 rounded-xl bg-stone-100 p-1 text-sm font-medium">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-lg py-2 transition ${mode === m ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <label className="field">
          <span>Full name</span>
          <input name="full_name" required autoComplete="name" />
        </label>
      )}
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
      </label>
      <label className="field">
        <span>Password</span>
        <PasswordInput name="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
        {mode === "signup" && <small className="text-xs text-stone-500">At least 6 characters.</small>}
      </label>
      {state.error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state.info && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.info}</p>}
      <button className="btn !py-3" disabled={pending}>
        {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
