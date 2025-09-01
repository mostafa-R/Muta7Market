import { generatePublicUrl, uploadLocal } from "./localStorage.js";

export const getStorageConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const useCloudStorage = process.env.USE_CLOUD_STORAGE === "true";

  if (isProduction && useCloudStorage) {
    return {
      upload: null,
      generateUrl: null,
      type: "cloud",
    };
  }

  return {
    upload: uploadLocal,
    generateUrl: generatePublicUrl,
    type: "local",
  };
};

export default getStorageConfig;
