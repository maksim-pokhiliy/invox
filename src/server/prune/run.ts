import { TIME } from "@app/shared/config/config";
import { PRUNE } from "@app/shared/config/prune";

import { RetentionMisconfiguredError } from "@app/server/prune/errors";

export const PRUNE_EVENT = {
  LARGE_DELETE: "prune.warning.large_delete",
  LARGE_BACKLOG: "prune.warning.large_backlog",
} as const;

export type PruneEventName = (typeof PRUNE_EVENT)[keyof typeof PRUNE_EVENT];

export type PruneArmMode = "prune" | "count";

export interface PruneArmRetention {
  days: number;
  label: string;
}

export interface PruneArmInputWithRetention<TClient> {
  client: TClient;
  now: Date;
  table: string;
  arm?: string;
  mode: PruneArmMode;
  retention: PruneArmRetention;
  run: (input: { client: TClient; cutoff: Date }) => Promise<number>;
}

export interface PruneArmInputWithoutRetention<TClient> {
  client: TClient;
  now: Date;
  table: string;
  arm?: string;
  mode: PruneArmMode;
  retention?: undefined;
  run: (input: { client: TClient }) => Promise<number>;
}

export async function pruneArm<TClient>(
  input: PruneArmInputWithRetention<TClient>
): Promise<number>;
export async function pruneArm<TClient>(
  input: PruneArmInputWithoutRetention<TClient>
): Promise<number>;
export async function pruneArm<TClient>(
  input: PruneArmInputWithRetention<TClient> | PruneArmInputWithoutRetention<TClient>
): Promise<number> {
  const amount = await runArm(input);

  emitWarningIfLarge({ amount, mode: input.mode, table: input.table, arm: input.arm });

  return amount;
}

async function runArm<TClient>(
  input: PruneArmInputWithRetention<TClient> | PruneArmInputWithoutRetention<TClient>
): Promise<number> {
  if (input.retention) {
    if (input.retention.days <= 0) {
      throw new RetentionMisconfiguredError(input.retention.label);
    }

    const cutoff = new Date(input.now.getTime() - TIME.DAY * input.retention.days);

    return input.run({ client: input.client, cutoff });
  }

  return input.run({ client: input.client });
}

interface WarningInput {
  amount: number;
  mode: PruneArmMode;
  table: string;
  arm?: string;
}

function emitWarningIfLarge(input: WarningInput): void {
  if (input.amount <= PRUNE.LARGE_DELETE_THRESHOLD) {
    return;
  }

  const event = input.mode === "prune" ? PRUNE_EVENT.LARGE_DELETE : PRUNE_EVENT.LARGE_BACKLOG;
  const amountKey = input.mode === "prune" ? "deleted" : "wouldDelete";

  const payload: Record<string, unknown> = { event, table: input.table };

  if (input.arm !== undefined) {
    payload.arm = input.arm;
  }

  payload[amountKey] = input.amount;

  console.warn(JSON.stringify(payload));
}
