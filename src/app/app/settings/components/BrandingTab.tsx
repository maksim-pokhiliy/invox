"use client";

import * as React from "react";
import { Box, Button, Typography, TextField, Divider, alpha, useTheme } from "@mui/material";
import { Spinner } from "@app/components/feedback/Loading";
import { useToast } from "@app/components/feedback/Toast";
import { useUpdateSenderProfile, ApiError } from "@app/lib/api";
import type { SenderProfile } from "@app/shared/schemas/api";

interface BrandingTabProps {
  profile: SenderProfile | undefined;
}

export function BrandingTab({ profile }: BrandingTabProps) {
  const theme = useTheme();
  const toast = useToast();
  const updateProfileMutation = useUpdateSenderProfile();

  const [logoUrl, setLogoUrl] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState("#1976d2");
  const [accentColor, setAccentColor] = React.useState("#9c27b0");
  const [brandingDirty, setBrandingDirty] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logoUrl || "");
      setPrimaryColor(profile.primaryColor || "#1976d2");
      setAccentColor(profile.accentColor || "#9c27b0");
      setBrandingDirty(false);
    }
  }, [profile]);

  const handleSaveBranding = () => {
    updateProfileMutation.mutate(
      {
        companyName: profile?.companyName || undefined,
        displayName: profile?.displayName || undefined,
        emailFrom: profile?.emailFrom || undefined,
        address: profile?.address || undefined,
        taxId: profile?.taxId || undefined,
        defaultCurrency: profile?.defaultCurrency || "USD",
        logoUrl: logoUrl || undefined,
        primaryColor: primaryColor || undefined,
        accentColor: accentColor || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Branding saved successfully!");
          setBrandingDirty(false);
        },
        onError: (err) => {
          toast.error(err instanceof ApiError ? err.message : "Failed to save branding");
        },
      }
    );
  };

  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        Invoice Branding
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Customize how your invoices look to clients. These settings will be applied to all public
        invoice views.
      </Typography>

      <Box sx={{ display: "grid", gap: 4, maxWidth: 500 }}>
        <TextField
          label="Logo URL"
          value={logoUrl}
          onChange={(e) => {
            setLogoUrl(e.target.value);
            setBrandingDirty(true);
          }}
          fullWidth
          placeholder="https://example.com/logo.png"
          helperText="Enter a URL to your company logo (recommended: 200x60px)"
        />

        {logoUrl && (
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5),
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Logo Preview
            </Typography>
            <Box
              component="img"
              src={logoUrl}
              alt="Logo preview"
              sx={{
                maxWidth: 200,
                maxHeight: 60,
                objectFit: "contain",
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </Box>
        )}

        <Divider />

        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Brand Colors
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Primary Color
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box
                  component="input"
                  type="color"
                  value={primaryColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPrimaryColor(e.target.value);
                    setBrandingDirty(true);
                  }}
                  sx={{
                    width: 48,
                    height: 48,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    cursor: "pointer",
                    p: 0.5,
                  }}
                />
                <TextField
                  size="small"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    setBrandingDirty(true);
                  }}
                  sx={{ width: 120 }}
                  slotProps={{
                    htmlInput: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Accent Color
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Box
                  component="input"
                  type="color"
                  value={accentColor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setAccentColor(e.target.value);
                    setBrandingDirty(true);
                  }}
                  sx={{
                    width: 48,
                    height: 48,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    cursor: "pointer",
                    p: 0.5,
                  }}
                />
                <TextField
                  size="small"
                  value={accentColor}
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    setBrandingDirty(true);
                  }}
                  sx={{ width: 120 }}
                  slotProps={{
                    htmlInput: { pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Preview
          </Typography>
          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              {logoUrl ? (
                <Box
                  component="img"
                  src={logoUrl}
                  alt="Logo"
                  sx={{ maxWidth: 120, maxHeight: 40, objectFit: "contain" }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Typography variant="h6" fontWeight={700} sx={{ color: primaryColor }}>
                  {profile?.companyName || profile?.displayName || "Your Company"}
                </Typography>
              )}
            </Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: primaryColor, mb: 1 }}>
              Invoice #INV-001
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                size="small"
                variant="contained"
                sx={{ bgcolor: primaryColor, "&:hover": { bgcolor: primaryColor } }}
              >
                Pay Now
              </Button>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: accentColor,
                  borderColor: accentColor,
                  "&:hover": { borderColor: accentColor },
                }}
              >
                Download
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={handleSaveBranding}
          disabled={!brandingDirty || updateProfileMutation.isPending}
          sx={{ minWidth: 150 }}
        >
          {updateProfileMutation.isPending ? <Spinner size={20} /> : "Save Changes"}
        </Button>
      </Box>
    </>
  );
}
