import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./component/header";
import SimpleHero from "./home/SimpleHero";
import Footer from "./component/Footer";
import { Noto_Sans_Arabic } from "next/font/google";
import Script from "next/script"; 



const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"], // Ensure Arabic subset is loaded
  weight: ["300", "400", "500", "600", "700", "800", "900"], // Desired font weights
  display: "swap", // Fallback strategy
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muta7market",
  description: "Muta7market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" className={notoSansArabic.className}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <Script
          src="https://checkout-web-components.checkout.com/index.js"
          strategy="afterInteractive"
        />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
