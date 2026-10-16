"use client";

import { useEffect, useState } from "react";
import { fetchSignedImageUrls } from "./api";

const REFRESH_MARGIN_SECONDS = 5 * 60;
const cache = new Map<string, { signedUrl: string; expiresAt: number }>();

function freshFromCache(url: string): string | undefined {
  const hit = cache.get(url);
  if (!hit || hit.expiresAt - REFRESH_MARGIN_SECONDS <= Date.now() / 1000) return undefined;
  return hit.signedUrl;
}

export function useSignedImageUrls(urls: string[]) {
  const key = urls.join("\n");
  const [, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pending = key ? key.split("\n").filter((url) => !freshFromCache(url)) : [];
    if (pending.length === 0) return;

    let cancelled = false;
    fetchSignedImageUrls(pending)
      .then(({ signedUrls, expiresAt }) => {
        for (const [url, signedUrl] of Object.entries(signedUrls)) cache.set(url, { signedUrl, expiresAt });
        if (!cancelled) {
          setError(null);
          setVersion((v) => v + 1);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load product images.");
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const signed: Record<string, string> = {};
  for (const url of urls) {
    const hit = freshFromCache(url);
    if (hit) signed[url] = hit;
  }

  return { signed, error };
}
