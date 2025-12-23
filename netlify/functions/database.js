import { neon } from '@neondatabase/serverless';

const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
});

export const handler = async (event) => {
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
      // CRITICAL: Query workout_logs table (not workouts)
      const workoutLogs = await sql`SELECT * FROM workout_logs ORDER BY created_at DESC`;
      const users = await sql`SELECT email, display_name, profile_pic FROM users`;
      
      console.log('Returning data to Dashboard:', {
        workoutLogsCount: workoutLogs.length,
        usersCount: users.length,
        firstWorkoutLog: workoutLogs[0]
      });

      // Return EXACT format your Dashboard expects
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ 
          workoutLogs: workoutLogs, // MUST be workoutLogs (not workouts)
          users: users 
        }),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      if (body.action === 'auth') {
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

      if (body.action === 'updateProfile') {
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
        // Insert into workout_logs table (NOT workouts)
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
    }

    if (method === 'DELETE') {
      const workoutId = event.queryStringParameters?.workoutId;
      await sql`DELETE FROM workout_logs WHERE id = ${parseInt(workoutId)}`;
      
      return {
        statusCode: 200,
        headers: getCorsHeaders(),
        body: JSON.stringify({ success: true })
      };
    }

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
