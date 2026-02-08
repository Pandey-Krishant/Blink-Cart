"use client";

import { useEffect } from "react";

export default function ScrollToMatch({ query }: { query: string }) {
  useEffect(() => {
    const q = (query || "").trim();
    if (!q) return;
    const t = setTimeout(() => {
      const el = document.querySelector(
        "[data-search-match=\"true\"]"
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);
    return () => clearTimeout(t);
  }, [query]);

  return null;
}
