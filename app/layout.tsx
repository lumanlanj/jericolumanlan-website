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

export const metadata: Metadata = {
  title: "Jerico Lumanlan — Product Manager",
  description:
    "Jerico Lumanlan is a Product Manager building products across sustainability, ecommerce, and customer experience.",
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
