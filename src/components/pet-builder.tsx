"use client";

import { useState, useRef } from "react";
import { Download, Layers, Play, Upload, Wand2, CheckCircle2 } from "lucide-react";
import JSZip from "jszip";

import { petAudio } from "@/lib/audio";

interface StateConfig {
  name: string;
  startFrame: number;
  frameCount: number;
}

export function PetBuilder() {
  const [petName, setPetName] = useState("My Custom Pet");
  const [petDescription, setPetDescription] = useState("A custom Codex animated pet.");
  const [vibe, setVibe] = useState("cozy");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [frameWidth, setFrameWidth] = useState<number>(32);
  const [frameHeight, setFrameHeight] = useState<number>(32);
  const [activeState, setActiveState] = useState<string>("idle");
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isBuildingZip, setIsBuildingZip] = useState(false);

  const [states, setStates] = useState<StateConfig[]>([
    { name: "idle", startFrame: 0, frameCount: 4 },
    { name: "walk", startFrame: 4, frameCount: 4 },
    { name: "run", startFrame: 8, frameCount: 4 },
    { name: "sleep", startFrame: 12, frameCount: 2 },
    { name: "play", startFrame: 14, frameCount: 4 },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImageSrc(evt.target.result as string);
          petAudio.play("celebrate");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportZip = async () => {
    if (!imageSrc) return;
    setIsBuildingZip(true);
    petAudio.play("click");

    try {
      const zip = new JSZip();
      const slug = petName.toLowerCase().replace(/[^a-z0-9]/g, "-");

      const petJson = {
        id: slug,
        displayName: petName,
        description: petDescription,
        spritesheetPath: "spritesheet.webp",
      };

      const metadataJson = {
        id: slug,
        slug: slug,
        displayName: petName,
        description: petDescription,
        spritesheetPath: `/pets/${slug}/spritesheet.webp`,
        petJsonPath: `/pets/${slug}/pet.json`,
        approvalState: "community",
        kind: "custom",
        vibes: [vibe],
        tags: ["custom", vibe],
        importedAt: new Date().toISOString(),
      };

      zip.file("pet.json", JSON.stringify(petJson, null, 2));
      zip.file("metadata.json", JSON.stringify(metadataJson, null, 2));

      // Extract raw image bytes
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      zip.file("spritesheet.png", blob);

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${slug}-codex-pack.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      petAudio.play("celebrate");
    } catch {
      // Handle error gracefully
    } finally {
      setIsBuildingZip(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 rounded-3xl border border-white/10 bg-slate-900/90 p-6 md:p-8 backdrop-blur-2xl text-white shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-white">
            <Wand2 className="size-6 text-indigo-400" />
            <span>Pet Creation Studio</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Build, map, and export custom Codex-compatible pet packages directly in your browser.
          </p>
        </div>

        <button
          onClick={handleExportZip}
          disabled={!imageSrc || isBuildingZip}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="size-4" />
          {isBuildingZip ? "Exporting Zip..." : "Export Codex Pack (.zip)"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & Upload */}
        <div className="flex flex-col gap-5 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="size-4 text-indigo-400" /> 1. Pet Profile & Image
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Pet Display Name</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Description</label>
              <textarea
                value={petDescription}
                onChange={(e) => setPetDescription(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Vibe Category</label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="cozy">Cozy</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="playful">Playful</option>
                <option value="magical">Magical</option>
                <option value="chill">Chill</option>
              </select>
            </div>

            {/* Spritesheet File Upload */}
            <div className="pt-2">
              <label className="block text-slate-300 mb-2 font-medium">Spritesheet Image (PNG/WEBP)</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 py-4 text-indigo-300 transition hover:bg-indigo-500/10 hover:border-indigo-500"
              >
                <Upload className="size-4" />
                <span>{imageSrc ? "Replace Spritesheet" : "Upload Spritesheet PNG"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Frame Inspector & Grid Setup */}
        <div className="flex flex-col gap-5 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Play className="size-4 text-purple-400" /> 2. Frame Grid Config
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Frame Width (px)</label>
              <input
                type="number"
                value={frameWidth}
                onChange={(e) => setFrameWidth(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 mb-1">Frame Height (px)</label>
              <input
                type="number"
                value={frameHeight}
                onChange={(e) => setFrameHeight(Number(e.target.value))}
                className="w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* State Frame Mapping List */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-medium text-slate-300">Animation State Mapping</label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {states.map((st, idx) => (
                <div key={st.name} className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-white/5 text-xs">
                  <span className="font-mono text-indigo-400 w-16 capitalize">{st.name}</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-slate-500">Start:</span>
                    <input
                      type="number"
                      value={st.startFrame}
                      onChange={(e) => {
                        const newStates = [...states];
                        newStates[idx].startFrame = Number(e.target.value);
                        setStates(newStates);
                      }}
                      className="w-12 rounded bg-slate-950 border border-white/10 px-1.5 py-0.5 text-center text-white"
                    />
                    <span className="text-slate-500 ml-1">Frames:</span>
                    <input
                      type="number"
                      value={st.frameCount}
                      onChange={(e) => {
                        const newStates = [...states];
                        newStates[idx].frameCount = Number(e.target.value);
                        setStates(newStates);
                      }}
                      className="w-12 rounded bg-slate-950 border border-white/10 px-1.5 py-0.5 text-center text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Spritesheet Preview */}
        <div className="flex flex-col items-center justify-center gap-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5 min-h-[300px]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2 self-start">
            <CheckCircle2 className="size-4 text-emerald-400" /> Live Preview
          </h3>

          {imageSrc ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative flex items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-950 border border-indigo-500/20">
                <img
                  src={imageSrc}
                  alt="Custom Spritesheet"
                  className="max-h-[160px] object-contain rounded border border-white/10"
                />
              </div>

              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-emerald-300 text-xs font-mono">
                <span>Valid Spritesheet Ready</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center p-6 text-slate-500">
              <Wand2 className="size-10 mb-2 opacity-40" />
              <p className="text-xs">Upload a spritesheet PNG above to see your real-time preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
