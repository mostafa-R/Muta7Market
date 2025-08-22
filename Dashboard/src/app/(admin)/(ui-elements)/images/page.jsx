import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ResponsiveImage from "@/components/ui/images/ResponsiveImage";
import ThreeColumnImageGrid from "@/components/ui/images/ThreeColumnImageGrid";
import TwoColumnImageGrid from "@/components/ui/images/TwoColumnImageGrid";
import React from "react";
import Head from "next/head";

export default function Images() {
  return (
    <>
      <Head>
        <title>Muta7Market</title>
        <meta
          name="description"
          content="This is Next.js Images page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template"
        />
      </Head>
      <div>
        <PageBreadcrumb pageTitle="Images" />
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Responsive image">
            <ResponsiveImage />
          </ComponentCard>
          <ComponentCard title="Image in 2 Grid">
            <TwoColumnImageGrid />
          </ComponentCard>
          <ComponentCard title="Image in 3 Grid">
            <ThreeColumnImageGrid />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
