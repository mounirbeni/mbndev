interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Renders a JSON-LD <script> tag for structured data. Server component. */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled JSON-LD data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
