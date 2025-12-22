import React, { useState, useEffect } from 'react';
import { databaseAPI } from './api/database.js';
import './App.css';

const AuthForm = ({ isLogin, onSuccess, onSwitch }) => {
  // ... your existing state and functions ...

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                   textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        
        <h2 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>{isLogin ? 'Login to FitFiddle' : 'Join FitFiddle'}</h2>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>Musical Fitness App</p>
        
        {error && <div style={{ background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        
        {/* ADD THE DEBUG BUTTON HERE - RIGHT AFTER THE ERROR DIV */}
        <button 
          type="button" 
          onClick={async () => {
            console.log('=== DEBUGGING LOGIN ===');
            console.log('Testing with:', formData.email || 'your-email', formData.password || 'your-password');
            
            try {
              const response = await fetch('/.netlify/functions/database', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  action: 'getUser', 
                  email: formData.email || 'test@test.com', 
                  password: formData.password || 'test123' 
                })
              });
              
              console.log('Response status:', response.status);
              console.log('Response headers:', Object.fromEntries(response.headers.entries()));
              
              const text = await response.text();
              console.log('Raw response text:', `"${text}"`);
              console.log('Response length:', text.length);
              
              if (!text || text.trim() === '') {
                console.log('❌ EMPTY RESPONSE - User not found or database issue');
                alert('Empty response - user not found in database');
              } else {
                try {
                  const data = JSON.parse(text);
                  console.log('Parsed data:', data);
                  alert('Response: ' + (data ? JSON.stringify(data) : 'null (user not found)'));
                } catch (e) {
                  console.log('Raw text response:', text);
                  alert('Raw response: ' + text);
                }
              }
            } catch (err) {
              console.error('❌ Network error:', err);
              alert('Network error: ' + err.message);
            }
          }}
          style={{background: '#f44336', color: 'white', padding: '0.5rem', marginBottom: '1rem', width: '100%'}}
        >
          🐛 Debug Login Response
        </button>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* your existing form inputs here */}
          
          <button type="submit" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', padding: '1rem', borderRadius: '12px',
            fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer'
          }} disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', color: '#718096' }}>
          {/* your existing switch button here */}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ currentUser, onLogout }) => {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({
    exercise: '',
    sets: 3,
    reps: 10,
    weight: 0
  });
  const [loading, setLoading] = useState(false);

  // Load workouts from database
  useEffect(() => {
    if (currentUser?.id) {
      loadWorkouts();
    }
  }, [currentUser]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const userWorkouts = await databaseAPI.getWorkouts(currentUser.id);
      console.log('Loaded workouts:', userWorkouts);
      setWorkouts(userWorkouts);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async () => {
    if (!newWorkout.exercise || newWorkout.weight <= 0) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const workout = await databaseAPI.addWorkout(currentUser.id, newWorkout);
      console.log('Added workout:', workout);
      setWorkouts([workout, ...workouts]);
      
      // Reset form
      setNewWorkout({ exercise: '', sets: 3, reps: 10, weight: 0 });
    } catch (error) {
      console.error('Failed to add workout:', error);
      alert('Failed to save workout');
    }
  };

  const getWorkoutStats = () => {
    const totalWorkouts = workouts.length;
    const thisWeek = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    }).length;
    
    return { totalWorkouts, thisWeek };
  };

  const stats = getWorkoutStats();

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>FitFiddle Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, {currentUser?.email}</span>
          <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h3>Total Workouts</h3>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: '#667eea', margin: 0 }}>{stats.totalWorkouts}</p>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <h3>This Week</h3>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: '#667eea', margin: 0 }}>{stats.thisWeek}</p>
          </div>
        </div>

        {/* Log Workout Section */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h3>Log New Workout</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <select 
              value={newWorkout.exercise}
              onChange={(e) => setNewWorkout({...newWorkout, exercise: e.target.value})}
              style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
            >
              <option value="">Select Exercise</option>
              <option value="Bench Press">Bench Press</option>
              <option value="Squats">Squats</option>
              <option value="Deadlifts">Deadlifts</option>
              <option value="Pull-ups">Pull-ups</option>
              <option value="Shoulder Press">Shoulder Press</option>
              <option value="Bicep Curls">Bicep Curls</option>
            </select>
            <input 
              type="number"
              placeholder="Sets"
              value={newWorkout.sets}
              onChange={(e) => setNewWorkout({...newWorkout, sets: parseInt(e.target.value) || 1})}
              style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
            />
            <input 
              type="number"
              placeholder="Reps"
              value={newWorkout.reps}
              onChange={(e) => setNewWorkout({...newWorkout, reps: parseInt(e.target.value) || 1})}
              style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
            />
            <input 
              type="number"
              placeholder="Weight (lbs)"
              value={newWorkout.weight}
              onChange={(e) => setNewWorkout({...newWorkout, weight: parseInt(e.target.value) || 0})}
              style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem' }}
            />
          </div>
          <button onClick={addWorkout} style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px',
            fontSize: '1.1rem', fontWeight: '600', cursor: 'pointer'
          }} disabled={loading}>
            {loading ? 'Saving...' : 'Log Workout'}
          </button>
        </div>

        {/* Recent Workouts */}
        {workouts.length > 0 && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3>Recent Workouts</h3>
            {loading ? (
              <p>Loading workouts...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workouts.slice(0, 5).map(workout => (
                  <div key={workout.id} style={{ 
                    background: '#f7fafc', border: '2px solid #e2e8f0', borderRadius: '12px', 
                    padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                  }}>
                    <div>
                      <h4 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>{workout.exercise}</h4>
                      <p style={{ color: '#718096', margin: 0 }}>{workout.sets} sets × {workout.reps} reps</p>
                      <p style={{ color: '#718096', margin: 0, fontSize: '0.9rem' }}>
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '2rem', fontWeight: '800', color: '#667eea' }}>{workout.weight}</span>
                      <span style={{ fontSize: '1rem', color: '#a0aec0', marginLeft: '0.25rem' }}>lbs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check URL params for register view
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'register') {
      setIsLogin(false);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    console.log('Auth successful:', user);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    window.history.pushState({}, '', '?view=register');
  };

  const switchToLogin = () => {
    setIsLogin(true);
    window.history.pushState({}, '', '?view=login');
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <AuthForm 
          isLogin={isLogin} 
          onSuccess={handleAuthSuccess}
          onSwitch={isLogin ? switchToRegister : switchToLogin}
        />
      )}
    </div>
  );
}

export default App;
