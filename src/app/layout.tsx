import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { KeyboardProvider } from "@/components/keyboard-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "chklst",
  description: "Daily checklist manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Nav />
        <KeyboardProvider>
          <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
        </KeyboardProvider>
      </body>
    </html>
  );
}
