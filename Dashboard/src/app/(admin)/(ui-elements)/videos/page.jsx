import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VideosExample from "@/components/ui/video/VideosExample";
import React from "react";
import Head from "next/head";

export default function VideoPage() {
  return (
    <>
      <Head>
        <title>Next.js Videos | TailAdmin - Next.js Dashboard Template</title>
        <meta
          name="description"
          content="This is Next.js Videos page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template"
        />
      </Head>
      <div>
        <PageBreadcrumb pageTitle="Videos" />
        <VideosExample />
      </div>
    </>
  );
}
