import { neon } from '@neondatabase/serverless';

// Add CORS headers helper
const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
});

export const handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: ''
    };
  }

  const sql = neon(process.env.DATABASE_URL);
  const method = event.httpMethod;

  try {
if (method === 'GET') {
  const workoutLogs = await sql`SELECT * FROM workout_logs ORDER BY created_at DESC`;
  const users = await sql`SELECT email, display_name, profile_pic FROM users`;
  
  const formattedWorkouts = workoutLogs.map(w => ({
    id: w.id,
    workout_id: w.workout_id,
    user_email: w.user_email, // You might need to add this column or join with workouts table
    created_at: w.created_at,
    ex_name: w.exercise_name,
    ex_weight: w.weight || 0,
    ex_sets: w.sets || 0,
    ex_reps: w.reps || 0,
    muscle_group: w.muscle_group
  }));

  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: JSON.stringify({ workouts: formattedWorkouts, users }),
  };
}

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      // Validate required fields
      if (!body.email && !body.userEmail) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Missing required fields' })
        };
      }

      if (body.action === 'auth') {
        // Validate auth fields
        if (!body.email || !body.password) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Email and password required' })
          };
        }

        const results = await sql`SELECT * FROM users WHERE email = ${body.email}`;
        
        if (results.length === 0) {
          await sql`INSERT INTO users (email, password, display_name) VALUES (${body.email}, ${body.password}, ${body.email.split('@')[0]})`;
        }
        
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify(results[0] || { email: body.email })
        };
      }

      if (body.userEmail && body.exercises) {
        // Validate exercises format
        if (!Array.isArray(body.exercises)) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Exercises must be an array' })
          };
        }

        // Insert into the CORRECT table - workout_logs
        for (const exercise of body.exercises) {
          await sql`
            INSERT INTO workout_logs 
            (user_email, exercise_name, muscle_group, sets, reps, weight, created_at) 
            VALUES (
              ${body.userEmail}, 
              ${exercise.exercise_name}, 
              ${exercise.muscle_group || 'Other'}, 
              ${exercise.sets || 1}, 
              ${exercise.reps || 0}, 
              ${exercise.weight || 0}, 
              NOW()
            )
          `;
        }
        
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({ success: true })
        };
      }

      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: 'Invalid request format' })
      };
    }

    if (method === 'DELETE') {
      const workoutId = event.queryStringParameters?.workoutId;
      
      // Validate workoutId
      if (!workoutId || isNaN(parseInt(workoutId))) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Valid workoutId required' })
        };
      }

      // Delete from the CORRECT table - workout_logs
      await sql`DELETE FROM workout_logs WHERE id = ${parseInt(workoutId)}`;
      
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 405,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (err) {
    console.error('Function error:', err);
    
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      })
    };
  }
};
