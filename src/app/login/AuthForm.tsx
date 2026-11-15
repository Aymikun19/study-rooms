"use client";

import { useActionState, useState } from "react";
import { authenticate, type AuthState } from "./actions";

export function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [state, action, pending] = useActionState(authenticate, {} as AuthState);
  return (
    <form action={action} className="card grid w-full max-w-sm gap-4 p-8">
      <h1 className="text-2xl font-semibold">{mode === "signin" ? "Welcome back" : "Create an account"}</h1>
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <label className="field">
          <span>Full name</span>
          <input name="full_name" required />
        </label>
      )}
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.info && <p className="text-sm text-emerald-700">{state.info}</p>}
      <button className="btn" disabled={pending}>
        {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
      </button>
      <button type="button" className="text-sm text-neutral-500 hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
        {mode === "signin" ? "No account? Sign up" : "Have an account? Sign in"}
      </button>
    </form>
  );
}
