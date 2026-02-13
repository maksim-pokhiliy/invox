import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { SHORTCUTS } from "@app/shared/config/config";

export function buildShortcuts(
  router: AppRouterInstance,
  openCommandPalette: () => void,
  openShortcutsDialog: () => void
) {
  return [
    {
      key: SHORTCUTS.NEW_INVOICE.key,
      ctrl: true,
      handler: () => router.push("/app/invoices/new"),
      description: SHORTCUTS.NEW_INVOICE.description,
    },
    {
      key: SHORTCUTS.COMMAND_PALETTE.key,
      ctrl: true,
      handler: openCommandPalette,
      description: SHORTCUTS.COMMAND_PALETTE.description,
    },
    {
      key: SHORTCUTS.SHORTCUTS_DIALOG.key,
      handler: openShortcutsDialog,
      description: SHORTCUTS.SHORTCUTS_DIALOG.description,
    },
    {
      key: SHORTCUTS.GO_DASHBOARD.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app"),
      description: SHORTCUTS.GO_DASHBOARD.description,
    },
    {
      key: SHORTCUTS.GO_INVOICES.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/invoices"),
      description: SHORTCUTS.GO_INVOICES.description,
    },
    {
      key: SHORTCUTS.GO_CLIENTS.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/clients"),
      description: SHORTCUTS.GO_CLIENTS.description,
    },
    {
      key: SHORTCUTS.GO_TEMPLATES.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/templates"),
      description: SHORTCUTS.GO_TEMPLATES.description,
    },
    {
      key: SHORTCUTS.GO_RECURRING.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/recurring"),
      description: SHORTCUTS.GO_RECURRING.description,
    },
    {
      key: SHORTCUTS.GO_SETTINGS.key,
      ctrl: true,
      shift: true,
      handler: () => router.push("/app/settings"),
      description: SHORTCUTS.GO_SETTINGS.description,
    },
  ];
}
