import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";

import { isAdmin } from "@/lib/admin";
import { listAllSubmittedPets } from "@/lib/db/queries";
import { petStates } from "@/lib/pet-states";

import { AdminReviewRow } from "@/components/admin-review-row";

export const metadata = {
  title: "Petdex — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!isAdmin(userId)) {
    notFound();
  }

  const pets = await listAllSubmittedPets();
  const pending = pets.filter((p) => p.status === "pending");
  const approved = pets.filter((p) => p.status === "approved");
  const rejected = pets.filter((p) => p.status === "rejected");

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-[#050505]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 md:px-8 md:py-12">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-black backdrop-blur transition hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            Back to gallery
          </Link>
          <span className="font-mono text-[10px] tracking-[0.22em] text-stone-500 uppercase">
            Admin · {pets.length} total
          </span>
        </div>

        <header>
          <p className="font-mono text-xs tracking-[0.22em] text-[#5266ea] uppercase">
            Submission Queue
          </p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight md:text-6xl">
            Review pets
          </h1>
          <p className="mt-3 text-sm text-stone-600">
            {pending.length} pending · {approved.length} approved ·{" "}
            {rejected.length} rejected
          </p>
        </header>

        <Section title="Pending" count={pending.length}>
          {pending.length === 0 ? (
            <Empty>No pets waiting for review.</Empty>
          ) : (
            pending.map((pet) => (
              <AdminReviewRow
                key={pet.id}
                pet={pet}
                stateCount={petStates.length}
              />
            ))
          )}
        </Section>

        {approved.length > 0 ? (
          <Section title="Approved" count={approved.length}>
            {approved.map((pet) => (
              <AdminReviewRow
                key={pet.id}
                pet={pet}
                stateCount={petStates.length}
              />
            ))}
          </Section>
        ) : null}

        {rejected.length > 0 ? (
          <Section title="Rejected" count={rejected.length}>
            {rejected.map((pet) => (
              <AdminReviewRow
                key={pet.id}
                pet={pet}
                stateCount={petStates.length}
              />
            ))}
          </Section>
        ) : null}
      </section>
    </main>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[10px] tracking-[0.22em] text-stone-500 uppercase">
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 p-6 text-center text-sm text-stone-600">
      {children}
    </div>
  );
}
