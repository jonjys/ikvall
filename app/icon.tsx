import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#050505",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div style={{ width: "70%", height: 6, background: "#e6ff3d" }} />
      </div>
    ),
    size
  )
}
