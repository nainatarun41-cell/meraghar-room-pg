interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Safely renders a JSON-LD structured-data script (scrubs `<` for XSS safety). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}