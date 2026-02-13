"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { type CommandItem, CommandPaletteContext } from "@app/shared/hooks/use-command-palette";
import { useRecentItems } from "@app/shared/hooks/use-recent-items";
import { CommandPalette } from "@app/shared/ui/command-palette";

import { buildActionItems, buildNavItems, recentToCommandItem } from "./items";

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { recentItems } = useRecentItems();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dynamicItems, setDynamicItems] = React.useState<CommandItem[]>([]);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);

  const registerItems = React.useCallback((newItems: CommandItem[]) => {
    setDynamicItems((prev) => [
      ...prev.filter((p) => !newItems.some((n) => n.id === p.id)),
      ...newItems,
    ]);
  }, []);

  const unregisterItems = React.useCallback((ids: string[]) => {
    setDynamicItems((prev) => prev.filter((p) => !ids.includes(p.id)));
  }, []);

  const items = React.useMemo<CommandItem[]>(() => {
    const recentCommandItems = recentItems.map((item) => recentToCommandItem(item, router));

    return [
      ...buildNavItems(router),
      ...buildActionItems(router),
      ...recentCommandItems,
      ...dynamicItems,
    ];
  }, [router, recentItems, dynamicItems]);

  const value = React.useMemo(
    () => ({ isOpen, open, close, items, registerItems, unregisterItems }),
    [isOpen, open, close, items, registerItems, unregisterItems]
  );

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette />
    </CommandPaletteContext.Provider>
  );
}
