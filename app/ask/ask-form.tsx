"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ask } from "./actions";

const EXAMPLES = [
  "Which faceless channels sell an ebook, and at what price?",
  "Fastest growing history channels under 100K subscribers",
  "AI avatar channels for seniors that make money from products",
];

export function AskForm({ initial }: { initial: string }) {
  const [state, action, pending] = useActionState(ask, null);
  const a = state?.answer;

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-3">
        <textarea name="q" required minLength={5} maxLength={500} rows={3} defaultValue={state?.question ?? initial}
          placeholder="Ask about niches, personas, offers…" aria-label="Your question"
          className="w-full rounded-md border bg-transparent px-3 py-2" />
        <div className="flex flex-wrap items-center gap-3">
          <button disabled={pending} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900">
            {pending ? "Thinking…" : "Ask"}
          </button>
          {state?.remaining != null && <span className="text-sm text-neutral-500">{state.remaining} questions left today</span>}
        </div>
      </form>

      {!state && (
        <ul className="space-y-1 text-sm text-neutral-500">
          <li className="font-medium">Try:</li>
          {EXAMPLES.map((e) => <li key={e}>“{e}”</li>)}
        </ul>
      )}

      {state?.error && (
        <p className="rounded-md border border-red-300 p-3 text-sm text-red-700 dark:text-red-400">
          {state.error} {state.error.includes("Pro") && <Link href="/pricing" className="underline">See Pro</Link>}
        </p>
      )}

      {a && (
        <article className="space-y-5" aria-live="polite">
          <div className="space-y-3">{a.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
          {a.channels.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold">Channels to look at</h2>
              <ul className="space-y-2">
                {a.channels.map((c) => (
                  <li key={c.handle} className="rounded-md border p-3 text-sm">
                    <Link href={`/channel/${c.handle}`} className="font-medium underline">{c.title}</Link>
                    <p className="text-neutral-600 dark:text-neutral-400">{c.why}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {a.next_steps.length > 0 && (
            <section>
              <h2 className="mb-2 font-semibold">Next steps</h2>
              <ol className="list-decimal space-y-1 pl-5 text-sm">{a.next_steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </section>
          )}
          <p className="text-xs text-neutral-500">AI answer based only on channels in this library. Check the channel pages before acting on it.</p>
        </article>
      )}
    </div>
  );
}
