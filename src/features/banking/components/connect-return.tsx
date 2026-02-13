"use client";

import * as React from "react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { CircularProgress, Stack, Typography } from "@mui/material";

import { BANKING, UI } from "@app/shared/config/config";

import { useCompleteConnection } from "../hooks";

type ConnectionStatus = "loading" | "success" | "error";

export function ConnectReturn() {
  const completeConnection = useCompleteConnection();
  const [status, setStatus] = React.useState<ConnectionStatus>("loading");
  const didRun = React.useRef(false);

  React.useEffect(() => {
    if (didRun.current) {
      return;
    }

    didRun.current = true;

    completeConnection
      .mutateAsync()
      .then(() => {
        setStatus("success");
        window.opener?.postMessage({ type: "bank-connected" }, window.location.origin);
        setTimeout(() => window.close(), BANKING.CONNECT_SUCCESS_DELAY);
      })
      .catch(() => {
        setStatus("error");
        setTimeout(() => window.close(), BANKING.CONNECT_ERROR_DELAY);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
      }}
    >
      {status === "loading" && <ConnectReturnLoading />}
      {status === "success" && <ConnectReturnSuccess />}
      {status === "error" && <ConnectReturnError />}
    </Stack>
  );
}

function ConnectReturnLoading() {
  return (
    <>
      <CircularProgress size={UI.ICON_SIZE_XL} />
      <Typography variant="h6" fontWeight={600}>
        Connecting your bank...
      </Typography>
    </>
  );
}

function ConnectReturnSuccess() {
  return (
    <>
      <CheckCircleIcon sx={{ fontSize: UI.ICON_SIZE_XL, color: "success.main" }} />
      <Typography variant="h6" fontWeight={600}>
        Bank connected!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This window will close automatically.
      </Typography>
    </>
  );
}

function ConnectReturnError() {
  return (
    <>
      <ErrorIcon sx={{ fontSize: UI.ICON_SIZE_XL, color: "error.main" }} />
      <Typography variant="h6" fontWeight={600}>
        Connection failed
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This window will close automatically.
      </Typography>
    </>
  );
}
