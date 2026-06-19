import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PriceOS — Price Intelligence Platform",
  description: "Compare prices across Amazon, Flipkart, Blinkit, Zepto and more. Powered by Gemini AI.",
  openGraph: {
    title: "PriceOS — Price Intelligence",
    description: "AI-powered price comparison across Indian e-commerce and quick-commerce platforms.",
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23171717'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-weight='900' font-size='14' fill='%2310b981'%3EP_%3C/text%3E%3C/svg%3E",
  },
};

export const viewport = { themeColor: "#171717" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
