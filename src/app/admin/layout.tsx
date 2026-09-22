import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { fetchOpenRequirementCount } from "@/lib/admin-queries";
import { Container } from "@/components/ui";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/leads", label: "Contact Leads" },
  { href: "/admin/requirements", label: "Requirements" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/localities", label: "Localities" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/admin");
  if (user.profile?.role !== "admin") redirect("/?error=admin");

  const openRequirements = await fetchOpenRequirementCount();

  return (
    <Container className="py-8">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-teal-600" />
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Admin</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="inline-flex items-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {n.label}
              {n.href === "/admin/requirements" && openRequirements > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-bold text-white">
                  {openRequirements}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}