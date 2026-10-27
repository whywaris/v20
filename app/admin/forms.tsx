"use client";

import { useActionState } from "react";
import { addChannels, addNiche, runAnalysis, runSync } from "./actions";

type Niche = { id: number; name: string };

const input = "w-full rounded-md border bg-transparent px-3 py-2 text-sm";
const button = "rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900";

export function AddChannelsForm({ niches }: { niches: Niche[] }) {
  const [state, action, pending] = useActionState(addChannels, null);
  return (
    <form action={action} className="space-y-3">
      <textarea name="channels" rows={6} required className={input}
        placeholder={"One per line, up to 500:\nhttps://www.youtube.com/@handle\n@handle\nUCxxxxxxxxxxxxxxxxxxxxxx"} />
      <select name="niche_id" className={input} defaultValue="">
        <option value="">No niche</option>
        {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
      </select>
      <button className={button} disabled={pending}>{pending ? "Adding…" : "Add channels"}</button>
      {state && <p className="text-sm text-neutral-500">{state.message}</p>}
    </form>
  );
}

export function AddNicheForm({ niches }: { niches: Niche[] }) {
  const [state, action, pending] = useActionState(addNiche, null);
  return (
    <form action={action} className="space-y-3">
      <input name="name" required placeholder="Niche name, e.g. Ancient Egypt" className={input} />
      <select name="parent_id" className={input} defaultValue="">
        <option value="">No parent niche</option>
        {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
      </select>
      <input name="description" placeholder="Short description (optional)" className={input} />
      <button className={button} disabled={pending}>{pending ? "Saving…" : "Add niche"}</button>
      {state && <p className="text-sm text-neutral-500">{state.message}</p>}
    </form>
  );
}

export function AnalyzeForm() {
  const [state, action, pending] = useActionState(runAnalysis, null);
  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input name="handle" placeholder="@handle (empty = next batch)" className={`${input} max-w-xs`} />
      <button className={button} disabled={pending}>{pending ? "Analyzing…" : "Run AI analysis"}</button>
      {state && <p className="w-full text-sm text-neutral-500">{state.message}</p>}
    </form>
  );
}

export function SyncButton() {
  const [state, action, pending] = useActionState(runSync, null);
  return (
    <form action={action} className="flex items-center gap-3">
      <button className={button} disabled={pending}>{pending ? "Syncing…" : "Sync all now"}</button>
      {state && <p className="text-sm text-neutral-500">{state.message}</p>}
    </form>
  );
}
