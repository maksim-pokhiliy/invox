import { ImageResponse } from "next/og";

import { UI } from "@app/shared/config/config";

export const size = { width: UI.FAVICON_SIZE, height: UI.FAVICON_SIZE };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
        borderRadius: "22%",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: UI.FAVICON_ICON_SIZE,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        $
      </span>
    </div>,
    { ...size }
  );
}
