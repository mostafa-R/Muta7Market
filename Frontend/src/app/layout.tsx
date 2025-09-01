import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Noto_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import Footer from "./component/Footer";
import Navbar from "./component/header";
import WhatsAppButton from "./component/WhatsAppButton";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Muta7market",
  description: "Muta7market - Sports Marketplace",
  icons: {
    icon: "/trophy.png",
  },
};

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"], 
  weight: ["300", "400", "500", "600", "700", "800", "900"], 
  display: "swap", 
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
  return (
    <html lang="ar" dir="rtl" className={`${notoSansArabic.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "44506d2e-9021-4372-a5d2-49765d4e46a1",
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
