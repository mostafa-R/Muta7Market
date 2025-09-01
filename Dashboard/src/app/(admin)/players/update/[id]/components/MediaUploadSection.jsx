"use client";

export default function MediaUploadSection({ 
  files,
  previews,
  existingMedia,
  handleFileChange,
  removeImage,
  removeExistingImage,
  removeExistingProfileImage,
  removeExistingVideo,
  removeExistingDocument
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <div className="flex items-center space-x-3 space-x-reverse mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">الوسائط والملفات</h2>
          <p className="text-sm text-gray-500 mt-1">الصور والفيديوهات والمستندات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الصورة الشخصية
          </label>
          
          {/* Show existing profile image if available */}
          {existingMedia.profileImage && !previews.profileImage && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-blue-800">الصورة الحالية:</p>
                <button
                  type="button"
                  onClick={removeExistingProfileImage}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  title="حذف الصورة"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="relative inline-block">
                <img
                  src={existingMedia.profileImage.url}
                  alt="الصورة الشخصية الحالية"
                  className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          
          <input
            type="file"
            name="profileImage"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {/* Show new preview if uploaded */}
          {previews.profileImage && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-3">الصورة الجديدة:</p>
              <div className="relative inline-block">
                <img
                  src={previews.profileImage}
                  alt="معاينة الصورة الشخصية الجديدة"
                  className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-green-300"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            مستند (CV/السيرة الذاتية)
          </label>
          
          {/* Show existing document if available */}
          {existingMedia.document && existingMedia.document.url && (
            <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm font-medium text-red-800 mb-3">المستند الحالي:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">{existingMedia.document.title || 'مستند'}</span>
                    <span className="text-xs text-gray-500">{existingMedia.document.type}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <a
                    href={existingMedia.document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    عرض
                  </a>
                  <button
                    type="button"
                    onClick={removeExistingDocument}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    title="حذف المستند"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <input
            type="file"
            name="document"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {files.document && (
            <p className="text-sm text-green-600 mt-2">
              مستند جديد محدد: {files.document.name}
            </p>
          )}
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            مقطع فيديو
          </label>
          
          {/* Show existing video if available */}
          {existingMedia.video && existingMedia.video.url && (
            <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm font-medium text-purple-800 mb-3">الفيديو الحالي:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block truncate max-w-xs">{existingMedia.video.title || 'فيديو'}</span>
                    <span className="text-xs text-gray-500">مدة: {existingMedia.video.duration || 'غير محدد'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <a
                    href={existingMedia.video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    عرض
                  </a>
                  <button
                    type="button"
                    onClick={removeExistingVideo}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    title="حذف الفيديو"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <input
            type="file"
            name="playerVideo"
            onChange={handleFileChange}
            accept="video/*"
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {files.playerVideo && (
            <p className="text-sm text-green-600 mt-2">
              فيديو جديد محدد: {files.playerVideo.name}
            </p>
          )}
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            الصور الإضافية (حد أقصى 4)
          </label>
          
          {/* Show existing images */}
          {existingMedia.images.length > 0 && (
            <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm font-medium text-amber-800 mb-3">الصور الحالية:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {existingMedia.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`صورة إضافية ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl shadow-md border-2 border-white transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-md"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input
            type="file"
            name="images"
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          
          {/* Show new image previews */}
          {previews.images.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-3">صور جديدة محددة:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {previews.images.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`معاينة الصورة الجديدة ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl shadow-md border-2 border-green-300 transition-transform duration-200 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all duration-200 shadow-md"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                      جديد
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
