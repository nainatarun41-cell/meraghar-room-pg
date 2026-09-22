"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRequirement } from "@/lib/actions/requirement";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { PROPERTY_TYPE_LABELS, PROPERTY_TYPES } from "@/lib/constants";

export function RequirementForm({
  cities,
  localities,
  initialType = "",
  initialPurpose = "rent",
}: {
  cities: string[];
  localities: { city: string; locality: string }[];
  initialType?: string;
  initialPurpose?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [propertyType, setPropertyType] = useState(initialType);
  const [purpose, setPurpose] = useState(initialPurpose);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [bhk, setBhk] = useState("");
  const [description, setDescription] = useState("");
  const [contactPreference, setContactPreference] = useState("both");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const availableLocalities =
    localities.find((l) => l.city === city)?.locality
      ? localities.filter((l) => l.city === city).map((l) => l.locality)
      : [];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!city.trim()) return setError("Please select a city.");
    startTransition(async () => {
      const title = `${purpose === "sale" ? "Looking to buy" : "Looking for"} ${propertyType || "a property"}${
        locality ? ` in ${locality}, ${city}` : ` in ${city}`
      }`;
      const result = await createRequirement({
        title,
        city: city.trim(),
        locality: locality.trim(),
        property_type: propertyType,
        purpose,
        budget_min: budgetMin || undefined,
        budget_max: budgetMax || undefined,
        bhk: bhk || undefined,
        description: description.trim(),
        contact_preference: contactPreference,
      });
      if (result.ok) {
        toast("Requirement posted!", "success");
        router.replace("/requirements");
        router.refresh();
      } else {
        setError(result.error ?? "Could not post requirement.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="City">
          <Select value={city} onChange={(e) => { setCity(e.target.value); setLocality(""); }}>
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Locality">
          <Select value={locality} onChange={(e) => setLocality(e.target.value)}>
            <option value="">Any locality</option>
            {availableLocalities.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </Field>

        <Field label="Property type">
          <Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">Any type</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
            ))}
          </Select>
        </Field>

        <Field label="Purpose">
          <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option value="rent">Rent</option>
            <option value="sale">Buy</option>
          </Select>
        </Field>

        <Field label="Budget min (₹)">
          <Input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 5000" inputMode="numeric" />
        </Field>

        <Field label="Budget max (₹)">
          <Input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 20000" inputMode="numeric" />
        </Field>

        <Field label="BHK (if applicable)">
          <Input value={bhk} onChange={(e) => setBhk(e.target.value)} placeholder="e.g. 2" />
        </Field>

        <Field label="Preferred contact">
          <Select value={contactPreference} onChange={(e) => setContactPreference(e.target.value)}>
            <option value="both">Call + WhatsApp</option>
            <option value="call">Call only</option>
            <option value="whatsapp">WhatsApp only</option>
          </Select>
        </Field>
      </div>

      <Field label="What are you looking for?">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Example: Need a 2 BHK house for family in Kaithal, near bus stand, with parking."
        />
      </Field>

      <Button type="submit" loading={pending}>
        Post requirement
      </Button>
    </form>
  );
}