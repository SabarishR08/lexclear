import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "LexClear | Legal document clarity", description: "Plain-language legal document assistance." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="notice" role="note">LexClear provides general information, not legal advice. Consult a licensed attorney for your specific situation.</div>{children}</body></html>;
}
