"use client";

import { Input } from "@/app/component/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/component/ui/tabs";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { GameIcon } from "@/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateSportForm from "./components/CreateSportForm";
import SportsTable from "./components/SportsTable";

export default function SportsPage() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  // استرجاع الألعاب الرياضية من API
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('accessToken');
        const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1";
        
        const response = await fetch(`${API_BASE_URL}/sports`, {
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
          setSports(result.data.sports || []);
        } else {
          throw new Error(result.message || "Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching sports:", err);
        setError(err.message);
        
        // بيانات تجريبية للعرض عند وجود خطأ
        setSports([
          {
            _id: "1",
            name: { ar: "كرة القدم", en: "Football" },
            slug: "football",
            description: { ar: "كرة القدم هي رياضة جماعية", en: "Football is a team sport" },
            icon: { url: "/images/sports/football.svg" },
            positions: ["حارس مرمى", "مدافع", "وسط", "مهاجم"],
            roleTypes: ["لاعب", "مدرب", "حكم"],
            isActive: true,
            displayOrder: 1,
            createdAt: "2023-01-01T00:00:00.000Z"
          },
          {
            _id: "2",
            name: { ar: "كرة السلة", en: "Basketball" },
            slug: "basketball",
            description: { ar: "كرة السلة هي رياضة جماعية", en: "Basketball is a team sport" },
            icon: { url: "/images/sports/basketball.svg" },
            positions: ["صانع ألعاب", "جناح", "مركز"],
            roleTypes: ["لاعب", "مدرب", "حكم"],
            isActive: true,
            displayOrder: 2,
            createdAt: "2023-01-02T00:00:00.000Z"
          },
          {
            _id: "3",
            name: { ar: "كرة الطائرة", en: "Volleyball" },
            slug: "volleyball",
            description: { ar: "كرة الطائرة هي رياضة جماعية", en: "Volleyball is a team sport" },
            icon: { url: "/images/sports/volleyball.svg" },
            positions: ["معد", "ضارب", "ليبرو"],
            roleTypes: ["لاعب", "مدرب", "حكم"],
            isActive: false,
            displayOrder: 3,
            createdAt: "2023-01-03T00:00:00.000Z"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSportCreated = (newSport) => {
    setSports([newSport, ...sports]);
    setActiveTab("list");
    toast.success("تم إضافة اللعبة الرياضية بنجاح");
  };

  const handleSportUpdated = (updatedSport) => {
    setSports(sports.map(sport => 
      sport._id === updatedSport._id ? updatedSport : sport
    ));
    toast.success("تم تحديث اللعبة الرياضية بنجاح");
  };

  const handleSportDeleted = (sportId) => {
    setSports(sports.filter(sport => sport._id !== sportId));
    toast.success("تم حذف اللعبة الرياضية بنجاح");
  };

  const filteredSports = sports.filter(sport => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sport.name.ar.toLowerCase().includes(searchLower) ||
      sport.name.en.toLowerCase().includes(searchLower) ||
      sport.slug.toLowerCase().includes(searchLower)
    );
  });

  const breadcrumbItems = [
    { title: "الرئيسية", href: "/admin" },
    { title: "الألعاب الرياضية", href: "/admin/sports" },
  ];

  return (
    <div className="p-6" dir="rtl">
      <PageBreadCrumb pageTitle="الألعاب الرياضية" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-6">
        <div className="flex items-center">
          <GameIcon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-2xl font-bold">إدارة الألعاب الرياضية</h1>
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
            <TabsTrigger value="list">قائمة الألعاب</TabsTrigger>
            <TabsTrigger value="create">إضافة لعبة جديدة</TabsTrigger>
          </TabsList>
          
          {activeTab === "list" && (
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
          )}
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
          <TabsContent value="list">
            <SportsTable 
              sports={filteredSports} 
              loading={loading} 
              onSportUpdated={handleSportUpdated}
              onSportDeleted={handleSportDeleted}
            />
          </TabsContent>
          
          <TabsContent value="create">
            <div className="p-6">
              <CreateSportForm onSportCreated={handleSportCreated} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
