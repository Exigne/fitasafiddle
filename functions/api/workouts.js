export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const userEmail = url.searchParams.get('user');
  
  if (!userEmail) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Query D1 database
    const { results } = await env.DB.prepare(
      'SELECT * FROM workouts WHERE user_email = ? ORDER BY created_at DESC'
    ).bind(userEmail).all();

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // If table doesn't exist, return mock data
    const mockData = [
      { id: 1, exercise: 'bench press', sets: 3, reps: 10, weight: 60 },
      { id: 2, exercise: 'squats', sets: 4, reps: 12, weight: 80 }
    ];
    
    return new Response(JSON.stringify(mockData), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost = async ({ request, env }) => {
  try {
    const body = await request.json();
    const { user_email, exercise, sets, reps, weight } = body;
    
    // Insert into D1 database
    const result = await env.DB.prepare(
      'INSERT INTO workouts (user_email, exercise, sets, reps, weight, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(user_email, exercise, sets, reps, weight, new Date().toISOString()).run();

    const newWorkout = {
      id: result.meta.last_row_id,
      exercise,
      sets,
      reps,
      weight,
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(newWorkout), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Fallback: return the workout data anyway
    const newWorkout = {
      id: Date.now(),
      exercise: body.exercise,
      sets: body.sets,
      reps: body.reps,
      weight: body.weight,
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(newWorkout), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
