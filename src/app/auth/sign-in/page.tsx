"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

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
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { zodResolver } from "@hookform/resolvers/zod";

import { features } from "@app/shared/config/features";
import { SignInInput, signInSchema } from "@app/shared/schemas";
import { LoadingButton } from "@app/shared/ui/loading-button";
import { Logo } from "@app/shared/ui/logo";
import { useToast } from "@app/shared/ui/toast";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const theme = useTheme();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password");

        return;
      }

      toast.success("Welcome back!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
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
          top: "-20%",
          right: "-10%",
          width: "50%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ mb: 4 }}>
            <Logo size="large" />
          </Box>

          <Paper sx={{ p: 5, width: "100%", borderRadius: 3 }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Welcome back
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Sign in to your account
              </Typography>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...register("password")}
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                autoComplete="current-password"
                InputProps={{
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
                Sign In
              </LoadingButton>
            </Box>

            {features.publicRegistration && (
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
                  Don&apos;t have an account?{" "}
                  <MuiLink component={Link} href="/auth/sign-up" sx={{ fontWeight: 600 }}>
                    Sign up for free
                  </MuiLink>
                </Typography>
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
        </Box>
      </Container>
    </Box>
  );
}
