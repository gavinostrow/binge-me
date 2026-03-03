import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D0D12",
};

export const metadata: Metadata = {
  title: "binge — rank your watches",
  description:
    "Social movie and TV show rankings. Rate, rank, and discover what to watch next with friends.",
  keywords: [
    "movies",
    "tv shows",
    "ratings",
    "rankings",
    "social",
    "recommendations",
    "watchlist",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "binge",
  },
  openGraph: {
    title: "binge — rank your watches",
    description:
      "Social movie and TV show rankings. Rate, rank, and discover what to watch next with friends.",
    type: "website",
    siteName: "binge",
  },
  twitter: {
    card: "summary_large_image",
    title: "binge — rank your watches",
    description:
      "Social movie and TV show rankings. Rate, rank, and discover what to watch next with friends.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-bg-primary text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
