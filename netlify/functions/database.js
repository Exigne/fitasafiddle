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
      console.log('Fetching joined workout data...');
      
      // CRITICAL: Join workouts and workout_logs tables
      const workoutLogs = await sql`
        SELECT 
          wl.id,
          wl.workout_id,
          wl.exercise_name,
          wl.muscle_group,
          wl.sets,
          wl.reps,
          wl.weight,
          wl.created_at,
          w.user_email
        FROM workout_logs wl
        INNER JOIN workouts w ON wl.workout_id = w.id
        ORDER BY wl.created_at DESC
      `;
      
      const users = await sql`SELECT email, display_name, profile_pic FROM users`;
      
      console.log('Joined workout logs found:', workoutLogs.length);
      console.log('First workout log:', workoutLogs[0]);
      console.log('Users found:', users.length);

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
        // First create a workout session
        const workoutResult = await sql`
          INSERT INTO workouts (user_email, created_at) 
          VALUES (${body.userEmail}, NOW()) 
          RETURNING id
        `;
        
        const workoutId = workoutResult[0].id;
        console.log('Created workout with id:', workoutId);

        // Then add exercises to workout_logs
        for (const exercise of body.exercises) {
          await sql`
            INSERT INTO workout_logs 
            (workout_id, exercise_name, muscle_group, sets, reps, weight, created_at) 
            VALUES (
              ${workoutId}, 
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
      console.log('Deleting workout log with id:', workoutId);
      
      // Delete from workout_logs (not workouts)
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
