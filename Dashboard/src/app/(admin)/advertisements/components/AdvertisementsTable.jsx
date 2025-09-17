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
import { Skeleton } from "@/app/component/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/component/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import EditAdvertisementDialog from "./EditAdvertisementDialog";
import ViewAdvertisementDialog from "./ViewAdvertisementDialog";

const TableSkeleton = () => (
    [...Array(5)].map((_, i) => (
        <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800">
            <TableCell className="py-4">
                <Skeleton className="h-12 w-20 rounded-lg" />
            </TableCell>
            <TableCell className="py-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                </div>
            </TableCell>
            <TableCell className="py-4"><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
            <TableCell className="py-4"><Skeleton className="h-6 w-[100px] rounded-full" /></TableCell>
            <TableCell className="py-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-[90px]" />
                    <Skeleton className="h-3 w-[90px]" />
                </div>
            </TableCell>
            <TableCell className="py-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-[70px]" />
                    <Skeleton className="h-3 w-[70px]" />
                </div>
            </TableCell>
            <TableCell className="py-4"><Skeleton className="h-6 w-[70px] rounded-full" /></TableCell>
            <TableCell className="py-4"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
        </TableRow>
    ))
);

const EmptyState = () => (
    <TableRow>
        <TableCell colSpan={8} className="h-32 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V9a2 2 0 00-2-2" />
                    </svg>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    لا توجد إعلانات لعرضها
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                    قم بإنشاء أول إعلان لك
                </div>
            </div>
        </TableCell>
    </TableRow>
);

export default function AdvertisementsTable({ advertisements, loading, onDelete, onEdit }) {
  const [dialogs, setDialogs] = useState({ delete: false, edit: false, view: false });
  const [selectedAd, setSelectedAd] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDialog = (dialog, advertisement) => {
    setSelectedAd(advertisement);
    setDialogs(prev => ({ ...prev, [dialog]: true }));
  };

  const closeDialog = (dialog) => {
    setDialogs(prev => ({ ...prev, [dialog]: false }));
    setTimeout(() => setSelectedAd(null), 300);
  };

  const handleDelete = async () => {
    if (!selectedAd) return;
    setIsDeleting(true);
    try {
      await api.delete(`/advertisements/${selectedAd._id}`);
      onDelete();
    } catch (error) {
      console.error("Failed to delete advertisement:", error);
    } finally {
      setIsDeleting(false);
      closeDialog('delete');
    }
  };

  const getTypeLabel = (type) => ({
    "banner": "بانر", "popup": "نافذة منبثقة", "sidebar": "شريط جانبي",
    "featured": "متميز", "inline": "مدمج"
  }[type] || type);

  const getPositionLabel = (position) => ({
    "home": "الصفحة الرئيسية", "players": "صفحة اللاعبين", "coaches": "صفحة المدربين",
    "profile": "صفحة الملف الشخصي", "all": "الكل"
  }[position] || position);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    الصورة
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    العنوان
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    النوع
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    الموقع
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    فترة العرض
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    الإحصائيات
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    الحالة
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-gray-100 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                    الإجراءات
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableSkeleton /> : advertisements.length === 0 ? <EmptyState /> : (
                advertisements.map((ad, index) => (
                  <TableRow key={ad._id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/20'}`}>
                    <TableCell className="py-4">
                      <div className="relative group">
                        {ad.media?.desktop?.url ? (
                          <img 
                            src={ad.media.desktop.url} 
                            alt={ad.title.ar} 
                            className="h-12 w-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-400 transition-colors" 
                          />
                        ) : (
                          <div className="h-12 w-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-blue-400 transition-colors">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {ad.source === 'google' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">G</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="max-w-[200px]">
                        <div className="font-semibold text-gray-900 dark:text-white truncate">{ad.title.ar}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{ad.title.en}</div>
                        {ad.description?.ar && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">{ad.description.ar}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className="font-medium">
                        {getTypeLabel(ad.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary" className="font-medium">
                        {getPositionLabel(ad.position)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                          {formatDate(ad.displayPeriod?.startDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {formatDate(ad.displayPeriod?.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-900 dark:text-white">{(ad.views || 0).toLocaleString()}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">مشاهدة</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.414l.707-.707zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium text-gray-900 dark:text-white">{(ad.clicks || 0).toLocaleString()}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">نقرة</span>
                        </div>
                        {ad.views > 0 && (
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            CTR: {((ad.clicks / ad.views) * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${ad.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <Badge variant={ad.isActive ? "default" : "secondary"} className={`font-medium ${ad.isActive ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700' : ''}`}>
                          {ad.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                      {ad.priority > 0 && (
                        <div className="flex items-center mt-1 text-xs text-amber-600 dark:text-amber-400">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          أولوية {ad.priority}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog('view', ad)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-400 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog('edit', ad)}
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-400 transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDialog('delete', ad)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={dialogs.delete} onOpenChange={() => closeDialog('delete')}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              حذف الإعلان "{selectedAd?.title?.ar}"
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الإعلان وجميع بياناته بشكل نهائي من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0 sm:mt-0">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  حذف نهائياً
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedAd && (
        <>
          <EditAdvertisementDialog
            open={dialogs.edit}
            onOpenChange={() => closeDialog('edit')}
            advertisement={selectedAd}
            onUpdate={onEdit}
          />
          <ViewAdvertisementDialog
            open={dialogs.view}
            onOpenChange={() => closeDialog('view')}
            advertisement={selectedAd}
          />
        </>
      )}
    </>
  );
}
