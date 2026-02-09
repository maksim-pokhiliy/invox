"use client";

import * as React from "react";
import { STORAGE_KEYS } from "@app/shared/config/config";
import { storage } from "@app/shared/lib/storage";

const MAX_ITEMS = 10;

export interface RecentItem {
  id: string;
  type: "invoice" | "client" | "template" | "recurring";
  label: string;
  href: string;
  timestamp: number;
}

function loadItems(): RecentItem[] {
  return storage.getJson<RecentItem[]>(STORAGE_KEYS.RECENT_ITEMS) ?? [];
}

export function useRecentItems() {
  const [items, setItems] = React.useState<RecentItem[]>(loadItems);

  const addRecentItem = React.useCallback((item: Omit<RecentItem, "timestamp">) => {
    setItems((prev) => {
      const filtered = prev.filter((existing) => existing.id !== item.id);
      const next = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      storage.setJson(STORAGE_KEYS.RECENT_ITEMS, next);
      return next;
    });
  }, []);

  const getRecentItems = React.useCallback(() => items, [items]);

  return { recentItems: items, addRecentItem, getRecentItems };
}
