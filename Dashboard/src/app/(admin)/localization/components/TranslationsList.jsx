"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/component/ui/alert-dialog";
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Input } from "@/app/component/ui/input";
import { ChevronLeft, ChevronRight, Edit, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

const TranslationsList = ({ translations, onUpdate, onDelete, isSubmitting, pagination, onPageChange }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    ar: "",
    en: ""
  });
  
  // Start editing a translation
  const handleStartEdit = (translation) => {
    setEditingId(translation._id);
    setEditValues({
      ar: translation.translations.ar,
      en: translation.translations.en
    });
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({
      ar: "",
      en: ""
    });
  };
  
  // Save edited translation
  const handleSaveEdit = (id) => {
    onUpdate(id, { translations: editValues });
    setEditingId(null);
  };
  
  // If no translations
  if (!translations || translations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" dir="rtl">
        لم يتم العثور على ترجمات. أضف بعض الترجمات أو عدّل معايير البحث.
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200 dark:border-slate-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800">
            <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">المفتاح</th>
            <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">المجموعة</th>
            <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">العربية</th>
            <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-right">الإنجليزية</th>
            <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-center">النظام</th>
            <th className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-center">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {translations.map((translation) => (
            <tr key={translation._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60">
              <td className="border border-gray-200 dark:border-slate-700 px-4 py-2">
                <code className="bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm font-mono">
                  {translation.key}
                </code>
              </td>
              <td className="border border-gray-200 dark:border-slate-700 px-4 py-2">
                <Badge variant="outline">{translation.group}</Badge>
              </td>
              <td className="border border-gray-200 dark:border-slate-700 px-4 py-2" dir="rtl">
                {editingId === translation._id ? (
                  <Input
                    value={editValues.ar}
                    onChange={(e) => setEditValues({ ...editValues, ar: e.target.value })}
                    dir="rtl"
                  />
                ) : (
                  translation.translations.ar
                )}
              </td>
              <td className="border border-gray-200 dark:border-slate-700 px-4 py-2">
                {editingId === translation._id ? (
                  <Input
                    value={editValues.en}
                    onChange={(e) => setEditValues({ ...editValues, en: e.target.value })}
                    dir="ltr"
                  />
                ) : (
                  translation.translations.en
                )}
              </td>
              <td className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-center">
                {translation.isSystem ? (
                  <Badge variant="secondary">نظام</Badge>
                ) : (
                  <Badge variant="outline">مخصص</Badge>
                )}
              </td>
              <td className="border border-gray-200 dark:border-slate-700 px-4 py-2 text-center">
                <div className="flex justify-center space-x-2">
                  {editingId === translation._id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveEdit(translation._id)}
                        disabled={isSubmitting}
                      >
                        <Save className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(translation)}
                      disabled={isSubmitting}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                  )}
                  
                  {!translation.isSystem && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد أنك تريد حذف الترجمة "{translation.key}"؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDelete(translation._id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      {pagination && pagination.pages > 0 && (
        <div className="flex flex-col items-center mt-6 gap-4" dir="rtl">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm">
            <span>عرض:</span>
            <select 
              className="border border-gray-300 rounded px-2 py-1"
              value={pagination.limit}
              onChange={(e) => onPageChange(1, parseInt(e.target.value))}
              disabled={isSubmitting}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>لكل صفحة</span>
          </div>
          
          {/* Page navigation */}
          <div className="flex items-center gap-2">
            {/* First page button */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={pagination.page <= 1 || isSubmitting}
              title="الصفحة الأولى"
            >
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -mr-2" />
              </div>
            </Button>
            
            {/* Previous page button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1 || isSubmitting}
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              <span>السابق</span>
            </Button>
            
            {/* Page indicator */}
            <div className="px-3 py-1 rounded-md bg-gray-100 dark:bg-slate-800">
              <span className="font-medium">{pagination.page}</span>
              <span className="mx-1">من</span>
              <span className="font-medium">{pagination.pages}</span>
            </div>
            
            {/* Next page button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPageChange(Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page >= pagination.pages || isSubmitting}
            >
              <span>التالي</span>
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
            
            {/* Last page button */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onPageChange(pagination.pages)}
              disabled={pagination.page >= pagination.pages || isSubmitting}
              title="الصفحة الأخيرة"
            >
              <div className="flex items-center">
                <ChevronLeft className="h-4 w-4 -ml-2" />
                <ChevronLeft className="h-4 w-4" />
              </div>
            </Button>
          </div>
          
          {/* Total records indicator */}
          <div className="text-sm text-gray-500">
            إجمالي السجلات: <span className="font-medium">{pagination.total}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationsList;
