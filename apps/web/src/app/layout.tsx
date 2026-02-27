import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionSync } from "@/components/auth/SessionSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Omni Agent - Conversational AI Workspace",
  description: "Conversational AI workspace for documents and team collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl="/chat"
      signUpForceRedirectUrl="/chat"
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <SessionSync />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
