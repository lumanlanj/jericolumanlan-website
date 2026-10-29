import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import VercelAnalytics from "@/components/VercelAnalytics";
import Clarity from "@/components/Clarity";
import Tracker from "@/components/Tracker";
import TopNav from "@/components/TopNav";

// Swiss / International Typographic type system: Geist (neutral grotesk) for
// reading, JetBrains Mono as the structural labeling layer (eyebrows, section
// numbers, status pills, dates, URLs).
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const TITLE =
  "Jerico Lumanlan — Senior Product Manager | Climate Tech, E-commerce & AI";
const DESCRIPTION =
  "Senior Product Manager at Xpansiv who turns customer insight into revenue across climate tech and e-commerce — and builds the AI agents he uses every day. Ex-Staples, Pitney Bowes. Boston.";
const SITE_URL = "https://heyjerico.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Jerico Lumanlan",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@jericolumanlan",
    images: ["/og.jpg"],
  },
};

// Dark browser chrome to match the site; edge-to-edge so the safe-area insets
// below can let the floating nav clear the notch / Dynamic Island.
export const viewport: Viewport = {
  themeColor: "#08080c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Progressive-enhancement flag: arms scroll-reveal hiding only when JS
            is present, so no-JS visitors still see all content. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="antialiased">
        <TopNav />
        {children}
        <VercelAnalytics />
        <Clarity />
        <Tracker />
      </body>
    </html>
  );
}
