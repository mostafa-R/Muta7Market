import Head from "next/head";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import DefaultModal from "../../../../components/example/ModalExample/DefaultModal";
import FormInModal from "../../../../components/example/ModalExample/FormInModal";
import FullScreenModal from "../../../../components/example/ModalExample/FullScreenModal";
import ModalBasedAlerts from "../../../../components/example/ModalExample/ModalBasedAlerts";
import VerticallyCenteredModal from "../../../../components/example/ModalExample/VerticallyCenteredModal";

export default function Modals() {
  return (
    <>
      <Head>
        <title>Next.js Modals | TailAdmin - Next.js Dashboard Template</title>
        <meta
          name="description"
          content="This is Next.js Modals page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template"
        />
      </Head>
      <div>
        <PageBreadcrumb pageTitle="Modals" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
          <DefaultModal />
          <VerticallyCenteredModal />
          <FormInModal />
          <FullScreenModal />
          <ModalBasedAlerts />
        </div>
      </div>
    </>
  );
}
