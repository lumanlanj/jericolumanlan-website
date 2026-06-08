import type { Metadata } from "next";
import { Inter, Fragment_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono-fragment",
  display: "swap",
});

const TITLE = "Jerico Lumanlan — Product Manager";
const DESCRIPTION =
  "Jerico Lumanlan is a Product Manager building products across sustainability, ecommerce, and customer experience.";
const SITE_URL = "https://jericolumanlan.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Jerico Lumanlan",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 2400,
        height: 1260,
        alt: "Jerico Lumanlan — Product Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@jericolumanlan",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${fragmentMono.variable}`}>
      <body className="antialiased">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
