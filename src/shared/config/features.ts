import type { Edition } from "./env";
import { env } from "./env";

export type { Edition };

interface FeatureFlags {
  publicRegistration: boolean;
}

const EDITION_FEATURES: Record<Edition, FeatureFlags> = {
  community: {
    publicRegistration: true,
  },
  pro: {
    publicRegistration: false,
  },
};

export const edition: Edition = env.NEXT_PUBLIC_GETPAID_EDITION;

export const features: Readonly<FeatureFlags> = EDITION_FEATURES[edition];
