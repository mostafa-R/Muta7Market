import { toast } from "sonner";

// Email validation regex
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// Phone validation regex (10-15 digits)
const PHONE_REGEX = /^[0-9]{10,15}$/;

/**
 * Validates Step 1: Account Information
 * @param {Object} formData - The form data object
 * @returns {boolean} - True if validation passes, false otherwise
 */
export const validateStep1 = (formData) => {
  // Check required fields
  if (!formData.email || !formData.name || !formData.password || !formData.phone) {
    toast.error("يرجى ملء جميع الحقول المطلوبة", {
      description: "الحقول المطلوبة: البريد الإلكتروني، الاسم، كلمة المرور، رقم الهاتف",
      duration: 4000
    });
    return false;
  }
  
  // Validate email format
  if (!EMAIL_REGEX.test(formData.email)) {
    toast.error("يرجى إدخال بريد إلكتروني صحيح", {
      description: "تأكد من صحة تنسيق البريد الإلكتروني",
      duration: 4000
    });
    return false;
  }
  
  // Validate password length
  if (formData.password.length < 8) {
    toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل", {
      description: "أضف المزيد من الأحرف لتقوية كلمة المرور",
      duration: 4000
    });
    return false;
  }
  
  // Validate phone (now required)
  if (!PHONE_REGEX.test(formData.phone)) {
    toast.error("يرجى إدخال رقم هاتف صحيح", {
      description: "يجب أن يكون الرقم بين 10-15 رقم ويحتوي على أرقام فقط",
      duration: 4000
    });
    return false;
  }
  
  return true;
};

/**
 * Validates Step 2: Personal Information
 * @param {Object} formData - The form data object
 * @returns {boolean} - True if validation passes, false otherwise
 */
export const validateStep2 = (formData) => {
  // Check required fields
  if (!formData.age || !formData.gender || !formData.nationality || !formData.birthCountry) {
    toast.error("يرجى ملء جميع الحقول المطلوبة", {
      description: "الحقول المطلوبة: العمر، الجنس، الجنسية، بلد الولادة",
      duration: 4000
    });
    return false;
  }
  
  // Validate age range
  if (formData.age < 15 || formData.age > 50) {
    toast.error("العمر يجب أن يكون بين 15 و 50", {
      description: "العمر المطلوب للانضمام للنظام",
      duration: 4000
    });
    return false;
  }
  
  // Validate custom nationality if "other" is selected
  if (formData.nationality === "other" && !formData.customNationality) {
    toast.error("يرجى تحديد الجنسية", {
      description: "اكتب الجنسية في الحقل المخصص",
      duration: 4000
    });
    return false;
  }
  
  // Validate custom birth country if "other" is selected
  if (formData.birthCountry === "other" && !formData.customBirthCountry) {
    toast.error("يرجى تحديد بلد الولادة", {
      description: "اكتب بلد الولادة في الحقل المخصص",
      duration: 4000
    });
    return false;
  }
  
  return true;
};

/**
 * Validates Step 3: Professional Information
 * @param {Object} formData - The form data object
 * @returns {boolean} - True if validation passes, false otherwise
 */
export const validateStep3 = (formData) => {
  // Check required job field
  if (!formData.jop) {
    toast.error("يرجى اختيار الوظيفة", {
      description: "اختر ما إذا كنت لاعب أو مدرب",
      duration: 4000
    });
    return false;
  }
  
  // Check required game field
  if (!formData.game) {
    toast.error("يرجى اختيار نوع الرياضة", {
      description: "اختر نوع الرياضة التي تمارسها",
      duration: 4000
    });
    return false;
  }
  
  // Validate custom sport if "other" is selected
  if (formData.game === "other" && !formData.customSport) {
    toast.error("يرجى تحديد نوع الرياضة", {
      description: "اكتب نوع الرياضة في الحقل المخصص",
      duration: 4000
    });
    return false;
  }
  
  return true;
};

/**
 * Validates Step 4: Contact Information
 * @param {Object} formData - The form data object
 * @returns {boolean} - True if validation passes, false otherwise
 */
export const validateStep4 = (formData) => {
  // Validate contact email if provided
  if (formData.contactInfo.email && !EMAIL_REGEX.test(formData.contactInfo.email)) {
    toast.error("يرجى إدخال بريد إلكتروني صحيح للتواصل", {
      description: "تأكد من صحة تنسيق البريد الإلكتروني",
      duration: 4000
    });
    return false;
  }
  
  // Validate contact phone if provided
  if (formData.contactInfo.phone && !PHONE_REGEX.test(formData.contactInfo.phone)) {
    toast.error("يرجى إدخال رقم هاتف صحيح للتواصل", {
      description: "يجب أن يكون الرقم بين 10-15 رقم",
      duration: 4000
    });
    return false;
  }
  
  // Validate Instagram link if provided
  if (formData.socialLinks.instagram && !formData.socialLinks.instagram.includes('instagram.com')) {
    toast.error("يرجى إدخال رابط إنستجرام صحيح", {
      description: "يجب أن يحتوي الرابط على instagram.com",
      duration: 4000
    });
    return false;
  }
  
  // Validate Twitter link if provided
  if (formData.socialLinks.twitter && !formData.socialLinks.twitter.includes('twitter.com') && !formData.socialLinks.twitter.includes('x.com')) {
    toast.error("يرجى إدخال رابط تويتر صحيح", {
      description: "يجب أن يحتوي الرابط على twitter.com أو x.com",
      duration: 4000
    });
    return false;
  }
  
  // Validate YouTube link if provided
  if (formData.socialLinks.youtube && !formData.socialLinks.youtube.includes('youtube.com')) {
    toast.error("يرجى إدخال رابط يوتيوب صحيح", {
      description: "يجب أن يحتوي الرابط على youtube.com",
      duration: 4000
    });
    return false;
  }
  
  // Validate WhatsApp number if provided
  if (formData.socialLinks.whatsapp && !PHONE_REGEX.test(formData.socialLinks.whatsapp)) {
    toast.error("يرجى إدخال رقم واتساب صحيح", {
      description: "يجب أن يكون الرقم بين 10-15 رقم",
      duration: 4000
    });
    return false;
  }
  
  // Validate agent email if provided
  if (formData.contactInfo.agent.email && !EMAIL_REGEX.test(formData.contactInfo.agent.email)) {
    toast.error("يرجى إدخال بريد إلكتروني صحيح للوكيل", {
      description: "تأكد من صحة تنسيق البريد الإلكتروني",
      duration: 4000
    });
    return false;
  }
  
  // Validate agent phone if provided
  if (formData.contactInfo.agent.phone && !PHONE_REGEX.test(formData.contactInfo.agent.phone)) {
    toast.error("يرجى إدخال رقم هاتف صحيح للوكيل", {
      description: "يجب أن يكون الرقم بين 10-15 رقم",
      duration: 4000
    });
    return false;
  }
  
  return true;
};

/**
 * Validates Step 5: Media Upload
 * No specific validation needed for media upload step
 * @returns {boolean} - Always returns true
 */
export const validateStep5 = () => {
  return true;
};

/**
 * Main validation function that validates based on current step
 * @param {number} currentStep - The current step number (1-5)
 * @param {Object} formData - The form data object
 * @returns {boolean} - True if validation passes, false otherwise
 */
export const validateCurrentStep = (currentStep, formData) => {
  switch (currentStep) {
    case 1:
      return validateStep1(formData);
    case 2:
      return validateStep2(formData);
    case 3:
      return validateStep3(formData);
    case 4:
      return validateStep4(formData);
    case 5:
      return validateStep5();
    default:
      return true;
  }
};

/**
 * Validates all steps before final submission
 * @param {Object} formData - The form data object
 * @returns {boolean} - True if all validations pass, false otherwise
 */
export const validateAllSteps = (formData) => {
  return (
    validateStep1(formData) &&
    validateStep2(formData) &&
    validateStep3(formData) &&
    validateStep4(formData) &&
    validateStep5()
  );
};
