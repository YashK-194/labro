import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "60px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            margin: "40px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "#0d9488",
              marginBottom: "20px",
              fontFamily: "system-ui",
            }}
          >
            LABRO
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#374151",
              textAlign: "center",
              fontFamily: "system-ui",
              fontWeight: "500",
              maxWidth: "800px",
              lineHeight: "1.2",
            }}
          >
            Find Local Services & Workers in Your Area
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#6b7280",
              textAlign: "center",
              fontFamily: "system-ui",
              marginTop: "20px",
              maxWidth: "700px",
            }}
          >
            Connect with skilled professionals near you
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
