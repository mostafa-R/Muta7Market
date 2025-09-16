import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import DynamicSeo from "@/components/DynamicSeo";
import { Noto_Sans_Arabic } from "next/font/google";
import Script from "next/script";
import DynamicFavicon from "./component/DynamicFavicon";
import Footer from "./component/Footer";
import Navbar from "./component/header";
import WhatsAppButton from "./component/WhatsAppButton";
import { Providers } from "./providers";


export const metadata: Metadata = {
  title: {
    default: "Muta7Market - منصة الرياضة الرائدة | Sports Marketplace Platform",
    template: "%s | Muta7Market",
  },
  description:
    "منصة متاح ماركت - أكبر سوق رياضي في المنطقة. اكتشف أفضل اللاعبين والمدربين في كرة القدم، كرة السلة، التنس، والمزيد. Muta7Market - The leading sports marketplace connecting players and coaches across all sports.",
  keywords: [
    "متاح ماركت",
    "منصة رياضية",
    "سوق الرياضة",
    "لاعبين",
    "مدربين",
    "كرة القدم",
    "كرة السلة",
    "كرة الطائرة",
    "التنس",
    "الريشة الطائرة",
    "كرة اليد",
    "الاسكواش",
    "المصارعة",
    "الجودو",
    "التايكوندو",
    "البلياردو",
    "تدريب رياضي",
    "أكاديمية رياضية",
    "مواهب رياضية",
    "السعودية",

    "Muta7Market",
    "sports marketplace",
    "sports platform",
    "athletes",
    "coaches",
    "football",
    "basketball",
    "volleyball",
    "tennis",
    "badminton",
    "handball",
    "squash",
    "wrestling",
    "judo",
    "taekwondo",
    "billiards",
    "sports training",
    "sports academy",
    "talent discovery",
    "Saudi Arabia",
    "Middle East sports",
    "player profiles",
    "coach profiles",
    "sports community",
    "athletic development",
    "sports networking",
    "professional sports",
  ],
  authors: [{ name: "Muta7Market Team" }],
  creator: "Muta7Market",
  publisher: "Muta7Market",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Use environment-provided site URL when available (helps local/dev vs prod)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com"),
  alternates: {
    canonical: "/",
    languages: {
      "ar-SA": "/ar",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "Muta7Market - منصة الرياضة الرائدة | Leading Sports Marketplace",
    description:
      "اكتشف أفضل اللاعبين والمدربين الرياضيين. منصة شاملة تربط المواهب الرياضية في جميع أنحاء المنطقة. Discover the best athletes and coaches on our comprehensive sports platform.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com",
    siteName: "Muta7Market",
    locale: "ar_SA",
    alternateLocale: "en_US",
    type: "website",
    images: [
      {
        url: "/trophy.png",
        width: 1200,
        height: 630,
        alt: "Muta7Market - Sports Marketplace Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Muta7Market - Sports Marketplace Platform",
    description:
      "Discover athletes and coaches across all sports. The ultimate platform for sports talent connection.",
    images: ["/trophy.png"],
    creator: "@muta7market",
    site: "@muta7market",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // icons: {
  //   icon: "/trophy.png", 
  //   shortcut: "/trophy.png",
  //   apple: "/trophy.png",
  // },
  manifest: "/manifest.json",
  category: "Sports",
  classification: "Sports Marketplace",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#2B5CE6",
    "theme-color": "#2B5CE6",
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
        <DynamicFavicon />
        <DynamicSeo />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Muta7Market",
              alternateName: "متاح ماركت",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com",
              description:
                "The leading sports marketplace connecting players and coaches across all sports in the Middle East region.",
              inLanguage: ["ar-SA", "en-US"],
              potentialAction: {
                "@type": "SearchAction",
                target: "https://muta7markt.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              sameAs: [
                "https://twitter.com/muta7market",
                "https://facebook.com/muta7market",
                "https://instagram.com/muta7market",
              ],
              mainEntity: {
                "@type": "Organization",
                name: "Muta7Market",
                alternateName: "متاح ماركت",
                url: "https://muta7markt.com",
                logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com"}/trophy.png`,
                description:
                  "Sports marketplace platform connecting athletes and coaches",
                sameAs: [
                  "https://twitter.com/muta7market",
                  "https://facebook.com/muta7market",
                  "https://instagram.com/muta7market",
                ],
                areaServed: {
                  "@type": "Country",
                  name: "Saudi Arabia",
                },
                serviceType: [
                  "Sports Training",
                  "Athlete Profiles",
                  "Coach Profiles",
                  "Sports Networking",
                ],
              },
            }),
          }}
        />

        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com"}/players/68aa1bbc93105c57fe2704af`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Muta7market" />
        <meta
          property="og:description"
          content="Muta7market - Sports Marketplace"
        />
        <meta property="og:image" content="" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content={(process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com").replace(/^https?:\/\//, "")}
        />
        <meta
          property="twitter:url"
          content={`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.muta7markt.com"}/players/68aa1bbc93105c57fe2704af`}
        />
        <meta name="twitter:title" content="Muta7market" />
        <meta
          name="twitter:description"
          content="Muta7market - Sports Marketplace"
        />
        <meta name="twitter:image" content=""></meta>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Muta7Market Sports Platform",
              description:
                "Sports marketplace platform for connecting athletes and coaches",
              url: "https://muta7markt.com",
              applicationCategory: "SportsApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "SAR",
              },
              featureList: [
                "Player Profiles",
                "Coach Profiles",
                "Sports Categories",
                "Training Services",
                "Sports Networking",
                "Multi-language Support",
              ],
            }),
          }}
        />
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
