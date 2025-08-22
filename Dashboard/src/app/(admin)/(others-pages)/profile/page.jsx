import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import React from "react";
import Head from "next/head";

export default function BasicTables() {
  return (
    <>
      <Head>
        <title>Muta7Market</title>
        <meta
          name="description"
          content="This is Next.js Basic Table page for TailAdmin Tailwind CSS Admin Dashboard Template"
        />
      </Head>
      <div>
        <PageBreadcrumb pageTitle="Basic Table" />
        <div className="space-y-6">
          <ComponentCard title="Basic Table 1">
            <BasicTableOne />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
