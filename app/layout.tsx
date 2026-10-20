import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "SeePay — Instant MoMo Storefronts for Ghanaian Businesses",
  description:
    "Launch your branded mobile storefront with instant MTN & Telecel MoMo checkout. Eliminate payment fraud, automate orders, and get direct split payouts.",
  keywords: [
    "Ghana e-commerce",
    "MoMo payments",
    "MTN Mobile Money",
    "Telecel Cash",
    "Paystack Ghana",
    "online store Ghana",
    "storefront Accra",
    "SeePay",
  ],
  authors: [{ name: "SeePay Team" }],
  openGraph: {
    title: "SeePay — Instant MoMo Storefronts for Ghanaian Businesses",
    description: "Launch your branded mobile storefront with instant MTN & Telecel MoMo checkout.",
    url: "https://seepay.shop",
    siteName: "SeePay",
    locale: "en_GH",
    type: "website",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}