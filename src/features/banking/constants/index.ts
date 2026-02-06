export const CONNECTION_STATUS_CONFIG: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "default" }
> = {
  active: { label: "Active", color: "success" },
  error: { label: "Error", color: "error" },
  inactive: { label: "Inactive", color: "warning" },
  disabled: { label: "Disabled", color: "default" },
};

export const MATCH_CONFIDENCE_CONFIG: Record<
  string,
  { label: string; color: "success" | "warning" | "info" }
> = {
  high: { label: "High confidence", color: "success" },
  medium: { label: "Medium confidence", color: "warning" },
  low: { label: "Low confidence", color: "info" },
};

export function getConfidenceLevel(confidence: number): "high" | "medium" | "low" {
  if (confidence >= 0.8) {
    return "high";
  }
  if (confidence >= 0.6) {
    return "medium";
  }
  return "low";
}
