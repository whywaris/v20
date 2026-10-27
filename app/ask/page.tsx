import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { AskForm } from "./ask-form";

export const metadata: Metadata = { title: "Ask the library", robots: { index: false } };

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const v = await getViewer();
  if (!v.user) redirect(`/login?next=${encodeURIComponent(`/ask${q ? `?q=${encodeURIComponent(q)}` : ""}`)}`);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-3xl font-bold">Ask the library</h1>
        <p className="mt-2 text-neutral-500">
          Questions about niches, personas and offers, answered from our channel data. {v.isPro ? "50" : "3"} questions a day.
        </p>
      </header>
      <AskForm initial={q.slice(0, 500)} />
    </main>
  );
}
