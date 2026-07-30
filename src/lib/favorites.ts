"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "petdex_favorites_v1";

export function getFavoritePetIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavoritePetId(slug: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getFavoritePetIds();
    const exists = current.includes(slug);
    const updated = exists ? current.filter((id) => id !== slug) : [...current, slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("petdex_favorites_changed", { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function useFavoritePets() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoritePetIds());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string[]>;
      if (customEvent.detail) {
        setFavorites(customEvent.detail);
      } else {
        setFavorites(getFavoritePetIds());
      }
    };

    window.addEventListener("petdex_favorites_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("petdex_favorites_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isFavorite = (slug: string) => favorites.includes(slug);

  const toggleFavorite = (slug: string) => {
    toggleFavoritePetId(slug);
  };

  return { favorites, isFavorite, toggleFavorite };
}
