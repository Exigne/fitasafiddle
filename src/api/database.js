const API_BASE = '/.netlify/functions/database';

export const databaseAPI = {
  // User operations
  async createUser(email, password) {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'createUser', 
          email, 
          password 
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  async getUser(email, password) {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'getUser', 
          email, 
          password 
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Workout operations
  async addWorkout(userId, workoutData) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'addWorkout', 
        userId, 
        ...workoutData 
      })
    });
    return response.json();
  },

  async getWorkouts(userId) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getWorkouts', userId })
    });
    return response.json();
  }
};
