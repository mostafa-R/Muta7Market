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
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import EditAdvertisementDialog from "./EditAdvertisementDialog";
import ViewAdvertisementDialog from "./ViewAdvertisementDialog";

export default function AdvertisementsTable({ advertisements, loading, onDelete, onUpdate }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async () => {
    if (!selectedAdvertisement) return;

    try {
      setDeletingId(selectedAdvertisement._id);
      await api.delete(`/advertisements/${selectedAdvertisement._id}`);
      onDelete();
    } catch (error) {
      console.error("Failed to delete advertisement:", error);
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setSelectedAdvertisement(null);
    }
  };

  const openDeleteDialog = (advertisement) => {
    setSelectedAdvertisement(advertisement);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (advertisement) => {
    setSelectedAdvertisement(advertisement);
    setEditDialogOpen(true);
  };

  const openViewDialog = (advertisement) => {
    setSelectedAdvertisement(advertisement);
    setViewDialogOpen(true);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "banner": return "بانر";
      case "popup": return "نافذة منبثقة";
      case "sidebar": return "شريط جانبي";
      case "native": return "إعلان مدمج";
      default: return type;
    }
  };

  const getPositionLabel = (position) => {
    switch (position) {
      case "home": return "الصفحة الرئيسية";
      case "search": return "صفحة البحث";
      case "profile": return "صفحة الملف الشخصي";
      case "listing": return "صفحة القوائم";
      default: return position;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (advertisements.length === 0) {
    return <div className="text-center p-8">لا توجد إعلانات</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الموقع</TableHead>
              <TableHead>فترة العرض</TableHead>
              <TableHead>الإحصائيات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisements.map((ad) => (
              <TableRow key={ad._id}>
                <TableCell>
                  {ad.media?.desktop?.url ? (
                    <img
                      src={ad.media.desktop.url}
                      alt={ad.title.ar}
                      className="h-10 w-auto object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">بدون صورة</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{ad.title.ar}</div>
                  <div className="text-xs text-gray-500">{ad.title.en}</div>
                  {ad.advertiser && (
                    <div className="text-xs text-gray-500">
                      المعلن: {ad.advertiser.name}
                    </div>
                  )}
                </TableCell>
                <TableCell>{getTypeLabel(ad.type)}</TableCell>
                <TableCell>{getPositionLabel(ad.position)}</TableCell>
                <TableCell>
                  <div className="text-xs">
                    من: {formatDate(ad.displayPeriod?.startDate)}
                    <br />
                    إلى: {formatDate(ad.displayPeriod?.endDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    المشاهدات: {ad.views || 0}
                    <br />
                    النقرات: {ad.clicks || 0}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ad.isActive ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {ad.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openViewDialog(ad)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(ad)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(ad)}
                      disabled={deletingId === ad._id}
                    >
                      {deletingId === ad._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الإعلان؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف الإعلان نهائيًا من قاعدة البيانات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              {deletingId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedAdvertisement && (
        <>
          <EditAdvertisementDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            advertisement={selectedAdvertisement}
            onUpdate={onUpdate}
          />
          
          <ViewAdvertisementDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            advertisement={selectedAdvertisement}
          />
        </>
      )}
    </>
  );
}
