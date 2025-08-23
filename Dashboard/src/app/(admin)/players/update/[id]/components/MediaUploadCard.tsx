// components/MediaUploadCard.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { get } from "lodash";
import { FiUpload } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

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
                {formik.values.media.videos.map((video: any, idx: number) => (
                  <li key={video.publicId || idx}>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
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
                {formik.values.media.documents.map((doc: any, idx: number) => (
                  <li key={doc.publicId || idx}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
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
    </>
  );
};
