import type { Metadata } from "next";
import { JsonLd } from "@/components/channel-card";
import { Faq, toolJsonLd } from "@/components/faq";
import { SITE } from "@/lib/seo";
import { Checker } from "./checker";

const DESCRIPTION = "Check any YouTube channel's subscribers, total views, video count and age. Free, live from YouTube.";
export const metadata: Metadata = { title: "YouTube Channel Stats Checker", description: DESCRIPTION, alternates: { canonical: "/tools/channel-stats-checker" } };

export default function ChannelStatsCheckerPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <JsonLd data={toolJsonLd("YouTube Channel Stats Checker", `${SITE}/tools/channel-stats-checker`, DESCRIPTION)} />
      <header>
        <h1 className="text-3xl font-bold">YouTube channel stats checker</h1>
        <p className="mt-2 text-neutral-500">{DESCRIPTION}</p>
      </header>
      <Checker />
      <Faq items={[
        ["Where do the numbers come from?", "Straight from the official YouTube Data API at the moment you check."],
        ["Why are subscribers rounded?", "YouTube only shares rounded subscriber counts (for example 1.23M) with outside tools."],
        ["Can I see growth over time?", "For channels in our library, yes: their page shows daily growth, what they sell and an analysis of why they work."],
      ]} />
    </main>
  );
}
