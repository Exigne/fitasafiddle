import { neon } from '@neondatabase/serverless';

export const handler = async (event) => {
  const sql = neon(process.env.DATABASE_URL);
  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      const workouts = await sql`SELECT * FROM workouts ORDER BY created_at DESC`;
      const users = await sql`SELECT email, display_name, profile_pic FROM users`;
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
        body: JSON.stringify({ workouts: workouts || [], users: users || [] }),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      // Update Profile
      if (body.action === 'update_profile') {
        await sql`
          UPDATE users 
          SET display_name = ${body.displayName}, profile_pic = ${body.profilePic} 
          WHERE email = ${body.email}
        `;
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }

      // Auth Logic
      if (body.action === 'auth') {
        const { email, password } = body;
        const users = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (users.length === 0) {
          // Auto-register if user doesn't exist
          await sql`INSERT INTO users (email, password, display_name) VALUES (${email}, ${password}, ${email.split('@')[0]})`;
          return { statusCode: 200, body: JSON.stringify({ email }) };
        }
        if (users[0].password !== password) return { statusCode: 401, body: JSON.stringify({ error: 'Wrong password' }) };
        return { statusCode: 200, body: JSON.stringify(users[0]) };
      }

      // Workout Save Logic - Ensuring JSON format
      if (body.userEmail && body.exercises) {
        await sql`
          INSERT INTO workouts (user_email, exercises, created_at) 
          VALUES (${body.userEmail}, ${JSON.stringify(body.exercises)}::jsonb, NOW())
        `;
        return { statusCode: 200, body: JSON.stringify({ message: "Saved" }) };
      }
    }
    
    if (method === 'DELETE') {
      await sql`DELETE FROM workouts WHERE id = ${event.queryStringParameters.workoutId}`;
      return { statusCode: 200, body: JSON.stringify({ message: "Deleted" }) };
    }
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
