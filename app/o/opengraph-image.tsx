import { ImageResponse } from "next/og"

export const alt = "Någon har skickat en kväll."
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
            fontSize: 76,
            lineHeight: 0.95,
            fontWeight: 650,
            letterSpacing: -2,
            maxWidth: 860,
          }}
        >
          Någon har skickat en kväll.
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#e6ff3d" }}>
          Öppna den.
        </div>
      </div>
    ),
    size
  )
}
