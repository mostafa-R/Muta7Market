import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Alert from "@/components/ui/alert/Alert";
import React from "react";
import Head from "next/head";

export default function Alerts() {
  return (
    <>
      <Head>
        <title>Next.js Alerts | TailAdmin - Next.js Dashboard Template</title>
        <meta
          name="description"
          content="This is Next.js Alerts page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template"
        />
      </Head>
      <div>
        <PageBreadcrumb pageTitle="Alerts" />
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Success Alert">
            <Alert
              variant="success"
              title="Success Message"
              message="Be cautious when performing this action."
              showLink={true}
              linkHref="/"
              linkText="Learn more"
            />
            <Alert
              variant="success"
              title="Success Message"
              message="Be cautious when performing this action."
              showLink={false}
            />
          </ComponentCard>

          <ComponentCard title="Warning Alert">
            <Alert
              variant="warning"
              title="Warning Message"
              message="Be cautious when performing this action."
              showLink={true}
              linkHref="/"
              linkText="Learn more"
            />
            <Alert
              variant="warning"
              title="Warning Message"
              message="Be cautious when performing this action."
              showLink={false}
            />
          </ComponentCard>

          <ComponentCard title="Error Alert">
            <Alert
              variant="error"
              title="Error Message"
              message="Be cautious when performing this action."
              showLink={true}
              linkHref="/"
              linkText="Learn more"
            />
            <Alert
              variant="error"
              title="Error Message"
              message="Be cautious when performing this action."
              showLink={false}
            />
          </ComponentCard>

          <ComponentCard title="Info Alert">
            <Alert
              variant="info"
              title="Info Message"
              message="Be cautious when performing this action."
              showLink={true}
              linkHref="/"
              linkText="Learn more"
            />
            <Alert
              variant="info"
              title="Info Message"
              message="Be cautious when performing this action."
              showLink={false}
            />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
