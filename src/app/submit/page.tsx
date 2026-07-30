import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { AuthBadge } from "@/components/auth-badge";
import { GithubIcon } from "@/components/github-icon";
import { PetSubmitForm } from "@/components/pet-submit-form";

export const metadata = {
  title: "Submit a pet - Petdex",
  description: "Upload and validate a Codex pet package for Petdex.",
};

export default function SubmitPage() {
  return (
    <main className="petdex-cloud relative min-h-screen overflow-hidden bg-[#f7f8ff]">
      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 md:px-8 md:py-12">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-black backdrop-blur transition hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            Back to gallery
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/crafter-station/petdex"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium text-black backdrop-blur transition hover:bg-white"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
            <AuthBadge />
          </div>
        </div>

        <header className="max-w-3xl">
          <p className="text-sm font-medium text-[#6478f6]">Submit</p>
          <h1 className="mt-4 text-5xl leading-tight font-medium tracking-normal text-black md:text-7xl">
            Add your pet to Petdex
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#33333a]">
            Share a Codex-compatible animated pet package. Petdex checks the
            files locally, previews the sprite, and prepares the submission.
          </p>
        </header>

        <PetSubmitForm />
      </section>
    </main>
  );
}
