import { api } from './api';

/**
 * @param {string} timeRange 
 * @returns {Promise<Object>} 
 */
export const fetchAnalyticsData = async (timeRange = '7d') => {
  try {
    const response = await api.get(`/analytics/overview?timeRange=${timeRange}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

/**
 * @returns {Promise<Object>} 
 */
export const fetchRealTimeAnalytics = async () => {
  try {
    const response = await api.get('/analytics/realtime');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching real-time analytics:', error);
    throw error;
  }
};

/**
 * @param {number} seconds 
 * @returns {string} 
 */
export const formatSessionDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * @param {string} englishDayName 
 * @returns {string} 
 */
export const getArabicDayName = (englishDayName) => {
  const dayMap = {
    'Saturday': 'السبت',
    'Sunday': 'الأحد',
    'Monday': 'الإثنين',
    'Tuesday': 'الثلاثاء',
    'Wednesday': 'الأربعاء',
    'Thursday': 'الخميس',
    'Friday': 'الجمعة',
  };
  return dayMap[englishDayName] || englishDayName;
};

/**
 * @param {string} path 
 * @returns {string} 
 */
export const getPageNameFromPath = (path) => {
  const pageMap = {
    '/': 'الرئيسية',
    '/players': 'اللاعبين',
    '/coaches': 'المدربين',
    '/sports': 'الرياضات',
    '/signup': 'التسجيل',
    '/signin': 'تسجيل الدخول',
    '/profile': 'الملف الشخصي',
  };
  return pageMap[path] || path;
};