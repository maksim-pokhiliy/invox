"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link as MuiLink,
  alpha,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Logo } from "@app/shared/ui/logo";
import { Spinner } from "@app/shared/ui/loading";
import { useToast } from "@app/shared/ui/toast";
import { signUpSchema, SignUpInput } from "@app/shared/schemas";

const features = [
  "Create professional invoices in minutes",
  "Track payments and send reminders",
  "Record payments with multiple methods",
  "Manage all your clients in one place",
];

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
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error?.message || "Failed to create account");
        return;
      }

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

      toast.success("Welcome to Invox!");
      router.push("/app");
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
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ mb: 4 }}>
            <Logo size="large" />
          </Box>

          <Paper sx={{ p: 5, width: "100%", borderRadius: 3 }}>
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
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              {features.map((feature) => (
                <Box
                  key={feature}
                  sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.75 }}
                >
                  <CheckCircleIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography variant="body2" color="text.secondary">
                    {feature}
                  </Typography>
                </Box>
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
                helperText={errors.password?.message || "At least 8 characters"}
                autoComplete="new-password"
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? <Spinner size={24} /> : "Create Account"}
              </Button>
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
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
            &copy; {new Date().getFullYear()} Invox
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
