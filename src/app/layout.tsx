import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://petdex.dev"),
  title: "Petdex - Codex Pet Gallery",
  description:
    "Browse, preview, download, and submit animated Codex digital pets.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Petdex - Codex Pet Gallery",
    description:
      "Browse, preview, download, and submit animated Codex digital pets.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Petdex - Codex Pet Gallery",
    description:
      "Browse, preview, download, and submit animated Codex digital pets.",
    images: ["/og-twitter.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="h-full antialiased"
      >
        <body className="min-h-full flex flex-col font-sans">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
