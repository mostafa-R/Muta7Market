"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/app/component/ui/alert-dialog";
import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import EditLegalDocumentDialog from "./EditLegalDocumentDialog";
import ViewLegalDocumentDialog from "./ViewLegalDocumentDialog";

export default function LegalDocumentsTable({ documents, loading, onDocumentUpdated, onDocumentDeleted }) {
  const [editingDocument, setEditingDocument] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewClick = (document) => {
    setViewingDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (document) => {
    setEditingDocument(document);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (document) => {
    setDeletingDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDocument) return;
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${API_BASE_URL}/legal/${deletingDocument._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        onDocumentDeleted(deletingDocument._id);
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error(result.message || "فشل حذف المستند القانوني");
      }
    } catch (error) {
      console.error("Error deleting legal document:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeletingDocument(null);
    }
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
            لا توجد مستندات قانونية
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            قم بإضافة مستند قانوني جديد من خلال تبويب "إضافة مستند جديد"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-slate-800 text-right">
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">النوع</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">العنوان</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الإصدار</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">تاريخ النشر</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الحالة</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {documents.map((document) => (
            <tr key={document._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60">
              <td className="px-4 py-3">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40">
                  {getDocumentTypeLabel(document.type)}
                </Badge>
                {document.isDefault && (
                  <Badge className="mr-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    افتراضي
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {document.title.ar}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {document.title.en}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {document.slug}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {document.version}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(document.publishedDate).toLocaleDateString('ar-SA')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  تاريخ السريان: {new Date(document.effectiveDate).toLocaleDateString('ar-SA')}
                </div>
              </td>
              <td className="px-4 py-3">
                {document.isActive ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40">
                    نشط
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500 dark:text-gray-400">
                    غير نشط
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewClick(document)}
                  >
                    عرض
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditClick(document)}
                  >
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(document)}
                    disabled={document.isDefault}
                  >
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* حوار عرض المستند */}
      {viewingDocument && (
        <ViewLegalDocumentDialog
          document={viewingDocument}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setViewingDocument(null);
          }}
        />
      )}

      {/* حوار تعديل المستند */}
      {editingDocument && (
        <EditLegalDocumentDialog
          document={editingDocument}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingDocument(null);
          }}
          onDocumentUpdated={onDocumentUpdated}
        />
      )}

      {/* حوار تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستند؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المستند القانوني "{deletingDocument?.title?.ar}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
