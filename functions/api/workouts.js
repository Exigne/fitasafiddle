export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const userEmail = url.searchParams.get('user');
  
  if (!userEmail) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Simple mock data
  const mockData = [
    { id: 1, exercise: 'bench press', sets: 3, reps: 10, weight: 60 },
    { id: 2, exercise: 'squats', sets: 4, reps: 12, weight: 80 }
  ];
  
  return new Response(JSON.stringify(mockData), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPost = async ({ request }) => {
  try {
    const body = await request.json();
    const { user_email, exercise, sets, reps, weight } = body;
    
    // Simple success response
    const newWorkout = {
      id: Date.now(),
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
    return new Response(JSON.stringify({ error: 'Failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
