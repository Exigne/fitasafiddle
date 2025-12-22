import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

// Move this outside the handler so it's not recreated every single time
const MUSCLE_MAP = {
  'Bench Press': 'Chest', 'Incline Press': 'Chest', 'Dips': 'Chest',
  'Squat': 'Legs', 'Deadlift': 'Back', 'Leg Press': 'Legs',
  'Pull-ups': 'Back', 'Rows': 'Back', 'Lat Pulldown': 'Back',
  'Overhead Press': 'Shoulders', 'Lateral Raises': 'Shoulders'
};

export const handler = async (event) => {
  const headers = { 
    'Access-Control-Allow-Origin': '*', 
    'Content-Type': 'application/json' 
  };

  try {
    const { user, action } = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    // --- AUTHENTICATION LOGIC ---
    if (event.httpMethod === 'POST' && body.action === 'auth') {
      const { email, password, isRegistering } = body;
      if (isRegistering) {
        const newUser = await sql`
          INSERT INTO users (email, password) VALUES (${email}, ${password}) 
          ON CONFLICT (email) DO NOTHING RETURNING email
        `;
        if (newUser.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'User exists' }) };
        return { statusCode: 201, headers, body: JSON.stringify({ email: newUser[0].email }) };
      } else {
        const foundUser = await sql`SELECT email FROM users WHERE email = ${email} AND password = ${password}`;
        if (foundUser.length === 0) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid login' }) };
        return { statusCode: 200, headers, body: JSON.stringify({ email: foundUser[0].email }) };
      }
    }

    // --- WORKOUT LOGIC ---
    if (event.httpMethod === 'GET') {
      if (action === 'leaderboard') {
        const leaders = await sql`
          SELECT user_email, SUM(weight * reps * sets) as total_volume
          FROM workouts GROUP BY user_email ORDER BY total_volume DESC LIMIT 5
        `;
        return { statusCode: 200, headers, body: JSON.stringify(leaders) };
      }
      // Added muscle_group to the select for your analytics
      const history = await sql`SELECT * FROM workouts WHERE user_email = ${user} ORDER BY created_at DESC`;
      return { statusCode: 200, headers, body: JSON.stringify(history) };
    }

    if (event.httpMethod === 'POST') {
      const { userEmail, exercise, sets, reps, weight } = body;
      
      // LOOKUP: Determine muscle group based on exercise
      const muscleGroup = MUSCLE_MAP[exercise] || 'Other';

      const result = await sql`
        INSERT INTO workouts (user_email, exercise, muscle_group, sets, reps, weight)
        VALUES (${userEmail}, ${exercise}, ${muscleGroup}, ${sets}, ${reps}, ${weight}) 
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
