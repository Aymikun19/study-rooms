import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { brand } from "@/lib/brand";
import { SITE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { SiteFooter, SiteHeader } from "@/components/kit/SiteHeader";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${brand.name}: ${brand.short}`, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: { title: brand.name, description: brand.description, siteName: brand.name, type: "website" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SiteHeader email={user?.email} />
        <main className={`mx-auto w-full flex-1 px-4 py-8 ${brand.width}`}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
