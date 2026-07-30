"use client";

import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";
import { generateReactHelpers } from "@uploadthing/react";
import { track } from "@vercel/analytics";
import JSZip from "jszip";
import {
  AlertTriangle,
  CheckCircle2,
  FileArchive,
  Loader2,
  Send,
  Upload,
} from "lucide-react";

import { petStates } from "@/lib/pet-states";
import type { OurFileRouter } from "@/lib/uploadthing";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

type ParsedPet = {
  petId: string;
  displayName: string;
  description: string;
  zipBlob: Blob;
  zipFileName: string;
  spritesheetBlob: Blob;
  petJsonString: string;
  spritesheetUrl: string;
  spritesheetWidth: number;
  spritesheetHeight: number;
  issues: string[];
};

type SubmissionResult =
  | { kind: "idle" }
  | { kind: "uploading"; step: "validating" | "uploading" | "registering" }
  | { kind: "error"; message: string }
  | { kind: "success"; slug: string; displayName: string };

const REQUIRED = { width: 1536, height: 1872 } as const;

export function PetSubmitForm() {
  const { isSignedIn, isLoaded } = useUser();
  const [parsed, setParsed] = useState<ParsedPet | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [submission, setSubmission] = useState<SubmissionResult>({
    kind: "idle",
  });

  const { startUpload } = useUploadThing("petPackUploader");

  useEffect(() => {
    return () => {
      if (parsed?.spritesheetUrl) URL.revokeObjectURL(parsed.spritesheetUrl);
    };
  }, [parsed?.spritesheetUrl]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setIsReading(true);
    setSubmission({ kind: "idle" });
    setParsed(null);

    try {
      const zipFile = [...files].find((f) => f.name.endsWith(".zip"));
      if (!zipFile) {
        setParsed({
          petId: "missing-zip",
          displayName: "Missing files",
          description: "Upload a ZIP containing pet.json and spritesheet.webp.",
          zipBlob: new Blob(),
          zipFileName: "",
          spritesheetBlob: new Blob(),
          petJsonString: "",
          spritesheetUrl: "",
          spritesheetWidth: 0,
          spritesheetHeight: 0,
          issues: ["Upload a ZIP file."],
        });
        return;
      }

      const buf = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      const petJsonEntry = zip.file("pet.json");
      const spriteEntry = zip.file("spritesheet.webp");
      const issues: string[] = [];
      if (!petJsonEntry) issues.push("Missing pet.json in zip.");
      if (!spriteEntry) issues.push("Missing spritesheet.webp in zip.");

      const petJsonString = petJsonEntry
        ? await petJsonEntry.async("string")
        : "";
      const spritesheetBlob = spriteEntry
        ? await spriteEntry.async("blob")
        : new Blob();

      let petJson: Record<string, unknown> = {};
      if (petJsonString) {
        try {
          petJson = JSON.parse(petJsonString);
        } catch {
          issues.push("pet.json is not valid JSON.");
        }
      }

      const spritesheetUrl = spritesheetBlob.size
        ? URL.createObjectURL(spritesheetBlob)
        : "";

      let width = 0;
      let height = 0;
      if (spritesheetUrl) {
        ({ width, height } = await measureImage(spritesheetUrl));
        if (width !== REQUIRED.width || height !== REQUIRED.height) {
          issues.push(
            `Spritesheet must be ${REQUIRED.width}×${REQUIRED.height}, got ${width}×${height}.`,
          );
        }
      }

      const displayName =
        typeof petJson.displayName === "string" && petJson.displayName.trim()
          ? petJson.displayName.trim()
          : "Untitled pet";
      const description =
        typeof petJson.description === "string" && petJson.description.trim()
          ? petJson.description.trim()
          : "A Codex-compatible digital pet.";
      const petId =
        typeof petJson.id === "string" && petJson.id.trim()
          ? petJson.id.trim()
          : zipFile.name.replace(/\.zip$/i, "");

      setParsed({
        petId,
        displayName,
        description,
        zipBlob: new Blob([buf], { type: "application/zip" }),
        zipFileName: zipFile.name,
        spritesheetBlob,
        petJsonString,
        spritesheetUrl,
        spritesheetWidth: width,
        spritesheetHeight: height,
        issues,
      });

      if (issues.length === 0) {
        track("pet_pack_validated", {
          pet_id: petId,
          size_kb: Math.round(zipFile.size / 1024),
        });
      } else {
        track("pet_pack_validation_failed", {
          pet_id: petId,
          issue_count: issues.length,
          first_issue: issues[0] ?? "unknown",
        });
      }
    } finally {
      setIsReading(false);
    }
  }

  async function handleSubmit() {
    if (!parsed || parsed.issues.length > 0) return;
    if (!isSignedIn) return;

    track("pet_submission_started", { pet_id: parsed.petId });
    setSubmission({ kind: "uploading", step: "validating" });

    const zipFile = new File([parsed.zipBlob], parsed.zipFileName, {
      type: "application/zip",
    });
    const spriteFile = new File(
      [parsed.spritesheetBlob],
      `${slugify(parsed.petId)}-spritesheet.webp`,
      { type: "image/webp" },
    );
    const petJsonFile = new File(
      [parsed.petJsonString],
      `${slugify(parsed.petId)}-pet.json`,
      { type: "application/json" },
    );

    setSubmission({ kind: "uploading", step: "uploading" });

    const uploaded = await startUpload([zipFile, spriteFile, petJsonFile]);
    if (!uploaded || uploaded.length < 3) {
      track("pet_submission_failed", {
        pet_id: parsed.petId,
        stage: "upload",
      });
      setSubmission({
        kind: "error",
        message: "Upload failed. Try again.",
      });
      return;
    }

    const zipResult = uploaded.find((u) => u.name === parsed.zipFileName);
    const spriteResult = uploaded.find((u) =>
      u.name.endsWith("-spritesheet.webp"),
    );
    const petJsonResult = uploaded.find((u) => u.name.endsWith("-pet.json"));

    if (!zipResult || !spriteResult || !petJsonResult) {
      setSubmission({ kind: "error", message: "Upload incomplete." });
      return;
    }

    setSubmission({ kind: "uploading", step: "registering" });

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zipUrl: zipResult.serverData?.url ?? zipResult.ufsUrl,
        spritesheetUrl: spriteResult.serverData?.url ?? spriteResult.ufsUrl,
        petJsonUrl: petJsonResult.serverData?.url ?? petJsonResult.ufsUrl,
        displayName: parsed.displayName,
        description: parsed.description,
        petId: parsed.petId,
        spritesheetWidth: parsed.spritesheetWidth,
        spritesheetHeight: parsed.spritesheetHeight,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      track("pet_submission_failed", {
        pet_id: parsed.petId,
        stage: "register",
        error_code: data.error ?? "unknown",
        status: res.status,
      });
      setSubmission({
        kind: "error",
        message:
          data.message ??
          (data.error
            ? `Submission failed: ${data.error}`
            : "Submission failed"),
      });
      return;
    }

    const data = (await res.json()) as { slug: string };
    track("pet_submission_succeeded", {
      pet_id: parsed.petId,
      slug: data.slug,
    });
    setSubmission({
      kind: "success",
      slug: data.slug,
      displayName: parsed.displayName,
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <label className="glass-panel flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-3xl p-8 text-center transition hover:bg-white/80">
        <input
          type="file"
          multiple={false}
          accept=".zip"
          className="sr-only"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <span className="grid size-16 place-items-center rounded-2xl bg-black text-white">
          <Upload className="size-7" />
        </span>
        <span className="mt-6 text-2xl font-medium">Upload a pet package</span>
        <span className="mt-3 max-w-md text-sm leading-6 text-[#5d5d66]">
          Drop a ZIP with{" "}
          <code className="rounded bg-white/70 px-1 py-0.5">pet.json</code> and{" "}
          <code className="rounded bg-white/70 px-1 py-0.5">
            spritesheet.webp
          </code>{" "}
          ({REQUIRED.width}×{REQUIRED.height}). Validation runs locally before
          upload.
        </span>
        {!isLoaded ? null : !isSignedIn ? (
          <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-amber-900 uppercase">
            Sign in to submit
          </span>
        ) : null}
      </label>

      <aside className="rounded-3xl border border-black/10 bg-white/76 p-5 shadow-sm shadow-blue-950/5 backdrop-blur">
        <div className="flex items-center gap-2 text-sm font-medium text-black">
          <FileArchive className="size-4" />
          Submission check
        </div>

        {isReading ? (
          <p className="mt-6 inline-flex items-center gap-2 text-sm text-[#5d5d66]">
            <Loader2 className="size-3.5 animate-spin" />
            Reading package...
          </p>
        ) : parsed ? (
          <div className="mt-6 space-y-5">
            {parsed.spritesheetUrl ? (
              <SpritePreview src={parsed.spritesheetUrl} />
            ) : null}
            <div>
              <h2 className="text-xl font-medium">{parsed.displayName}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5d5d66]">
                {parsed.description}
              </p>
              {parsed.spritesheetWidth ? (
                <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-stone-400 uppercase">
                  {parsed.spritesheetWidth}×{parsed.spritesheetHeight}
                </p>
              ) : null}
            </div>
            {parsed.issues.length > 0 ? (
              <div className="flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <ul className="space-y-1">
                  {parsed.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <CheckCircle2 className="size-4" />
                Looks ready to submit.
              </div>
            )}

            <SubmitButton
              disabled={
                parsed.issues.length > 0 ||
                !isSignedIn ||
                submission.kind === "uploading" ||
                submission.kind === "success"
              }
              submission={submission}
              onSubmit={() => void handleSubmit()}
            />

            {submission.kind === "error" ? (
              <p className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-900">
                {submission.message}
              </p>
            ) : null}

            {submission.kind === "success" ? (
              <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">
                {submission.displayName} is in review. You'll be notified when
                it's approved.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-6 text-sm leading-6 text-[#5d5d66]">
            Packages stay local until you confirm. Petdex checks the manifest
            and sprite dimensions before upload.
          </p>
        )}
      </aside>
    </div>
  );
}

function SubmitButton({
  disabled,
  submission,
  onSubmit,
}: {
  disabled: boolean;
  submission: SubmissionResult;
  onSubmit: () => void;
}) {
  const label =
    submission.kind === "uploading"
      ? submission.step === "validating"
        ? "Validating..."
        : submission.step === "uploading"
          ? "Uploading..."
          : "Finalizing..."
      : submission.kind === "success"
        ? "Submitted"
        : "Submit pet";

  return (
    <button
      type="button"
      onClick={onSubmit}
      disabled={disabled}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submission.kind === "uploading" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : submission.kind === "success" ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <Send className="size-4" />
      )}
      {label}
    </button>
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
        aria-label="Uploaded pet animation preview"
        style={{ "--pet-scale": 0.5 } as React.CSSProperties}
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

function measureImage(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
