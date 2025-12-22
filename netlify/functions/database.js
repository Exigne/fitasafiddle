import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

export const handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };

  try {
    const { user, action } = event.queryStringParameters || {};

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
      const { userEmail, exercise, sets, reps, weight } = JSON.parse(event.body);
      const result = await sql`
        INSERT INTO workouts (user_email, exercise, sets, reps, weight)
        VALUES (${userEmail}, ${exercise}, ${sets}, ${reps}, ${weight}) RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(result[0]) };
    }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
