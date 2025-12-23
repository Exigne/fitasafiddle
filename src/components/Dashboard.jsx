import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Dumbbell, TrendingUp, Calendar, Heart, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';

// ... (Keep EXERCISES and AuthForm constants from previous version)

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

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => { if (user?.email) loadWorkouts(); }, [user]);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/.netlify/functions/database?user=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setWorkouts(Array.isArray(data.workouts) ? data.workouts : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user]);

  const deleteWorkout = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await fetch(`/.netlify/functions/database?workoutId=${id}`, { method: 'DELETE' });
      loadWorkouts();
    } catch (err) { alert("Delete failed"); }
  };

  const calculateStats = useCallback(() => {
    const uniqueDates = [...new Set(workouts.map(w => new Date(w.created_at).toDateString()))];
    
    // Calculate last 7 days volume for chart
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toDateString();
      const dayVol = workouts
        .filter(w => new Date(w.created_at).toDateString() === dateStr)
        .reduce((s, w) => s + (w.exercises?.reduce((exS, ex) => exS + (ex.sets * ex.reps * (ex.weight || 0)), 0) || 0), 0);
      return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), value: dayVol };
    });

    const totalVol = workouts.reduce((s, w) => s + (w.exercises?.reduce((exS, ex) => exS + (ex.sets * ex.reps * (ex.weight || 0)), 0) || 0), 0);
    
    return {
      count: workouts.length,
      volume: Math.round(totalVol),
      streak: uniqueDates.length,
      activeDates: uniqueDates,
      chartData,
      consistency: Math.min(100, Math.round((uniqueDates.length / 12) * 100))
    };
  }, [workouts]);

  if (!user) return <div style={styles.container}><AuthForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} isRegistering={isRegistering} setIsRegistering={setIsRegistering} handleAuth={handleAuth} loading={loading} /></div>;

  const stats = calculateStats();
  const maxVol = Math.max(...stats.chartData.map(d => d.value), 1);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={styles.brandContainer}><Sparkles size={24} color="#6366f1" /><h1 style={styles.brandTitle}>Fit as a Fiddle</h1></div>
          <p style={styles.greeting}>Welcome back, {user.email.split('@')[0]}</p>
        </div>
        <button onClick={() => { setUser(null); localStorage.removeItem('fitnessUser'); }} style={styles.logoutBtn}>Sign Out</button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}><div style={styles.statIcon}><Dumbbell size={20} /></div><div><div style={styles.statValue}>{stats.count}</div><div style={styles.statLabel}>Sessions</div></div></div>
        <div style={styles.statCard}><div style={{...styles.statIcon, background: '#10b981'}}><TrendingUp size={20} /></div><div><div style={styles.statValue}>{stats.volume}kg</div><div style={styles.statLabel}>Total Volume</div></div></div>
        <div style={styles.statCard}><div style={{...styles.statIcon, background: '#6366f1'}}><CheckCircle2 size={20} /></div><div><div style={styles.statValue}>{stats.consistency}%</div><div style={styles.statLabel}>Consistency</div></div></div>
      </div>

      <div style={styles.mainGrid}>
        {/* CHART SECTION */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📈 Weekly Volume (kg)</h3>
          <div style={styles.chartContainer}>
            {stats.chartData.map((d, i) => (
              <div key={i} style={styles.chartBarCol}>
                <div style={{...styles.chartBar, height: `${(d.value / maxVol) * 100}%`}}>
                  {d.value > 0 && <span style={styles.barTooltip}>{Math.round(d.value)}</span>}
                </div>
                <span style={styles.chartLabel}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVITY MAP */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🔥 Activity Map</h3>
          <div style={styles.calendarGrid}>
            {Array.from({ length: 28 }).map((_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (27 - i));
              const active = stats.activeDates.includes(d.toDateString());
              return <div key={i} title={d.toDateString()} style={{...styles.calendarDot, background: active ? '#6366f1' : 'rgba(255,255,255,0.05)'}} />;
            })}
          </div>
        </div>

        {/* RECENT HISTORY WITH DELETE */}
        <div style={{...styles.card, gridColumn: '1 / -1'}}>
          <h3 style={styles.cardTitle}>📅 Recent History</h3>
          <div style={styles.sessionList}>
            {workouts.map((w, i) => (
              <div key={i} style={styles.sessionItem}>
                <div style={styles.sessionDate}>{new Date(w.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                <div style={styles.sessionName}>
                   {w.exercises?.slice(0, 3).map(ex => ex.exercise_name).join(', ')}
                   {w.exercises?.length > 3 && '...'}
                </div>
                <div style={styles.sessionActions}>
                  <button onClick={() => deleteWorkout(w.id)} style={styles.deleteBtn}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ... WorkoutPanel Modal and FAB buttons remain the same ... */}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '24px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px' },
  brandContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  brandTitle: { fontSize: '24px', color: '#6366f1', margin: 0 },
  greeting: { margin: '4px 0', color: '#94a3b8' },
  logoutBtn: { padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: { background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' },
  statIcon: { width: '40px', height: '40px', borderRadius: '10px', background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: '20px', fontWeight: 'bold' },
  statLabel: { fontSize: '12px', color: '#94a3b8' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' },
  card: { background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  cardTitle: { fontSize: '18px', margin: '0 0 16px 0' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' },
  calendarDot: { aspectRatio: '1/1', borderRadius: '3px' },
  streakBig: { fontSize: '32px', fontWeight: 'bold', color: '#6366f1' },
  streakSub: { color: '#94a3b8', marginBottom: '12px' },
  sessionItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  sessionDate: { color: '#94a3b8', width: '60px' },
  sessionName: { flex: 1, fontWeight: '500' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  workoutPanel: { background: '#1e1b4b', width: '90%', maxWidth: '450px', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' },
  workoutHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  inputGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputRow: { display: 'flex', gap: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  label: { fontSize: '12px', color: '#94a3b8' },
  input: { padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' },
  select: { padding: '10px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '8px' },
  addButton: { padding: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  finishButton: { width: '100%', padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
  fabContainer: { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px' },
  fab: { padding: '12px 20px', borderRadius: '30px', border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' },
  closeBtn: { background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' },
  exerciseList: { marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' },
  listScroll: { maxHeight: '150px', overflowY: 'auto', marginBottom: '16px' },
  exerciseItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' },
  exerciseDetails: { color: '#94a3b8' },
  authCard: { maxWidth: '400px', margin: '100px auto', padding: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', textAlign: 'center' },
  authInput: { width: '100%', padding: '12px', margin: '8px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxSizing: 'border-box' },
  authButton: { width: '100%', padding: '14px', background: '#6366f1', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', marginTop: '16px' },
  toggleButton: { background: 'none', border: 'none', color: '#6366f1', marginTop: '12px', cursor: 'pointer' }
};

export default Dashboard;
