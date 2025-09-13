"use client";

import useSportsStore from "@/stores/sportsStore";
import { useEffect } from "react";

export const useSportsData = () => {
  const { sports, isLoading, error, fetchSports } = useSportsStore();

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  /**

   * @returns {Array}
   */
  const getSportsOptions = () => {
    if (!sports || !sports.length) {
      return [];
    }

    return sports.map((sport) => ({
      id: sport.slug,
      name: {
        ar: sport.name.ar,
        en: sport.name.en,
      },
      value: sport.slug,
      _original: sport,
    }));
  };

  /**

   * @param {string} sportSlug
   * @returns {Array}
   */
  const getSportPositions = (sportSlug) => {
    if (!sports || !sports.length) {
      return [];
    }

    const sport = sports.find((s) => s.slug === sportSlug);
    if (!sport || !sport.positions || !sport.positions.length) {
      return [];
    }

    const positions = sport.positions.map((position) => ({
      id: position.name.en.toLowerCase().replace(/\s+/g, "_"),
      name: {
        ar: position.name.ar,
        en: position.name.en,
      },
      value: position.name.en.toLowerCase().replace(/\s+/g, "_"),
      _original: position,
    }));

    positions.push({
      id: "other",
      name: {
        ar: "أخرى",
        en: "Other",
      },
      value: "other",
    });

    return positions;
  };

  /**

   * @param {string} jobType 
   * @param {string} sportSlug 
   * @returns {Array} 
   */
  const getRoleTypes = (jobType, sportSlug) => {
    if (!sports || !sports.length || !jobType) {
      return [];
    }

    const sport = sports.find((s) => s.slug === sportSlug);
    if (!sport || !sport.roleTypes || !sport.roleTypes.length) {
      return [];
    }

    const filteredRoles = sport.roleTypes.filter(
      (role) => role.jop === jobType
    );

    const roleTypes = filteredRoles.map((role) => ({
      id: role.name.en.toLowerCase().replace(/\s+/g, "_"),
      name: {
        ar: role.name.ar,
        en: role.name.en,
      },
      value: role.name.en.toLowerCase().replace(/\s+/g, "_"),
      _original: role,
    }));

    roleTypes.push({
      id: "other",
      name: {
        ar: "أخرى",
        en: "Other",
      },
      value: "other",
    });

    return roleTypes;
  };

  /**
   * @param {string} sportSlug
   * @returns {Array}
   */
  const getPlayerRoleTypes = (sportSlug) => {
    return getRoleTypes("player", sportSlug);
  };

  /**
   * @param {string} sportSlug
   * @returns {Array}
   */
  const getCoachRoleTypes = (sportSlug) => {
    return getRoleTypes("coach", sportSlug);
  };

  return {
    sports,
    isLoading,
    error,
    getSportsOptions,
    getSportPositions,
    getPlayerRoleTypes,
    getCoachRoleTypes,
  };
};
