import React, { useState, useEffect, useCallback } from 'react';
import { Dumbbell, Calendar, Heart, Sparkles, Trash2, X, Trophy, Medal, Sun, Moon, Cloud, Loader2, Target, Zap, Wind } from 'lucide-react';

const EXERCISES = {
  strength: {
    'Bench Press': { group: 'Chest' }, 'Squat': { group: 'Legs' }, 'Deadlift': { group: 'Back' },
    'Overhead Press': { group: 'Shoulders' }, 'Rows': { group: 'Back' }, 'Bicep Curls': { group: 'Arms' }
  },
  cardio: { 'Running': { group: 'Cardio' }, 'Cycling': { group: 'Cardio' }, 'Swimming': { group: 'Cardio' } },
  stretch: { 'Yoga': { group: 'Flexibility' }, 'Mobility Work': { group: 'Flexibility' } }
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [isLogging, setIsLogging] = useState(false);
  const [workoutType, setWorkoutType] = useState('strength');
  const [loading, setLoading] = useState(true);
  
  // Input states for logging
  const [selectedEx, setSelectedEx] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  // Auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isReg, setIsReg] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/database`);
      const data = await res.json();
      setAllWorkouts(data.workouts || []);
    } catch (e) { console.error("Sync error", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
    else setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const finishWorkout = async () => {
    if (!selectedEx) return alert("Select an exercise first");
    setLoading(true);
    
    const exerciseData = {
      exercise_name: selectedEx,
      sets: sets || 1,
      reps: reps || 0,
      weight: weight || 0
    };

    await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ 
        userEmail: user.email, 
        exercises: [exerciseData] 
      })
    });
    
    setIsLogging(false);
    setSelectedEx(''); setSets(''); setReps(''); setWeight('');
    loadData();
  };

  const handleAuth = async () => {
    setLoading(true);
    const res = await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ action: 'auth', email, password, isRegistering: isReg })
    });
    const data = await res.json();
    if (res.ok) {
      setUser({ email: data.email });
      localStorage.setItem('fitnessUser', JSON.stringify({ email: data.email }));
    } else alert(data.error);
    setLoading(false);
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm("Delete session?")) return;
    await fetch(`/.netlify/functions/database?workoutId=${id}`, { method: 'DELETE' });
    loadData();
  };

  const stats = (() => {
    const myLogs = allWorkouts.filter(w => w.user_email === user?.email);
    const muscleSplit = { Chest: 0, Legs: 0, Back: 0, Shoulders: 0, Arms: 0, Cardio: 0, Flexibility: 0 };
    
    myLogs.forEach(w => {
      w.exercises?.forEach(ex => {
        const info = EXERCISES.strength[ex.exercise_name] || EXERCISES.cardio[ex.exercise_name] || EXERCISES.stretch[ex.exercise_name];
        if (info) muscleSplit[info.group]++;
      });
    });

    const leagueMap = allWorkouts.reduce((acc, w) => {
      acc[w.user_email] = (acc[w.user_email] || 0) + 1;
      return acc;
    }, {});

    const sortedLeague = Object.entries(leagueMap)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count);

    return { myLogs, muscleSplit, sortedLeague };
  })();

  if (!user) return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        <Sparkles size={40} color="#6366f1" />
        <h2 style={{margin: '20px 0'}}>Fit as a Fiddle</h2>
        <input style={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={styles.mainBtn} onClick={handleAuth}>{isReg ? 'Create Account' : 'Sign In'}</button>
        <button style={styles.textBtn} onClick={() => setIsReg(!isReg)}>
          {isReg ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
          <p style={styles.greeting}>Live Neon Database connected</p>
        </div>
        <div style={styles.topRightWidget}>
          <div style={{textAlign: 'right'}}>
            <div style={styles.weatherDate}>{new Date().toLocaleDateString(undefined, {weekday: 'long', day:'numeric', month:'short'}).toUpperCase()}</div>
            <div style={styles.weatherStatus}>Peak strength hours</div>
          </div>
          <div style={styles.weatherIcon}><Sun size={18} color="#fbbf24" /></div>
          <button onClick={() => {setUser(null); localStorage.removeItem('fitnessUser');}} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Target size={18} color="#6366f1" /><h3>Quick Stats</h3></div>
          <div style={styles.pbItem}><span>Total Sessions</span><span style={{color: '#6366f1', fontWeight: 'bold'}}>{stats.myLogs.length}</span></div>
          <div style={styles.pbItem}><span>Global Rank</span><span style={{color: '#6366f1', fontWeight: 'bold'}}>#{stats.sortedLeague.findIndex(e => e.email === user.email) + 1}</span></div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}><Zap size={18} color="#fbbf24" /><h3>Muscle Balance</h3></div>
          {Object.entries(stats.muscleSplit).map(([group, count]) => (
            <div key={group} style={styles.balanceRow}>
              <span style={{fontSize: '11px', width: '75px', color: '#94a3b8'}}>{group}</span>
              <div style={styles.barContainer}><div style={{...styles.barFill, width: `${Math.min(100, count * 15)}%`}} /></div>
            </div>
          ))}
        </div>

        <div style={styles.splitGrid}>
          <div style={styles.card}>
            <div style={styles.cardHeader}><Calendar size={18} color="#6366f1" /><h3>Your History</h3></div>
            <div style={styles.scrollList}>
              {stats.myLogs.length > 0 ? stats.myLogs.map((w, i) => (
                <div key={i} style={styles.sessionItem}>
                  <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                    <span style={styles.sessionDate}>{new Date(w.created_at).toLocaleDateString(undefined, {day:'numeric', month:'short'})}</span>
                    <span style={{color: '#fff', fontSize: '14px'}}>{w.exercises?.[0]?.exercise_name || 'Workout'}</span>
                  </div>
                  <button onClick={() => deleteWorkout(w.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}><Trash2 size={14}/></button>
                </div>
              )) : <p style={styles.emptyMsg}>No sessions found.</p>}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}><Trophy size={18} color="#fbbf24" /><h3>Global League</h3></div>
            <div style={styles.scrollList}>
              {stats.sortedLeague.map((entry, i) => (
                <div key={i} style={{...styles.leagueItem, borderLeft: entry.email === user.email ? '3px solid #6366f1' : 'none'}}>
                  <div style={styles.rankCircle}>{i + 1}</div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '13px'}}>{entry.email.split('@')[0]} {entry.email === user.email && '⭐'}</div>
                    <small style={{color: '#94a3b8'}}>{entry.count} Workouts</small>
                  </div>
                  {i === 0 && <Medal size={16} color="#fbbf24" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.fabContainer}>
        <button onClick={() => {setWorkoutType('strength'); setIsLogging(true); setSelectedEx('Bench Press')}} style={{...styles.fab, background: '#6366f1'}}><Dumbbell size={18}/> Strength</button>
        <button onClick={() => {setWorkoutType('cardio'); setIsLogging(true); setSelectedEx('Running')}} style={{...styles.fab, background: '#ec4899'}}><Heart size={18}/> Cardio</button>
      </div>

      {isLogging && (
        <div style={styles.modalOverlay}>
          <div style={styles.workoutPanel}>
            <div style={styles.workoutHeader}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <Dumbbell size={20} color="#6366f1" />
                <h3 style={{margin:0}}>New {workoutType} Session</h3>
              </div>
              <button onClick={() => setIsLogging(false)} style={styles.textBtn}><X /></button>
            </div>
            
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              <div>
                <label style={styles.label}>EXERCISE</label>
                <select style={styles.input} value={selectedEx} onChange={(e) => setSelectedEx(e.target.value)}>
                  {Object.keys(EXERCISES[workoutType]).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>

              {workoutType === 'strength' && (
                <div style={styles.inputGrid}>
                  <div><label style={styles.label}>SETS</label><input type="number" style={styles.input} value={sets} onChange={e=>setSets(e.target.value)} /></div>
                  <div><label style={styles.label}>REPS</label><input type="number" style={styles.input} value={reps} onChange={e=>setReps(e.target.value)} /></div>
                  <div><label style={styles.label}>KG</label><input type="number" style={styles.input} value={weight} onChange={e=>setWeight(e.target.value)} /></div>
                </div>
              )}

              {workoutType === 'cardio' && (
                <div><label style={styles.label}>DURATION (MIN)</label><input type="number" style={styles.input} value={reps} onChange={e=>setReps(e.target.value)} /></div>
              )}

              <button style={styles.mainBtn} onClick={finishWorkout}>Finish & Save to Neon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', padding: '30px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px', alignItems: 'center' },
  brandTitle: { color: '#6366f1', margin: 0, fontWeight: '800' },
  greeting: { color: '#94a3b8', fontSize: '14px' },
  topRightWidget: { display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  weatherDate: { fontSize: '10px', color: '#94a3b8' },
  weatherStatus: { fontSize: '12px', color: '#fff' },
  logoutBtn: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', paddingBottom: '100px' },
  splitGrid: { gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  card: { background: '#161d2f', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' },
  cardHeader: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' },
  pbItem: { display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#0a0f1d', borderRadius: '12px', marginBottom: '8px' },
  balanceRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  barContainer: { flex: 1, height: '6px', background: '#0a0f1d', borderRadius: '3px' },
  barFill: { height: '100%', background: '#6366f1', borderRadius: '3px' },
  scrollList: { maxHeight: '300px', overflowY: 'auto' },
  sessionItem: { display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', marginBottom: '10px' },
  sessionDate: { color: '#6366f1', fontWeight: 'bold', fontSize: '13px' },
  leagueItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', marginBottom: '10px' },
  rankCircle: { width: '28px', height: '28px', background: '#0a0f1d', borderRadius: '50%', textAlign: 'center', lineHeight: '28px', fontSize: '12px' },
  fabContainer: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '15px' },
  fab: { padding: '14px 24px', borderRadius: '20px', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', gap: '10px', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  workoutPanel: { background: '#161d2f', padding: '30px', borderRadius: '25px', width: '90%', maxWidth: '420px', border: '1px solid rgba(255,255,255,0.1)' },
  workoutHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' },
  label: { fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', display: 'block' },
  inputGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', background: '#0a0f1d', color: '#fff', border: '1px solid #1e293b', boxSizing: 'border-box' },
  mainBtn: { width: '100%', padding: '16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' },
  textBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' },
  authCard: { maxWidth: '380px', margin: '100px auto', background: '#161d2f', padding: '40px', borderRadius: '30px', textAlign: 'center' },
  emptyMsg: { color: '#475569', textAlign: 'center', padding: '40px' }
};

export default Dashboard;
