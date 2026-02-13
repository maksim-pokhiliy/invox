"use client";

import * as React from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Alert,
  type AlertProps,
  AlertTitle,
  Button,
  IconButton,
  keyframes,
  LinearProgress,
  Slide,
  type SlideProps,
  Snackbar,
} from "@mui/material";

import { UI } from "@app/shared/config/config";

export type ToastSeverity = NonNullable<AlertProps["severity"]>;

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  message: string;
  title?: string;
  severity: ToastSeverity;
  duration?: number;
  action?: ToastAction;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const countdown = keyframes`
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
`;

const SEVERITY_ICONS: Record<ToastSeverity, React.ReactElement> = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

export function ToastItem({
  toast,
  index,
  onHide,
}: {
  toast: Toast;
  index: number;
  onHide: (id: string) => void;
}) {
  return (
    <Snackbar
      open
      autoHideDuration={toast.duration}
      onClose={() => onHide(toast.id)}
      slots={{ transition: SlideTransition }}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      sx={{ bottom: { xs: 16 + index * 80, sm: 24 + index * 80 } }}
    >
      <Alert
        severity={toast.severity}
        icon={SEVERITY_ICONS[toast.severity]}
        action={
          <>
            {toast.action && (
              <Button
                size="small"
                color="inherit"
                sx={{ fontWeight: 600, mr: 0.5 }}
                onClick={() => {
                  toast.action?.onClick();
                  onHide(toast.id);
                }}
              >
                {toast.action.label}
              </Button>
            )}
            <IconButton size="small" color="inherit" onClick={() => onHide(toast.id)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          minWidth: UI.TOAST_MIN_WIDTH,
          boxShadow: 2,
          "& .MuiAlert-icon": { alignItems: "center" },
        }}
      >
        {toast.title && <AlertTitle sx={{ fontWeight: 600 }}>{toast.title}</AlertTitle>}
        {toast.message}
        <LinearProgress
          variant="determinate"
          value={100}
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: "transparent",
            "& .MuiLinearProgress-bar": {
              transformOrigin: "left",
              animation: `${countdown} ${toast.duration || UI.TOAST_DURATION_DEFAULT}ms linear forwards`,
            },
          }}
        />
      </Alert>
    </Snackbar>
  );
}
