import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Jerico Lumanlan",
  description:
    "Product manager in climate tech. I write about the craft, build agents I actually use, and treat this site as the working log.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Sidebar />
        <main className="ml-0 md:ml-[190px] px-6 py-9 md:px-18 md:py-15">
          <div className="max-w-[640px]">{children}</div>
        </main>
      </body>
    </html>
  );
}
