"use client";

import { Button } from "@/app/component/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
import LoadingSpinner from "../component/LoadingSpinner";
import { ContactInfoCard } from "./components/ContactInfoCard";
import { FinancialInfoCard } from "./components/FinancialInfoCard";
import { MediaUploadCard } from "./components/MediaUploadCard";
import { MobileNavigation } from "./components/MobileNavigation";
import { PersonalInfoCard } from "./components/PersonalInfoCard";
import { ProgressIndicator } from "./components/ProgressIndicator";
import { PublishProfilePrompt } from "./components/PublishProfilePrompt";
import { SocialLinksCard } from "./components/SocialLinksCard";
import { SportsInfoCard } from "./components/SportsInfoCard";
import { StepIndicators } from "./components/StepIndicators";
import { SuccessMessage } from "./components/SuccessMessage";
import { TermsCard } from "./components/TermsCard";
import { TransferInfoCard } from "./components/TransferInfoCard";
import { UploadProgress } from "./components/UploadProgress";
import { useFormSteps } from "./hooks/useFormSteps";
import { useMediaHandling } from "./hooks/useMediaHandling";
import { usePlayerForm } from "./hooks/usePlayerForm";
// Updated imports to use new organized constants structure
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE,
} from "./utils/constants";
import { handleFileValidation } from "./utils/helpers";

function RegisterProfileContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const isRTL = i18n.language === "ar";

  // Custom hooks
  const { formik, isLoading, canPay, player } = usePlayerForm(idParam, router);
  const { currentStep, setCurrentStep, formSections, nextStep, prevStep } =
    useFormSteps(formik);
  const { uploadProgress, uploadStatus } = useMediaHandling(formik);

  // Get the current form section component
  const renderFormSection = () => {
    const section = formSections[currentStep];
    switch (section.id) {
      case "personal":
        return (
          <PersonalInfoCard
            formik={formik}
            handleFileValidation={(file, types, size) =>
              handleFileValidation(file, types, size, t)
            }
            ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
          />
        );
      case "sports":
        return <SportsInfoCard formik={formik} />;
      case "financial":
        return <FinancialInfoCard formik={formik} />;
      case "transfer":
        return <TransferInfoCard formik={formik} />;
      case "contact":
        return <ContactInfoCard formik={formik} />;
      case "social":
        return <SocialLinksCard formik={formik} />;
      case "media":
        return (
          <MediaUploadCard
            formik={formik}
            handleFileValidation={(file, types, size) =>
              handleFileValidation(file, types, size, t)
            }
            ALLOWED_VIDEO_TYPES={ALLOWED_VIDEO_TYPES}
            ALLOWED_DOCUMENT_TYPES={ALLOWED_DOCUMENT_TYPES}
            ALLOWED_IMAGE_TYPES={ALLOWED_IMAGE_TYPES}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
            playerId={player?._id || idParam} // Pass the player ID for delete functionality
          />
        );
      case "terms":
        return <TermsCard formik={formik} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        rtl={isRTL}
      />

      <div className="container mx-auto pt-8 pb-20 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-[#00183D] text-right">
              {idParam
                ? t("registerProfile.editPlayerProfile")
                : t("registerProfile.createNewPlayerProfile")}
            </h1>
            <p className="text-gray-500 mt-1 text-right">
              {t("registerProfile.completeRequiredInformation")}
            </p>
          </div>
          <Link
            href="/profile"
            className="flex items-center text-[#00183D] hover:text-[#002c65] font-medium transition-colors"
          >
            {t("registerProfile.backToProfile")}
            <ArrowLeft className="w-4 h-4 mr-1" />
          </Link>
        </div>

        {/* Progress indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={formSections.length}
          title={formSections[currentStep].title}
        />

        {/* Step indicators */}
        <StepIndicators
          sections={formSections}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">
              {t("registerProfile.loadingData")}
            </p>
          </div>
        )}

        {/* Form content */}
        {!isLoading && (
          <form
            onSubmit={(e) => {
              e.preventDefault(); // منع الـ auto-submit
              // السماح بالـ submit فقط عند الضغط على الـ Save button بشكل صريح
            }}
            className="w-full"
          >
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
              <div className="p-6 md:p-8">{renderFormSection()}</div>

              {/* Navigation buttons */}
              <div className="px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t hidden md:flex md:flex-col-reverse md:justify-between md:items-center md:gap-4 lg:flex-row">
                <div className="flex gap-3 w-full sm:w-auto">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 sm:flex-initial flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
                    >
                      {t("registerProfile.navigation.previousStep")}
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      )}
                    </Button>
                  )}
                  {currentStep === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={formik.resetForm}
                      className="flex-1 sm:flex-initial flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200"
                    >
                      <X className="w-4 h-4 mr-1" />
                      {t("registerProfile.navigation.resetForm")}
                    </Button>
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {currentStep < formSections.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 sm:flex-initial flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                    >
                      {t("registerProfile.navigation.nextStep")}
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-1" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="flex-1 sm:flex-initial flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(
                          "Save button clicked - manually triggering submission"
                        );
                        formik.handleSubmit();
                      }}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {idParam
                        ? t("registerProfile.navigation.saveChanges")
                        : t("registerProfile.navigation.createProfile")}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Upload progress */}
            <UploadProgress progress={uploadProgress} />

            {/* Success message — show only after successful creation */}
            {!idParam && canPay && player?._id && (
              <SuccessMessage
                isUpdate={Boolean(idParam)}
                playerId={player?._id}
              />
            )}

            {/* Publish profile prompt — appears only when a profile exists and is not active */}
            {player?._id && (
              <PublishProfilePrompt
                playerId={player._id}
                isActive={player?.isActive ?? true}
              />
            )}
          </form>
        )}
      </div>

      <Toaster position="top-right" />

      {/* Mobile navigation */}
      <MobileNavigation
        currentStep={currentStep}
        totalSteps={formSections.length}
        onPrevStep={prevStep}
        onNextStep={nextStep}
        onSubmit={(e) => {
          console.log(
            "Mobile submit button clicked - manually triggering submission"
          );
          formik.handleSubmit();
        }}
        isSubmitting={formik.isSubmitting}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <LoadingSpinner />
        </div>
      }
    >
      <RegisterProfileContent />
    </Suspense>
  );
}
