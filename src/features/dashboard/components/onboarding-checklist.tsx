"use client";

import * as React from "react";
import {
  Box,
  Collapse,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { STORAGE_KEYS, UI } from "@app/shared/config/config";
import { storage } from "@app/shared/lib/storage";

const COLLAPSED_KEY = STORAGE_KEYS.ONBOARDING_DISMISSED;

interface OnboardingStep {
  label: string;
  completed: boolean;
  href: string;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  isLoading: boolean;
  onNavigate: (href: string) => void;
}

function ChecklistSteps({
  steps,
  onNavigate,
}: {
  steps: OnboardingStep[];
  onNavigate: (href: string) => void;
}) {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {steps.map((step) => (
        <Box
          key={step.label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 1.5,
            cursor: step.completed ? "default" : "pointer",
            "&:hover": step.completed
              ? {}
              : { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) },
          }}
          onClick={step.completed ? undefined : () => onNavigate(step.href)}
        >
          {step.completed ? (
            <CheckCircleIcon fontSize="small" color="success" />
          ) : (
            <RadioButtonUncheckedIcon fontSize="small" sx={{ color: "text.secondary" }} />
          )}
          <Typography
            variant="body2"
            sx={{
              textDecoration: step.completed ? "line-through" : "none",
              color: step.completed ? "text.secondary" : "text.primary",
              fontWeight: step.completed ? 400 : 500,
            }}
          >
            {step.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function OnboardingChecklist({ steps, isLoading, onNavigate }: OnboardingChecklistProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setExpanded(storage.get(COLLAPSED_KEY) !== "true");
    setMounted(true);
  }, []);

  const completedCount = steps.filter((s) => s.completed).length;
  const allComplete = completedCount === steps.length;
  const progress = (completedCount / steps.length) * 100;

  if (!mounted || isLoading || allComplete) {
    return null;
  }

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      storage.remove(COLLAPSED_KEY);
    } else {
      storage.set(COLLAPSED_KEY, "true");
    }
  };

  return (
    <Paper
      sx={{
        mb: 3,
        borderRadius: 3,
        border: 1,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        bgcolor: alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Box
        onClick={handleToggle}
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER) },
          borderRadius: 3,
        }}
      >
        <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>
          {expanded ? "Get started with Invox" : "Setup guide"}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          {completedCount}/{steps.length}
        </Typography>
        <IconButton
          size="small"
          component="span"
          aria-label={expanded ? "Collapse checklist" : "Expand checklist"}
          sx={{ p: 0 }}
        >
          {expanded ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Complete these steps to set up your account
          </Typography>
          <ChecklistSteps steps={steps} onNavigate={onNavigate} />
        </Box>
      </Collapse>
    </Paper>
  );
}
