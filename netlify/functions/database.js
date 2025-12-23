import { neon } from '@neondatabase/serverless';

export const handler = async (event) => {
  const sql = neon(process.env.DATABASE_URL);
  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      const workouts = await sql`SELECT * FROM workouts ORDER BY created_at DESC`;
      const users = await sql`SELECT email, display_name, profile_pic FROM users`;
      
      // DEEP PARSE: Ensures exercises are objects, not strings
      const cleanedWorkouts = workouts.map(w => {
        let parsedEx = w.exercises;
        if (typeof w.exercises === 'string') {
          try { parsedEx = JSON.parse(w.exercises); } catch (e) { parsedEx = []; }
        }
        return { ...w, exercises: Array.isArray(parsedEx) ? parsedEx : [parsedEx] };
      });

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workouts: cleanedWorkouts, users }),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      if (body.action === 'auth') {
        const users = await sql`SELECT * FROM users WHERE email = ${body.email}`;
        if (users.length === 0) {
          await sql`INSERT INTO users (email, password, display_name) VALUES (${body.email}, ${body.password}, ${body.email.split('@')[0]})`;
          return { statusCode: 200, body: JSON.stringify({ email: body.email }) };
        }
        return { statusCode: 200, body: JSON.stringify(users[0]) };
      }

      if (body.userEmail && body.exercises) {
        // Save as strict JSONB
        await sql`INSERT INTO workouts (user_email, exercises) VALUES (${body.userEmail}, ${JSON.stringify(body.exercises)}::jsonb)`;
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }
    }

    if (method === 'DELETE') {
      await sql`DELETE FROM workouts WHERE id = ${event.queryStringParameters.workoutId}`;
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
