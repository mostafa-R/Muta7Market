import { Button } from "@/app/component/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/component/ui/dialog";
import { formatDate } from "@/lib/utils";

export default function ViewAdvertisementDialog({ open, onOpenChange, advertisement }) {
  if (!advertisement) return null;

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

  const getTargetingInfo = () => {
    const targeting = advertisement.targeting || {};
    const parts = [];

    if (targeting.countries && targeting.countries.length > 0) {
      parts.push(`البلدان: ${targeting.countries.join(', ')}`);
    }

    if (targeting.sports && targeting.sports.length > 0) {
      parts.push(`الرياضات: ${targeting.sports.join(', ')}`);
    }

    if (targeting.ageRange) {
      const { min, max } = targeting.ageRange;
      if (min && max) {
        parts.push(`العمر: ${min} - ${max}`);
      } else if (min) {
        parts.push(`العمر: أكبر من ${min}`);
      } else if (max) {
        parts.push(`العمر: أقل من ${max}`);
      }
    }

    if (targeting.gender) {
      parts.push(`الجنس: ${targeting.gender === 'male' ? 'ذكر' : targeting.gender === 'female' ? 'أنثى' : 'الكل'}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'لا يوجد استهداف محدد';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الإعلان</DialogTitle>
          <DialogDescription>
            عرض تفاصيل الإعلان وإحصائياته
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">المعلومات الأساسية</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">العنوان (عربي): </span>
                  <span>{advertisement.title.ar}</span>
                </div>
                <div>
                  <span className="font-medium">العنوان (إنجليزي): </span>
                  <span>{advertisement.title.en}</span>
                </div>
                <div>
                  <span className="font-medium">الوصف (عربي): </span>
                  <span>{advertisement.description?.ar || 'غير متوفر'}</span>
                </div>
                <div>
                  <span className="font-medium">الوصف (إنجليزي): </span>
                  <span>{advertisement.description?.en || 'غير متوفر'}</span>
                </div>
                <div>
                  <span className="font-medium">النوع: </span>
                  <span>{getTypeLabel(advertisement.type)}</span>
                </div>
                <div>
                  <span className="font-medium">الموقع: </span>
                  <span>{getPositionLabel(advertisement.position)}</span>
                </div>
                <div>
                  <span className="font-medium">الرابط: </span>
                  <a 
                    href={advertisement.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {advertisement.link}
                  </a>
                </div>
                <div>
                  <span className="font-medium">الحالة: </span>
                  <span className={advertisement.isActive ? 'text-green-600' : 'text-gray-500'}>
                    {advertisement.isActive ? 'نشط' : 'غير نشط'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">الأولوية: </span>
                  <span>{advertisement.priority || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">فترة العرض</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">تاريخ البدء: </span>
                  <span>{formatDate(advertisement.displayPeriod?.startDate)}</span>
                </div>
                <div>
                  <span className="font-medium">تاريخ الانتهاء: </span>
                  <span>{formatDate(advertisement.displayPeriod?.endDate)}</span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">معلومات المعلن</h3>
              <div className="space-y-2">
                {advertisement.advertiser ? (
                  <>
                    <div>
                      <span className="font-medium">الاسم: </span>
                      <span>{advertisement.advertiser.name}</span>
                    </div>
                    <div>
                      <span className="font-medium">البريد الإلكتروني: </span>
                      <span>{advertisement.advertiser.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">رقم الهاتف: </span>
                      <span>{advertisement.advertiser.phone || 'غير متوفر'}</span>
                    </div>
                  </>
                ) : (
                  <div>لا توجد معلومات عن المعلن</div>
                )}
              </div>

              <h3 className="text-lg font-semibold mt-4 mb-2">الاستهداف</h3>
              <div>
                {getTargetingInfo()}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">الإحصائيات</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-md text-center">
                <div className="text-3xl font-bold">{advertisement.views || 0}</div>
                <div className="text-sm text-gray-500">المشاهدات</div>
              </div>
              <div className="bg-gray-100 p-4 rounded-md text-center">
                <div className="text-3xl font-bold">{advertisement.clicks || 0}</div>
                <div className="text-sm text-gray-500">النقرات</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">معاينة الإعلان</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">صورة سطح المكتب:</h4>
                {advertisement.media?.desktop?.url ? (
                  <img
                    src={advertisement.media.desktop.url}
                    alt="صورة سطح المكتب"
                    className="max-h-64 object-contain border rounded"
                  />
                ) : (
                  <div className="h-32 bg-gray-100 flex items-center justify-center rounded">
                    لا توجد صورة لسطح المكتب
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-1">صورة الجوال:</h4>
                {advertisement.media?.mobile?.url ? (
                  <img
                    src={advertisement.media.mobile.url}
                    alt="صورة الجوال"
                    className="max-h-64 object-contain border rounded"
                  />
                ) : (
                  <div className="h-32 bg-gray-100 flex items-center justify-center rounded">
                    لا توجد صورة للجوال
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
