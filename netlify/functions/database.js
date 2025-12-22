import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json'
};

export const handler = async (event) => {
  try {
    /* -------------------------------
       CORS preflight
    -------------------------------- */
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers };
    }

    /* -------------------------------
       GET – fetch workout summaries
    -------------------------------- */
    if (event.httpMethod === 'GET') {
      const { user } = event.queryStringParameters || {};

      if (!user) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing user parameter' })
        };
      }

      const data = await sql`
        SELECT
          w.id,
          w.created_at,
          COUNT(l.id) AS exercise_count,
          COALESCE(SUM(l.weight * l.reps * l.sets), 0) AS total_volume
        FROM workouts w
        LEFT JOIN workout_logs l ON w.id = l.workout_id
        WHERE w.user_email = ${user}
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    /* -------------------------------
       POST – save workout  ✅ FIX IS HERE
    -------------------------------- */
    if (event.httpMethod === 'POST') {
      // 🔧 SAFE BODY PARSING
      const body =
        typeof event.body === 'string'
          ? JSON.parse(event.body)
          : event.body || {};

      const { userEmail, exercises } = body;

      if (!userEmail || !Array.isArray(exercises) || exercises.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid payload' })
        };
      }

      const isValidNumber = n => Number.isFinite(Number(n));

      for (const ex of exercises) {
        if (
          !ex.name ||
          !isValidNumber(ex.sets) ||
          !isValidNumber(ex.reps)
        ) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid exercise data' })
          };
        }
      }

      await sql.begin(async (tx) => {
        const workout = await tx`
          INSERT INTO workouts (user_email)
          VALUES (${userEmail})
          RETURNING id
        `;

        const workoutId = workout[0].id;

        await tx`
          INSERT INTO workout_logs
            (workout_id, exercise_name, muscle_group, sets, reps, weight)
          SELECT
            ${workoutId},
            x.name,
            x.group,
            x.sets,
            x.reps,
            x.weight
          FROM jsonb_to_recordset(${JSON.stringify(exercises)}::jsonb)
          AS x(
            name text,
            group text,
            sets int,
            reps int,
            weight numeric
          )
        `;
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, headers };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
