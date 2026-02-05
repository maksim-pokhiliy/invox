"use client";

import * as React from "react";

const AUTOSAVE_DELAY = 2000;

interface UseAutosaveOptions<T> {
  key: string;
  data: T;
  onRestore?: (data: T) => void;
  enabled?: boolean;
}

export function useAutosave<T>({ key, data, onRestore, enabled = true }: UseAutosaveOptions<T>) {
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [hasDraft, setHasDraft] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialCheckDone = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || initialCheckDone.current) {
      return;
    }
    initialCheckDone.current = true;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && parsed.timestamp) {
          setHasDraft(true);
        }
      }
    } catch {}
  }, [key, enabled]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          data,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(key, JSON.stringify(payload));
        setLastSaved(new Date());
        setHasDraft(true);
      } catch {}
    }, AUTOSAVE_DELAY);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, enabled]);

  const restoreDraft = React.useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data && onRestore) {
          onRestore(parsed.data);
          return true;
        }
      }
    } catch {}
    return false;
  }, [key, onRestore]);

  const clearDraft = React.useCallback(() => {
    try {
      localStorage.removeItem(key);
      setHasDraft(false);
      setLastSaved(null);
    } catch {}
  }, [key]);

  const getDraftTimestamp = React.useCallback((): Date | null => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.timestamp) {
          return new Date(parsed.timestamp);
        }
      }
    } catch {}
    return null;
  }, [key]);

  return {
    lastSaved,
    hasDraft,
    restoreDraft,
    clearDraft,
    getDraftTimestamp,
  };
}
