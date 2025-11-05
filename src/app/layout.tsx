import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agentic Chat - Aferi??o",
  description: "ChatGPT-like app with multi-vendor models and aferi??o power apps",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container-app">{children}</div>
      </body>
    </html>
  );
}
