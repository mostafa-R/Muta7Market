// components/MediaUploadCard.jsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Label } from "@/app/component/ui/label";
import { get } from "lodash";
import { FiUpload } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export const MediaUploadCard = ({
  formik,
  handleFileValidation,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
}) => {
  const removeVideoAt = (index) => {
    const items = [...formik.values.media.videos];
    const item = items[index];
    if (!item) return;
    // Revoke only local object URLs (newly selected files)
    if (item.file && item.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(item.url);
      } catch {}
    }
    items.splice(index, 1);
    formik.setFieldValue("media.videos", items);
  };

  const removeDocumentAt = (index) => {
    const items = [...formik.values.media.documents];
    const item = items[index];
    if (!item) return;
    if (item.file && item.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(item.url);
      } catch {}
    }
    items.splice(index, 1);
    formik.setFieldValue("media.documents", items);
  };

  return (
    <>
      <Card className="border-0 shadow-card bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FiUpload className="w-5 h-5 text-primary mr-2 ml-2" />
            <span>رفع فيديوهات رياضية (اختياري)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="media-upload">اختيار ملفات الفيديو</Label>
            <Input
              id="media-upload"
              type="file"
              accept={ALLOWED_VIDEO_TYPES.join(",")}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const validFiles = files.filter((file) => {
                  const error = handleFileValidation(
                    file,
                    ALLOWED_VIDEO_TYPES,
                    MAX_FILE_SIZE
                  );
                  if (error) {
                    formik.setFieldError("media.videos", error);
                    return false;
                  }
                  return true;
                });
                const uploaded = validFiles.map((file) => ({
                  url: URL.createObjectURL(file),
                  publicId: uuidv4(),
                  title: file.name,
                  duration: 0,
                  uploadedAt: new Date().toISOString(),
                  file,
                }));
                formik.setFieldValue("media.videos", [
                  ...formik.values.media.videos,
                  ...uploaded,
                ]);
              }}
            />
            {get(formik.errors, "media.videos") && (
              <div className="text-red-500 text-xs mt-1">
                {get(formik.errors, "media.videos")}
              </div>
            )}
          </div>
          {formik.values.media.videos.length > 0 && (
            <div className="space-y-2">
              <Label>الفيديوهات المرفوعة:</Label>
              <ul className="list-disc pl-5 space-y-1">
                {formik.values.media.videos.map((video, idx) => (
                  <li
                    key={video.publicId || idx}
                    className="flex items-center gap-3"
                  >
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {video.title}
                    </a>
                    {video.file && (
                      <button
                        type="button"
                        onClick={() => removeVideoAt(idx)}
                        className="text-xs text-red-600 hover:underline"
                        aria-label="إزالة الفيديو"
                      >
                        إزالة
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-card bg-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <FiUpload className="w-5 h-5 text-primary mr-2 ml-2" />
            <span>رفع مستندات داعمة (PDF أو صور) (اختياري)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="document-upload">اختيار الملفات</Label>
            <Input
              id="document-upload"
              type="file"
              accept={ALLOWED_DOCUMENT_TYPES.join(",")}
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const validFiles = files.filter((file) => {
                  const error = handleFileValidation(
                    file,
                    ALLOWED_DOCUMENT_TYPES,
                    MAX_FILE_SIZE
                  );
                  if (error) {
                    formik.setFieldError("media.documents", error);
                    return false;
                  }
                  return true;
                });
                const uploaded = validFiles.map((file) => ({
                  url: URL.createObjectURL(file),
                  publicId: uuidv4(),
                  title: file.name,
                  type: file.type,
                  uploadedAt: new Date().toISOString(),
                  file,
                }));
                formik.setFieldValue("media.documents", [
                  ...formik.values.media.documents,
                  ...uploaded,
                ]);
              }}
            />
            {get(formik.errors, "media.documents") && (
              <div className="text-red-500 text-xs mt-1">
                {get(formik.errors, "media.documents")}
              </div>
            )}
          </div>
          {formik.values.media.documents.length > 0 && (
            <div className="space-y-2">
              <Label>المستندات المرفوعة:</Label>
              <ul className="list-disc pl-5 space-y-1">
                {formik.values.media.documents.map((doc, idx) => (
                  <li
                    key={doc.publicId || idx}
                    className="flex items-center gap-3"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {doc.title}
                    </a>
                    {doc.file && (
                      <button
                        type="button"
                        onClick={() => removeDocumentAt(idx)}
                        className="text-xs text-red-600 hover:underline"
                        aria-label="إزالة المستند"
                      >
                        إزالة
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
