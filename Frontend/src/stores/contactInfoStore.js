import { create } from "zustand";

const useContactInfoStore = create((set) => ({
  contactInfo: {
    email: "info@muta7market.com",
    phone: {
      primary: "00966531540229",
      formatted: "+966 53 154 0229",
    },
    address: {
      ar: "المملكة العربية السعودية",
      en: "Saudi Arabia",
    },
    socialMedia: {
      facebook: null,
      twitter: null,
      instagram: null,
      youtube: null,
      linkedin: null,
    },
  },
  isLoading: false,
  error: null,

  fetchContactInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.contactInfo) {
        const contactData = data.data.contactInfo;

        // Format phone number if it exists
        const formatPhone = (phone) => {
          if (!phone) return "+966 53 154 0229";
          // Remove any non-digit characters and format
          const digits = phone.replace(/\D/g, "");
          if (digits.length === 12 && digits.startsWith("966")) {
            return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(
              5,
              8
            )} ${digits.slice(8)}`;
          }
          return phone;
        };

        set({
          contactInfo: {
            email: contactData.email || "info@muta7market.com",
            phone: {
              primary: contactData.phone || "00966531540229",
              formatted: formatPhone(contactData.phone),
            },
            address: {
              ar: contactData.address?.ar || "المملكة العربية السعودية",
              en: contactData.address?.en || "Saudi Arabia",
            },
            socialMedia: {
              facebook: contactData.socialMedia?.facebook || null,
              twitter: contactData.socialMedia?.twitter || null,
              instagram: contactData.socialMedia?.instagram || null,
              youtube: contactData.socialMedia?.youtube || null,
              linkedin: contactData.socialMedia?.linkedin || null,
            },
          },
          isLoading: false,
        });
      } else {
        // If the API doesn't return the expected structure, keep the default values
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching contact information:", error);
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useContactInfoStore;
