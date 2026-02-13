"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  alpha,
  Box,
  Container,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { zodResolver } from "@hookform/resolvers/zod";

import { ApiError } from "@app/shared/api/base";
import { UI } from "@app/shared/config/config";
import { features } from "@app/shared/config/features";
import { useToast } from "@app/shared/hooks/use-toast";
import { SignUpInput, signUpSchema } from "@app/shared/schemas";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { Logo } from "@app/shared/ui/logo";

import { authApi } from "@app/features/auth";

const SIGN_UP_FEATURES = [
  "Create professional invoices in minutes",
  "Track payments and send reminders",
  "Record payments with multiple methods",
  "Manage all your clients in one place",
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const theme = useTheme();
  const toast = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
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

  return (
    <Stack
      direction="row"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: "50%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="column" sx={{ alignItems: "center" }}>
          <Box sx={{ mb: 4 }}>
            <Logo size="large" />
          </Box>

          <Paper sx={{ p: 5, width: "100%", borderRadius: 3 }}>
            {features.publicRegistration ? (
              <>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    Create your account
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Start managing invoices like a pro
                  </Typography>
                </Box>

                <Box
                  sx={{
                    mb: 4,
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, UI.ALPHA_HOVER),
                  }}
                >
                  {SIGN_UP_FEATURES.map((feature) => (
                    <Stack
                      key={feature}
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center", py: 0.75 }}
                    >
                      <CheckCircleIcon sx={{ fontSize: UI.ICON_SIZE_SM, color: "primary.main" }} />

                      <Typography variant="body2" color="text.secondary">
                        {feature}
                      </Typography>
                    </Stack>
                  ))}
                </Box>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    {...register("email")}
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
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

                  <TextField
                    {...register("password")}
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message || "At least 8 characters"}
                    autoComplete="new-password"
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

                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: 1,
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <MuiLink component={Link} href="/auth/sign-in" sx={{ fontWeight: 600 }}>
                      Sign in
                    </MuiLink>
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Registration is closed
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  New accounts can only be created by an administrator.
                </Typography>

                <MuiLink component={Link} href="/auth/sign-in" sx={{ fontWeight: 600 }}>
                  Back to sign in
                </MuiLink>
              </Box>
            )}
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://getpaid.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit" }}
            >
              GetPaid
            </a>
          </Typography>
        </Stack>
      </Container>
    </Stack>
  );
}
