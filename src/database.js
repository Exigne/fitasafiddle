const { neon } = require('@neondatabase/serverless');

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
  // Add CORS headers for frontend communication
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { action, email, password, userId, ...otherData } = JSON.parse(event.body);
    
    console.log(`Database action: ${action}`);
    
    switch (action) {
      case 'getUser':
        const user = await sql`
          SELECT id, email, created_at 
          FROM users 
          WHERE email = ${email} AND password = ${password}
        `;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(user[0] || null)
        };
        
      case 'createUser':
        // Check if user already exists
        const existingUser = await sql`
          SELECT id FROM users WHERE email = ${email}
        `;
        
        if (existingUser.length > 0) {
          return {
            statusCode: 409,
            headers,
            body: JSON.stringify({ error: 'User already exists' })
          };
        }
        
        const newUser = await sql`
          INSERT INTO users (email, password, created_at)
          VALUES (${email}, ${password}, NOW())
          RETURNING id, email, created_at
        `;
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newUser[0])
        };
        
      case 'addWorkout':
        const workout = await sql`
          INSERT INTO workouts (user_id, name, exercises, duration, date)
          VALUES (
            ${userId}, 
            ${otherData.name}, 
            ${JSON.stringify(otherData.exercises || [])}, 
            ${otherData.duration || 0}, 
            ${otherData.date || new Date().toISOString()}
          )
          RETURNING *
        `;
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(workout[0])
        };
        
      case 'getWorkouts':
        const workouts = await sql`
          SELECT * FROM workouts 
          WHERE user_id = ${userId}
          ORDER BY date DESC
        `;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(workouts || [])
        };
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Database operation failed',
        message: error.message 
      })
    };
  }
};
