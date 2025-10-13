import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

/**
 * @returns {Promise<Array>} 
 */
export const fetchSportsData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sports/active`, {
      timeout: 10000, 
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sports data:', error);
    return [];
  }
};

/**
 * @param {string} sportId 
 * @returns {Promise<Object>} 
 */
export const fetchSportById = async (sportId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sports/${sportId}`, {
      timeout: 10000, 
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching sport with ID ${sportId}:`, error);
    return null;
  }
};
