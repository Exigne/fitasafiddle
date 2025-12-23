import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Dumbbell, TrendingUp, Heart, Sparkles } from 'lucide-react';

// Configuration Data
const EXERCISES = {
  strength: {
    'Bench Press': { group: 'Chest', icon: '💪' },
    'Squat': { group: 'Legs', icon: '🦵' },
    'Deadlift': { group: 'Back', icon: '🏋️' },
    'Overhead Press': { group: 'Shoulders', icon: '💪' },
    'Pull-ups': { group: 'Back', icon: '🔝' },
    'Rows': { group: 'Back', icon: '⬅️' },
    'Bicep Curls': { group: 'Arms', icon: '💪' },
    'Tricep Dips': { group: 'Arms', icon: '💪' },
    'Lunges': { group: 'Legs', icon: '🦵' }
  },
  cardio: {
    'Running': { group: 'Cardio', icon: '🏃' },
    'Cycling': { group: 'Cardio', icon: '🚴' },
    'Swimming': { group: 'Cardio', icon: '🏊' },
    'Rowing': { group: 'Cardio', icon: '🚣' },
    'Jump Rope': { group: 'Cardio', icon: '🪢' },
    'Elliptical': { group: 'Cardio', icon: '⚡' },
    'Stair Climbing': { group: 'Cardio', icon: '🪜' }
  },
  stretch: {
    'Yoga': { group: 'Flexibility', icon: '🧘' },
    'Pilates': { group: 'Core', icon: '🧘' },
    'Dynamic Stretching': { group: 'Flexibility', icon: '🤸' },
    'Foam Rolling': { group: 'Recovery', icon: '🔄' },
    'Static Stretching': { group: 'Flexibility', icon: '🤸' },
    'Mobility Work': { group: 'Flexibility', icon: '🔄' }
  }
};

// --- Sub-Components ---

const AuthForm = ({ email, setEmail, password, setPassword, isRegistering, setIsRegistering, handleAuth, loading }) => (
  <div style={styles.authCard}>
    <div style={styles.authHeader}>
      <div style={styles.logoContainer}><Sparkles size={40} color="#6366f1" /></div>
      <h1 style={styles.authTitle}>Fit as a Fiddle</h1>
      <p style={styles.authSubtitle}>Your Personal Fitness Journey</p>
    </div>
    <div style={styles.authForm}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.authInput} disabled={loading} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={e => e.key === 'Enter' && !loading && handleAuth()} style={styles.authInput} disabled={loading} />
      <button onClick={handleAuth} style={styles.authButton} disabled={loading}>{loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}</button>
      <button onClick={() => setIsRegistering(!isRegistering)} style={styles.toggleButton} disabled={loading}>{isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}</button>
    </div>
  </div>
);

const WorkoutPanel = ({ workoutType, setIsLoggingWorkout, setWorkoutType, currentExercises, setCurrentExercises, finishWorkout, loading }) => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    if (workoutType && EXERCISES[workoutType]) {
      setSelectedExercise(Object.keys(EXERCISES[workoutType])[0]);
    }
  }, [workoutType]);

  const addExercise = () => {
    const exerciseData = EXERCISES[workoutType][selectedExercise];
    let newExercise;

    if (workoutType === 'cardio' || workoutType === 'stretch') {
      if (!duration || duration <= 0) return alert('Enter duration');
      newExercise = { exercise_name: selectedExercise, sets: 1, reps: parseInt(duration), weight: 0, group: exerciseData.group, type: workoutType };
    } else {
      if (!sets || !reps) return alert('Enter sets and reps');
      newExercise = { exercise_name: selectedExercise, sets: parseInt(sets), reps: parseInt(reps), weight: parseFloat(weight) || 0, group: exerciseData.group, type: workoutType };
    }
    setCurrentExercises([...currentExercises, newExercise]);
    setSets(''); setReps(''); setWeight(''); setDuration('');
  };

  return (
    <div style={styles.workoutPanel}>
      <div style={styles.workoutHeader}>
        <h3 style={styles.workoutTitle}>{workoutType.toUpperCase()} Session</h3>
        <button onClick={() => {setIsLoggingWorkout(false); setWorkoutType(null); setCurrentExercises([]);}} style={styles.closeBtn}>✕</button>
      </div>
      <div style={styles.inputGrid}>
        <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} style={styles.select}>
          {Object.keys(EXERCISES[workoutType] || {}).map(name => <option key={name} value={name}>{EXERCISES[workoutType][name].icon} {name}</option>)}
        </select>
        {workoutType === 'strength' ? (
          <div style={styles.inputRow}>
            <input type="number" placeholder="Sets" value={sets} onChange={e => setSets(e.target.value)} style={styles.input} />
            <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} style={styles.input} />
            <input type="number" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)} style={styles.input} />
          </div>
        ) : (
          <input type="number" placeholder="Minutes" value={duration} onChange={e => setDuration(e.target.value)} style={styles.input} />
        )}
        <button onClick={addExercise} style={styles.addButton}>+ Add</button>
      </div>
      {currentExercises.length > 0 && (
        <div style={styles.exerciseList}>
          {currentExercises.map((ex, i) => <div key={i} style={styles.exerciseItem}>{ex.exercise_name} - {ex.sets}x{ex.reps}</div>)}
          <button onClick={finishWorkout} disabled={loading} style={styles.finishButton}>{loading ? 'Saving...' : 'Finish Workout'}</button>
        </div>
      )}
    </div>
  );
};

// --- Main Dashboard ---

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [workoutType, setWorkoutType] = useState(null);
  const [currentExercises, setCurrentExercises] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const loadWorkouts = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/database?user=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setWorkouts(Array.isArray(data.workouts) ? data.workouts : []);
    } catch (err) { setError("Failed to load workouts"); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { if (user) loadWorkouts(); }, [user, loadWorkouts]);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auth', email, password, isRegistering })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem('fitnessUser', JSON.stringify(data));
      } else { alert(data.error); }
    } catch (err) { alert("Auth failed"); }
    finally { setLoading(false); }
  };

  const finishWorkout = async () => {
    if (!user?.email || currentExercises.length === 0) return;
    setLoading(true);
    setSaveError(null);

    try {
      const workoutData = {
        action: 'saveWorkout', // REQUIRED for backend routing
        userEmail: user.email,
        exercises: currentExercises,
        type: workoutType,
        created_at: new Date().toISOString()
      };

      const res = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      });

      if (res.ok) {
        setIsLoggingWorkout(false);
        setCurrentExercises([]);
        await loadWorkouts();
      } else {
        const errData = await res.json();
        setSaveError(errData.error || "Save failed");
      }
    } catch (err) { setSaveError("Network error"); }
    finally { setLoading(false); }
  };

  if (!user) return <div style={styles.container}><AuthForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} isRegistering={isRegistering} setIsRegistering={setIsRegistering} handleAuth={handleAuth} loading={loading} /></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
        <button onClick={() => { setUser(null); localStorage.removeItem('fitnessUser'); }} style={styles.logoutBtn}>Sign Out</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><Dumbbell /> <div>{workouts.length} Sessions</div></div>
        <div style={styles.statCard}><Activity /> <div>Active</div></div>
      </div>

      {!isLoggingWorkout ? (
        <div style={styles.fabContainer}>
          <button onClick={() => { setWorkoutType('strength'); setIsLoggingWorkout(true); }} style={styles.fabButton}>+ Strength</button>
          <button onClick={() => { setWorkoutType('cardio'); setIsLoggingWorkout(true); }} style={styles.fabButton}>+ Cardio</button>
        </div>
      ) : (
        <WorkoutPanel 
            workoutType={workoutType} 
            setIsLoggingWorkout={setIsLoggingWorkout} 
            setWorkoutType={setWorkoutType} 
            currentExercises={currentExercises} 
            setCurrentExercises={setCurrentExercises} 
            finishWorkout={finishWorkout} 
            loading={loading} 
        />
      )}

      <div style={styles.card}>
        <h3>Recent Workouts</h3>
        {workouts.map((w, i) => (
          <div key={i} style={styles.sessionItem}>
            {new Date(w.created_at).toLocaleDateString()} - {w.type} ({w.exercises?.length} exercises)
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Styles ---

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' },
  authCard: { maxWidth: '400px', margin: '80px auto', background: '#1e1b4b', padding: '40px', borderRadius: '24px' },
  authHeader: { textAlign: 'center', marginBottom: '32px' },
  authTitle: { fontSize: '28px', fontWeight: '700', color: '#6366f1' },
  authSubtitle: { color: '#94a3b8' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  authInput: { padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' },
  authButton: { padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  toggleButton: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  brandTitle: { fontSize: '24px', color: '#6366f1' },
  logoutBtn: { padding: '8px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  statCard: { background: '#1e293b', padding: '20px', borderRadius: '16px', display: 'flex', gap: '12px' },
  fabContainer: { display: 'flex', gap: '12px', marginBottom: '24px' },
  fabButton: { padding: '12px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '24px', cursor: 'pointer' },
  workoutPanel: { background: '#1e293b', padding: '24px', borderRadius: '24px', marginBottom: '24px' },
  workoutHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  inputGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputRow: { display: 'flex', gap: '8px' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#0f172a', color: '#fff', width: '100%' },
  select: { padding: '8px', borderRadius: '4px', background: '#0f172a', color: '#fff' },
  addButton: { padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px' },
  exerciseList: { marginTop: '16px', borderTop: '1px solid #334155', paddingTop: '16px' },
  finishButton: { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '12px' },
  sessionItem: { padding: '12px', borderBottom: '1px solid #334155' },
  card: { background: '#1e293b', padding: '20px', borderRadius: '16px' }
};

export default Dashboard;
