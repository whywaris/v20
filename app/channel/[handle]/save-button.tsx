"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleSave } from "./actions";

export function SaveButton({ channelId, initiallySaved }: { channelId: number; initiallySaved: boolean }) {
  const [state, action, pending] = useActionState(toggleSave, { saved: initiallySaved });
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="channel_id" value={channelId} />
      <button disabled={pending} aria-pressed={state.saved} className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50">
        {state.saved ? "★ Saved" : "☆ Save"}
      </button>
      {state.message && (
        <span className="text-xs text-neutral-500">
          {state.message} {state.message.includes("Pro") && <Link href="/pricing" className="underline">Upgrade</Link>}
        </span>
      )}
    </form>
  );
}
