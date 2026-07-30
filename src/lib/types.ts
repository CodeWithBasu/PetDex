export type ApprovalState = "approved" | "needs-review" | "needs-repair";

export type PetKind = "creature" | "object" | "character";

export type PetVibe =
  | "cozy"
  | "calm"
  | "playful"
  | "cheerful"
  | "focused"
  | "mischievous";

export type PetdexPet = {
  id: string;
  slug: string;
  displayName: string;
  description: string;
  spritesheetPath: string;
  petJsonPath: string;
  approvalState: ApprovalState;
  featured?: boolean;
  kind: PetKind;
  vibes: PetVibe[];
  tags: string[];
  importedAt: string;
  qa: {
    contactSheetPath?: string;
  };
};

export const PET_KINDS: PetKind[] = ["creature", "object", "character"];

export const PET_VIBES: PetVibe[] = [
  "cozy",
  "calm",
  "playful",
  "cheerful",
  "focused",
  "mischievous",
];
