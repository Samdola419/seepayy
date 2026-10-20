import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeePay – Your shop, online by lunchtime",
  description: "Get your own shop link, take orders and get paid by Mobile Money. For any small business in Ghana.",
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
