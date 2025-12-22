const API_BASE = '/.netlify/functions/database';

export const databaseAPI = {
  // User operations
  async createUser(email, password) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createUser', email, password })
    });
    return response.json();
  },

  async getUser(email) {
    const response = await fetch(`${API_BASE}?action=getUser&email=${encodeURIComponent(email)}`);
    return response.json();
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
