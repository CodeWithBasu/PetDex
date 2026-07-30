import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, FileJson, Images, Sparkles } from "lucide-react";

import { getPet, getPets } from "@/lib/pets";

import { DownloadActions } from "@/components/download-actions";
import { InstallCommand } from "@/components/install-command";
import { PetStateViewer } from "@/components/pet-state-viewer";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getPets().map((pet) => ({
    slug: pet.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pet = getPet(slug);

  if (!pet) {
    return {
      title: "Pet not found - Petdex",
    };
  }

  return {
    title: `${pet.displayName} - Petdex`,
    description: pet.description,
  };
}

export default async function PetPage({ params }: PageProps) {
  const { slug } = await params;
  const pet = getPet(slug);

  if (!pet) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f8ff]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 md:px-8 md:py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-sm font-medium text-black backdrop-blur transition hover:border-black/30"
        >
          <ArrowLeft className="size-4" />
          Back to gallery
        </Link>

        <header className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-cyan-700 uppercase">
              {pet.featured ? "Featured Petdex entry" : "Petdex entry"}
            </p>
            <h1 className="mt-3 text-5xl font-semibold text-stone-950 md:text-7xl">
              {pet.displayName}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
              {pet.description}
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <p className="text-sm font-semibold text-stone-950">Traits</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pet.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#eef1ff] px-2.5 py-1 text-xs font-medium text-[#5266ea]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <PetStateViewer src={pet.spritesheetPath} petName={pet.displayName} />

        <section className="grid gap-4 lg:grid-cols-3">
          <InstallCommand slug={pet.slug} displayName={pet.displayName} />
          <DownloadActions pet={pet} />
          <InfoCard title="Package" icon={<FileJson className="size-4" />}>
            <p>
              <span className="font-medium text-stone-950">pet.json:</span>{" "}
              {pet.petJsonPath}
            </p>
            <p>
              <span className="font-medium text-stone-950">spritesheet:</span>{" "}
              {pet.spritesheetPath}
            </p>
          </InfoCard>
          <InfoCard title="Preview" icon={<Images className="size-4" />}>
            {pet.qa.contactSheetPath ? (
              <a
                href={pet.qa.contactSheetPath}
                className="font-medium text-black underline underline-offset-4"
              >
                Open contact sheet
              </a>
            ) : (
              <p>Contact sheet coming soon.</p>
            )}
          </InfoCard>
          <InfoCard title="Share" icon={<Sparkles className="size-4" />}>
            <p>Public Petdex page for sharing this companion.</p>
            <p>Updated {new Date(pet.importedAt).toLocaleDateString()}</p>
          </InfoCard>
        </section>
      </section>
    </main>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/76 p-5 shadow-sm shadow-blue-950/5 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
        {icon}
        {title}
      </div>
      <div className="mt-4 space-y-2 break-words text-sm leading-6 text-stone-600">
        {children}
      </div>
    </div>
  );
}
