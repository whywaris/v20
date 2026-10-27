"use client";

import Link from "next/link";
import { useActionState } from "react";
import { compact } from "@/lib/format";
import { checkChannel } from "./actions";

export function Checker() {
  const [state, action, pending] = useActionState(checkChannel, null);
  const r = state?.result;
  return (
    <div className="space-y-4">
      <form action={action} className="flex flex-wrap gap-3">
        <input name="channel" required defaultValue={state?.input} placeholder="youtube.com/@channel or @handle" aria-label="Channel link"
          className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2" />
        <button disabled={pending} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">
          {pending ? "Checking…" : "Check stats"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {r && (
        <div className="rounded-lg border p-5" aria-live="polite">
          <div className="flex items-center gap-3">
            {r.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.avatar} alt="" width={48} height={48} className="size-12 rounded-full" />
            )}
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-neutral-500">{r.handle}{r.country && ` · ${r.country}`} · since {r.created}</p>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 text-sm">
            <div><dt className="text-neutral-500">Subscribers</dt><dd className="text-xl font-semibold">{r.subscribers != null ? compact(r.subscribers) : "Hidden"}</dd></div>
            <div><dt className="text-neutral-500">Views</dt><dd className="text-xl font-semibold">{compact(r.views)}</dd></div>
            <div><dt className="text-neutral-500">Videos</dt><dd className="text-xl font-semibold">{compact(r.videos)}</dd></div>
          </dl>
          <p className="mt-4 text-sm">
            {r.trackedHandle
              ? <Link href={`/channel/${r.trackedHandle}`} className="underline">See growth, offers and analysis for this channel →</Link>
              : "We don't track this channel yet. We've added it to our review queue."}
          </p>
        </div>
      )}
    </div>
  );
}
