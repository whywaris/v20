import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JsonLd } from "@/components/channel-card";
import { Faq, toolJsonLd } from "@/components/faq";
import { MoneyCalculator, type RpmNiche } from "@/components/money-calculator";
import { SITE } from "@/lib/seo";

const DESCRIPTION = "Estimate how much a YouTube channel earns from ads. Enter daily views and pick a niche to see daily, monthly and yearly earnings.";
export const metadata: Metadata = { title: "YouTube Money Calculator by Niche", description: DESCRIPTION, alternates: { canonical: "/tools/youtube-money-calculator" } };

export default async function MoneyCalculatorPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("niches").select("slug, name, rpm_low, rpm_high").not("rpm_low", "is", null).order("rpm_high", { ascending: false });
  const niches = (data ?? []).map((n) => ({ ...n, rpm_low: Number(n.rpm_low), rpm_high: Number(n.rpm_high) })) as RpmNiche[];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <JsonLd data={toolJsonLd("YouTube Money Calculator", `${SITE}/tools/youtube-money-calculator`, DESCRIPTION)} />
      <header>
        <h1 className="text-3xl font-bold">YouTube money calculator</h1>
        <p className="mt-2 text-neutral-500">{DESCRIPTION}</p>
      </header>
      <MoneyCalculator niches={niches} />

      <section>
        <h2 className="mb-3 text-xl font-semibold">RPM by niche</h2>
        <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {niches.map((n) => (
            <li key={n.slug} className="flex justify-between border-b py-1">
              <Link href={`/youtube-rpm/${n.slug}`} className="hover:underline">{n.name}</Link>
              <span className="text-neutral-500">${n.rpm_low}–${n.rpm_high}</span>
            </li>
          ))}
        </ul>
      </section>

      <Faq items={[
        ["What is RPM on YouTube?", "RPM (revenue per mille) is what a creator earns per 1,000 views after YouTube takes its 45% share. It is lower than CPM, which is what advertisers pay."],
        ["Why do some niches pay more?", "Advertisers pay more to reach viewers who are about to spend money, such as finance, real estate or software buyers. Kids, music and gaming audiences attract cheaper ads."],
        ["Are these numbers exact?", "No. They are typical ranges for long-form videos with mostly US, UK, Canada and Australia viewers. Your real RPM depends on audience country, video length, season and how many ads you allow."],
        ["Do Shorts earn the same?", "No. Shorts revenue is pooled and usually pays a few cents per 1,000 views, so this calculator is for long-form videos."],
      ]} />
    </main>
  );
}
