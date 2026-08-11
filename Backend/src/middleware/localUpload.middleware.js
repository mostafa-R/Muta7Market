import { uploadLocal, uploadMultiple, uploadSingle } from "../config/localStorage.js";
import { deleteMediaFromLocal } from "../utils/localMediaUtils.js";

export { uploadMultiple, uploadSingle };

export const uploadMixed = uploadLocal;

export const deleteLocalFile = async (publicId, resourceType = "image") => {
  return await deleteMediaFromLocal(publicId, resourceType);
};

export default uploadLocal;
