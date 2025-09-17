"use client";

import { useDebounce } from "@/hooks/use-debounce.js";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export const useAdvertisements = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    position: "",
    isActive: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchAdvertisements = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        search: debouncedSearch,
        type: filters.type,
        position: filters.position,
        isActive: filters.isActive,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const response = await api.get(`/advertisements?${params.toString()}`);
      setAdvertisements(response.data.advertisements || []);
      setPagination(response.data.pagination || {});
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب الإعلانات",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, toast]);

  useEffect(() => {
    fetchAdvertisements(currentPage);
  }, [fetchAdvertisements, currentPage]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const refreshAdvertisements = () => {
    fetchAdvertisements(1); // Go to first page on creation
  };

  return {
    advertisements,
    pagination,
    loading,
    filters,
    currentPage,
    handleFilterChange,
    handlePageChange,
    refreshAdvertisements,
  };
};
