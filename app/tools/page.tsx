import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free YouTube Tools",
  description: "Free YouTube tools: money calculator by niche, niche finder and channel stats checker.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">Free YouTube tools</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block h-full rounded-lg border p-5 hover:border-neutral-400">
              <h2 className="font-semibold">{t.name}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
