import { Home } from "lucide-react";
import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-teal-700">
        <Home className="h-7 w-7" />
        MeraGhar
      </Link>
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}