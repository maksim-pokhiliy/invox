"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailIcon from "@mui/icons-material/Email";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";

import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@app/shared/api/base";
import { useToast } from "@app/shared/hooks/use-toast";
import {
  type SignUpInput,
  signUpSchema,
  WAITLIST_STATUS,
  type WaitlistInput,
  waitlistSchema,
} from "@app/shared/schemas";
import { LoadingButton } from "@app/shared/ui/loading-button";

import { authApi } from "@app/features/auth";

import { waitlistApi } from "../api";

type Step = "email_check" | "register" | "pending" | "join_waitlist" | "submitted";

export function WaitlistForm() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = React.useState<Step>("email_check");
  const [checkedEmail, setCheckedEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const emailForm = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
  });

  const registerForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onCheckEmail = async (data: WaitlistInput) => {
    setIsLoading(true);

    try {
      const result = await waitlistApi.checkStatus(data);

      setCheckedEmail(data.email);

      switch (result.status) {
        case WAITLIST_STATUS.APPROVED:
          registerForm.setValue("email", data.email);
          setStep("register");
          break;
        case WAITLIST_STATUS.PENDING:
          setStep("pending");
          break;
        case WAITLIST_STATUS.NOT_FOUND:
          setStep("join_waitlist");
          break;
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: SignUpInput) => {
    setIsLoading(true);

    try {
      await authApi.signUp(data);

      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Account created! Please sign in.");
        router.push("/auth/sign-in");

        return;
      }

      toast.success("Welcome to GetPaid!");
      router.push("/app");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onJoinWaitlist = async () => {
    setIsLoading(true);

    try {
      await waitlistApi.join({ email: checkedEmail });
      setStep("submitted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "submitted") {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: "success.main", mb: 2 }} />

        <Typography variant="h5" fontWeight={700} gutterBottom>
          You&apos;re on the list!
        </Typography>

        <Typography variant="body2" color="text.secondary">
          We&apos;ll notify you at <strong>{checkedEmail}</strong> when your account is ready.
        </Typography>
      </Box>
    );
  }

  if (step === "pending") {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <HourglassEmptyIcon sx={{ fontSize: 48, color: "warning.main", mb: 2 }} />

        <Typography variant="h5" fontWeight={700} gutterBottom>
          You&apos;re on the waitlist
        </Typography>

        <Typography variant="body2" color="text.secondary">
          We&apos;ll notify you at <strong>{checkedEmail}</strong> when your account is ready.
        </Typography>

        <MuiLink
          component={Link}
          href="/auth/sign-in"
          sx={{ fontWeight: 600, display: "inline-block", mt: 3 }}
        >
          Back to sign in
        </MuiLink>
      </Box>
    );
  }

  if (step === "join_waitlist") {
    return (
      <Box>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Join the waitlist
          </Typography>

          <Typography variant="body2" color="text.secondary">
            We&apos;re not open for public registration yet. We&apos;ll notify you at{" "}
            <strong>{checkedEmail}</strong> when it&apos;s your turn.
          </Typography>
        </Box>

        <LoadingButton
          variant="contained"
          fullWidth
          size="large"
          sx={{ py: 1.5 }}
          loading={isLoading}
          onClick={onJoinWaitlist}
        >
          Join Waitlist
        </LoadingButton>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <MuiLink
            component="button"
            type="button"
            onClick={() => setStep("email_check")}
            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
          >
            Use a different email
          </MuiLink>
        </Box>
      </Box>
    );
  }

  if (step === "register") {
    return (
      <Box>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Create your account
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Your email has been approved. Set a password to get started.
          </Typography>
        </Box>

        <Box component="form" onSubmit={registerForm.handleSubmit(onRegister)} noValidate>
          <TextField
            {...registerForm.register("email")}
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            disabled
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            {...registerForm.register("password")}
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            error={!!registerForm.formState.errors.password}
            helperText={registerForm.formState.errors.password?.message || "At least 8 characters"}
            autoComplete="new-password"
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3, py: 1.5 }}
            loading={isLoading}
          >
            Create Account
          </LoadingButton>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Get started
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Enter your email to check your access or join the waitlist.
        </Typography>
      </Box>

      <Box component="form" onSubmit={emailForm.handleSubmit(onCheckEmail)} noValidate>
        <TextField
          {...emailForm.register("email")}
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          error={!!emailForm.formState.errors.email}
          helperText={emailForm.formState.errors.email?.message}
          autoComplete="email"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          sx={{ mt: 2, py: 1.5 }}
          loading={isLoading}
        >
          Continue
        </LoadingButton>
      </Box>
    </Box>
  );
}
