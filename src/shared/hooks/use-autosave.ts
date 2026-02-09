"use client";

import * as React from "react";
import { AUTOSAVE } from "@app/shared/config/config";
import { storage } from "@app/shared/lib/storage";

interface AutosavePayload<T> {
  data: T;
  timestamp: string;
}

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

    const saved = storage.getJson<AutosavePayload<T>>(key);
    if (saved?.data && saved?.timestamp) {
      setHasDraft(true);
    }
  }, [key, enabled]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const payload: AutosavePayload<T> = {
        data,
        timestamp: new Date().toISOString(),
      };
      storage.setJson(key, payload);
      setLastSaved(new Date());
      setHasDraft(true);
    }, AUTOSAVE.DELAY_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, enabled]);

  const restoreDraft = React.useCallback(() => {
    const saved = storage.getJson<AutosavePayload<T>>(key);
    if (saved?.data && onRestore) {
      onRestore(saved.data);
      return true;
    }
    return false;
  }, [key, onRestore]);

  const clearDraft = React.useCallback(() => {
    storage.remove(key);
    setHasDraft(false);
    setLastSaved(null);
  }, [key]);

  const getDraftTimestamp = React.useCallback((): Date | null => {
    const saved = storage.getJson<AutosavePayload<T>>(key);
    if (saved?.timestamp) {
      return new Date(saved.timestamp);
    }
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
