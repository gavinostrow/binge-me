import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "binge",
  description: "Social movie and TV show rankings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-bg-primary text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}
