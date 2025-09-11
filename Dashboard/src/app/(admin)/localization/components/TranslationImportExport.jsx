"use client";

import { Alert, AlertDescription, AlertTitle } from "@/app/component/ui/alert";
import { Button } from "@/app/component/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/component/ui/card";
import { Label } from "@/app/component/ui/label";
import { Switch } from "@/app/component/ui/switch";
import { Textarea } from "@/app/component/ui/textarea";
import { AlertCircle, Download, Upload } from "lucide-react";
import { useState } from "react";

const TranslationImportExport = ({ onImport, onExport, isSubmitting, exportStatus }) => {
  const [importData, setImportData] = useState("");
  const [importError, setImportError] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  
  // Handle import
  const handleImport = () => {
    try {
      setImportError("");
      
      if (!importData.trim()) {
        setImportError("Please enter JSON data to import");
        return;
      }
      
      const parsedData = JSON.parse(importData);
      
      if (typeof parsedData !== 'object' || Array.isArray(parsedData)) {
        setImportError("Import data must be a JSON object");
        return;
      }
      
      onImport(parsedData, overwrite);
      setImportData("");
    } catch (error) {
      setImportError(`Invalid JSON format: ${error.message}`);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>استيراد الترجمات</CardTitle>
          <CardDescription>
            استيراد الترجمات من ملف JSON
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importData">بيانات JSON</Label>
            <Textarea
              id="importData"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='{"general":{"welcome_message":{"ar":"مرحبا","en":"Welcome"}}}'
              rows={10}
              className={importError ? "border-red-500" : ""}
            />
            {importError && (
              <Alert variant="destructive" className="mt-2">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <AlertTitle>خطأ</AlertTitle>
                </div>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="overwrite"
              checked={overwrite}
              onCheckedChange={setOverwrite}
            />
            <Label htmlFor="overwrite">
              استبدال الترجمات الموجودة
            </Label>
          </div>
          <p className="text-xs text-gray-500">
            إذا كان مفعلاً، سيتم تحديث الترجمات الموجودة مع نفس المفتاح والمجموعة.
            إذا كان معطلاً، سيتم تخطيها.
          </p>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={handleImport}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
                جاري الاستيراد...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                استيراد
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>تصدير الترجمات</CardTitle>
          <CardDescription>
            تصدير جميع الترجمات إلى ملف JSON
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm">
            تصدير جميع الترجمات إلى ملف JSON يمكن استيراده لاحقاً أو استخدامه في تطبيقات أخرى.
          </p>
          
          <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-md">
            <code className="text-xs">
              {`{
  "general": {
    "welcome_message": {
      "ar": "مرحبا",
      "en": "Welcome"
    }
  },
  "errors": {
    "not_found": {
      "ar": "غير موجود",
      "en": "Not found"
    }
  }
}`}
            </code>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            onClick={onExport}
            disabled={isSubmitting}
            variant="outline"
          >
            {exportStatus === "loading" ? (
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full"></div>
            ) : exportStatus === "success" ? (
              <span className="text-green-500 mr-2">✓</span>
            ) : exportStatus === "error" ? (
              <span className="text-red-500 mr-2">✗</span>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            تصدير جميع الترجمات
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TranslationImportExport;
