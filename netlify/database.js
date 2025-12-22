import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? {
    rejectUnauthorized: false
  } : false
});

export const handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { httpMethod, body } = event;
  
  try {
    if (httpMethod === 'POST') {
      const data = JSON.parse(body);
      console.log('Database action:', data.action);
      
      switch (data.action) {
        case 'getUser':
          const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = $2',
            [data.email, data.password]
          );
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(userResult.rows[0] || null)
          };
        
        case 'createUser':
          // Check if user exists first
          const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [data.email]
          );
          
          if (existingUser.rows.length > 0) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({ error: 'User already exists' })
            };
          }
          
          const newUserResult = await pool.query(
            `INSERT INTO users (email, password, created_at, level, experience, streak)
             VALUES ($1, $2, NOW(), 1, 0, 0)
             RETURNING id, email, level, experience, streak`,
            [data.email, data.password]
          );
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify(newUserResult.rows[0])
          };
        
        case 'addWorkout':
          // Support both old format (single exercise) and new format (multiple exercises)
          if (data.exercises && Array.isArray(data.exercises)) {
            // New format: multiple exercises as JSONB
            const result = await pool.query(
              `INSERT INTO workouts (user_id, name, exercises, duration, date)
               VALUES ($1, $2, $3, $4, NOW())
               RETURNING *`,
              [data.userId, data.name, JSON.stringify(data.exercises), data.duration || 0]
            );
            return {
              statusCode: 201,
              headers,
              body: JSON.stringify(result.rows[0])
            };
          } else {
            // Old format: single exercise
            const result = await pool.query(
              `INSERT INTO workouts (user_id, exercise, sets, reps, weight, date)
               VALUES ($1, $2, $3, $4, $5, NOW())
               RETURNING *`,
              [data.userId, data.exercise, data.sets, data.reps, data.weight]
            );
            return {
              statusCode: 201,
              headers,
              body: JSON.stringify(result.rows[0])
            };
          }
        
        case 'getWorkouts':
          const workoutsResult = await pool.query(
            'SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC',
            [data.userId]
          );
          
          // Transform the data for the frontend
          const workouts = workoutsResult.rows.map(workout => {
            // Check if this is a new format workout (has exercises JSONB)
            if (workout.exercises) {
              return {
                id: workout.id,
                name: workout.name,
                exercises: typeof workout.exercises === 'string' ? JSON.parse(workout.exercises) : workout.exercises,
                duration: workout.duration,
                date: workout.date
              };
            } else {
              // Old format - convert to new format
              return {
                id: workout.id,
                name: workout.exercise,
                exercises: [{
                  name: workout.exercise,
                  sets: workout.sets,
                  reps: workout.reps,
                  weight: workout.weight
                }],
                duration: 0, // No duration in old format
                date: workout.date
              };
            }
          });
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(workouts)
          };
        
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid action' })
          };
      }
    }
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid request method' })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Database operation failed', message: error.message })
    };
  }
};
