import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Momentum",
  description: "Slack command center with AI-powered actions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
