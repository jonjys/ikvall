import { ImageResponse } from "next/og"

export const alt = "IKVÄLL. En mening. En öppningsscen."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#050505",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 10 }}>
          IKVÄLL
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 84,
            lineHeight: 0.92,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          <span>En mening.</span>
          <span>En öppningsscen.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#e6ff3d" }}>
          29 kr · en länk
        </div>
      </div>
    ),
    size
  )
}
