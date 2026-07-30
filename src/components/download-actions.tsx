import { Download, Package } from "lucide-react";

import { getPetPackPath } from "@/lib/downloads";
import type { PetdexPet } from "@/lib/types";

type DownloadActionsProps = {
  pet: PetdexPet;
  compact?: boolean;
};

export function DownloadActions({
  pet,
  compact = false,
}: DownloadActionsProps) {
  return (
    <div
      className={
        compact
          ? "flex flex-wrap gap-2"
          : "rounded-lg border border-stone-200 bg-white p-5"
      }
    >
      {!compact ? (
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-950">
          <Package className="size-4" />
          Download pack
        </div>
      ) : null}
      <a
        href={getPetPackPath(pet.slug)}
        download
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-4 text-sm font-medium text-white transition hover:bg-black/85"
      >
        <Download className="size-4" />
        Download ZIP
      </a>
      <a
        href={pet.spritesheetPath}
        download
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-black transition hover:border-black/30"
      >
        <Download className="size-4" />
        Sprite
      </a>
    </div>
  );
}
