import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { fetchOpenRequirementCount } from "@/lib/admin-queries";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: {
    default: "MeraGhar Admin Panel",
    template: "%s | MeraGhar Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/admin");
  if (user.profile?.role !== "admin") redirect("/?error=admin");

  const openRequirements = await fetchOpenRequirementCount();

  return (
    <AdminShell openRequirements={openRequirements}>{children}</AdminShell>
  );
}