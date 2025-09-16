"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchSportsData } from '../api/sportsData';

/**
 * @returns {Object} 
 */
export function useSportsData() {
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSportsData = async () => {
      try {
        setIsLoading(true);
        const sportsData = await fetchSportsData();
        setSports(sportsData || []);
      } catch (err) {
        setError(err);
        console.error('Error loading sports data:', err);
        setSports([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSportsData();
  }, []);

  const formatObject = useCallback((item) => {
    if (!item || !item.name) return null;
    return {
      ar: item.name.ar,
      en: item.name.en,
      slug: item.name.en.replace(/\s+/g, '_').toLowerCase()
    };
  }, []);

  const sportsOptions = useMemo(() => [
    ...sports.map(sport => ({
      ...formatObject({ name: sport.name }),
      id: sport._id,
      positions: sport.positions || [],
      roleTypes: sport.roleTypes || [],
    })),
    { ar: "أخرى", en: "Other", slug: "other", id: "other" }
  ], [sports, formatObject]);

  const getSportBySlug = useCallback((slug) => {
    return sportsOptions.find(s => s.slug === slug) || null;
  }, [sportsOptions]);

  const getPositionBySlug = useCallback((sportSlug, positionSlug) => {
    const sport = sportsOptions.find(s => s.slug === sportSlug);
    if (!sport || !sport.positions) return null;
    const position = sport.positions.find(p => formatObject(p)?.slug === positionSlug);
    return formatObject(position);
  }, [sportsOptions, formatObject]);

  const getRoleTypeBySlug = useCallback((sportSlug, roleTypeSlug, jop) => {
    const sport = sportsOptions.find(s => s.slug === sportSlug);
    if (!sport || !sport.roleTypes) return null;
    const role = sport.roleTypes.find(r => r.jop === jop && formatObject(r)?.slug === roleTypeSlug);
    return formatObject(role);
  }, [sportsOptions, formatObject]);
  
  return {
    sports,
    sportsOptions,
    isLoading,
    error,
    getSportBySlug,
    getPositionBySlug,
    getRoleTypeBySlug,
    formatObject,
  };
}

export const statusOptions = [
  { id: "available", name: "متاح", value: "available" },
  { id: "contracted", name: "متعاقد", value: "contracted" },
  { id: "transferred", name: "منتقل", value: "transferred" },
];

export const genderOptions = [
  { id: "Male", name: "ذكر", value: "male" },
  { id: "Female", name: "أنثى", value: "female" },
];

export const nationalities = [
  { id: "saudi", name: "السعودية", value: "saudi" },
  { id: "uae", name: "الإمارات", value: "uae" },
  { id: "egypt", name: "مصر", value: "egypt" },
  { id: "morocco", name: "المغرب", value: "morocco" },
  { id: "kuwait", name: "الكويت", value: "kuwait" },
  { id: "qatar", name: "قطر", value: "qatar" },
  { id: "bahrain", name: "البحرين", value: "bahrain" },
  { id: "oman", name: "عمان", value: "oman" },
  { id: "jordan", name: "الأردن", value: "jordan" },
  { id: "lebanon", name: "لبنان", value: "lebanon" },
  { id: "syria", name: "سوريا", value: "syria" },
  { id: "iraq", name: "العراق", value: "iraq" },
  { id: "libya", name: "ليبيا", value: "libya" },
  { id: "tunisia", name: "تونس", value: "tunisia" },
  { id: "algeria", name: "الجزائر", value: "algeria" },
  { id: "sudan", name: "السودان", value: "sudan" },
  { id: "yemen", name: "اليمن", value: "yemen" },
  { id: "other", name: "أخرى", value: "other" },
];

export const currencyOptions = [
  { id: "SAR", name: "SAR", value: "SAR" },
  { id: "USD", name: "USD", value: "USD" },
  { id: "EUR", name: "EUR", value: "EUR" },
  { id: "GBP", name: "GBP", value: "GBP" },
];




