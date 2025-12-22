const { neon } = require('@netlify/neon');

// Connect to your Neon PostgreSQL database
const db = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
  const { httpMethod, body, queryStringParameters } = event;
  
  try {
    switch (httpMethod) {
      case 'GET':
        if (queryStringParameters.action === 'getUser') {
          const result = await db`
            SELECT * FROM users WHERE email = ${queryStringParameters.email}
          `;
          return {
            statusCode: 200,
            body: JSON.stringify(result[0] || null)
          };
        }
        break;
        
      case 'POST':
        const data = JSON.parse(body);
        
        if (data.action === 'createUser') {
          const result = await db`
            INSERT INTO users (email, password, created_at, level, experience, streak)
            VALUES (${data.email}, ${data.password}, NOW(), 1, 0, 0)
            RETURNING id, email
          `;
          return {
            statusCode: 201,
            body: JSON.stringify(result[0])
          };
        }
        
        if (data.action === 'addWorkout') {
          const result = await db`
            INSERT INTO workouts (user_id, exercise, sets, reps, weight, date)
            VALUES (${data.userId}, ${data.exercise}, ${data.sets}, ${data.reps}, ${data.weight}, NOW())
            RETURNING *
          `;
          return {
            statusCode: 201,
            body: JSON.stringify(result[0])
          };
        }
        
        if (data.action === 'getWorkouts') {
          const result = await db`
            SELECT * FROM workouts WHERE user_id = ${data.userId} ORDER BY date DESC
          `;
          return {
            statusCode: 200,
            body: JSON.stringify(result)
          };
        }
        break;
    }
    
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database operation failed' })
    };
  }
};
