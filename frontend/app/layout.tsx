import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POC 79 — Real Estate Cashflow Model",
  description:
    "Intelligence Library — Property investment cashflow analysis dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-dex-bg text-dex-tx min-h-screen">
        {children}
      </body>
    </html>
  );
}