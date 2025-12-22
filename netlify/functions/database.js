import pg from 'pg';
const { Pool } = pg;

// Use your actual Neon connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    console.log('Received request:', data);

    switch (data.action) {
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
            body: JSON.stringify({ error: 'Email already exists' })
          };
        }

        const newUser = await pool.query(
          `INSERT INTO users (email, password, created_at, level, experience, streak)
           VALUES ($1, $2, NOW(), 1, 0, 0)
           RETURNING id, email, created_at`,
          [data.email, data.password]
        );
        
        console.log('Created user:', newUser.rows[0]);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newUser.rows[0])
        };

      case 'getUser':
        const user = await pool.query(
          'SELECT id, email, created_at FROM users WHERE email = $1 AND password = $2',
          [data.email, data.password]
        );
        
        console.log('Found user:', user.rows[0]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(user.rows[0] || null)
        };

      case 'addWorkout':
        const workout = await pool.query(
          `INSERT INTO workouts (user_id, exercise, sets, reps, weight, date)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING *`,
          [data.userId, data.exercise, data.sets, data.reps, data.weight]
        );
        
        console.log('Added workout:', workout.rows[0]);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(workout.rows[0])
        };

      case 'getWorkouts':
        const workouts = await pool.query(
          'SELECT * FROM workouts WHERE user_id = $1 ORDER BY date DESC',
          [data.userId]
        );
        
        console.log('Found workouts:', workouts.rows.length);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(workouts.rows)
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
      body: JSON.stringify({ error: 'Database operation failed', details: error.message })
    };
  }
};
