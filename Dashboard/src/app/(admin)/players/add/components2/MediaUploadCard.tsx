// components/MediaUploadCard.tsx
import { FiUpload } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { get } from "lodash";
// import { v4 as uuidv4 } from "uuid";

interface MediaUploadCardProps {
  formik: any;
  handleFileValidation: (
    file: File | null | undefined,
    allowedTypes: string[],
    maxSize: number
  ) => string | null;
  ALLOWED_VIDEO_TYPES: string[];
  ALLOWED_DOCUMENT_TYPES: string[];
  MAX_FILE_SIZE: number;
}

export const MediaUploadCard = ({
  formik,
  handleFileValidation,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
}: MediaUploadCardProps) => {
  return (
    <div className="space-y-6">
      {/* فيديوهات رياضية */}
      <Card className="border-0 shadow-card bg-white text-right">
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span className="text-lg font-semibold text-gray-800">رفع فيديوهات رياضية (اختياري)</span>
            <FiUpload className="w-5 h-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="media-upload" className="block text-sm font-medium text-gray-700">
              اختيار ملفات الفيديو
            </Label>
            <div className="flex flex-col items-end gap-2">
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
                  const uploaded = validFiles.map((file: any) => ({
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
                className="text-right"
              />
              <p className="text-xs text-gray-500 text-right">
                الأنواع المسموحة: {ALLOWED_VIDEO_TYPES.join(', ')}
              </p>
            </div>
            {get(formik.errors, "media.videos") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "media.videos")}
              </div>
            )}
          </div>
          {formik.values.media.videos.length > 0 && (
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">الفيديوهات المرفوعة:</Label>
              <ul className="list-disc pr-5 space-y-1 text-right">
                {formik.values.media.videos.map((video: any, idx: number) => (
                  <li key={video.publicId || idx} className="text-sm">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {video.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* مستندات داعمة */}
      <Card className="border-0 shadow-card bg-white text-right">
        <CardHeader>
          <CardTitle className="flex items-center justify-end gap-2">
            <span className="text-lg font-semibold text-gray-800">رفع مستندات داعمة (PDF أو صور) (اختياري)</span>
            <FiUpload className="w-5 h-5 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="document-upload" className="block text-sm font-medium text-gray-700">
              اختيار الملفات
            </Label>
            <div className="flex flex-col items-end gap-2">
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
                  const uploaded = validFiles.map((file: any) => ({
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
                className="text-right"
              />
              <p className="text-xs text-gray-500 text-right">
                الأنواع المسموحة: {ALLOWED_DOCUMENT_TYPES.join(', ')}
              </p>
            </div>
            {get(formik.errors, "media.documents") && (
              <div className="text-red-500 text-xs mt-1 text-right">
                {get(formik.errors, "media.documents")}
              </div>
            )}
          </div>
          {formik.values.media.documents.length > 0 && (
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">المستندات المرفوعة:</Label>
              <ul className="list-disc pr-5 space-y-1 text-right">
                {formik.values.media.documents.map((doc: any, idx: number) => (
                  <li key={doc.publicId || idx} className="text-sm">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {doc.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};