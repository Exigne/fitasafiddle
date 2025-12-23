import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Dumbbell, TrendingUp, Calendar, Heart, Sparkles, CheckCircle2, Trash2, Plus, X, Wind, Target, Zap, Trophy, Medal, Cloud, Sun, Moon } from 'lucide-react';

const EXERCISES = {
  strength: {
    'Bench Press': { group: 'Chest', icon: '💪' },
    'Squat': { group: 'Legs', icon: '🦵' },
    'Deadlift': { group: 'Back', icon: '🏋️' },
    'Overhead Press': { group: 'Shoulders', icon: '💪' },
    'Pull-ups': { group: 'Back', icon: '🔝' },
    'Rows': { group: 'Back', icon: '⬅️' },
    'Bicep Curls': { group: 'Arms', icon: '💪' },
    'Tricep Dips': { group: 'Arms', icon: '💪' }
  },
  cardio: {
    'Running': { group: 'Cardio', icon: '🏃' },
    'Cycling': { group: 'Cardio', icon: '🚴' },
    'Swimming': { group: 'Cardio', icon: '🏊' }
  },
  stretch: {
    'Yoga': { group: 'Flexibility', icon: '🧘' },
    'Pilates': { group: 'Core', icon: '🧘' },
    'Mobility Work': { group: 'Flexibility', icon: '🔄' }
  }
};

// --- SUB-COMPONENTS ---

const AuthForm = ({ email, setEmail, password, setPassword, isRegistering, setIsRegistering, handleAuth, loading }) => (
  <div style={styles.authCard}>
    <div style={styles.authHeader}>
      <div style={styles.logoContainer}><Sparkles size={40} color="#6366f1" /></div>
      <h1 style={styles.authTitle}>Fit as a Fiddle</h1>
      <p style={styles.authSubtitle}>Join the live neon-powered league</p>
    </div>
    <div style={styles.authForm}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.authInput} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.authInput} />
      <button onClick={handleAuth} style={styles.authButton} disabled={loading}>
        {loading ? 'Connecting...' : (isRegistering ? 'Create Account' : 'Sign In')}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)} style={styles.toggleButton}>
        {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  </div>
);

const WorkoutPanel = ({ workoutType, setIsLoggingWorkout, currentExercises, setCurrentExercises, finishWorkout, loading }) => {
  const [selectedExercise, setSelectedExercise] = useState(Object.keys(EXERCISES[workoutType] || {})[0] || '');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const addExercise = () => {
    const isStrength = workoutType === 'strength';
    if (isStrength && (!sets || !reps)) return alert('Enter sets and reps');
    if (!isStrength && !reps) return alert('Enter duration');

    const exData = EXERCISES[workoutType][selectedExercise];
    setCurrentExercises([...currentExercises, {
      exercise_name: selectedExercise,
      sets: isStrength ? parseInt(sets) : 1,
      reps: parseInt(reps),
      weight: parseFloat(weight) || 0,
      group: exData.group
    }]);
    setSets(''); setReps(''); setWeight('');
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.workoutPanel}>
        <div style={styles.workoutHeader}>
          <h3 style={styles.workoutTitle}>Log {workoutType}</h3>
          <button onClick={() => {setIsLoggingWorkout(false); setCurrentExercises([])}} style={styles.closeBtn}><X /></button>
        </div>
        <div style={styles.inputGrid}>
          <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} style={styles.select}>
            {Object.keys(EXERCISES[workoutType] || {}).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <div style={styles.threeColRow}>
            {workoutType === 'strength' ? (
              <>
                <input type="number" value={sets} onChange={e => setSets(e.target.value)} style={styles.input} placeholder="Sets" />
                <input type="number" value={reps} onChange={e => setReps(e.target.value)} style={styles.input} placeholder="Reps" />
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={styles.input} placeholder="kg" />
              </>
            ) : (
              <input type="number" value={reps} onChange={e => setReps(e.target.value)} style={{...styles.input, gridColumn: 'span 3'}} placeholder="Duration (min)" />
            )}
          </div>
          <button onClick={addExercise} style={styles.addButton}>Add Exercise</button>
        </div>
        {currentExercises.length > 0 && (
          <div style={styles.exerciseListContainer}>
            <div style={styles.listScroll}>
              {currentExercises.map((ex, i) => (
                <div key={i} style={styles.exerciseItem}>
                  <span>{ex.exercise_name}</span>
                  <span style={{color: '#94a3b8'}}>{workoutType === 'strength' ? `${ex.sets}x${ex.reps}` : `${ex.reps}m`}</span>
                </div>
              ))}
            </div>
            <button onClick={finishWorkout} style={styles.finishButton}>{loading ? 'Saving...' : 'Complete Session'}</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allWorkouts, setAllWorkouts] = useState([]); // Now stores ALL workouts for the league
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [workoutType, setWorkoutType] = useState(null);
  const [currentExercises, setCurrentExercises] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Fetch ALL workouts from Neon to build the league
  const loadGlobalData = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/database?league=true`);
      const data = await res.json();
      setAllWorkouts(data.workouts || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { if (user?.email) loadGlobalData(); }, [user, loadGlobalData]);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/database', {
        method: 'POST',
        body: JSON.stringify({ action: 'auth', email, password, isRegistering })
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ email: data.email });
        localStorage.setItem('fitnessUser', JSON.stringify({ email: data.email }));
      } else alert(data.error);
    } catch (e) { alert("Auth failed"); }
    finally { setLoading(false); }
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm("Delete?")) return;
    await fetch(`/.netlify/functions/database?workoutId=${id}`, { method: 'DELETE' });
    loadGlobalData();
  };

  const finishWorkout = async () => {
    setLoading(true);
    try {
      await fetch('/.netlify/functions/database', {
        method: 'POST',
        body: JSON.stringify({ userEmail: user.email, exercises: currentExercises })
      });
      setIsLoggingWorkout(false);
      setCurrentExercises([]);
      loadGlobalData();
    } finally { setLoading(false); }
  };

  const stats = (() => {
    const myWorkouts = allWorkouts.filter(w => w.user_email === user?.email);
    const pbs = {};
    const muscleSplit = { Chest: 0, Legs: 0, Back: 0, Shoulders: 0, Arms: 0, Cardio: 0, Flexibility: 0 };
    
    myWorkouts.forEach(w => {
      w.exercises?.forEach(ex => {
        if (!pbs[ex.exercise_name] || ex.weight > pbs[ex.exercise_name]) pbs[ex.exercise_name] = ex.weight;
        if (muscleSplit[ex.group] !== undefined) muscleSplit[ex.group]++;
      });
    });

    // League Logic: Group all sessions by user email
    const leagueMap = allWorkouts.reduce((acc, w) => {
      acc[w.user_email] = (acc[w.user_email] || 0) + 1;
      return acc;
    }, {});

    const sortedLeague = Object.entries(leagueMap)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count);

    const topPBs = Object.entries(pbs).filter(([_, w]) => w > 0).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const recommendation = Object.entries(muscleSplit).sort((a, b) => a[1] - b[1])[0][0];

    return { myWorkouts, topPBs, muscleSplit, recommendation, sortedLeague };
  })();

  const getTimeInfo = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { msg: "Perfect for morning cardio", icon: <Sun size={18} color="#fbbf24" /> };
    if (hour < 18) return { msg: "Peak strength hours", icon: <Cloud size={18} color="#94a3b8" /> };
    return { msg: "Good time for flexibility", icon: <Moon size={18} color="#6366f1" /> };
  };

  if (!user) return <div style={styles.container}><AuthForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} isRegistering={isRegistering} setIsRegistering={setIsRegistering} handleAuth={handleAuth} loading={loading} /></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
          <p style={styles.greeting}>Focus: <span style={{color: '#fff'}}>{stats.recommendation}</span></p>
        </div>
        
        {/* NEW TOP RIGHT WIDGET */}
        <div style={styles.weatherWidget}>
          <div style={styles.weatherInfo}>
            <span style={styles.weatherDate}>{new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'})}</span>
            <span style={styles.weatherMsg}>{getTimeInfo().msg}</span>
          </div>
          <div style={styles.weatherIcon}>{getTimeInfo().icon}</div>
          <button onClick={() => { setUser(null); localStorage.removeItem('fitnessUser'); }} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Target size={20} color="#6366f1" /><h3>Personal Bests</h3></div>
          {stats.topPBs.map(([name, weight]) => (
            <div key={name} style={styles.pbItem}><span>{name}</span><span style={{color: '#6366f1', fontWeight: 'bold'}}>{weight}kg</span></div>
          ))}
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}><Zap size={20} color="#fbbf24" /><h3>Muscle Balance</h3></div>
          {Object.entries(stats.muscleSplit).map(([group, count]) => (
            <div key={group} style={styles.balanceRow}>
              <span style={{fontSize: '11px', width: '75px'}}>{group}</span>
              <div style={styles.barContainer}><div style={{...styles.barFill, width: `${Math.min(100, count * 15)}%`}} /></div>
            </div>
          ))}
        </div>

        <div style={styles.splitGrid}>
          {/* Real Neon History */}
          <div style={styles.card}>
            <div style={styles.cardHeader}><Calendar size={18} color="#6366f1" /><h3>Your History</h3></div>
            <div style={styles.scrollList}>
              {stats.myWorkouts.slice(0, 10).map((w, i) => (
                <div key={i} style={styles.sessionItem}>
                  <div style={{display: 'flex', gap: '12px'}}>
                    <span style={styles.sessionDate}>{new Date(w.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    <span style={{color: '#94a3b8', fontSize: '13px'}}>{w.exercises?.[0]?.exercise_name}...</span>
                  </div>
                  <button onClick={() => deleteWorkout(w.id)} style={styles.deleteBtn}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          {/* Real Neon League */}
          <div style={styles.card}>
            <div style={styles.cardHeader}><Trophy size={18} color="#fbbf24" /><h3>Global League</h3></div>
            <div style={styles.scrollList}>
              {stats.sortedLeague.map((entry, i) => (
                <div key={entry.email} style={{...styles.leagueItem, borderLeft: entry.email === user.email ? '4px solid #6366f1' : 'none'}}>
                  <div style={styles.rankCircle}>{i + 1}</div>
                  <div style={styles.leagueInfo}>
                    <span>{entry.email.split('@')[0]} {entry.email === user.email && '(You)'}</span>
                    <small>{entry.count} Sessions</small>
                  </div>
                  {i === 0 && <Medal size={16} color="#fbbf24" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.fabContainer}>
        <button onClick={() => {setWorkoutType('strength'); setIsLoggingWorkout(true)}} style={{...styles.fab, background: '#6366f1'}}><Dumbbell size={18}/> Strength</button>
        <button onClick={() => {setWorkoutType('cardio'); setIsLoggingWorkout(true)}} style={{...styles.fab, background: '#ec4899'}}><Heart size={18}/> Cardio</button>
        <button onClick={() => {setWorkoutType('stretch'); setIsLoggingWorkout(true)}} style={{...styles.fab, background: '#10b981'}}><Wind size={18}/> Stretch</button>
      </div>

      {isLoggingWorkout && <WorkoutPanel workoutType={workoutType} setIsLoggingWorkout={setIsLoggingWorkout} setCurrentExercises={setCurrentExercises} currentExercises={currentExercises} finishWorkout={finishWorkout} loading={loading} />}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '25px', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'flex-start' },
  brandTitle: { color: '#6366f1', margin: 0, fontWeight: '800', fontSize: '24px' },
  greeting: { color: '#94a3b8', margin: '4px 0', fontSize: '14px' },
  
  weatherWidget: { display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' },
  weatherInfo: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
  weatherDate: { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' },
  weatherMsg: { fontSize: '12px', color: '#f1f5f9', fontWeight: '500' },
  weatherIcon: { background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' },
  logoutBtn: { marginLeft: '10px', background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', opacity: 0.7 },

  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', paddingBottom: '100px' },
  splitGrid: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  card: { background: '#1e293b', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' },
  pbItem: { display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#0f172a', borderRadius: '12px', marginBottom: '8px' },
  balanceRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  barContainer: { flex: 1, height: '6px', background: '#0f172a', borderRadius: '3px' },
  barFill: { height: '100%', background: '#fbbf24', borderRadius: '3px' },
  scrollList: { maxHeight: '250px', overflowY: 'auto' },
  sessionItem: { display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '8px' },
  sessionDate: { color: '#6366f1', fontWeight: 'bold', fontSize: '13px' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' },
  leagueItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '8px' },
  rankCircle: { width: '24px', height: '24px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' },
  leagueInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  fabContainer: { position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 },
  fab: { padding: '12px 20px', borderRadius: '25px', border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  workoutPanel: { background: '#1e293b', padding: '25px', borderRadius: '25px', width: '90%', maxWidth: '400px' },
  workoutHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  threeColRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  input: { padding: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '10px', width: '100%', boxSizing: 'border-box' },
  select: { padding: '12px', background: '#0f172a', color: '#fff', borderRadius: '10px', width: '100%', border: '1px solid #334155' },
  addButton: { padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid #6366f1', borderRadius: '10px', fontWeight: 'bold', marginTop: '5px' },
  finishButton: { width: '100%', padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '10px' },
  authCard: { maxWidth: '380px', margin: '100px auto', background: '#1e293b', padding: '40px', borderRadius: '30px', textAlign: 'center' },
  authInput: { width: '100%', padding: '14px', margin: '8px 0', background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' },
  authButton: { width: '100%', padding: '14px', background: '#6366f1', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' },
  toggleButton: { background: 'none', border: 'none', color: '#6366f1', marginTop: '20px', cursor: 'pointer' }
};

export default Dashboard;
