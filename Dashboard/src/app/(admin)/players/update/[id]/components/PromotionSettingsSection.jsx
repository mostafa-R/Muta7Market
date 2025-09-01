"use client";

export default function PromotionSettingsSection({ formData, handleInputChange }) {
  return (
    <>
      {/* Promotion Settings */}


      {/* System Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center space-x-3 space-x-reverse mb-8">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-xl">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">إعدادات النظام</h3>
            <p className="text-sm text-gray-500 mt-1">حالة وإعدادات الملف الشخصي</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Listed Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">مدرج في القوائم</span>
                <p className="text-xs text-gray-500">ظهور في القوائم العامة</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="isListed"
              checked={formData.isListed}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">نشط</span>
                <p className="text-xs text-gray-500">الحساب فعال ومتاح</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-5 w-5 text-green-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            />
          </div>

          {/* Confirmed Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">مؤكد</span>
                <p className="text-xs text-gray-500">تم تأكيد البيانات</p>
              </div>
            </div>
            <input
              type="checkbox"
              name="isConfirmed"
              checked={formData.isConfirmed}
              onChange={handleInputChange}
              className="h-5 w-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            />
          </div>
        </div>
      </div>
    </>
  );
}
