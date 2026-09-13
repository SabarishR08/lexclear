// LexClear — AI for Legal Assistance & Access (PromptWars 2026 submission)
// Author: Sabarish R <sabarishr1087@gmail.com>
// Portfolio: https://sabarishr08.vercel.app | LinkedIn: https://www.linkedin.com/in/sabarishr08 | GitHub: https://github.com/SabarishR08
// Original work by the author. Please do not resubmit it as your own — see LICENSE.

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
