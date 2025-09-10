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
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import EditSportDialog from "./EditSportDialog";

export default function SportsTable({ sports, loading, onSportUpdated, onSportDeleted }) {
  const [editingSport, setEditingSport] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingSport, setDeletingSport] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = (sport) => {
    setEditingSport(sport);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (sport) => {
    setDeletingSport(sport);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSport) return;
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
      const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
      
      const response = await fetch(`${API_BASE_URL}/sports/${deletingSport._id}`, {
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
        onSportDeleted(deletingSport._id);
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error(result.message || "فشل حذف اللعبة الرياضية");
      }
    } catch (error) {
      console.error("Error deleting sport:", error);
      toast.error(`حدث خطأ: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeletingSport(null);
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

  if (sports.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
            لا توجد ألعاب رياضية
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            قم بإضافة لعبة رياضية جديدة من خلال تبويب "إضافة لعبة جديدة"
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
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الأيقونة</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الاسم</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الوصف</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">المواقع</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الأدوار</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الترتيب</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الحالة</th>
            <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {sports.map((sport) => (
            <tr key={sport._id} className="hover:bg-gray-50 dark:hover:bg-slate-800/60">
              <td className="px-4 py-3">
                <div className="relative h-10 w-10">
                  {sport.icon?.url ? (
                    <Image
                      src={sport.icon.url}
                      alt={sport.name.ar}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">لا توجد</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {sport.name.ar}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {sport.name.en}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {sport.slug}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="max-w-xs truncate text-sm text-gray-700 dark:text-gray-300">
                  {sport.description?.ar || "-"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {sport.positions?.length > 0 ? (
                    sport.positions.slice(0, 3).map((position, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {position}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                  )}
                  {sport.positions?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{sport.positions.length - 3}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {sport.roleTypes?.length > 0 ? (
                    sport.roleTypes.slice(0, 3).map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">-</span>
                  )}
                  {sport.roleTypes?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{sport.roleTypes.length - 3}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {sport.displayOrder || 0}
                </span>
              </td>
              <td className="px-4 py-3">
                {sport.isActive ? (
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
                    variant="outline"
                    onClick={() => handleEditClick(sport)}
                  >
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(sport)}
                  >
                    حذف
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* حوار تعديل اللعبة */}
      {editingSport && (
        <EditSportDialog
          sport={editingSport}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingSport(null);
          }}
          onSportUpdated={onSportUpdated}
        />
      )}

      {/* حوار تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه اللعبة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف اللعبة الرياضية "{deletingSport?.name?.ar}" بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
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
