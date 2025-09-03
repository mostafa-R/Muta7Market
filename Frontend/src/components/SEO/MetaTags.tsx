import Head from "next/head";

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  alternateLocale?: string;
  noIndex?: boolean;
}

export default function MetaTags({
  title = "Muta7Market - منصة الرياضة الرائدة | Leading Sports Marketplace",
  description = "منصة متاح ماركت - أكبر سوق رياضي في المنطقة. اكتشف أفضل اللاعبين والمدربين في جميع الرياضات.",
  keywords = [
    "متاح ماركت",
    "منصة رياضية",
    "لاعبين",
    "مدربين",
    "Muta7Market",
    "sports platform",
    "athletes",
    "coaches",
  ],
  image = "/trophy.png",
  url = "https://muta7markt.com",
  type = "website",
  locale = "ar_SA",
  alternateLocale = "en_US",
  noIndex = false,
}: MetaTagsProps) {
  const keywordsString = keywords.join(", ");

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content="Muta7Market Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* SEO Meta Tags */}
      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />
      <meta
        name="googlebot"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />
      <meta
        name="bingbot"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />
      <meta property="og:site_name" content="Muta7Market" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@muta7market" />
      <meta name="twitter:creator" content="@muta7market" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#2B5CE6" />
      <meta name="msapplication-TileColor" content="#2B5CE6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Language and Canonical */}
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="ar" href={`${url}?lang=ar`} />
      <link rel="alternate" hrefLang="en" href={`${url}?lang=en`} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* Icons */}
      <link rel="icon" href="/trophy.png" />
      <link rel="shortcut icon" href="/trophy.png" />
      <link rel="apple-touch-icon" href="/trophy.png" />

      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
}
