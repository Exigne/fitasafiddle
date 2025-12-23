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
      console.log('GET request - fetching workout logs and users');
      
      // Query the CORRECT table - workout_logs
      const workoutLogs = await sql`SELECT * FROM workout_logs ORDER BY created_at DESC`;
      const users = await sql`SELECT email, display_name, profile_pic FROM users`;
      
      console.log('Workout logs found:', workoutLogs.length);
      console.log('Users found:', users.length);
      console.log('First workout log:', workoutLogs[0]);

      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ 
          workoutLogs: workoutLogs,
          users: users 
        }),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      console.log('POST request body:', body);

      if (body.action === 'auth') {
        // Validate auth fields
        if (!body.email || !body.password) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Email and password required' })
          };
        }

        console.log('Checking if user exists:', body.email);
        const results = await sql`SELECT * FROM users WHERE email = ${body.email}`;
        console.log('User lookup results:', results.length);
        
        if (results.length === 0) {
          console.log('Creating new user');
          await sql`INSERT INTO users (email, password, display_name) VALUES (${body.email}, ${body.password}, ${body.email.split('@')[0]})`;
          console.log('User created successfully');
        }
        
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify(results[0] || { email: body.email })
        };
      }

      if (body.action === 'updateProfile') {
        if (!body.email || !body.displayName) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Email and display name required' })
          };
        }

        console.log('Updating profile for:', body.email);
        await sql`
          UPDATE users 
          SET display_name = ${body.displayName}, profile_pic = ${body.profilePic || ''}
          WHERE email = ${body.email}
        `;
        
        return {
          statusCode: 200,
          headers: getCorsHeaders(),
          body: JSON.stringify({ success: true })
        };
      }

      if (body.userEmail && body.exercises) {
        console.log('Saving workout for user:', body.userEmail);
        console.log('Exercises to save:', body.exercises);

        // Validate exercises format
        if (!Array.isArray(body.exercises)) {
          return {
            statusCode: 400,
            headers: getCorsHeaders(),
            body: JSON.stringify({ error: 'Exercises must be an array' })
          };
        }

        // Insert into workout_logs table
        for (const exercise of body.exercises) {
          console.log('Inserting exercise:', exercise);
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
        
        console.log('All exercises saved successfully');
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
      console.log('Delete request for workoutId:', workoutId);
      
      // Validate workoutId
      if (!workoutId || isNaN(parseInt(workoutId))) {
        return {
          statusCode: 400,
          headers: getCorsHeaders(),
          body: JSON.stringify({ error: 'Valid workoutId required' })
        };
      }

      console.log('Deleting workout log with id:', parseInt(workoutId));
      await sql`DELETE FROM workout_logs WHERE id = ${parseInt(workoutId)}`;
      console.log('Workout deleted successfully');
      
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
