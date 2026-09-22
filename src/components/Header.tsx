"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileRow } from "@/types";
import { signOut } from "@/lib/actions/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties?purpose=rent", label: "Rent" },
  { href: "/properties?purpose=sale", label: "Buy" },
  { href: "/requirements", label: "Requirements" },
  { href: "/favorites", label: "Favorites" },
  { href: "/help", label: "Help" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
        <Home className="h-5 w-5" />
      </span>
      <span className="text-xl font-extrabold tracking-tight text-slate-900">
        Mera<span className="text-teal-600">Ghar</span>
      </span>
    </Link>
  );
}

export function Header({ profile }: { profile: ProfileRow | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    const [base] = href.split("?");
    return pathname.startsWith(base) && base !== "/";
  };

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                isActive(link.href) && "bg-teal-50 text-teal-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/add-property"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            <PlusCircle className="h-4 w-4" />
            Post Property
          </Link>
          {profile ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
              >
                <UserRound className="h-4 w-4" />
                <span className="max-w-32 truncate">{profile.name || "Your Account"}</span>
              </Link>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100",
                  isActive(link.href) && "bg-teal-50 text-teal-700"
                )}
              >
                {link.label}
              </Link>
            ))}
            {profile && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Your Account
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Admin Panel
              </Link>
            )}
            <Link
              href="/add-property"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Post Property
            </Link>
            {profile ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 text-sm font-medium text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 text-sm font-semibold text-white"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/** Fixed bottom navigation for mobile phones. */
export function MobileBottomNav({ profile }: { profile: ProfileRow | null }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Search", icon: Search },
    { href: "/add-property", label: "Post", icon: PlusCircle },
    { href: "/favorites", label: "Saved", icon: Heart },
    { href: profile ? "/dashboard" : "/login", label: "Account", icon: profile ? LayoutDashboard : LogIn },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-slate-500",
                active && "text-teal-600"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}