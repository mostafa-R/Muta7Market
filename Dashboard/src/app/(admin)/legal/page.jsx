"use client";

import { Input } from "@/app/component/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DocumentIcon } from "@/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateLegalDocumentForm from "./components/CreateLegalDocumentForm";
import LegalDocumentsTable from "./components/LegalDocumentsTable";

export default function LegalDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [filterType, setFilterType] = useState("all");

  // استرجاع المستندات القانونية من API
  useEffect(() => {
    const fetchLegalDocuments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
        const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
        
        const response = await fetch(`${API_BASE_URL}/legal`, {
          method: "GET",
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
        
        if (result.success && result.data) {
          setDocuments(result.data.documents || []);
        } else {
          throw new Error(result.message || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching legal documents:", err);
        setError(err.message);
        
        // بيانات تجريبية للعرض عند وجود خطأ
        setDocuments([
          {
            _id: "1",
            type: "terms",
            title: { ar: "الشروط والأحكام", en: "Terms and Conditions" },
            content: { 
              ar: "<h2>الشروط والأحكام</h2><p>هذه هي شروط وأحكام استخدام منصة متاح ماركت...</p>", 
              en: "<h2>Terms and Conditions</h2><p>These are the terms and conditions for using the Muta7Market platform...</p>" 
            },
            slug: "terms-and-conditions",
            isActive: true,
            isDefault: true,
            version: "1.0",
            effectiveDate: "2023-01-01T00:00:00.000Z",
            publishedDate: "2023-01-01T00:00:00.000Z",
            createdAt: "2023-01-01T00:00:00.000Z"
          },
          {
            _id: "2",
            type: "privacy",
            title: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
            content: { 
              ar: "<h2>سياسة الخصوصية</h2><p>تلتزم منصة متاح ماركت بحماية خصوصية المستخدمين...</p>", 
              en: "<h2>Privacy Policy</h2><p>Muta7Market is committed to protecting user privacy...</p>" 
            },
            slug: "privacy-policy",
            isActive: true,
            isDefault: true,
            version: "1.0",
            effectiveDate: "2023-01-01T00:00:00.000Z",
            publishedDate: "2023-01-01T00:00:00.000Z",
            createdAt: "2023-01-01T00:00:00.000Z"
          },
          {
            _id: "3",
            type: "refund",
            title: { ar: "سياسة الاسترداد", en: "Refund Policy" },
            content: { 
              ar: "<h2>سياسة الاسترداد</h2><p>يمكن للمستخدمين طلب استرداد المدفوعات في الحالات التالية...</p>", 
              en: "<h2>Refund Policy</h2><p>Users can request refunds in the following cases...</p>" 
            },
            slug: "refund-policy",
            isActive: true,
            isDefault: true,
            version: "1.0",
            effectiveDate: "2023-01-01T00:00:00.000Z",
            publishedDate: "2023-01-01T00:00:00.000Z",
            createdAt: "2023-01-01T00:00:00.000Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalDocuments();
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleDocumentCreated = (newDocument) => {
    setDocuments([newDocument, ...documents]);
    setActiveTab("list");
    toast.success("تم إضافة المستند القانوني بنجاح");
  };

  const handleDocumentUpdated = (updatedDocument) => {
    setDocuments(documents.map(doc => 
      doc._id === updatedDocument._id ? updatedDocument : doc
    ));
    toast.success("تم تحديث المستند القانوني بنجاح");
  };

  const handleDocumentDeleted = (documentId) => {
    setDocuments(documents.filter(doc => doc._id !== documentId));
    toast.success("تم حذف المستند القانوني بنجاح");
  };

  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      doc.title.ar.toLowerCase().includes(searchLower) ||
      doc.title.en.toLowerCase().includes(searchLower) ||
      doc.slug.toLowerCase().includes(searchLower)
    );
    
    if (filterType === "all") {
      return matchesSearch;
    } else {
      return doc.type === filterType && matchesSearch;
    }
  });


  return (
    <div className="p-6" dir="rtl">
      <PageBreadCrumb pageTitle="المستندات القانونية" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6">
        <div className="flex items-center">
          <DocumentIcon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-bold">إدارة المستندات القانونية</h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-6">
          <p className="font-medium">تعذر الاتصال بالخادم. يتم عرض بيانات تجريبية.</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList className="mb-0">
            <TabsTrigger value="list">قائمة المستندات</TabsTrigger>
            <TabsTrigger value="create">إضافة مستند جديد</TabsTrigger>
          </TabsList>
          
          {activeTab === "list" && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={handleFilterChange}
                className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">جميع المستندات</option>
                <option value="terms">الشروط والأحكام</option>
                <option value="privacy">سياسة الخصوصية</option>
                <option value="refund">سياسة الاسترداد</option>
                <option value="cookies">سياسة ملفات تعريف الارتباط</option>
                <option value="disclaimer">إخلاء المسؤولية</option>
                <option value="custom">مستندات مخصصة</option>
              </select>
              
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pr-8"
                />
                <svg
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
          <TabsContent value="list">
            <LegalDocumentsTable 
              documents={filteredDocuments} 
              loading={loading} 
              onDocumentUpdated={handleDocumentUpdated}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>
          
          <TabsContent value="create">
            <div className="p-6">
              <CreateLegalDocumentForm onDocumentCreated={handleDocumentCreated} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
