"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../component/ui/dialog";
import AccountInformationStep from "./components/AccountInformationStep";
import ContactInformationStep from "./components/ContactInformationStep";
import NavigationButtons from "./components/NavigationButtons";
import PersonalInformationStep from "./components/PersonalInformationStep";
import ProfessionalInformationStep from "./components/ProfessionalInformationStep";
import StepIndicator from "./components/StepIndicator";
import { usePlayerForm } from "./hooks/usePlayerForm";

// Success Dialog Component
function SuccessDialog({ open, onOpenChange, playerName, playerId, onViewPlayer, onCreateNewPlayer, onViewAllPlayers }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl">تم إنشاء اللاعب بنجاح</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center mt-2 text-gray-600">
            لقد تم إنشاء اللاعب <span className="font-bold text-black">{playerName}</span> بنجاح. ماذا تريد أن تفعل الآن؟
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          {/* <button onClick={onViewPlayer} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
            عرض بيانات اللاعب
          </button> */}
          <button onClick={onCreateNewPlayer} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
            إنشاء لاعب جديد
          </button>
          <button onClick={onViewAllPlayers} className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
            عرض جميع اللاعبين
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Media Upload Component
function MediaUploadComponent({ files, setFiles, previews, setPreviews, handleFileChange, removeImage }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse mb-6">
        <div className="bg-indigo-100 rounded-lg p-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">الوسائط</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصورة الشخصية
          </label>
          <input
            type="file"
            name="profileImage"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
          />
          {previews.profileImage && (
            <div className="mt-2">
              <img
                src={previews.profileImage}
                alt="معاينة الصورة الشخصية"
                className="w-24 h-24 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مقطع فيديو
          </label>
          <input
            type="file"
            name="playerVideo"
            onChange={handleFileChange}
            accept="video/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مستند (CV/السيرة الذاتية)
          </label>
          <input
            type="file"
            name="document"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الصور الإضافية (حد أقصى 4)
          </label>
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-300 transition-all"
          />
          {previews.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {previews.images.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`معاينة الصورة الإضافية ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Create Player Page Component
export default function CreatePlayerPage() {
  const {
    // State
    loading,
    currentStep,
    showPassword,
    setShowPassword,
    showSuccessDialog,
    setShowSuccessDialog,
    createdPlayerId,
    createdPlayerName,
    showCustomFields,
    formData,
    files,
    previews,
    
    // Functions
    handleInputChange,
    handleFileChange,
    removeImage,
    handleSubmit,
    nextStep,
    prevStep,
    navigateToPlayersList,
    navigateToPlayerView,
    createNewPlayer,
  } = usePlayerForm();

  // Render the current step content
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AccountInformationStep
            formData={formData}
            handleInputChange={handleInputChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        );
      case 2:
        return (
          <PersonalInformationStep
            formData={formData}
            handleInputChange={handleInputChange}
            showCustomFields={showCustomFields}
          />
        );
      case 3:
        return (
          <ProfessionalInformationStep
            formData={formData}
            handleInputChange={handleInputChange}
            showCustomFields={showCustomFields}
          />
        );
      case 4:
        return (
          <ContactInformationStep
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 5:
        return (
          <MediaUploadComponent
            files={files}
            setFiles={null}
            previews={previews}
            setPreviews={null}
            handleFileChange={handleFileChange}
            removeImage={removeImage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="bg-[#1e293b] rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div>
                <h1 className="text-2xl font-bold">إنشاء لاعب جديد</h1>
                <p className="text-blue-100 mt-1">قم بإضافة لاعب جديد إلى النظام</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <StepIndicator currentStep={currentStep} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
            {/* Current Step Content */}
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <NavigationButtons
              currentStep={currentStep}
              loading={loading}
              onPrevious={prevStep}
              onSubmit={handleSubmit}
            />
          </form>
        </div>
      </div>
      
      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        playerName={createdPlayerName}
        playerId={createdPlayerId}
        onViewPlayer={navigateToPlayerView}
        onCreateNewPlayer={createNewPlayer}
        onViewAllPlayers={navigateToPlayersList}
      />
    </>
  );
}
