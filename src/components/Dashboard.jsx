import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Dumbbell, TrendingUp, Calendar, Heart, Sparkles, CheckCircle2, Trash2, Plus, X, Wind, Target, Zap, Trophy, Medal, Cloud, Sun, Moon, Loader2 } from 'lucide-react';

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
      <p style={styles.authSubtitle}>Connect to your Neon database</p>
    </div>
    <div style={styles.authForm}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.authInput} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.authInput} />
      <button onClick={handleAuth} style={styles.authButton} disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={20} /> : (isRegistering ? 'Create Account' : 'Sign In')}
      </button>
      <button onClick={() => setIsRegistering(!isRegistering)} style={styles.toggleButton}>
        {isRegistering ? 'Back to Login' : "Don't have an account? Register"}
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
          <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
             <Dumbbell size={20} color="#6366f1" />
             <h3 style={styles.workoutTitle}>New {workoutType} Session</h3>
          </div>
          <button onClick={() => {setIsLoggingWorkout(false); setCurrentExercises([])}} style={styles.closeBtn}><X /></button>
        </div>
        <div style={styles.inputGrid}>
          <label style={styles.label}>EXERCISE</label>
          <select value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} style={styles.select}>
            {Object.keys(EXERCISES[workoutType] || {}).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <div style={styles.threeColRow}>
            {workoutType === 'strength' ? (
              <>
                <div style={styles.inputStack}><label style={styles.label}>SETS</label><input type="number" value={sets} onChange={e => setSets(e.target.value)} style={styles.input} /></div>
                <div style={styles.inputStack}><label style={styles.label}>REPS</label><input type="number" value={reps} onChange={e => setReps(e.target.value)} style={styles.input} /></div>
                <div style={styles.inputStack}><label style={styles.label}>KG</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} style={styles.input} /></div>
              </>
            ) : (
              <div style={{gridColumn: 'span 3'}}><label style={styles.label}>DURATION (MINS)</label><input type="number" value={reps} onChange={e => setReps(e.target.value)} style={styles.input} /></div>
            )}
          </div>
          <button onClick={addExercise} style={styles.addButton}>Add to Session</button>
        </div>
        {currentExercises.length > 0 && (
          <div style={styles.exerciseListContainer}>
            <div style={styles.listScroll}>
              {currentExercises.map((ex, i) => (
                <div key={i} style={styles.exerciseItem}>
                  <span>{ex.exercise_name}</span>
                  <span style={{color: '#94a3b8'}}>{workoutType === 'strength' ? `${ex.sets}x${ex.reps} @ ${ex.weight}kg` : `${ex.reps}m`}</span>
                </div>
              ))}
            </div>
            <button onClick={finishWorkout} disabled={loading} style={styles.finishButton}>
              {loading ? 'Saving to Neon...' : 'Finish Workout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD ---

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  const [workoutType, setWorkoutType] = useState(null);
  const [currentExercises, setCurrentExercises] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
    else setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/database?league=true`);
      const data = await res.json();
      setAllWorkouts(data.workouts || []);
    } catch (e) { console.error("Database fetch error:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (user?.email) loadData(); }, [user, loadData]);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/database', {
        method: 'POST',
        body: JSON.stringify({ action: 'auth', email, password, isRegistering })
      });
      const data = await res.json();
      if (res.ok) {
        const newUser = { email: data.email };
        setUser(newUser);
        localStorage.setItem('fitnessUser', JSON.stringify(newUser));
      } else alert(data.error);
    } catch (e) { alert("Auth failed"); }
    finally { setLoading(false); }
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    await fetch(`/.netlify/functions/database?workoutId=${id}`, { method: 'DELETE' });
    loadData();
  };

  const finishWorkout = async () => {
    try {
      await fetch('/.netlify/functions/database', {
        method: 'POST',
        body: JSON.stringify({ userEmail: user.email, exercises: currentExercises })
      });
      setIsLoggingWorkout(false);
      setCurrentExercises([]);
      loadData();
    } catch (e) { alert("Save failed"); }
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

  const getTimeIcon = () => {
    const hr = new Date().getHours();
    if (hr < 12) return <Sun size={18} color="#fbbf24" />;
    if (hr < 18) return <Cloud size={18} color="#94a3b8" />;
    return <Moon size={18} color="#6366f1" />;
  };

  if (!user) return <div style={styles.container}><AuthForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} isRegistering={isRegistering} setIsRegistering={setIsRegistering} handleAuth={handleAuth} loading={loading} /></div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
          <p style={styles.greeting}>Focus: <span style={{color: '#818cf8', fontWeight: 'bold'}}>{stats.recommendation}</span></p>
        </div>
        
        <div style={styles.topRightWidget}>
          <div style={styles.weatherText}>
            <span style={styles.weatherDate}>{new Date().toLocaleDateString(undefined, {weekday: 'long', day:'numeric', month:'short'}).toUpperCase()}</span>
            <span style={styles.weatherStatus}>Peak strength hours</span>
          </div>
          <div style={styles.weatherIcon}>{getTimeIcon()}</div>
          <button onClick={() => { setUser(null); localStorage.removeItem('fitnessUser'); }} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Personal Bests */}
        <div style={styles.card}>
          <div style={styles.cardHeader}><Target size={18} color="#6366f1" /><h3>Personal Bests</h3></div>
          <div style={styles.cardContent}>
            {stats.topPBs.length > 0 ? stats.topPBs.map(([name, weight]) => (
              <div key={name} style={styles.pbItem}><span>{name}</span><span style={{color: '#6366f1', fontWeight: 'bold'}}>{weight}kg</span></div>
            )) : <p style={styles.emptyMsg}>No records yet. Start lifting!</p>}
          </div>
        </div>

        {/* Muscle Balance */}
        <div style={styles.card}>
          <div style={styles.cardHeader}><Zap size={18} color="#fbbf24" /><h3>Muscle Balance</h3></div>
          <div style={styles.cardContent}>
            {Object.entries(stats.muscleSplit).map(([group, count]) => (
              <div key={group} style={styles.balanceRow}>
                <span style={styles.balanceLabel}>{group}</span>
                <div style={styles.barContainer}><div style={{...styles.barFill, width: `${Math.min(100, count * 20)}%`}} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Split Layout */}
        <div style={styles.splitGrid}>
          {/* Your History */}
          <div style={styles.card}>
            <div style={styles.cardHeader}><Calendar size={18} color="#6366f1" /><h3>Your History</h3></div>
            <div style={styles.scrollList}>
              {loading ? <div style={styles.loaderBox}><Loader2 className="animate-spin" /></div> : 
               stats.myWorkouts.length > 0 ? stats.myWorkouts.map((w, i) => (
                <div key={i} style={styles.sessionItem}>
                  <div>
                    <span style={styles.sessionDate}>{new Date(w.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    <span style={styles.sessionType}>{w.exercises?.[0]?.exercise_name || 'Workout'}</span>
                  </div>
                  <button onClick={() => deleteWorkout(w.id)} style={styles.deleteBtn}><Trash2 size={14}/></button>
                </div>
              )) : <p style={styles.emptyMsg}>No sessions found.</p>}
            </div>
          </div>

          {/* Global League */}
          <div style={styles.card}>
            <div style={styles.cardHeader}><Trophy size={18} color="#fbbf24" /><h3>Global League</h3></div>
            <div style={styles.scrollList}>
              {loading ? <div style={styles.loaderBox}><Loader2 className="animate-spin" /></div> :
               stats.sortedLeague.length > 0 ? stats.sortedLeague.map((entry, i) => (
                <div key={entry.email} style={{...styles.leagueItem, borderLeft: entry.email === user.email ? '3px solid #6366f1' : 'none'}}>
                  <div style={styles.rankCircle}>{i + 1}</div>
                  <div style={styles.leagueInfo}>
                    <span style={{fontSize: '13px'}}>{entry.email.split('@')[0]} {entry.email === user.email && '⭐'}</span>
                    <small style={{color: '#94a3b8'}}>{entry.count} Sessions</small>
                  </div>
                  {i === 0 && <Medal size={16} color="#fbbf24" />}
                </div>
              )) : <p style={styles.emptyMsg}>League is empty.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
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
  container: { minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', padding: '30px', fontFamily: 'Inter, system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' },
  brandTitle: { color: '#6366f1', margin: 0, fontWeight: '800', fontSize: '26px' },
  greeting: { color: '#94a3b8', margin: '4px 0', fontSize: '14px' },
  
  topRightWidget: { display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' },
  weatherText: { display: 'flex', flexDirection: 'column', textAlign: 'right' },
  weatherDate: { fontSize: '10px', color: '#94a3b8', letterSpacing: '0.05em' },
  weatherStatus: { fontSize: '12px', color: '#fff' },
  weatherIcon: { background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '10px' },
  logoutBtn: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },

  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', paddingBottom: '100px' },
  splitGrid: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  card: { background: '#161d2f', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' },
  cardContent: { flex: 1 },
  
  pbItem: { display: 'flex', justifyContent: 'space-between', padding: '14px', background: '#0a0f1d', borderRadius: '15px', marginBottom: '10px' },
  balanceRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  balanceLabel: { fontSize: '12px', width: '80px', color: '#94a3b8' },
  barContainer: { flex: 1, height: '6px', background: '#0a0f1d', borderRadius: '3px' },
  barFill: { height: '100%', background: '#6366f1', borderRadius: '3px', transition: 'width 0.5s ease' },
  
  scrollList: { maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' },
  sessionItem: { display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', marginBottom: '10px' },
  sessionDate: { color: '#6366f1', fontWeight: 'bold', fontSize: '13px', marginRight: '15px' },
  sessionType: { color: '#fff', fontSize: '13px' },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 },
  
  leagueItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', marginBottom: '10px' },
  rankCircle: { width: '28px', height: '28px', borderRadius: '50%', background: '#0a0f1d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' },
  leagueInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  
  emptyMsg: { color: '#475569', textAlign: 'center', padding: '40px 0', fontSize: '14px' },
  loaderBox: { display: 'flex', justifyContent: 'center', padding: '40px' },

  fabContainer: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px', zIndex: 10 },
  fab: { padding: '14px 24px', borderRadius: '20px', border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', gap: '10px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', fontSize: '14px' },
  
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  workoutPanel: { background: '#161d2f', padding: '30px', borderRadius: '30px', width: '90%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)' },
  workoutHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' },
  workoutTitle: { margin: 0, fontSize: '20px' },
  label: { fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', display: 'block' },
  inputGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  threeColRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' },
  inputStack: { display: 'flex', flexDirection: 'column' },
  input: { padding: '14px', background: '#0a0f1d', border: '1px solid #1e293b', color: '#fff', borderRadius: '12px', width: '100%', boxSizing: 'border-box' },
  select: { padding: '14px', background: '#0a0f1d', color: '#fff', borderRadius: '12px', width: '100%', border: '1px solid #1e293b' },
  addButton: { padding: '14px', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid #6366f1', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  finishButton: { width: '100%', padding: '16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', marginTop: '15px', cursor: 'pointer' },
  exerciseListContainer: { marginTop: '25px', borderTop: '1px solid #1e293b', paddingTop: '20px' },
  listScroll: { maxHeight: '120px', overflowY: 'auto' },
  exerciseItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' },
  
  authCard: { maxWidth: '400px', margin: '100px auto', background: '#161d2f', padding: '40px', borderRadius: '30px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' },
  authInput: { width: '100%', padding: '16px', margin: '10px 0', background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' },
  authButton: { width: '100%', padding: '16px', background: '#6366f1', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', marginTop: '15px', display: 'flex', justifyContent: 'center' },
  toggleButton: { background: 'none', border: 'none', color: '#6366f1', marginTop: '20px', cursor: 'pointer' }
};

export default Dashboard;
