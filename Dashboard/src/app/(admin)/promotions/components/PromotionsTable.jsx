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
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import EditPromotionDialog from "./EditPromotionDialog";

export default function PromotionsTable({ promotions, loading, onDelete, onUpdate }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async () => {
    if (!selectedPromotion) return;

    try {
      setDeletingId(selectedPromotion._id);
      await api.delete(`/promotions/${selectedPromotion._id}`);
      onDelete();
    } catch (error) {
      console.error("Failed to delete promotion:", error);
    } finally {
      setDeletingId(null);
      setDeleteDialogOpen(false);
      setSelectedPromotion(null);
    }
  };

  const openDeleteDialog = (promotion) => {
    setSelectedPromotion(promotion);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (promotion) => {
    setSelectedPromotion(promotion);
    setEditDialogOpen(true);
  };

  const getDiscountValue = (promotion) => {
    switch (promotion.type) {
      case "percentage":
        return `${promotion.value}%`;
      case "fixed":
        return `${promotion.value} ريال`;
      case "free":
        return "مجاني";
      default:
        return promotion.value;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (promotions.length === 0) {
    return <div className="text-center p-8">لا توجد عروض ترويجية</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الكود</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>ينطبق على</TableHead>
              <TableHead>فترة الصلاحية</TableHead>
              <TableHead>الاستخدام</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promotion) => (
              <TableRow key={promotion._id}>
                <TableCell>
                  {promotion.media?.url ? (
                    <img
                      src={promotion.media.url}
                      alt={promotion.name.ar}
                      className="h-10 w-10 object-cover rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs">بدون صورة</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{promotion.name.ar}</div>
                  <div className="text-xs text-gray-500">{promotion.name.en}</div>
                </TableCell>
                <TableCell>
                  <code className="bg-gray-100 p-1 rounded">{promotion.code}</code>
                </TableCell>
                <TableCell>
                  {promotion.type === "percentage" && "نسبة مئوية"}
                  {promotion.type === "fixed" && "قيمة ثابتة"}
                  {promotion.type === "free" && "مجاني"}
                </TableCell>
                <TableCell>{getDiscountValue(promotion)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {promotion.applicableTo.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item === "contactAccess" && "الوصول للتواصل"}
                        {item === "listing" && "النشر"}
                        {item === "promotion" && "الترويج"}
                        {item === "subscription" && "الاشتراك"}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    من: {formatDate(promotion.validityPeriod.startDate)}
                    <br />
                    إلى: {formatDate(promotion.validityPeriod.endDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {promotion.usageCount}/{promotion.usageLimit.total || "∞"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={promotion.isActive ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {promotion.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2 rtl:space-x-reverse">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(promotion)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(promotion)}
                      disabled={deletingId === promotion._id}
                    >
                      {deletingId === promotion._id ? (
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
            <AlertDialogTitle>هل أنت متأكد من حذف هذا العرض الترويجي؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف العرض الترويجي نهائيًا من قاعدة البيانات.
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

      {selectedPromotion && (
        <EditPromotionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          promotion={selectedPromotion}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}