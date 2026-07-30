"use client";

import { useState } from "react";

import { Play } from "lucide-react";

import { defaultPetState, type PetStateId, petStates } from "@/lib/pet-states";

import { PetSprite } from "@/components/pet-sprite";

type PetStateViewerProps = {
  src: string;
  petName: string;
};

export function PetStateViewer({ src, petName }: PetStateViewerProps) {
  const [selectedState, setSelectedState] = useState<PetStateId>(
    defaultPetState.id,
  );
  const activeState =
    petStates.find((state) => state.id === selectedState) ?? defaultPetState;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,420px)_1fr]">
      <section className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-700 uppercase">
              State viewer
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {activeState.label}
            </h2>
          </div>
          <span className="inline-flex h-9 items-center gap-2 rounded-md bg-stone-100 px-3 text-xs font-medium text-stone-700">
            <Play className="size-3.5" />
            {activeState.frames} frames
          </span>
        </div>

        <div className="mt-6 flex min-h-80 items-center justify-center rounded-lg border border-stone-200 bg-[linear-gradient(45deg,#fafaf9_25%,transparent_25%),linear-gradient(-45deg,#fafaf9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fafaf9_75%),linear-gradient(-45deg,transparent_75%,#fafaf9_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0]">
          <PetSprite
            src={src}
            state={activeState.id}
            scale={1.2}
            label={`${petName} ${activeState.label} animation`}
          />
        </div>

        <p className="mt-4 text-sm leading-6 text-stone-600">
          {activeState.purpose}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {petStates.map((state) => (
          <button
            key={state.id}
            type="button"
            onClick={() => setSelectedState(state.id)}
            className={`rounded-lg border bg-white p-4 text-left transition ${
              selectedState === state.id
                ? "border-stone-950 shadow-lg shadow-stone-200"
                : "border-stone-200 hover:border-stone-400"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-950">
                  {state.label}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Row {state.row} - {state.frames} frames
                </p>
              </div>
              <div className="rounded-md border border-stone-200 bg-stone-50 p-2">
                <PetSprite src={src} state={state.id} scale={0.32} />
              </div>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}
