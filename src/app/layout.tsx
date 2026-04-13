import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { KeyboardProvider } from "@/components/keyboard-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "chklst",
  description: "Daily checklist manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-svh flex-col">
        <Nav />
        <KeyboardProvider>
          <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
        </KeyboardProvider>
        <Footer />
      </body>
    </html>
  );
}
