// components/MediaUploadCard.jsx
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import {
  FiFile,
  FiFilePlus,
  FiImage,
  FiUpload,
  FiVideo,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export const MediaUploadCard = ({
  formik,
  handleFileValidation,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  playerId,
}) => {
  const { t } = useTranslation();

  const deleteImagesFromServer = async (publicIds) => {
    if (!playerId || !publicIds || publicIds.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const API_URL = API_BASE_URL.includes("/api/v1")
        ? API_BASE_URL
        : `${API_BASE_URL}/api/v1`;

      const response = await fetch(`${API_URL}/players/${playerId}/images`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicIds }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Images deleted successfully!");
        return true;
      } else {
        toast.error("Failed to delete images. Please try again.");
        return false;
      }
    } catch (error) {
      console.error(" Error deleting images:", error);
      return false;
    }
  };

  const deleteVideoFromServer = async () => {
    if (!playerId) return false;

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const API_URL = API_BASE_URL.includes("/api/v1")
        ? API_BASE_URL
        : `${API_BASE_URL}/api/v1`;

      const response = await fetch(`${API_URL}/players/${playerId}/video`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Video deleted successfully!");
        return true;
      } else {
        toast.error("Failed to delete video. Please try again.");
        return false;
      }
    } catch (error) {
      toast.error("Failed to delete video. Please try again.");
      return false;
    }
  };

  const removeVideo = async () => {
    const video = formik.values.media.video;

    if (video?.publicId && !video.url?.startsWith("blob:")) {
      const success = await deleteVideoFromServer();
      if (!success) {
        toast.error("Failed to delete video from server. Please try again.");
        return;
      }
      toast.success("Video deleted successfully!");
    }

    if (video && video.file && video.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(video.url);
      } catch (err) {
        console.error("Error revoking video blob URL:", err);
      }
    }

    formik.setFieldValue("media.video", {
      url: null,
      publicId: null,
      title: null,
      duration: 0,
      uploadedAt: null,
    });
  };

  const deleteDocumentFromServer = async () => {
    if (!playerId) return false;

    try {
      const token = localStorage.getItem("token");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const API_URL = API_BASE_URL.includes("/api/v1")
        ? API_BASE_URL
        : `${API_BASE_URL}/api/v1`;

      const response = await fetch(`${API_URL}/players/${playerId}/document`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Document deleted successfully!");
        return true;
      } else {
        toast.error("Failed to delete document. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("💥 Error deleting document:", error);
      return false;
    }
  };

  const removeDocument = async () => {
    const document = formik.values.media.document;
    if (document?.publicId && !document.url?.startsWith("blob:")) {
      const success = await deleteDocumentFromServer();

      if (!success) {
        toast.error("Failed to delete document from server. Please try again.");
        return;
      }
      toast.success("Document deleted successfully!");
    }

    if (document && document.file && document.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(document.url);
      } catch (err) {
        console.error("Error revoking document blob URL:", err);
      }
    }

    formik.setFieldValue("media.document", {
      url: null,
      publicId: null,
      title: null,
      type: null,
      size: 0,
      uploadedAt: null,
    });
  };

  const removeImage = async (index) => {
    const images = formik.values.media.images || [];
    const imageToRemove = images[index];

    if (imageToRemove?.publicId && !imageToRemove.url?.startsWith("blob:")) {
      const success = await deleteImagesFromServer([imageToRemove.publicId]);

      if (!success) {
        toast.error("Failed to delete image from server. Please try again.");
        return;
      }
      toast.success("Image deleted successfully!");
    }

    if (imageToRemove && imageToRemove.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imageToRemove.url);
      } catch (err) {
        console.error("Error revoking blob URL:", err);
      }
    }

    const newImages = images.filter((_, i) => i !== index);
    formik.setFieldValue("media.images", newImages);
  };

  const addImages = (files) => {
    const currentImages = formik.values.media.images || [];
    const newImages = [];

    for (
      let i = 0;
      i < files.length && currentImages.length + newImages.length < 4;
      i++
    ) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast.error("File is not an image:", file.name, file.type);
        continue;
      }

      try {
        const objectUrl = URL.createObjectURL(file);
        const imageData = {
          url: objectUrl,
          publicId: uuidv4(),
          title: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          file,
        };

        newImages.push(imageData);
      } catch (err) {
        toast.error("Error creating");
      }
    }

    if (newImages.length > 0) {
      const finalImages = [...currentImages, ...newImages];
      formik.setFieldValue("media.images", finalImages);
    } else {
      toast.error("⚠️ No valid images to add");
    }
  };

  return (
    <div className="space-y-12">
      {/* Videos section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="bg-purple-50 p-2 rounded-full">
            <FiVideo className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold">
            {t("registerProfile.form.mediaUpload.sportsVideos.title")}
          </h2>
          <Badge variant="outline" className="mr-auto font-normal text-xs">
            {t("labels.optional")}
          </Badge>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t("registerProfile.form.mediaUpload.sportsVideos.description")}
              </p>
              <p className="text-xs text-gray-500">
                {t("registerProfile.form.mediaUpload.sportsVideos.maxSize")}
              </p>
            </div>

            <Input
              id="media-upload"
              type="file"
              accept={ALLOWED_VIDEO_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const error = handleFileValidation(
                  file,
                  ALLOWED_VIDEO_TYPES,
                  MAX_FILE_SIZE,
                  t
                );

                if (error) {
                  formik.setFieldError("media.video", error);
                  return;
                }

                if (formik.values.media.video?.url?.startsWith("blob:")) {
                  try {
                    URL.revokeObjectURL(formik.values.media.video.url);
                  } catch {}
                }
                const videoData = {
                  url: URL.createObjectURL(file),
                  publicId: uuidv4(),
                  title: file.name,
                  duration: 0,
                  uploadedAt: new Date().toISOString(),
                  file,
                };

                formik.setFieldValue("media.video", videoData);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("media-upload")?.click()}
              className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50"
            >
              <FiUpload className="w-4 h-4 ml-2" />
              {t("registerProfile.form.mediaUpload.sportsVideos.selectVideos")}
            </Button>
          </div>
        </div>

        {get(formik.errors, "media.video") && (
          <div
            role="alert"
            aria-live="assertive"
            className="text-red-500 text-xs mt-2 bg-red-50 p-2 px-3 rounded-md border border-red-100"
          >
            {get(formik.errors, "media.video")}
          </div>
        )}

        {/* Uploaded videos display */}
        {formik.values.media.video?.url && (
          <div className="space-y-3">
            <h3 className="text-base font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              {t("registerProfile.form.mediaUpload.sportsVideos.uploadedVideo")}
            </h3>
            <div>
              <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group transition-all hover:shadow-md">
                <div className="relative pt-[56.25%] bg-gray-900">
                  {/* 16:9 aspect ratio */}
                  {formik.values.media.video.url && (
                    <video
                      src={formik.values.media.video.url}
                      className="absolute inset-0 w-full h-full object-contain"
                      controls
                      controlsList="nodownload"
                    >
                      {t("browser.videoNotSupported")}
                    </video>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 truncate">
                      {formik.values.media.video.title}
                    </h4>
                    <Badge
                      variant={
                        formik.values.media.video.file ? "secondary" : "outline"
                      }
                      className={`text-xs ${
                        formik.values.media.video.file
                          ? "bg-purple-100 text-purple-700"
                          : ""
                      }`}
                    >
                      {formik.values.media.video.file
                        ? t("registerProfile.form.mediaUpload.sportsVideos.new")
                        : formik.values.media.video.publicId
                        ? t(
                            "registerProfile.form.mediaUpload.sportsVideos.uploaded"
                          )
                        : t(
                            "registerProfile.form.mediaUpload.sportsVideos.processing"
                          )}
                    </Badge>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="flex items-center px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-medium transition-colors"
                      aria-label={t("actions.removeVideo")}
                    >
                      <FiX className="w-3 h-3 mr-1" />
                      {t(
                        "registerProfile.form.mediaUpload.sportsVideos.remove"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="bg-green-50 p-2 rounded-full">
            <FiImage className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">
            {t("registerProfile.form.mediaUpload.sportsImages.title")}
          </h2>
          <Badge variant="outline" className="mr-auto font-normal text-xs">
            {t("labels.optional")}
          </Badge>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FiImage className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t("registerProfile.form.mediaUpload.sportsImages.description")}
              </p>
              <p className="text-xs text-gray-500">
                {t("registerProfile.form.mediaUpload.sportsImages.maxSize")}
              </p>
            </div>

            <Input
              id="images-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                if (files.length > 0) {
                  formik.setFieldError("media.images", "");
                  addImages(files);
                }
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("images-upload")?.click()}
              className="bg-white border-green-200 text-green-700 hover:bg-green-50 transition-colors focus:ring-2 focus:ring-green-200 focus:ring-opacity-50"
              disabled={(formik.values.media.images || []).length >= 4}
            >
              <FiImage className="w-4 h-4 ml-2" />
              {t(
                "registerProfile.form.mediaUpload.sportsImages.selectImages"
              )}{" "}
              ({(formik.values.media.images || []).length}/4)
            </Button>
          </div>
        </div>

        {get(formik.errors, "media.images") && (
          <div
            role="alert"
            aria-live="assertive"
            className="text-red-500 text-xs mt-2 bg-red-50 p-2 px-3 rounded-md border border-red-100"
          >
            {get(formik.errors, "media.images")}
          </div>
        )}

        {/* Debug info - only show in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <strong>Debug:</strong> Total images in state:{" "}
            {(formik.values.media.images || []).length}
            {(formik.values.media.images || []).map((img, i) => (
              <div key={i}>
                Image {i}: {img.title} - URL exists: {!!img.url} - URL type:{" "}
                {img.url?.startsWith("blob:") ? "blob" : "other"}
              </div>
            ))}
          </div>
        )}

        {/* Uploaded images display */}
        {(formik.values.media.images || []).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              {t(
                "registerProfile.form.mediaUpload.sportsImages.uploadedImages"
              )}{" "}
              ({(formik.values.media.images || []).length}/4)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(formik.values.media.images || []).map((image, index) => {
                return (
                  <div
                    key={`${image.publicId}-${index}`}
                    className="relative group"
                  >
                    <div className="w-full h-48 bg-blue-100 rounded-lg border-2 border-blue-300 overflow-hidden relative">
                      {/* Show URL for debugging - only in development */}
                      {process.env.NODE_ENV === "development" && (
                        <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-1 z-20 max-w-full truncate">
                          URL: {image.url ? "EXISTS" : "NULL"} -{" "}
                          {image.url?.substring(0, 30)}...
                        </div>
                      )}

                      <img
                        src={image.url}
                        alt={
                          image.title ||
                          t(
                            "registerProfile.form.mediaUpload.sportsImages.imageAlt",
                            { number: index + 1 }
                          )
                        }
                        className="w-full h-full object-cover"
                        style={
                          process.env.NODE_ENV === "development"
                            ? {
                                backgroundColor: "yellow",
                                border: "2px solid green",
                              }
                            : {}
                        }
                        onLoad={(e) => {
                          if (process.env.NODE_ENV === "development") {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.border = "none";
                          }
                        }}
                        onError={(e) => {
                          if (process.env.NODE_ENV === "development") {
                            e.target.style.backgroundColor = "red";
                            e.target.style.border = "2px solid red";
                          }
                          e.target.alt = t(
                            "registerProfile.form.mediaUpload.sportsImages.imageLoadError"
                          );
                        }}
                      />

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        style={{ zIndex: 30 }}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1">
                      <p className="text-xs text-gray-600 truncate">
                        {image.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Documents section */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="bg-blue-50 p-2 rounded-full">
            <FiFilePlus className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">
            {t("registerProfile.form.mediaUpload.supportingDocuments.title")}
          </h2>
          <Badge variant="outline" className="mr-auto font-normal text-xs">
            {t("labels.optional")}
          </Badge>
        </div>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FiFile className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t(
                  "registerProfile.form.mediaUpload.supportingDocuments.description"
                )}
              </p>
              <p className="text-xs text-gray-500">
                {t(
                  "registerProfile.form.mediaUpload.supportingDocuments.maxSize"
                )}
              </p>
            </div>

            <Input
              id="document-upload"
              type="file"
              accept={ALLOWED_DOCUMENT_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const error = handleFileValidation(
                  file,
                  ALLOWED_DOCUMENT_TYPES,
                  MAX_FILE_SIZE,
                  t
                );

                if (error) {
                  formik.setFieldError("media.document", error);
                  return;
                }

                if (formik.values.media.document?.url?.startsWith("blob:")) {
                  try {
                    URL.revokeObjectURL(formik.values.media.document.url);
                  } catch {}
                }

                const documentData = {
                  url: URL.createObjectURL(file),
                  publicId: uuidv4(),
                  title: file.name,
                  type: file.type,
                  size: file.size,
                  uploadedAt: new Date().toISOString(),
                  file,
                };

                formik.setFieldValue("media.document", documentData);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                document.getElementById("document-upload")?.click()
              }
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50"
            >
              <FiFile className="w-4 h-4 ml-2" />
              {t(
                "registerProfile.form.mediaUpload.supportingDocuments.selectFiles"
              )}
            </Button>
          </div>
        </div>

        {get(formik.errors, "media.document") && (
          <div
            role="alert"
            aria-live="assertive"
            className="text-red-500 text-xs mt-2 bg-red-50 p-2 px-3 rounded-md border border-red-100"
          >
            {get(formik.errors, "media.document")}
          </div>
        )}

        {/* Uploaded documents display */}
        {formik.values.media.document?.url && (
          <div className="space-y-3">
            <h3 className="text-base font-medium flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              {t(
                "registerProfile.form.mediaUpload.supportingDocuments.uploadedDocument"
              )}
            </h3>

            <div>
              {(() => {
                const doc = formik.values.media.document;
                // Extract file extension for icon display
                const extension =
                  doc.type?.split("/")[1] ||
                  doc.title?.split(".").pop() ||
                  doc.url?.split(".").pop() ||
                  "unknown";

                return (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="p-4 flex items-center">
                      <div className="relative w-14 h-14 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                        <FiFile className="w-6 h-6 text-blue-500" />
                        <span className="absolute bottom-1 text-[8px] font-bold text-blue-600 uppercase">
                          {extension}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm truncate mb-1">
                          {doc.title}
                        </h4>
                        <div className="flex items-center flex-wrap gap-2">
                          <Badge
                            variant={doc.file ? "secondary" : "outline"}
                            className={`text-xs ${
                              doc.file ? "bg-blue-100 text-blue-700" : ""
                            }`}
                          >
                            {doc.file
                              ? t(
                                  "registerProfile.form.mediaUpload.sportsVideos.new"
                                )
                              : doc.publicId
                              ? t(
                                  "registerProfile.form.mediaUpload.sportsVideos.uploaded"
                                )
                              : t(
                                  "registerProfile.form.mediaUpload.sportsVideos.processing"
                                )}
                          </Badge>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                          >
                            <span>
                              {t(
                                "registerProfile.form.mediaUpload.sportsVideos.view"
                              )}
                            </span>
                          </a>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeDocument}
                        className="flex-shrink-0 p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                        aria-label={t("actions.removeDocument")}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
