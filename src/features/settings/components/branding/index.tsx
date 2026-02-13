"use client";

import * as React from "react";

import { Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";

import { ApiError } from "@app/shared/api";
import { BRANDING, FONT_FAMILY_MAP, VALIDATION } from "@app/shared/config/config";
import { useToast } from "@app/shared/hooks/use-toast";
import type { SenderProfile } from "@app/shared/schemas/api";
import { LoadingButton } from "@app/shared/ui/loading-button";

import { useUpdateSenderProfile } from "@app/features/settings";

import { BrandColors } from "./brand-colors";
import { BrandingPreview } from "./branding-preview";
import { LogoPreview } from "./logo-preview";

const toUndefined = (val: string | null | undefined): string | undefined => val || undefined;

interface BrandingTabProps {
  profile: SenderProfile | undefined;
}

export function BrandingTab({ profile }: BrandingTabProps) {
  const toast = useToast();
  const mutation = useUpdateSenderProfile();

  const [logoUrl, setLogoUrl] = React.useState("");
  const [primaryColor, setPrimaryColor] = React.useState(BRANDING.DEFAULT_PRIMARY_COLOR);
  const [accentColor, setAccentColor] = React.useState(BRANDING.DEFAULT_ACCENT_COLOR);
  const [footerText, setFooterText] = React.useState("");
  const [fontFamily, setFontFamily] = React.useState("");
  const [invoicePrefix, setInvoicePrefix] = React.useState("");
  const [isDirty, setIsDirty] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      setLogoUrl(profile.logoUrl || "");
      setPrimaryColor(profile.primaryColor || BRANDING.DEFAULT_PRIMARY_COLOR);
      setAccentColor(profile.accentColor || BRANDING.DEFAULT_ACCENT_COLOR);
      setFooterText(profile.footerText || "");
      setFontFamily(profile.fontFamily || "system");
      setInvoicePrefix(profile.invoicePrefix || "");
      setIsDirty(false);
    }
  }, [profile]);

  const markDirty = () => setIsDirty(true);

  const handleSave = () => {
    const data = {
      companyName: toUndefined(profile?.companyName),
      displayName: toUndefined(profile?.displayName),
      emailFrom: toUndefined(profile?.emailFrom),
      address: toUndefined(profile?.address),
      taxId: toUndefined(profile?.taxId),
      defaultCurrency: profile?.defaultCurrency || BRANDING.DEFAULT_CURRENCY,
      logoUrl: toUndefined(logoUrl),
      primaryColor: toUndefined(primaryColor),
      accentColor: toUndefined(accentColor),
      footerText: toUndefined(footerText),
      fontFamily: toUndefined(fontFamily === "system" ? "" : fontFamily),
      invoicePrefix: toUndefined(invoicePrefix),
    };

    mutation.mutate(data, {
      onSuccess: () => {
        toast.success("Branding saved successfully!");
        setIsDirty(false);
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Failed to save branding");
      },
    });
  };

  return (
    <>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        Invoice Branding
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Customize how your invoices look to clients.
      </Typography>

      <Stack direction="column" spacing={4} sx={{ maxWidth: 500 }}>
        <TextField
          label="Logo URL"
          value={logoUrl}
          onChange={(e) => {
            setLogoUrl(e.target.value);
            markDirty();
          }}
          fullWidth
          placeholder="https://example.com/logo.png"
          helperText="Enter a URL to your company logo (recommended: 200x60px)"
        />
        <LogoPreview logoUrl={logoUrl} />
        <Divider />
        <BrandColors
          primaryColor={primaryColor}
          accentColor={accentColor}
          onPrimaryChange={(v) => {
            setPrimaryColor(v);
            markDirty();
          }}
          onAccentChange={(v) => {
            setAccentColor(v);
            markDirty();
          }}
        />
        <Divider />
        <TextField
          select
          label="Font Style"
          value={fontFamily || "system"}
          onChange={(e) => {
            setFontFamily(e.target.value);
            markDirty();
          }}
          fullWidth
          helperText="Applied to public invoice pages and emails"
          sx={{
            "& .MuiSelect-select": {
              fontFamily: FONT_FAMILY_MAP[fontFamily || "system"],
            },
          }}
        >
          <MenuItem value="system" sx={{ fontFamily: FONT_FAMILY_MAP.system }}>
            System (Sans-serif)
          </MenuItem>
          <MenuItem value="serif" sx={{ fontFamily: FONT_FAMILY_MAP.serif }}>
            Serif (Georgia)
          </MenuItem>
          <MenuItem value="mono" sx={{ fontFamily: FONT_FAMILY_MAP.mono }}>
            Monospace (Courier)
          </MenuItem>
        </TextField>
        <TextField
          label="Invoice Prefix"
          value={invoicePrefix}
          onChange={(e) => {
            setInvoicePrefix(e.target.value.replace(/[^A-Za-z0-9]/g, ""));
            markDirty();
          }}
          fullWidth
          placeholder="INV"
          helperText="Prefix for payment references (e.g., MYCO → MYCO-ABC123)"
          slotProps={{ htmlInput: { maxLength: VALIDATION.MAX_PREFIX_LENGTH } }}
        />
        <TextField
          label="Footer Text"
          value={footerText}
          onChange={(e) => {
            setFooterText(e.target.value);
            markDirty();
          }}
          fullWidth
          multiline
          minRows={VALIDATION.FOOTER_MIN_ROWS}
          maxRows={VALIDATION.FOOTER_MAX_ROWS}
          placeholder="Payment instructions, thank-you note, etc."
          helperText="Shown on invoices and emails (max 500 characters)"
          slotProps={{ htmlInput: { maxLength: VALIDATION.MAX_FOOTER_TEXT_LENGTH } }}
        />
        <Divider />
        <BrandingPreview
          logoUrl={logoUrl}
          companyName={profile?.companyName || profile?.displayName || ""}
          primaryColor={primaryColor}
          accentColor={accentColor}
        />
      </Stack>

      <Stack direction="row" sx={{ mt: 4, justifyContent: "flex-end" }}>
        <LoadingButton
          variant="contained"
          onClick={handleSave}
          disabled={!isDirty}
          loading={mutation.isPending}
        >
          Save Changes
        </LoadingButton>
      </Stack>
    </>
  );
}
