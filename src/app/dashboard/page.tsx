import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { getAuthUser } from "@/lib/auth";
import { fetchFavoriteProperties, fetchUserProperties, fetchUserRequirements } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | MeraGhar",
  description: "Manage your MeraGhar listings, saved properties and requirements.",
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/dashboard");

  const [properties, favorites, requirements] = await Promise.all([
    fetchUserProperties(user.id),
    fetchFavoriteProperties(user.id),
    fetchUserRequirements(user.id),
  ]);

  const cards = properties.map((p) => ({
    id: p.id,
    title: p.title,
    purpose: p.purpose,
    property_type: p.property_type,
    price: p.price,
    status: p.status,
    created_at: p.created_at,
    is_featured: p.is_featured,
    is_verified: p.is_verified,
    city: p.city,
    locality: p.locality,
    image_url: p.images?.[0]?.image_url ?? null,
    bhk: p.bhk,
    furnishing: p.furnishing,
    rent_period: p.rent_period,
  }));

  return (
    <Container className="py-8">
      <Dashboard
        user={{ id: user.id, name: user.profile?.name ?? "", phone: user.profile?.phone ?? "", email: user.email, avatar_url: user.profile?.avatar_url }}
        properties={cards}
        favorites={favorites}
        requirements={requirements}
      />
    </Container>
  );
}