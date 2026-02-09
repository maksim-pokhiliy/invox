"use client";

import * as React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { BANKING } from "@app/shared/config/config";
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 4,
      }}
    >
      {status === "loading" && <ConnectReturnLoading />}
      {status === "success" && <ConnectReturnSuccess />}
      {status === "error" && <ConnectReturnError />}
    </Box>
  );
}

function ConnectReturnLoading() {
  return (
    <>
      <CircularProgress size={48} />
      <Typography variant="h6" fontWeight={600}>
        Connecting your bank...
      </Typography>
    </>
  );
}

function ConnectReturnSuccess() {
  return (
    <>
      <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />
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
      <ErrorIcon sx={{ fontSize: 48, color: "error.main" }} />
      <Typography variant="h6" fontWeight={600}>
        Connection failed
      </Typography>
      <Typography variant="body2" color="text.secondary">
        This window will close automatically.
      </Typography>
    </>
  );
}
