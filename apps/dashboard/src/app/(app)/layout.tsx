import "../../global.css";
import { DashboardRouterTopProgressBar } from "@/lib/DashboardRouter";
import { cn } from "@/lib/utils";
import { PHProvider } from "lib/posthog/Posthog";
import { PosthogHeadSetup } from "lib/posthog/PosthogHeadSetup";
import { PostHogPageView } from "lib/posthog/PosthogPageView";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { AppRouterProviders } from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thirdweb.com"),
  alternates: {
    canonical: "./",
  },
  title: "thirdweb: The complete web3 development platform",
  description:
    "Build web3 apps easily with thirdweb's powerful SDKs, audited smart contracts, and developer tools—for Ethereum & 700+ EVM chains. Try now.",
  openGraph: {
    title: "thirdweb: The complete web3 development platform",
    description:
      "Build web3 apps easily with thirdweb's powerful SDKs, audited smart contracts, and developer tools—for Ethereum & 700+ EVM chains. Try now.",
    type: "website",
    locale: "en_US",
    url: "https://thirdweb.com",
    siteName: "thirdweb",
    images: [
      {
        url: "https://thirdweb.com/assets/og-image/thirdweb.png",
        width: 1200,
        height: 630,
        alt: "thirdweb",
      },
    ],
  },
  twitter: {
    creator: "@thirdweb",
    site: "@thirdweb",
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <PlausibleProvider
          domain="thirdweb.com"
          customDomain="https://pl.thirdweb.com"
          selfHosted
        />
        <PosthogHeadSetup />
      </head>
      <PHProvider disable_session_recording={true}>
        <PostHogPageView />
        <body
          className={cn(
            "bg-background font-sans antialiased",
            fontSans.variable,
          )}
        >
          <AppRouterProviders>{children}</AppRouterProviders>
          <DashboardRouterTopProgressBar />
          <NextTopLoader
            color="hsl(var(--foreground))"
            height={3}
            shadow={false}
            showSpinner={false}
          />
        </body>
      </PHProvider>
    </html>
  );
}
