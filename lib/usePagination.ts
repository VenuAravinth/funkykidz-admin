"use client";

import { useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 15] as const;
export const DEFAULT_PAGE_SIZE = 10;

function isSingleRemoval(next: string[], prev: string[]): boolean {
  if (next.length !== prev.length - 1) return false;
  let i = 0;
  for (const key of prev) if (key === next[i]) i++;
  return i === next.length;
}

export function usePagination(keys: string[]) {
  const [pageSize, setPageSizeState] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const signature = keys.join("\u0000");
  const [prev, setPrev] = useState({ signature, keys });

  if (signature !== prev.signature) {
    setPrev({ signature, keys });
    if (!isSingleRemoval(keys, prev.keys)) setPage(1);
  }

  const total = keys.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  const end = Math.min(start + pageSize, total);

  return {
    page: current,
    pageCount,
    pageSize,
    total,
    start,
    end,
    setPage: (next: number) => setPage(Math.min(Math.max(1, next), pageCount)),
    setPageSize: (size: number) => {
      setPageSizeState(size);
      setPage(Math.floor(start / size) + 1);
    },
  };
}

export type PaginationState = ReturnType<typeof usePagination>;
