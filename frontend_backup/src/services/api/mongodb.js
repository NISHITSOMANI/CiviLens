// MongoDB API service for interacting with Django MongoDB endpoints

const API_BASE_URL = '/api';

// Test MongoDB connection
export const testMongoDBConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-mongodb/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    throw error;
  }
};

// Log user activity to MongoDB
export const logUserActivity = async (activityData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/log-activity/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error logging user activity:', error);
    throw error;
  }
};

// Get user analytics from MongoDB
export const getUserAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/analytics/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

// Sample data operations
export const getSampleData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sample-data/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching sample data:', error);
    throw error;
  }
};

export const createSampleData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sample-data/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  }
};
