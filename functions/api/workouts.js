export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const userEmail = url.searchParams.get('user');
  
  if (!userEmail) {
    return new Response(JSON.stringify({ error: 'User email required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // For now, return mock data - you'll connect to Supabase later
    const mockData = [
      {
        id: 1,
        exercise: 'bench press',
        sets: 3,
        reps: 10,
        weight: 60,
        user_email: userEmail,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        exercise: 'squats',
        sets: 4,
        reps: 12,
        weight: 80,
        user_email: userEmail,
        created_at: new Date().toISOString()
      }
    ];
    
    return new Response(JSON.stringify(mockData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch workouts' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPost = async ({ request }) => {
  try {
    const body = await request.json();
    const { user_email, exercise, sets, reps, weight } = body;
    
    if (!user_email || !exercise || !sets || !reps || !weight) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Mock successful save - you'll connect to Supabase later
    const newWorkout = {
      id: Date.now(),
      exercise,
      sets,
      reps,
      weight,
      user_email,
      created_at: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(newWorkout), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save workout' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
