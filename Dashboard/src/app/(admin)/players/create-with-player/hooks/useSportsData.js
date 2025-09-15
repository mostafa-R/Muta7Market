import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for managing sports data fetching and state
 * Fetches sports with their positions and role types from the backend
 */
export const useSportsData = () => {
  const [sportsData, setSportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sports data from backend
  const fetchSportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("accessToken") || localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const endpoint = "/sports/active";
      const fullUrl = `${baseUrl}${endpoint}`;

      const response = await axios.get(fullUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setSportsData(response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching sports data:", error);
      setError(error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "حدث خطأ في تحميل بيانات الرياضات";
      
      toast.error("خطأ في تحميل البيانات", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSportsData();
  }, []);

  // Helper function to get sport options formatted for select dropdown
  const getSportOptions = () => {
    return sportsData.map((sport) => ({
      id: sport._id,
      name: sport.name.ar, // Use Arabic name
      value: sport.slug,
      slug: sport.slug,
      icon: sport.icon,
      // Include full object data for form submission
      objectData: {
        ar: sport.name.ar,
        en: sport.name.en,
        slug: sport.slug
      }
    }));
  };

  // Helper function to get positions for a specific sport
  const getPositionsForSport = (sportSlug) => {
    const sport = sportsData.find(s => s.slug === sportSlug);
    if (!sport || !sport.positions) return [];
    
    return sport.positions.map((position) => ({
      id: position._id,
      name: position.name.ar, // Use Arabic name
      value: position.name.en.toLowerCase().replace(/\s+/g, "_"), // Create value from English name
      nameAr: position.name.ar,
      nameEn: position.name.en,
      // Include full object data for form submission
      objectData: {
        ar: position.name.ar,
        en: position.name.en,
        slug: position.name.en.toLowerCase().replace(/\s+/g, '_')
      }
    }));
  };

  // Helper function to get role types for a specific sport and job type
  const getRoleTypesForSport = (sportSlug, jobType) => {
    const sport = sportsData.find(s => s.slug === sportSlug);
    if (!sport || !sport.roleTypes) return [];
    
    return sport.roleTypes
      .filter(roleType => roleType.jop === jobType)
      .map((roleType) => ({
        id: roleType._id,
        name: roleType.name.ar, // Use Arabic name
        value: roleType.name.en.toLowerCase().replace(/\s+/g, "_"), // Create value from English name
        nameAr: roleType.name.ar,
        nameEn: roleType.name.en,
        jop: roleType.jop,
        // Include full object data for form submission
        objectData: {
          ar: roleType.name.ar,
          en: roleType.name.en,
          slug: roleType.name.en.toLowerCase().replace(/\s+/g, '_')
        }
      }));
  };

  // Helper function to get all role types regardless of sport (fallback)
  const getAllRoleTypes = (jobType) => {
    const allRoleTypes = [];
    
    sportsData.forEach(sport => {
      if (sport.roleTypes) {
        sport.roleTypes
          .filter(roleType => roleType.jop === jobType)
          .forEach(roleType => {
            // Check if this role type already exists (by name)
            const exists = allRoleTypes.some(existing => 
              existing.nameEn === roleType.name.en
            );
            
             if (!exists) {
               allRoleTypes.push({
                 id: roleType._id,
                 name: roleType.name.ar,
                 value: roleType.name.en.toLowerCase().replace(/\s+/g, "_"),
                 nameAr: roleType.name.ar,
                 nameEn: roleType.name.en,
                 jop: roleType.jop,
                 // Include full object data for form submission
                 objectData: {
                   ar: roleType.name.ar,
                   en: roleType.name.en,
                   slug: roleType.name.en.toLowerCase().replace(/\s+/g, '_')
                 }
               });
             }
          });
      }
    });
    
    return allRoleTypes;
  };

  // Helper function to find sport by slug
  const getSportBySlug = (slug) => {
    return sportsData.find(sport => sport.slug === slug);
  };

  // Helper function to refresh sports data
  const refreshSportsData = () => {
    fetchSportsData();
  };

  // Helper function to get sport object data by slug
  const getSportObjectBySlug = (slug) => {
    const sport = sportsData.find(s => s.slug === slug);
    if (!sport) return null;
    
    return {
      ar: sport.name.ar,
      en: sport.name.en,
      slug: sport.slug
    };
  };

  // Helper function to get position object data by value and sport
  const getPositionObjectByValue = (value, sportSlug) => {
    const positions = getPositionsForSport(sportSlug);
    const position = positions.find(p => p.value === value);
    return position ? position.objectData : null;
  };

  // Helper function to get role type object data by value and sport/job
  const getRoleTypeObjectByValue = (value, sportSlug, jobType) => {
    const roleTypes = sportSlug 
      ? getRoleTypesForSport(sportSlug, jobType)
      : getAllRoleTypes(jobType);
    
    const roleType = roleTypes.find(r => r.value === value);
    return roleType ? roleType.objectData : null;
  };

  return {
    // State
    sportsData,
    loading,
    error,
    
    // Helper functions
    getSportOptions,
    getPositionsForSport,
    getRoleTypesForSport,
    getAllRoleTypes,
    getSportBySlug,
    refreshSportsData,
    
    // Object data helpers
    getSportObjectBySlug,
    getPositionObjectByValue,
    getRoleTypeObjectByValue,
  };
};

export default useSportsData;
