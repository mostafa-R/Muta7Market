import {
  uploadFields,
  uploadLocal,
  uploadMultiple,
  uploadSingle,
} from "../config/localStorage.js";

export { uploadFields, uploadMultiple, uploadSingle };

export const uploadMixed = uploadLocal;

export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  const { deleteMediaFromLocal } = await import("../utils/localMediaUtils.js");
  return await deleteMediaFromLocal(publicId, resourceType);
};

export default uploadLocal;
