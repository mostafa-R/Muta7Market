"use client";

import { Button } from "@/app/component/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/component/ui/card";
import { Input } from "@/app/component/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/component/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import { Plus, RefreshCcw, RotateCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TranslationForm from "./TranslationForm";
// import TranslationGroups from "./TranslationGroups";
import TranslationImportExport from "./TranslationImportExport";
import TranslationsList from "./TranslationsList";

const LocalizationManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [isLoading, setIsLoading] = useState(true);
  const [translations, setTranslations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTranslations, setFilteredTranslations] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";

  // State for pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Fetch translations with pagination and search
  const fetchTranslations = async (page = 1, limit = 10) => {
    setIsLoading(true);
    try {
      // Build the query parameters
      const queryParams = new URLSearchParams({
        page,
        limit
      });
      
      // Add search query if exists
      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      
      // Add group filter if not "all"
      if (selectedGroup && selectedGroup !== "all") {
        queryParams.append('group', selectedGroup);
      }
      
      const response = await fetch(`${API_BASE_URL}/localization?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTranslations(result.data.translations || []);
        setFilteredTranslations(result.data.translations || []); // No need to filter client-side anymore
        setPagination(result.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 1
        });
        setError(null);
      } else {
        throw new Error(result.message || "Failed to fetch translations");
      }
    } catch (error) {
      console.error("Error fetching translations:", error);
      setError("An error occurred while fetching translations");
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch translation groups
  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/localization/groups`, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setGroups(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch translation groups");
      }
    } catch (error) {
      console.error("Error fetching translation groups:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchTranslations();
    fetchGroups();
  }, []);

  // Trigger new search when search query or selected group changes
  useEffect(() => {
    // Reset to first page when search query or group changes
    // Use a debounce to avoid too many requests while typing
    const debounceTimer = setTimeout(() => {
      fetchTranslations(1, pagination.limit);
    }, 500); // 500ms debounce
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGroup]);

  // Handle creating a new translation
  const handleCreateTranslation = async (formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/localization`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Translation created successfully");
        fetchTranslations();
        setActiveTab("list");
      } else {
        throw new Error(result.message || "Failed to create translation");
      }
    } catch (error) {
      console.error("Error creating translation:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a translation
  const handleUpdateTranslation = async (id, formData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/localization/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Translation updated successfully");
        
        // Update the translations list
        setTranslations(prev => 
          prev.map(item => item._id === id ? result.data : item)
        );
      } else {
        throw new Error(result.message || "Failed to update translation");
      }
    } catch (error) {
      console.error("Error updating translation:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a translation
  const handleDeleteTranslation = async (id) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/localization/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Translation deleted successfully");
        
        // Update the translations list
        setTranslations(prev => prev.filter(item => item._id !== id));
      } else {
        throw new Error(result.message || "Failed to delete translation");
      }
    } catch (error) {
      console.error("Error deleting translation:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle importing translations
  const handleImportTranslations = async (data, overwrite = false) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/localization/import`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: data,
          overwrite
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Import successful: ${result.data.created.length} created, ${result.data.updated.length} updated`);
        fetchTranslations();
        fetchGroups();
      } else {
        throw new Error(result.message || "Failed to import translations");
      }
    } catch (error) {
      console.error("Error importing translations:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle exporting translations
  const handleExportTranslations = async () => {
    try {
      setExportStatus("loading");
      const response = await fetch(`${API_BASE_URL}/localization/export`, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportFileDefaultName = `translations_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success("Translations exported successfully");
        setExportStatus("success");
      } else {
        throw new Error(result.message || "Failed to export translations");
      }
    } catch (error) {
      console.error("Error exporting translations:", error);
      toast.error(`Error: ${error.message}`);
      setExportStatus("error");
    } finally {
      setTimeout(() => setExportStatus(null), 2000);
    }
  };

  // Handle syncing translations with locale files
  const handleSyncTranslations = async () => {
    setIsSubmitting(true);
    try {
      setSyncStatus("loading");
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/localization/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Sync successful: ${result.data.created.length} created, ${result.data.updated.length} updated`);
        setSyncStatus("success");
        fetchTranslations();
        fetchGroups();
      } else {
        throw new Error(result.message || "Failed to sync translations");
      }
    } catch (error) {
      console.error("Error syncing translations:", error);
      toast.error(`Error: ${error.message}`);
      setSyncStatus("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSyncStatus(null), 2000);
    }
  };

  // Handle exporting translations to locale files
  const handleExportToFiles = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/localization/export-to-files`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Translations exported to locale files successfully");
      } else {
        throw new Error(result.message || "Failed to export translations to locale files");
      }
    } catch (error) {
      console.error("Error exporting translations to locale files:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading && !translations.length) {
    return (
      <div className="flex justify-center items-center p-8" dir="rtl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
        <span className="mr-2">جاري تحميل الترجمات...</span>
      </div>
    );
  }

  // Error state
  if (error && !translations.length) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md" dir="rtl">
        <h3 className="font-bold mb-2">خطأ</h3>
        <p>{error}</p>
        <Button 
          onClick={() => fetchTranslations()} 
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>إدارة ترجمات الموقع</CardTitle>
              <CardDescription>
                إدارة الترجمات لمحتوى موقع الويب الخاص بك
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncTranslations}
                disabled={isSubmitting}
              >
                {syncStatus === "loading" ? (
                  <div className="animate-spin h-4 w-4 ml-2 border-2 border-b-transparent rounded-full"></div>
                ) : syncStatus === "success" ? (
                  <span className="text-green-500 ml-2">✓</span>
                ) : syncStatus === "error" ? (
                  <span className="text-red-500 ml-2">✗</span>
                ) : (
                  <RotateCw className="h-4 w-4 ml-2" />
                )}
                مزامنة مع الملفات
              </Button>
              
   
              <Button
                onClick={() => setActiveTab("add")}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة ترجمة
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">قائمة الترجمات</TabsTrigger>
              <TabsTrigger value="add">إضافة ترجمة</TabsTrigger>
              <TabsTrigger value="import">استيراد/تصدير</TabsTrigger>
              {/* <TabsTrigger value="groups">إدارة المجموعات</TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="list">
              <div className="flex items-center mb-4 gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في الترجمات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                    dir="rtl"
                  />
                  {searchQuery && (
                    <div className="absolute left-10 top-2.5 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      بحث على الخادم
                    </div>
                  )}
                </div>
                
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-[180px]" dir="rtl">
                    <SelectValue placeholder="اختر مجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المجموعات</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group} value={group}>{group}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGroup('all');
                    // Reset and fetch without filters
                    fetchTranslations(1, pagination.limit);
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  <RefreshCcw className="h-4 w-4 ml-1" />
                  إعادة تعيين
                </Button>
              </div>
              
                <TranslationsList 
                translations={filteredTranslations}
                onUpdate={handleUpdateTranslation}
                onDelete={handleDeleteTranslation}
                isSubmitting={isSubmitting}
                pagination={pagination}
                onPageChange={(page, limit) => fetchTranslations(page, limit || pagination.limit)}
              />
            </TabsContent>
            
            <TabsContent value="add">
              <TranslationForm 
                groups={groups}
                onSubmit={handleCreateTranslation}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
            
            <TabsContent value="import">
              <TranslationImportExport 
                onImport={handleImportTranslations}
                onExport={handleExportTranslations}
                isSubmitting={isSubmitting}
                exportStatus={exportStatus}
              />
            </TabsContent>
            
            {/* <TabsContent value="groups">
              <TranslationGroups 
                groups={groups}
                translations={translations}
                onRefresh={() => {
                  fetchGroups();
                  fetchTranslations();
                }}
              />
            </TabsContent> */}
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalizationManagement;
