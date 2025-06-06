import type { SideBar } from "@/components/Layouts/DocLayout";
import { DotNetIcon, ReactIcon, TypeScriptIcon, UnityIcon } from "@/icons";
import { ExternalLinkIcon } from "lucide-react";
import { UnrealEngineIcon } from "../../icons/sdks/UnrealEngineIcon";

// TODO: move the following two slugs to walletSlug with updated docs
const inAppSlug = "/connect/in-app-wallet";

const walletSlug = "/connect/wallet";
const aAslug = "/connect/account-abstraction";
const authSlug = "/connect/auth";

export const sidebar: SideBar = {
  name: "Connect",
  links: [
    { separator: true },
    {
      name: "Introduction",
      href: "/connect",
    },
    {
      name: "Why thirdweb?",
      href: "/connect/why-thirdweb",
    },
    {
      name: "Playground",
      href: "https://playground.thirdweb.com/",
      icon: <ExternalLinkIcon />,
    },
    {
      name: "Templates",
      href: "https://thirdweb.com/templates",
      icon: <ExternalLinkIcon />,
    },
    { separator: true },
    // Connect\
    {
      name: "Onboard Users",
      expanded: true,
      isCollapsible: false,
      links: [
        {
          name: "Overview",
          href: `${walletSlug}/overview`,
        },
        {
          name: "Security",
          href: `${walletSlug}/security`,
        },
        {
          name: "Get Started",
          href: `${walletSlug}/get-started`,
        },
        {
          name: "External Wallets",
          href: `${walletSlug}/sign-in-methods/external-wallets`,
        },
        {
          name: "In-App Wallets",
          links: [
            {
              name: "Sign-In Methods",
              href: `${walletSlug}/sign-in-methods/configure`,
            },
            {
              name: "Fetch Users",
              href: `${walletSlug}/get-users`,
            },
            {
              name: "Pregenerate Wallets",
              href: `${walletSlug}/pregenerate-wallets`,
            },
            {
              name: "Guest Mode",
              href: `${walletSlug}/sign-in-methods/guest`,
            },
            {
              name: "FAQ",
              href: `${walletSlug}/in-app-wallet/faq`,
            },
            {
              name: "Custom Authentication",
              links: [
                {
                  name: "Overview",
                  href: `${inAppSlug}/custom-auth/overview`,
                },
                {
                  name: "Configuration",
                  href: `${inAppSlug}/custom-auth/configuration`,
                },
                {
                  name: "Integration guides",
                  links: [
                    {
                      name: "Custom auth server (OIDC Auth)",
                      href: `${inAppSlug}/custom-auth/custom-jwt-auth-server`,
                    },
                    {
                      name: "Custom auth server (Generic Auth)",
                      href: `${inAppSlug}/custom-auth/custom-auth-server`,
                    },
                    {
                      name: "Firebase Auth",
                      href: `${inAppSlug}/custom-auth/firebase-auth`,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Ecosystem Wallets",
          links: [
            {
              name: "Set-up",
              href: `${walletSlug}/ecosystem/set-up`,
            },
            {
              name: "Ecosystem Portal",
              href: `${walletSlug}/ecosystem/portal`,
            },
            {
              name: "Managing Ecosystem Permissions",
              href: `${walletSlug}/ecosystem/permissions`,
            },
            {
              name: "Integrating with Partners",
              href: `${walletSlug}/ecosystem/integrating-partners`,
            },
            {
              name: "Register with WalletConnect",
              href: `${walletSlug}/ecosystem/register-walletconnect`,
            },
            {
              name: "FAQ",
              href: `${walletSlug}/ecosystem/faq`,
            },
          ],
        },
        //Account abstraction
        {
          name: "Account Abstraction",
          links: [
            {
              name: "Overview",
              href: `${aAslug}/overview`,
            },
            {
              name: "How it Works",
              href: `${aAslug}/how-it-works`,
            },
            {
              name: "Get Started",
              links: [
                {
                  name: "TypeScript",
                  href: "/typescript/v5/account-abstraction/get-started",
                  icon: <TypeScriptIcon />,
                },
                {
                  name: "React",
                  href: "/react/v5/account-abstraction/get-started",
                  icon: <ReactIcon />,
                },
                {
                  name: "React Native",
                  // TODO - add react-native dedicated page
                  href: "/react/v5/account-abstraction/get-started",
                  icon: <ReactIcon />,
                },
                {
                  name: "Dotnet",
                  href: "/dotnet/wallets/providers/account-abstraction",
                  icon: <DotNetIcon />,
                },
                {
                  name: "Unity",
                  href: "/unity/wallets/providers/account-abstraction",
                  icon: <UnityIcon />,
                },
              ],
            },
            {
              name: "ERC-20 Paymaster",
              href: `${aAslug}/erc-20-paymaster`,
            },
            {
              name: "Account Factories",
              href: `${aAslug}/factories`,
            },
            {
              name: "Bundler & Paymaster",
              href: `${aAslug}/infrastructure`,
            },
            {
              name: "Sponsorship rules",
              href: `${aAslug}/sponsorship-rules`,
            },
            {
              name: "API Reference",
              href: `${aAslug}/api`,
            },
            {
              name: "FAQs",
              href: `${aAslug}/faq`,
            },
          ],
        },
        {
          name: "Web3 Onboard",
          links: [
            {
              name: "Overview",
              href: `${walletSlug}/web3-onboard/overview`,
            },
            {
              name: "Migration Guide",
              href: `${walletSlug}/web3-onboard/migration-guide`,
            },
          ],
        },
        {
          name: "Migrate to thirdweb",
          href: `${walletSlug}/migrate-to-thirdweb`,
        },
        {
          name: "FAQ",
          href: `${walletSlug}/faq`,
        },
      ],
    },
    { separator: true },
    // User identity
    {
      name: "User Identity",
      isCollapsible: false,
      links: [
        // Auth
        // TODO move to TS reference
        {
          name: "Sign In with Ethereum",
          links: [
            {
              name: "Get Started",
              href: `${authSlug}`,
            },
            {
              name: "Frameworks",
              isCollapsible: true,
              expanded: false,
              links: [
                {
                  name: "Next.js",
                  href: `${authSlug}/frameworks/next`,
                },
                {
                  name: "React + Express",
                  href: `${authSlug}/frameworks/react-express`,
                },
              ],
            },
            {
              name: "Deploying to Production",
              href: `${authSlug}/deploying-to-production`,
            },
          ],
        },
        {
          name: "Get User Profiles",
          href: `${walletSlug}/user-management/get-user-profiles`,
        },
        {
          name: "Link Multiple Identities",
          href: `${walletSlug}/user-management/link-multiple-identity`,
        },
        {
          name: "Export Private Keys",
          href: `${walletSlug}/user-management/export-private-key`,
        },
        // TODO:
        // {
        //   name: "Deleting User Details",
        //   href: `${walletSlug}/user-management/deleting-user-details`,
        // },
      ],
    },
    { separator: true },
    // Blockchain API
    // TODO Overview page?
    {
      name: "API References",
      isCollapsible: false,
      links: [
        {
          name: "TypeScript",
          href: "/typescript/v5",
          icon: <TypeScriptIcon />,
        },
        {
          name: "React",
          href: "/react/v5",
          icon: <ReactIcon />,
        },
        {
          name: "React Native",
          href: "/react-native/v5",
          icon: <ReactIcon />,
        },
        {
          name: "Dotnet",
          href: "/dotnet",
          icon: <DotNetIcon />,
        },
        {
          name: "Unity",
          href: "/unity",
          icon: <UnityIcon />,
        },
        {
          name: "Unreal Engine",
          href: "/unreal-engine",
          icon: <UnrealEngineIcon />,
        },
      ],
    },
  ],
};
