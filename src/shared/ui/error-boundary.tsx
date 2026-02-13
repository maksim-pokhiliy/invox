"use client";

import * as React from "react";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Button, Paper, Stack, Typography } from "@mui/material";

import { UI } from "@app/shared/config/config";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            p: 3,
          }}
        >
          <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center", maxWidth: 480 }}>
            <ErrorOutlineIcon sx={{ fontSize: UI.METRIC_ICON_SIZE, color: "error.main", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred. Please try again.
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              Try Again
            </Button>
          </Paper>
        </Stack>
      );
    }

    return this.props.children;
  }
}
