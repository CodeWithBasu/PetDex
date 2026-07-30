"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function AuthBadge() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 bg-white/70 px-4 text-sm font-medium text-black backdrop-blur transition hover:bg-white"
          >
            Sign in
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9 rounded-full ring-1 ring-black/10",
            },
          }}
        />
      </Show>
    </>
  );
}
