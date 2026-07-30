import Link from "next/link";

import { Download } from "lucide-react";

import { getAllPetsPackPath } from "@/lib/downloads";
import { petStates } from "@/lib/pet-states";
import { getPets } from "@/lib/pets";

import { AuthBadge } from "@/components/auth-badge";
import { GithubIcon } from "@/components/github-icon";
import { PetGallery } from "@/components/pet-gallery";
import { PetSprite } from "@/components/pet-sprite";
import { PetdexLogo } from "@/components/petdex-logo";
import { TrackOnClick } from "@/components/track-on-click";

export default function Home() {
  const pets = getPets();
  const featured = pets.filter((pet) => pet.featured);
  const heroPets = (featured.length > 0 ? featured : pets).slice(0, 6);

  return (
    <main className="min-h-screen bg-[#f7f8ff] text-[#050505]">
      <section className="petdex-cloud relative overflow-hidden">
        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 pt-5 pb-10 md:px-8">
          <nav className="flex items-center justify-between gap-4">
            <PetdexLogo href="/" />
            <div className="hidden items-center gap-9 text-sm text-[#4f515c] md:flex">
              <a href="#gallery">Gallery</a>
              <Link href="/submit">Submit</Link>
              <a href="/packs/manifest.json">Manifest</a>
              <a
                href="https://github.com/crafter-station/petdex"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition hover:text-black"
              >
                <GithubIcon className="size-4" />
                GitHub
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/submit"
                className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white transition hover:bg-black/85"
              >
                Submit a pet
              </Link>
              <AuthBadge />
            </div>
          </nav>

          <div className="mt-12 flex flex-col items-center text-center md:mt-16">
            <p className="font-mono text-xs tracking-[0.22em] text-[#5266ea] uppercase">
              The Codex pet index
            </p>
            <h1 className="mt-3 text-[48px] leading-[0.98] font-semibold tracking-tight md:text-[80px]">
              Petdex
            </h1>
            <p className="mt-5 max-w-xl text-balance text-base leading-7 text-[#202127] md:text-lg">
              A public gallery of animated pets for Codex.{" "}
              <span className="text-stone-500">
                {petStates.length} states each. Drop in, animate, ship.
              </span>
            </p>
          </div>

          <HeroPetParade pets={heroPets} />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <TrackOnClick
              event="pack_downloaded"
              payload={{ scope: "all" }}
              href={getAllPetsPackPath()}
              download
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
            >
              <Download className="size-4" />
              Download all pets
            </TrackOnClick>
            <Link
              href="#gallery"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-6 text-sm font-medium text-black backdrop-blur transition hover:bg-white"
            >
              Browse gallery
            </Link>
          </div>
        </div>
      </section>

      <section
        id="gallery"
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-12 md:px-8 md:py-16"
      >
        {pets.length > 0 ? <PetGallery pets={pets} /> : null}
      </section>
    </main>
  );
}

type HeroPetParadeProps = {
  pets: ReturnType<typeof getPets>;
};

function HeroPetParade({ pets }: HeroPetParadeProps) {
  if (pets.length === 0) return null;

  return (
    <div className="mt-10 flex flex-wrap items-end justify-center gap-3 md:gap-5">
      {pets.map((pet, index) => {
        const tilt = index % 2 === 0 ? "rotate-[-3deg]" : "rotate-[3deg]";
        const lift = index % 3 === 1 ? "translate-y-1" : "-translate-y-1";

        return (
          <Link
            key={pet.slug}
            href={`/pets/${pet.slug}`}
            aria-label={`Open ${pet.displayName}`}
            className={`group relative flex flex-col items-center rounded-2xl border border-white/70 bg-white/55 px-3 pt-3 pb-2 shadow-lg shadow-blue-900/10 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white ${tilt} ${lift}`}
          >
            <PetSprite
              src={pet.spritesheetPath}
              cycleStates
              cycleIntervalMs={1500}
              scale={0.55}
              label={`${pet.displayName} animated`}
            />
            <span className="mt-1 font-mono text-[10px] tracking-[0.18em] text-stone-700 uppercase">
              {pet.displayName}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
