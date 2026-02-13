"use client";

import * as React from "react";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { ScreenReaderProvider } from "@app/shared/ui/screen-reader-announcer";

import { CommandPaletteProvider } from "./command-palette";
import { QueryProvider } from "./query";
import { SessionProvider } from "./session-provider";
import { ThemeRegistry } from "./theme/registry";
import { ToastProvider } from "./toast";

export { QueryProvider } from "./query";
export { SessionProvider } from "./session-provider";
export { ThemeRegistry, useThemeMode } from "./theme/registry";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeRegistry>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ScreenReaderProvider>
              <ToastProvider>
                <CommandPaletteProvider>{children}</CommandPaletteProvider>
              </ToastProvider>
            </ScreenReaderProvider>
          </LocalizationProvider>
        </ThemeRegistry>
      </QueryProvider>
    </SessionProvider>
  );
}
