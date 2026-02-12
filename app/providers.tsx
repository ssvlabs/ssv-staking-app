"use client";

import { useState, type ReactNode } from "react";
import {
  darkTheme,
  lightTheme,
  RainbowKitProvider
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { ThemeProvider, useTheme } from "@/lib/theme";
import { wagmiConfig } from "@/lib/wagmi";

const Disclaimer = () => (
  <span className="text-[12px] leading-[18px] text-rk-modal-text-secondary">
    By connecting your wallet, you agree to the{" "}
    <a
      className="font-semibold text-rk-accent-color"
      href="https://ssv.network/terms-of-use/"
      rel="noreferrer"
      target="_blank"
    >
      Terms &amp; Conditions
    </a>{" "}
    and{" "}
    <a
      className="font-semibold text-rk-accent-color"
      href="https://ssv.network/privacy-policy/"
      rel="noreferrer"
      target="_blank"
    >
      Privacy Policy
    </a>
    .
  </span>
);

function ProvidersInner({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  const rainbowTheme =
    theme === "dark"
      ? (() => {
          const base = darkTheme({
            accentColor: "#1ba5f8",
            accentColorForeground: "#fdfefe",
            borderRadius: "large",
            fontStack: "system"
          });
          return {
            ...base,
            colors: {
              ...base.colors,
              modalBackground: "#0b2a3c",
              modalBorder: "#34455a",
              modalText: "#e6eaf7",
              modalTextSecondary: "#97a5ba",
              modalTextDim: "#97a5ba",
              generalBorder: "#34455a",
              generalBorderDim: "#34455a",
              menuItemBackground: "#34455a",
              actionButtonSecondaryBackground: "rgba(255, 255, 255, 0.06)",
              actionButtonBorder: "#34455a",
              connectButtonBackground: "#1ba5f8",
              connectButtonText: "#fdfefe",
              closeButton: "#cbd3e5",
              closeButtonBackground: "rgba(255, 255, 255, 0.06)",
              profileForeground: "#0b2a3c",
              selectedOptionBorder: "#34455a",
              modalBackdrop: "var(--color-overlay)"
            }
          };
        })()
      : (() => {
          const base = lightTheme({
            accentColor: "#1ba5f8",
            accentColorForeground: "#ffffff",
            borderRadius: "large",
            fontStack: "system"
          });
          return {
            ...base,
            colors: {
              ...base.colors,
              modalBackground: "#fdfefe",
              modalBorder: "#e6eaf7",
              modalText: "#0b2a3c",
              modalTextSecondary: "#63768b",
              modalTextDim: "#63768b",
              generalBorder: "#e6eaf7",
              generalBorderDim: "#e6eaf7",
              menuItemBackground: "#e6eaf7",
              actionButtonSecondaryBackground: "rgba(0, 0, 0, 0.06)",
              actionButtonBorder: "rgba(0, 0, 0, 0.04)",
              connectButtonBackground: "#1ba5f8",
              connectButtonText: "#ffffff",
              closeButton: "#3c4242",
              closeButtonBackground: "rgba(0, 0, 0, 0.06)",
              profileForeground: "#fdfefe",
              selectedOptionBorder: "#e6eaf7",
              modalBackdrop: "var(--color-overlay)"
            }
          };
        })();

  return (
    <RainbowKitProvider
      modalSize="compact"
      appInfo={{ disclaimer: Disclaimer }}
      theme={rainbowTheme}
    >
      {children}
    </RainbowKitProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ProvidersInner>{children}</ProvidersInner>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
