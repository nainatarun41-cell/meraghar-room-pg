import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { Header, MobileBottomNav } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AiChat } from "@/components/ai/AiChat";
import { JsonLd } from "@/components/JsonLd";
import { websiteJsonLd } from "@/lib/locations/structured-data";
import { getPublicEnv } from "@/lib/env";
import { getAuthUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Rent & Sale Properties in Kaithal & Pundri`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Apna Room, Ghar Ya Property Yahan Dhundhiye. Find rooms, PGs, flats and houses for rent and sale in Kaithal aur Pundri, Haryana. Post your property free.",
  keywords: [
    "property in kaithal",
    "property in pundri",
    "room for rent kaithal",
    "flat for sale kaithal",
    "pg pundri",
    "meraghar",
    "haryana real estate",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: `${APP_NAME} - Local Property Marketplace`,
    description:
      "Rent and sell properties in Kaithal & Pundri, Haryana. Search rooms, PGs, flats, houses and more.",
    siteName: APP_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Local Property Marketplace`,
    description: "Rent and sell properties in Kaithal & Pundri, Haryana.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getAuthUser();
  const profile = user?.profile ?? null;
  const siteUrl = getPublicEnv().siteUrl.replace(/\/$/, "");
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
        <ToastProvider>
          {isAdmin ? null : <Header profile={profile} />}
          <main className={`flex-1 ${isAdmin ? "" : "pb-16 md:pb-0"}`}>{children}</main>
          {isAdmin ? null : (
            <>
              <Footer />
              <MobileBottomNav profile={profile} />
              <AiChat />
            </>
          )}
          <JsonLd data={websiteJsonLd(siteUrl, APP_NAME)} />
        </ToastProvider>
      </body>
    </html>
  );
}
