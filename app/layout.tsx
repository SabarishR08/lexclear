import type { Metadata } from "next";
import { DisclaimerBanner } from "@/components/disclaimer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LexClear | Legal document clarity",
    template: "%s | LexClear",
  },
  description:
    "Plain-language explanations, risk labels and grounded answers for leases, contracts, offer letters and NDAs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <DisclaimerBanner />
        {children}
      </body>
    </html>
  );
}
