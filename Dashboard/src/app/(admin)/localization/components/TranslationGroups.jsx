"use client";

import { Badge } from "@/app/component/ui/badge";
import { Button } from "@/app/component/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/component/ui/card";
import { Progress } from "@/app/component/ui/progress";
import { useMemo } from "react";

const TranslationGroups = ({ groups, translations, onRefresh }) => {
  // Calculate stats for each group
  const groupStats = useMemo(() => {
    const stats = {};
    
    groups.forEach(group => {
      const groupTranslations = translations.filter(t => t.group === group);
      const systemCount = groupTranslations.filter(t => t.isSystem).length;
      const customCount = groupTranslations.length - systemCount;
      
      stats[group] = {
        total: groupTranslations.length,
        system: systemCount,
        custom: customCount,
        percentage: Math.round((groupTranslations.length / translations.length) * 100) || 0
      };
    });
    
    return stats;
  }, [groups, translations]);
  
  // Sort groups by count
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      return (groupStats[b]?.total || 0) - (groupStats[a]?.total || 0);
    });
  }, [groups, groupStats]);
  
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">مجموعات الترجمات</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          إعادة تحميل
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
        {sortedGroups.map(group => (
          <Card key={group}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md">
                  <Badge variant={group === "general" ? "default" : "outline"} className="mr-2">
                    {group}
                  </Badge>
                </CardTitle>
                <Badge variant="secondary">
                  {groupStats[group]?.total || 0} مفاتيح
                </Badge>
              </div>
              <CardDescription>
                {groupStats[group]?.system || 0} نظام, {groupStats[group]?.custom || 0} ترجمات مخصصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={groupStats[group]?.percentage || 0} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {groupStats[group]?.percentage || 0}% من جميع الترجمات
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">حول مجموعات الترجمة</h4>
        <p className="text-blue-700 dark:text-blue-400 text-sm">
        تساعد المجموعات في تنظيم ترجماتك حسب الفئة أو الميزة. تُستخدم المجموعة "العامة" للترجمات الشائعة التي لا تندرج ضمن فئة محددة.
يتم استيراد ترجمات النظام من ملفات الإعدادات المحلية، ولا يجب حذفها يدويًا.
        </p>
      </div>
    </div>
  );
};

export default TranslationGroups;
