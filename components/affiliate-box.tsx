import { createClient } from "@/lib/supabase/server";

// "Tools to build a channel like this": active affiliate_tools whose tags fit the channel.
export async function AffiliateBox({ isAiAvatar, isFaceless }: { isAiAvatar: boolean; isFaceless: boolean }) {
  const tags = ["all", ...(isAiAvatar ? ["ai_avatar"] : []), ...(isFaceless ? ["faceless"] : [])];
  const supabase = await createClient();
  const { data: tools } = await supabase.from("affiliate_tools").select("id, name, url, blurb").overlaps("tags", tags).limit(4);
  if (!tools?.length) return null;
  return (
    <section className="rounded-lg border p-5">
      <h2 className="text-lg font-semibold">Tools to build a channel like this</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <li key={t.id}>
            <a href={t.url} target="_blank" rel="sponsored nofollow noopener" className="font-medium underline">{t.name}</a>
            {t.blurb && <p className="text-sm text-neutral-500">{t.blurb}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-neutral-500">Some links are affiliate links: we may earn a commission at no extra cost to you.</p>
    </section>
  );
}
