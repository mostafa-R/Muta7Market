import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/component/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/component/ui/dialog";
import { Separator } from "@/app/component/ui/separator";
import { formatDate } from "@/lib/utils";
import React from "react";

export default function ViewAdvertisementDialog({ open, onOpenChange, advertisement }) {
  if (!advertisement) return null;
  
  const [desktopImageLoading, setDesktopImageLoading] = React.useState(true);
  const [mobileImageLoading, setMobileImageLoading] = React.useState(true);
  const [desktopImageError, setDesktopImageError] = React.useState(false);
  const [mobileImageError, setMobileImageError] = React.useState(false);
  
  // Reset image states when advertisement changes
  React.useEffect(() => {
    setDesktopImageLoading(true);
    setMobileImageLoading(true);
    setDesktopImageError(false);
    setMobileImageError(false);
  }, [advertisement?.media?.desktop?.url, advertisement?.media?.mobile?.url]);

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

  const getStatusBadgeVariant = (isActive) => {
    return isActive ? "default" : "secondary";
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "banner": return "default";
      case "popup": return "destructive";
      case "sidebar": return "secondary";
      case "native": return "outline";
      default: return "outline";
    }
  };

  const clickThroughRate = advertisement.views > 0 
    ? ((advertisement.clicks || 0) / advertisement.views * 100).toFixed(2)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                تفاصيل الإعلان
                <Badge 
                  variant={getStatusBadgeVariant(advertisement.isActive)}
                  className="text-xs"
                >
                  {advertisement.isActive ? 'نشط' : 'غير نشط'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                عرض شامل لجميع تفاصيل الإعلان وإحصائياته
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getTypeBadgeVariant(advertisement.type)}>
                {getTypeLabel(advertisement.type)}
              </Badge>
              <div className="text-sm text-muted-foreground">
                أولوية: {advertisement.priority || 0}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">المعلومات الأساسية</CardTitle>
                  <CardDescription className="text-slate-600">تفاصيل الإعلان الرئيسية والمعلومات المهمة</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Title Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-800">عناوين الإعلان</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <label className="text-sm font-semibold text-blue-700">العنوان بالعربية</label>
                    </div>
                    <p className="text-base font-medium text-slate-800 leading-relaxed">{advertisement.title.ar}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <label className="text-sm font-semibold text-green-700">English Title</label>
                    </div>
                    <p className="text-base font-medium text-slate-800 leading-relaxed">{advertisement.title.en}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Configuration Section */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-800">إعدادات الإعلان</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">موقع العرض</label>
                        <p className="text-base font-semibold text-slate-800">{getPositionLabel(advertisement.position)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">نوع الإعلان</label>
                        <p className="text-base font-semibold text-slate-800">{getTypeLabel(advertisement.type)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 bg-violet-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">مستوى الأولوية</label>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-slate-800">{advertisement.priority || 0}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (advertisement.priority || 0) ? 'text-yellow-400' : 'text-gray-200'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link Section */}
              {advertisement.link?.url && (
                <>
                  <Separator className="my-6" />
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <h3 className="text-lg font-semibold text-slate-800">رابط الإعلان</h3>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <a 
                            href={advertisement.link.url} 
                            target={advertisement.link.target || "_blank"} 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium break-all block"
                          >
                            {advertisement.link.url}
                          </a>
                          <p className="text-sm text-slate-600 mt-1">
                            يفتح في: {advertisement.link.target === "_self" ? "نفس الصفحة" : "صفحة جديدة"}
                          </p>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(advertisement.link.url)}
                          className="ml-3 p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="نسخ الرابط"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Description Section */}
              {(advertisement.description?.ar || advertisement.description?.en) && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-slate-800">وصف الإعلان</h3>
                    </div>
                    <div className="space-y-4">
                      {advertisement.description?.ar && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <label className="text-sm font-semibold text-amber-700">الوصف بالعربية</label>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700">{advertisement.description.ar}</p>
                        </div>
                      )}
                      {advertisement.description?.en && (
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-200">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="h-4 w-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <label className="text-sm font-semibold text-rose-700">English Description</label>
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700">{advertisement.description.en}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإحصائيات والأداء</CardTitle>
              <CardDescription>بيانات الأداء والتفاعل مع الإعلان</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">المشاهدات</p>
                      <p className="text-3xl font-bold text-blue-900">{advertisement.views || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">النقرات</p>
                      <p className="text-3xl font-bold text-green-900">{advertisement.clicks || 0}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.121 2.122" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">معدل النقر</p>
                      <p className="text-3xl font-bold text-purple-900">{clickThroughRate}%</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Display Period */}
            <Card className="border-2 border-indigo-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">فترة العرض</CardTitle>
                    <CardDescription className="text-slate-600">الجدول الزمني لعرض الإعلان</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-green-700">تاريخ البدء</label>
                        <p className="text-lg font-bold text-slate-800">{formatDate(advertisement.displayPeriod?.startDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Visual */}
                  <div className="relative py-4">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-green-400 to-red-400 rounded-full"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="text-center py-2">
                      <p className="text-sm text-slate-600 font-medium">مدة العرض</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-red-700">تاريخ الانتهاء</label>
                        <p className="text-lg font-bold text-slate-800">{formatDate(advertisement.displayPeriod?.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Duration calculation */}
                  {advertisement.displayPeriod?.startDate && advertisement.displayPeriod?.endDate && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">إجمالي المدة</p>
                        <p className="text-base font-semibold text-slate-800">
                          {Math.ceil((new Date(advertisement.displayPeriod.endDate) - new Date(advertisement.displayPeriod.startDate)) / (1000 * 60 * 60 * 24))} يوم
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advertiser Information */}
            <Card className="border-2 border-emerald-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">معلومات المعلن</CardTitle>
                    <CardDescription className="text-slate-600">بيانات التواصل والتفاصيل</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {advertisement.advertiser ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-blue-700">اسم المعلن</label>
                          <p className="text-lg font-bold text-slate-800">{advertisement.advertiser.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <label className="text-sm font-semibold text-purple-700">البريد الإلكتروني</label>
                          <p className="text-base font-medium text-slate-800 break-all">{advertisement.advertiser.email}</p>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(advertisement.advertiser.email)}
                          className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="نسخ البريد الإلكتروني"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-semibold text-green-700">رقم الهاتف</label>
                          <p className="text-base font-medium text-slate-800">
                            {advertisement.advertiser.phone || (
                              <span className="text-slate-500 italic">غير متوفر</span>
                            )}
                          </p>
                        </div>
                        {advertisement.advertiser.phone && (
                          <button
                            onClick={() => navigator.clipboard.writeText(advertisement.advertiser.phone)}
                            className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="نسخ رقم الهاتف"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-8 rounded-lg border border-gray-200">
                      <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">لا توجد معلومات عن المعلن</h3>
                      <p className="text-sm text-slate-500">لم يتم تسجيل بيانات المعلن لهذا الإعلان</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Media Preview */}
          <Card className="border-2 border-rose-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">معاينة الإعلان</CardTitle>
                  <CardDescription className="text-slate-600">صور الإعلان المحسنة للأجهزة المختلفة</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Desktop Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">صورة سطح المكتب</h3>
                        <p className="text-sm text-slate-600">للشاشات الكبيرة والمتوسطة</p>
                      </div>
                    </div>
                    {advertisement.media?.desktop?.url && (
                      <Badge variant="default" className="bg-blue-100 text-blue-700">
                        متوفرة
                      </Badge>
                    )}
                  </div>
                  
                  <div className="relative group">
                    <div className="border-2 border-dashed border-blue-200 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 transition-colors">
                      {advertisement.media?.desktop?.url && !desktopImageError ? (
                        <div className="relative">
                          {desktopImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                <p className="text-sm text-slate-600">جاري تحميل الصورة...</p>
                              </div>
                            </div>
                          )}
                          <img
                            src={advertisement.media.desktop.url}
                            alt="صورة سطح المكتب"
                            className="w-full h-64 object-contain bg-white rounded-lg shadow-sm"
                            onLoad={() => setDesktopImageLoading(false)}
                            onError={() => {
                              setDesktopImageLoading(false);
                              setDesktopImageError(true);
                            }}
                            style={{ display: desktopImageLoading ? 'none' : 'block' }}
                          />
                          {!desktopImageLoading && !desktopImageError && (
                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    const newWindow = window.open('', '_blank');
                                    if (newWindow) {
                                      newWindow.document.write(`
                                        <html>
                                          <head>
                                            <title>صورة سطح المكتب - معاينة الإعلان</title>
                                            <style>
                                              body { margin: 0; padding: 20px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                              img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; background: white; }
                                            </style>
                                          </head>
                                          <body>
                                            <img src="${advertisement.media.desktop.url}" alt="صورة سطح المكتب" />
                                          </body>
                                        </html>
                                      `);
                                      newWindow.document.close();
                                    }
                                  }}
                                  className="bg-white bg-opacity-90 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-opacity-100 transition-colors flex items-center gap-2"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  عرض بالحجم الكامل
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <div className="bg-blue-100 p-4 rounded-full mb-4 inline-block">
                              {desktopImageError ? (
                                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              ) : (
                                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">
                              {desktopImageError ? 'فشل في تحميل الصورة' : 'لا توجد صورة لسطح المكتب'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {desktopImageError 
                                ? 'تعذر تحميل صورة سطح المكتب. قد يكون الرابط غير صحيح أو الصورة غير متاحة'
                                : 'لم يتم رفع صورة خاصة بأجهزة سطح المكتب'
                              }
                            </p>
                            {desktopImageError && advertisement.media?.desktop?.url && (
                              <button
                                onClick={() => {
                                  setDesktopImageError(false);
                                  setDesktopImageLoading(true);
                                }}
                                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                              >
                                إعادة المحاولة
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {advertisement.media?.desktop?.url && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">رابط الصورة:</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(advertisement.media.desktop.url)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          نسخ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Mobile Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">صورة الجوال</h3>
                        <p className="text-sm text-slate-600">للهواتف الذكية والأجهزة اللوحية</p>
                      </div>
                    </div>
                    {advertisement.media?.mobile?.url && (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        متوفرة
                      </Badge>
                    )}
                  </div>
                  
                  <div className="relative group">
                    <div className="border-2 border-dashed border-green-200 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 hover:border-green-400 transition-colors">
                      {advertisement.media?.mobile?.url && !mobileImageError ? (
                        <div className="relative">
                          {mobileImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                                <p className="text-sm text-slate-600">جاري تحميل الصورة...</p>
                              </div>
                            </div>
                          )}
                          <img
                            src={advertisement.media.mobile.url}
                            alt="صورة الجوال"
                            className="w-full h-64 object-contain bg-white rounded-lg shadow-sm"
                            onLoad={() => setMobileImageLoading(false)}
                            onError={() => {
                              setMobileImageLoading(false);
                              setMobileImageError(true);
                            }}
                            style={{ display: mobileImageLoading ? 'none' : 'block' }}
                          />
                          {!mobileImageLoading && !mobileImageError && (
                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    const newWindow = window.open('', '_blank');
                                    if (newWindow) {
                                      newWindow.document.write(`
                                        <html>
                                          <head>
                                            <title>صورة الجوال - معاينة الإعلان</title>
                                            <style>
                                              body { margin: 0; padding: 20px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                              img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; background: white; }
                                            </style>
                                          </head>
                                          <body>
                                            <img src="${advertisement.media.mobile.url}" alt="صورة الجوال" />
                                          </body>
                                        </html>
                                      `);
                                      newWindow.document.close();
                                    }
                                  }}
                                  className="bg-white bg-opacity-90 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-opacity-100 transition-colors flex items-center gap-2"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  عرض بالحجم الكامل
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <div className="bg-green-100 p-4 rounded-full mb-4 inline-block">
                              {mobileImageError ? (
                                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                              ) : (
                                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            <h4 className="text-lg font-semibold text-slate-700 mb-2">
                              {mobileImageError ? 'فشل في تحميل الصورة' : 'لا توجد صورة للجوال'}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {mobileImageError 
                                ? 'تعذر تحميل صورة الجوال. قد يكون الرابط غير صحيح أو الصورة غير متاحة'
                                : 'لم يتم رفع صورة خاصة بالأجهزة المحمولة'
                              }
                            </p>
                            {mobileImageError && advertisement.media?.mobile?.url && (
                              <button
                                onClick={() => {
                                  setMobileImageError(false);
                                  setMobileImageLoading(true);
                                }}
                                className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                              >
                                إعادة المحاولة
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {advertisement.media?.mobile?.url && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">رابط الصورة:</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(advertisement.media.mobile.url)}
                          className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          نسخ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Actions */}
              {(advertisement.media?.desktop?.url || advertisement.media?.mobile?.url) && (
                <>
                  <Separator className="my-6" />
                  <div className="flex flex-wrap gap-3 justify-center">
                    {advertisement.media?.desktop?.url && !desktopImageError && (
                      <button
                        onClick={() => {
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>صورة سطح المكتب - معاينة الإعلان</title>
                                  <style>
                                    body { margin: 0; padding: 20px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                    img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; background: white; }
                                    .loading { text-align: center; color: #6b7280; }
                                  </style>
                                </head>
                                <body>
                                  <div class="loading">جاري تحميل الصورة...</div>
                                  <img src="${advertisement.media.desktop.url}" alt="صورة سطح المكتب" onload="document.querySelector('.loading').style.display='none'" onerror="document.querySelector('.loading').innerHTML='فشل في تحميل الصورة'" />
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={desktopImageLoading}
                      >
                        {desktopImageLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            جاري التحميل...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            عرض صورة سطح المكتب
                          </>
                        )}
                      </button>
                    )}
                    {advertisement.media?.mobile?.url && !mobileImageError && (
                      <button
                        onClick={() => {
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head>
                                  <title>صورة الجوال - معاينة الإعلان</title>
                                  <style>
                                    body { margin: 0; padding: 20px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                    img { max-width: 100%; max-height: 100%; object-fit: contain; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; background: white; }
                                    .loading { text-align: center; color: #6b7280; }
                                  </style>
                                </head>
                                <body>
                                  <div class="loading">جاري تحميل الصورة...</div>
                                  <img src="${advertisement.media.mobile.url}" alt="صورة الجوال" onload="document.querySelector('.loading').style.display='none'" onerror="document.querySelector('.loading').innerHTML='فشل في تحميل الصورة'" />
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={mobileImageLoading}
                      >
                        {mobileImageLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            جاري التحميل...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                            </svg>
                            عرض صورة الجوال
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-6">
          <Button 
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}