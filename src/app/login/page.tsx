import { AuthForm } from "./AuthForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-[80vh] place-items-center px-4">
      <AuthForm next={next ?? "/"} />
    </main>
  );
}
