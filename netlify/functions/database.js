import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const MUSCLE_MAP = {
  'Bench Press': 'Chest', 'Incline Press': 'Chest', 'Dips': 'Chest',
  'Squat': 'Legs', 'Deadlift': 'Back', 'Leg Press': 'Legs',
  'Pull-ups': 'Back', 'Rows': 'Back',
  'Yoga (Vinyasa)': 'Flexibility', 'Yoga (Hatha)': 'Flexibility',
  'Running (Distance)': 'Cardio', 'Sprinting': 'Cardio',
  'Cycling': 'Cardio', 'Swimming': 'Full Body', 'Pilates': 'Core'
};

export const handler = async (event) => {
  const headers = { 
    'Access-Control-Allow-Origin': '*', 
    'Content-Type': 'application/json' 
  };

  try {
    const { user, action, id } = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};

    // --- AUTHENTICATION ---
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
      
      const history = await sql`SELECT * FROM workouts WHERE user_email = ${user} ORDER BY created_at DESC`;
      return { statusCode: 200, headers, body: JSON.stringify(history) };
    }

    if (event.httpMethod === 'POST') {
      const { userEmail, exercise, sets, reps, weight } = body;
      const muscleGroup = MUSCLE_MAP[exercise] || 'Other';

      const result = await sql`
        INSERT INTO workouts (user_email, exercise, muscle_group, sets, reps, weight)
        VALUES (${userEmail}, ${exercise}, ${muscleGroup}, ${sets}, ${reps}, ${weight}) 
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }

    // --- DELETE LOGIC ---
    if (event.httpMethod === 'DELETE') {
      await sql`DELETE FROM workouts WHERE id = ${id} AND user_email = ${user}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Deleted' }) };
    }

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
