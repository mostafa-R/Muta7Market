// hooks/useDashboardStats.js
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    players: { total: 0, active: 0, inactive: 0 },
    recent: { users: [], players: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('token') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('accessToken') ||
        localStorage.getItem('accessToken')
      );
    }
    return null;
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) throw new Error('Authentication token not found.');

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:5000';

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard/stats`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setStats(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.message || 'Invalid response format');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // -------------------
  // WebSocket (Socket.io) Real-time updates
  // -------------------
  useEffect(() => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:5000';

    const socket = io(API_BASE_URL, {
      auth: { token: getAuthToken() },
    });

    socket.on('connect_error', (err) => console.error('Socket connection error:', err));

    // Event من السيرفر كل ما تتغير البيانات
    socket.on('dashboardUpdate', (updatedStats) => {
      setStats(updatedStats);
      setLastUpdated(new Date());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch أول مرة عند التحميل
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const refreshStats = useCallback(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refreshStats,
    isStale: lastUpdated && Date.now() - lastUpdated.getTime() > 5 * 60 * 1000,
    isEmpty: !loading && !error && stats.users.total === 0 && stats.players.total === 0,
  };
};
