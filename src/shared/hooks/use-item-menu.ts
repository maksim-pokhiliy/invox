"use client";

import * as React from "react";

interface UseItemMenuResult<T> {
  menuAnchorEl: HTMLElement | null;
  selectedId: string | null;
  selectedItem: T | undefined;
  openMenu: (event: React.MouseEvent<HTMLElement>, id: string) => void;
  closeMenu: () => void;
  closeMenuKeepSelection: () => void;
}

export function useItemMenu<T extends { id: string }>(
  items: T[] | undefined
): UseItemMenuResult<T> {
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selectedItem = React.useMemo(
    () => items?.find((item) => item.id === selectedId),
    [items, selectedId]
  );

  const openMenu = React.useCallback((event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedId(id);
  }, []);

  const closeMenu = React.useCallback(() => {
    setMenuAnchorEl(null);
    setSelectedId(null);
  }, []);

  const closeMenuKeepSelection = React.useCallback(() => {
    setMenuAnchorEl(null);
  }, []);

  return { menuAnchorEl, selectedId, selectedItem, openMenu, closeMenu, closeMenuKeepSelection };
}
