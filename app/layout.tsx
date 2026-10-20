import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeePay",
  description: "Your shop, online by lunchtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}