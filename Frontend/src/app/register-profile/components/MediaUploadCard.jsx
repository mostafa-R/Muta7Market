// components/MediaUploadCard.jsx
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { get } from "lodash";
import { useTranslation } from "react-i18next";
import { FiFile, FiFilePlus, FiUpload, FiVideo, FiX } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export const MediaUploadCard = ({
  formik,
  handleFileValidation,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
}) => {
  const { t } = useTranslation();

  const removeVideo = () => {
    const video = formik.values.media.video;
    if (video && video.file && video.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(video.url);
      } catch {}
    }
    formik.setFieldValue("media.video", {
      url: null,
      publicId: null,
      title: null,
      duration: 0,
      uploadedAt: null,
    });
  };

  const removeDocument = () => {
    const document = formik.values.media.document;
    if (document && document.file && document.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(document.url);
      } catch {}
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
            اختياري
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
                  MAX_FILE_SIZE
                );

                if (error) {
                  formik.setFieldError("media.video", error);
                  return;
                }

                // If we already have a video with a local URL, revoke it
                if (formik.values.media.video?.url?.startsWith("blob:")) {
                  try {
                    URL.revokeObjectURL(formik.values.media.video.url);
                  } catch {}
                }

                // Set the new video
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
                      Your browser does not support video playback.
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
                      aria-label="إزالة الفيديو"
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
            اختياري
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
                  MAX_FILE_SIZE
                );

                if (error) {
                  formik.setFieldError("media.document", error);
                  return;
                }

                // If we already have a document with a local URL, revoke it
                if (formik.values.media.document?.url?.startsWith("blob:")) {
                  try {
                    URL.revokeObjectURL(formik.values.media.document.url);
                  } catch {}
                }

                // Set the new document
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
                        aria-label="إزالة المستند"
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
