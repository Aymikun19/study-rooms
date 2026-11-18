import { LogOut, Mail } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { signOutEverywhere } from "./actions";
import { NameForm, PasswordForm } from "./Forms";

export const metadata = { title: "Account" };

export default async function Account({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  const { user } = await requireUser("/account");
  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "";
  const joined = new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-6">
      <div>
        <p className="eyebrow">Account</p>
        <h1 className="page-title mt-1">Settings</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-stone-500"><Mail size={14} aria-hidden /> {user.email} · member since {joined}</p>
      </div>
      {reset && <p role="status" className="card border-accent/30 bg-accent/5 p-4 text-sm">You are signed in from your reset link. Choose a new password below.</p>}
      <PasswordForm highlight={Boolean(reset)} />
      <NameForm name={name} />
      <form action={signOutEverywhere} className="card flex flex-wrap items-center justify-between gap-3 p-6">
        <div>
          <h2 className="font-semibold">Sign out everywhere</h2>
          <p className="text-sm text-stone-500">Ends your sessions on every device and in every app that shares this account.</p>
        </div>
        <button className="btn-outline"><LogOut size={15} aria-hidden /> Sign out everywhere</button>
      </form>
    </div>
  );
}
