"use client";

import { useState, useEffect } from "react";
import { Apple, Heart, Play, RefreshCw, Sparkles, Volume2 } from "lucide-react";

import { petAudio } from "@/lib/audio";
import { PetSprite } from "@/components/pet-sprite";
import { Pet } from "@/lib/types";

type Environment = "cozy" | "cyberpunk" | "forest" | "synthwave" | "void";

interface PetPlaygroundProps {
  pet: Pet;
}

export function PetPlayground({ pet }: PetPlaygroundProps) {
  const [currentState, setCurrentState] = useState<string>("idle");
  const [environment, setEnvironment] = useState<Environment>("cozy");
  const [happiness, setHappiness] = useState<number>(85);
  const [hunger, setHunger] = useState<number>(70);
  const [energy, setEnergy] = useState<number>(90);
  const [particle, setParticle] = useState<"heart" | "apple" | "sparkle" | null>(null);

  // Available states from pet or fallback
  const states = ["idle", "walk", "run", "sleep", "play", "eat", "celebrate", "drag"];

  const handlePet = () => {
    petAudio.play("pet");
    setCurrentState("celebrate");
    setHappiness((h) => Math.min(100, h + 10));
    triggerParticle("heart");
    setTimeout(() => setCurrentState("idle"), 2500);
  };

  const handleFeed = () => {
    petAudio.play("eat");
    setCurrentState("eat");
    setHunger((h) => Math.min(100, h + 15));
    triggerParticle("apple");
    setTimeout(() => setCurrentState("idle"), 2000);
  };

  const handlePlay = () => {
    petAudio.play("play");
    setCurrentState("play");
    setHappiness((h) => Math.min(100, h + 12));
    setEnergy((e) => Math.max(10, e - 8));
    triggerParticle("sparkle");
    setTimeout(() => setCurrentState("idle"), 2200);
  };

  const triggerParticle = (type: "heart" | "apple" | "sparkle") => {
    setParticle(type);
    setTimeout(() => setParticle(null), 1200);
  };

  const getEnvBg = (env: Environment) => {
    switch (env) {
      case "cyberpunk":
        return "bg-gradient-to-b from-purple-950 via-slate-900 to-pink-950 border-purple-500/30";
      case "forest":
        return "bg-gradient-to-b from-emerald-950 via-slate-900 to-green-950 border-emerald-500/30";
      case "synthwave":
        return "bg-gradient-to-b from-indigo-950 via-fuchsia-950 to-slate-950 border-pink-500/30";
      case "void":
        return "bg-slate-950 border-slate-800";
      case "cozy":
      default:
        return "bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-900 border-indigo-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{pet.displayName}</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Interactive Playground
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">{pet.description}</p>
        </div>

        {/* Environment Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-full border border-white/10 text-xs">
          {(["cozy", "cyberpunk", "forest", "synthwave", "void"] as Environment[]).map((env) => (
            <button
              key={env}
              onClick={() => {
                setEnvironment(env);
                petAudio.play("click");
              }}
              className={`capitalize px-3 py-1 rounded-full transition ${
                environment === env
                  ? "bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pet Canvas Arena */}
      <div
        className={`relative flex min-h-[300px] w-full items-center justify-center rounded-2xl border transition-all duration-500 ${getEnvBg(
          environment
        )}`}
      >
        {/* Floating FX Particles */}
        {particle && (
          <div className="absolute top-1/4 animate-bounce pointer-events-none text-3xl transition-opacity">
            {particle === "heart" && "❤️ ❤️ ❤️"}
            {particle === "apple" && "🍎 ✨ 🍎"}
            {particle === "sparkle" && "✨ ⚽ ✨"}
          </div>
        )}

        <div className="flex flex-col items-center">
          <PetSprite
            src={pet.spritesheetPath}
            forcedState={currentState}
            scale={1.2}
            label={`${pet.displayName} in state ${currentState}`}
          />
          <span className="mt-4 font-mono text-xs text-indigo-300/80 bg-slate-950/80 px-3 py-1 rounded-full border border-white/5">
            Current State: <strong className="text-white uppercase">{currentState}</strong>
          </span>
        </div>
      </div>

      {/* Pet Stats & Interactive Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="flex flex-col gap-3 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Pet Status</h3>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Happiness</span>
                <span>{happiness}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300"
                  style={{ width: `${happiness}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Fullness</span>
                <span>{hunger}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${hunger}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Energy</span>
                <span>{energy}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">Actions & Audio FX</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePet}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 transition group"
            >
              <Heart className="size-5 group-hover:scale-110 transition-transform text-pink-400" />
              <span className="text-xs font-medium">Pet</span>
            </button>

            <button
              onClick={handleFeed}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition group"
            >
              <Apple className="size-5 group-hover:scale-110 transition-transform text-emerald-400" />
              <span className="text-xs font-medium">Feed Treat</span>
            </button>

            <button
              onClick={handlePlay}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition group"
            >
              <Sparkles className="size-5 group-hover:scale-110 transition-transform text-cyan-400" />
              <span className="text-xs font-medium">Play Ball</span>
            </button>
          </div>

          {/* State Stepper */}
          <div className="mt-1 flex flex-wrap gap-1.5">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => {
                  setCurrentState(st);
                  petAudio.play("state");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                  currentState === st
                    ? "bg-indigo-600 text-white font-semibold"
                    : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-white/5"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
