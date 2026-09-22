import { notFound, redirect } from "next/navigation";
import { fetchPublicProperty } from "@/lib/queries";
import type { AppPageProps } from "@/types";

export const dynamic = "force-dynamic";

export default async function PropertySeoRoute(
  props: AppPageProps<{ id: string; slug: string }>
) {
  const { slug } = await props.params;
  const property = await fetchPublicProperty(slug);
  if (!property) notFound();
  redirect(`/properties/${property.id}`);
}