import { JsonLd } from "@/components/channel-card";

// Visible FAQ + matching FAQPage JSON-LD, so the structured data always mirrors the page.
export function Faq({ items }: { items: [string, string][] }) {
  return (
    <section>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }} />
      <h2 className="mb-3 text-xl font-semibold">FAQ</h2>
      <dl className="space-y-4">
        {items.map(([q, a]) => <div key={q}><dt className="font-medium">{q}</dt><dd className="text-neutral-600 dark:text-neutral-400">{a}</dd></div>)}
      </dl>
    </section>
  );
}

export const toolJsonLd = (name: string, url: string, description: string) => ({
  "@context": "https://schema.org", "@type": "WebApplication", name, url, description,
  applicationCategory: "BusinessApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
});
