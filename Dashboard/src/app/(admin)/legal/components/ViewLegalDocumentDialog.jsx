"use client";

import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/component/ui/dialog";
import React, { useState } from "react";

export default function ViewLegalDocumentDialog({ document, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("ar");
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'terms':
        return 'الشروط والأحكام';
      case 'privacy':
        return 'سياسة الخصوصية';
      case 'refund':
        return 'سياسة الاسترداد';
      case 'cookies':
        return 'سياسة ملفات تعريف الارتباط';
      case 'disclaimer':
        return 'إخلاء المسؤولية';
      case 'custom':
        return 'مستند مخصص';
      default:
        return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} dir="rtl">
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'ar' ? document?.title?.ar : document?.title?.en}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {getDocumentTypeLabel(document?.type)}
            </Badge>
            {document?.isDefault && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                افتراضي
              </Badge>
            )}
            {document?.isActive ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                نشط
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                غير نشط
              </Badge>
            )}
            <Badge variant="outline" className="text-gray-700 dark:text-gray-300">
              الإصدار: {document?.version}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex border-b border-gray-200 dark:border-slate-700 mb-4">
            <button
              type="button"
              className={`px-4 py-2 ${activeTab === 'ar' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => handleTabChange('ar')}
            >
              المحتوى بالعربية
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${activeTab === 'en' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => handleTabChange('en')}
            >
              المحتوى بالإنجليزية
            </button>
          </div>
          
          <div className={activeTab === 'ar' ? 'block' : 'hidden'}>
            <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-slate-800 rounded-lg min-h-[300px]">
              <div dangerouslySetInnerHTML={{ __html: document?.content?.ar || '' }} />
            </div>
          </div>
          
          <div className={activeTab === 'en' ? 'block' : 'hidden'}>
            <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-slate-800 rounded-lg min-h-[300px]">
              <div dangerouslySetInnerHTML={{ __html: document?.content?.en || '' }} />
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">معلومات المستند</h3>
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500 dark:text-gray-400">الرابط:</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    <code className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded">{document?.slug}</code>
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">تاريخ السريان:</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(document?.effectiveDate).toLocaleDateString('ar-SA')}
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">تاريخ النشر:</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(document?.publishedDate).toLocaleDateString('ar-SA')}
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">تاريخ الإنشاء:</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(document?.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                  
                  <div className="text-gray-500 dark:text-gray-400">آخر تحديث:</div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {document?.updatedAt ? new Date(document.updatedAt).toLocaleDateString('ar-SA') : '-'}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إعدادات SEO</h3>
              <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg text-sm">
                <div className="space-y-2">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">عنوان Meta (بالعربية):</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {document?.seo?.metaTitle?.ar || '-'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">عنوان Meta (بالإنجليزية):</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {document?.seo?.metaTitle?.en || '-'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">الكلمات المفتاحية:</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {document?.seo?.keywords?.length > 0 
                        ? document.seo.keywords.join(', ') 
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
