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

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      // Check if response is empty
      if (!text) {
        throw new Error('Empty response from server');
      }

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse JSON:', text);
        throw new Error(`Invalid JSON response: ${text}`);
      }
    } catch (error) {
      console.error('Create user error:', error);
      console.log('Falling back to localStorage');
      
      // Fallback to localStorage
      return new Promise((resolve) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
          id: Date.now().toString(),
          email,
          password,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        resolve(newUser);
      });
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

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      // Check if response is empty
      if (!text) {
        throw new Error('Empty response from server');
      }

      try {
        const result = JSON.parse(text);
        return result;
      } catch (parseError) {
        console.error('Failed to parse JSON:', text);
        throw new Error(`Invalid JSON response: ${text}`);
      }
    } catch (error) {
      console.error('Get user error:', error);
      console.log('Falling back to localStorage');
      
      // Fallback to localStorage
      return new Promise((resolve) => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        resolve(user || null);
      });
    }
  }
};
