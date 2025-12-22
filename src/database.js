// ... (neon connection code)

  try {
    // 1. GET - FETCH WORKOUTS (Existing)
    if (event.httpMethod === 'GET') {
      const { user, action } = event.queryStringParameters || {};

      // NEW: Leaderboard Action
      if (action === 'leaderboard') {
        const leaders = await sql`
          SELECT user_email, SUM(sets) as total_sets, SUM(weight * reps * sets) as total_volume
          FROM workouts
          GROUP BY user_email
          ORDER BY total_volume DESC
          LIMIT 10
        `;
        return { statusCode: 200, headers, body: JSON.stringify(leaders) };
      }

      // Existing User History
      const workouts = await sql`SELECT * FROM workouts WHERE user_email = ${user} ORDER BY created_at DESC`;
      return { statusCode: 200, headers, body: JSON.stringify(workouts) };
    }
    
    // ... (rest of your POST logic)
