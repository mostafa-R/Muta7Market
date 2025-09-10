"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import useSeoStore from "@/stores/seoStore";
import { generateStructuredData } from "@/utils/seoUtils";
import Script from "next/script";
import { useEffect, useMemo } from "react";

export default function DynamicSeo() {
  const { seo, fetchSeoSettings } = useSeoStore();
  const { language } = useLanguage();

  useEffect(() => {
    fetchSeoSettings();
  }, [fetchSeoSettings]);

  // Get the current language version of metadata
  const title = seo.metaTitle?.[language] || seo.metaTitle?.en || "Muta7Market";
  const description =
    seo.metaDescription?.[language] || seo.metaDescription?.en || "";

  // Generate structured data for SEO
  const structuredData = useMemo(() => {
    return generateStructuredData(seo, language);
  }, [seo, language]);

  // Update document title dynamically
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <>
      {/* Update meta tags dynamically */}
      <meta name="description" content={description} />
      <meta name="keywords" content={seo.keywords?.join(", ")} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={seo.ogImage} />

      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={seo.ogImage} />

      {/* Google Analytics */}
      {seo.googleAnalyticsId && (
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', '${seo.googleAnalyticsId}', 'auto');
            ga('send', 'pageview');
          `}
        </Script>
      )}

      {/* Structured Data */}
      <Script id="structured-data-website" type="application/ld+json">
        {JSON.stringify(structuredData.websiteSchema)}
      </Script>

      <Script id="structured-data-organization" type="application/ld+json">
        {JSON.stringify(structuredData.organizationSchema)}
      </Script>

      <Script id="structured-data-webapp" type="application/ld+json">
        {JSON.stringify(structuredData.webAppSchema)}
      </Script>
    </>
  );
}
