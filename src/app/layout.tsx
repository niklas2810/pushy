import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RegisterServiceWorkerWrapper from "./RegisterServiceWorkerWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pushy",
  description: "POC for Web Push API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Pushy</title>
        <meta name="theme-color" content="#18181b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pushy" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/img/bell.svg" sizes="192x192" />
        <link rel="apple-touch-icon" href="/img/bell-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
  {children}
  {/* Register service worker for PWA */}
  <RegisterServiceWorkerWrapper />
      </body>
    </html>
  );
}
