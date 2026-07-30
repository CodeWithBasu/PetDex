"use client";

import { useEffect, useState } from "react";

import {
  Check,
  Clock,
  ExternalLink,
  Loader2,
  Mail,
  Slash,
  X,
} from "lucide-react";

import { petStates } from "@/lib/pet-states";

import type { SubmittedPet } from "@/lib/db/schema";

type AdminReviewRowProps = {
  pet: SubmittedPet;
  stateCount: number;
};

export function AdminReviewRow({ pet, stateCount }: AdminReviewRowProps) {
  const [status, setStatus] = useState(pet.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "approve" | "reject") {
    if (busy) return;
    setBusy(true);
    setError(null);

    let reason: string | null = null;
    if (action === "reject") {
      reason = window.prompt("Reason for rejection (optional)") ?? "";
    }

    const res = await fetch(`/api/admin/${pet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? `Request failed (${res.status})`);
      setBusy(false);
      return;
    }

    setStatus(action === "approve" ? "approved" : "rejected");
    setBusy(false);
  }

  return (
    <article className="grid gap-4 rounded-2xl border border-black/10 bg-white/76 p-4 backdrop-blur md:grid-cols-[160px_1fr_auto] md:items-center">
      <SpritePreview src={pet.spritesheetUrl} />

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-semibold text-stone-950">
            {pet.displayName}
          </h3>
          <span className="font-mono text-[10px] tracking-[0.18em] text-stone-400 uppercase">
            /{pet.slug}
          </span>
          <StatusBadge status={status} />
        </div>
        <p className="line-clamp-2 text-sm text-stone-600">{pet.description}</p>
        <div className="flex flex-wrap gap-3 font-mono text-[10px] tracking-[0.12em] text-stone-500 uppercase">
          {pet.ownerEmail ? (
            <span className="inline-flex items-center gap-1">
              <Mail className="size-3" />
              {pet.ownerEmail}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {new Date(pet.createdAt).toLocaleString()}
          </span>
          <span>{stateCount} states</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <a
            href={pet.zipUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-stone-700 underline underline-offset-4 hover:text-black"
          >
            <ExternalLink className="size-3" />
            zip
          </a>
          <a
            href={pet.spritesheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-stone-700 underline underline-offset-4 hover:text-black"
          >
            <ExternalLink className="size-3" />
            sprite
          </a>
          <a
            href={pet.petJsonUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-stone-700 underline underline-offset-4 hover:text-black"
          >
            <ExternalLink className="size-3" />
            pet.json
          </a>
        </div>
        {error ? (
          <p className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-900">
            {error}
          </p>
        ) : null}
      </div>

      {status === "pending" ? (
        <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-stretch">
          <button
            type="button"
            onClick={() => void decide("approve")}
            disabled={busy}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            Approve
          </button>
          <button
            type="button"
            onClick={() => void decide("reject")}
            disabled={busy}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 text-xs font-medium text-stone-700 transition hover:border-rose-400 hover:text-rose-700 disabled:opacity-60"
          >
            <X className="size-3.5" />
            Reject
          </button>
        </div>
      ) : null}
    </article>
  );
}

function StatusBadge({ status }: { status: SubmittedPet["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] text-amber-900 uppercase">
        <Clock className="size-3" />
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] text-emerald-900 uppercase">
        <Check className="size-3" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-mono text-[10px] tracking-[0.15em] text-rose-900 uppercase">
      <Slash className="size-3" />
      Rejected
    </span>
  );
}

function SpritePreview({ src }: { src: string }) {
  const [index, setIndex] = useState(0);
  const animation = petStates[index];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % petStates.length);
    }, 1500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="w-fit rounded-2xl border border-black/10 bg-[#f7f8ff] p-3">
      <div
        className="pet-sprite-frame"
        role="img"
        aria-label="pet animation"
        style={{ "--pet-scale": 0.42 } as React.CSSProperties}
      >
        <div
          className="pet-sprite"
          style={
            {
              "--sprite-url": `url(${src})`,
              "--sprite-row": animation.row,
              "--sprite-frames": animation.frames,
              "--sprite-duration": `${animation.durationMs}ms`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
