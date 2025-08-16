import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Noto_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import Footer from "./component/Footer";
import Navbar from "./component/header";
import WhatsAppButton from "./component/WhatsAppButton";
import { Providers } from "./providers";

// Language support needs to be server-side only imports
export const metadata: Metadata = {
  title: "Muta7market",
  description: "Muta7market - Sports Marketplace",
  icons: {
    icon: "/trophy.png",
  },
};

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"], // Ensure Arabic subset is loaded
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Desired font weights
  display: "swap", // Fallback strategy
  variable: "--font-arabic",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lang and direction are set client-side via JavaScript in LanguageProvider
  return (
    <html lang="en" dir="ltr" className={`${notoSansArabic.variable}`}>
      <head>
        {/* Default metadata, will be overridden by client-side language selection */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* OneSignal SDK */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "b8f45ad2-ae38-46e2-a160-069a90d04b92",
            });
          });
        `}
        </Script>

        <Script
          src="https://paylink.sa/assets/js/paylink.js"
          strategy="afterInteractive"
        />
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <WhatsAppButton />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
