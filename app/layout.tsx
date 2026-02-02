import type { ReactNode } from "react";
import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";

import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

import { Toaster } from "sonner";

import Providers from "@/app/providers";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans"
});

export const metadata: Metadata = {
  title: "Stake SSV | SSV Network",
  description:
    "Stake your SSV tokens to earn a share of SSV Network fees, paid in ETH.",
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    title: "Stake SSV | SSV Network",
    description:
      "Stake your SSV tokens to earn a share of SSV Network fees, paid in ETH.",
    type: "website",
    images: [
      {
        url: "/OGStaking.png",
        width: 1200,
        height: 630,
        alt: "SSV Network staking"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Stake SSV | SSV Network",
    description:
      "Stake your SSV tokens to earn a share of SSV Network fees, paid in ETH.",
    images: ["/OGStaking.png"]
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${dmSans.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
