import React from 'react';

const EXERCISES = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Pull-ups', 'Barbell Row', 'Lunges'];

const Dashboard = ({ currentUser, onLogout }) => {
  const [workouts, setWorkouts] = React.useState([]);
  const [leaderboard, setLeaderboard] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  // Form State
  const [exercise, setExercise] = React.useState(EXERCISES[0]);
  const [sets, setSets] = React.useState('');
  const [reps, setReps] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch User History
      const historyRes = await fetch(`/.netlify/functions/database?user=${encodeURIComponent(currentUser.email)}`);
      const historyData = await historyRes.json();
      setWorkouts(Array.isArray(historyData) ? historyData : []);

      // 2. Fetch Leaderboard (We'll update the backend for this)
      const leaderRes = await fetch(`/.netlify/functions/database?action=leaderboard`);
      const leaderData = await leaderRes.json();
      setLeaderboard(Array.isArray(leaderData) ? leaderData : []);
    } catch (err) {
      setError('Connection failed. Check your DATABASE_URL in Netlify.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sets || !reps || !weight) return;
    setSaving(true);
    try {
      await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createWorkout',
          userEmail: currentUser.email,
          exercise,
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: parseFloat(weight)
        })
      });
      setSets(''); setReps(''); setWeight('');
      loadData();
    } catch (err) {
      setError('Failed to save workout.');
    } finally {
      setSaving(false);
    }
  };

  // Helper: Calculate total volume for the graph
  const chartData = workouts.slice(0, 7).reverse();

  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <nav style={sidebarStyle}>
        <h2 style={{ color: '#6366f1', marginBottom: '2rem' }}>FitFiddle</h2>
        <div style={navItemActive}>Dashboard</div>
        <div style={navItem}>History</div>
        <div style={navItem}>Settings</div>
        <button onClick={onLogout} style={logoutBtnStyle}>Sign Out</button>
      </nav>

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        <header style={headerStyle}>
          <h1>Welcome back, {currentUser?.email.split('@')[0]}</h1>
          <p>Here is what's happening with your fitness today.</p>
        </header>

        {error && <div style={errorStyle}>{error}</div>}

        {/* TOP STATS */}
        <div style={statsGrid}>
          <div style={statCard}><h3>Total Workouts</h3><p style={statNum}>{workouts.length}</p></div>
          <div style={statCard}><h3>Max Weight</h3><p style={statNum}>{Math.max(...workouts.map(w => w.weight), 0)} kg</p></div>
          <div style={statCard}><h3>Rank</h3><p style={statNum}>#{leaderboard.findIndex(l => l.user_email === currentUser.email) + 1 || '?'}</p></div>
        </div>

        <div style={layoutGrid}>
          {/* LEFT COLUMN: LOGGING & GRAPHS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <section style={cardStyle}>
              <h2 style={cardTitle}>Log New Exercise</h2>
              <form onSubmit={handleSave} style={formStyle}>
                <select value={exercise} onChange={e => setExercise(e.target.value)} style={inputStyle}>
                  {EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <input type="number" placeholder="Sets" value={sets} onChange={e => setSets(e.target.value)} style={inputStyle} />
                  <input type="number" placeholder="Reps" value={reps} onChange={e => setReps(e.target.value)} style={inputStyle} />
                  <input type="number" placeholder="kg" value={weight} onChange={e => setWeight(e.target.value)} style={inputStyle} />
                </div>
                <button type="submit" disabled={saving} style={submitBtnStyle}>
                  {saving ? 'Saving...' : 'Add to Journal'}
                </button>
              </form>
            </section>

            <section style={cardStyle}>
              <h2 style={cardTitle}>Volume Progress (Last 7)</h2>
              <div style={chartContainer}>
                {chartData.map((w, i) => (
                  <div key={i} style={barWrapper}>
                    <div style={{ ...barStyle, height: `${(w.weight / 150) * 100}%` }}></div>
                    <span style={barLabel}>{w.exercise.substring(0, 3)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: LEADERBOARD */}
          <section style={cardStyle}>
            <h2 style={cardTitle}>League Table</h2>
            <table style={tableStyle}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                  <th>User</th>
                  <th>Sets</th>
                  <th>Volume</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, i) => (
                  <tr key={i} style={user.user_email === currentUser.email ? activeRowStyle : rowStyle}>
                    <td>{user.user_email.split('@')[0]}</td>
                    <td>{user.total_sets}</td>
                    <td>{user.total_weight}kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

// --- STYLES (Modern & Sleek) ---
const containerStyle = { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' };
const sidebarStyle = { width: '240px', background: 'white', padding: '2rem', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const mainStyle = { flex: 1, padding: '2rem', maxWidth: '1200px' };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' };
const layoutGrid = { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' };
const cardStyle = { background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const cardTitle = { fontSize: '1rem', fontWeight: '600', marginBottom: '1.2rem', color: '#1e293b' };
const statCard = { background: '#6366f1', color: 'white', padding: '1.5rem', borderRadius: '12px' };
const statNum = { fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' };
const inputStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' };
const submitBtnStyle = { padding: '0.8rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' };
const rowStyle = { borderBottom: '1px solid #f1f5f9', height: '3rem' };
const activeRowStyle = { ...rowStyle, background: '#f5f3ff', color: '#6366f1', fontWeight: 'bold' };
const chartContainer = { display: 'flex', alignItems: 'flex-end', gap: '10px', height: '150px', paddingTop: '20px' };
const barWrapper = { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 };
const barStyle = { width: '100%', background: '#6366f1', borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' };
const barLabel = { fontSize: '0.7rem', color: '#94a3b8', marginTop: '5px' };
const navItem = { padding: '0.75rem', borderRadius: '8px', color: '#64748b', cursor: 'pointer', marginBottom: '0.5rem' };
const navItemActive = { ...navItem, background: '#f1f5f9', color: '#1e293b', fontWeight: '600' };
const logoutBtnStyle = { marginTop: 'auto', padding: '0.75rem', border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' };
const errorStyle = { background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fee2e2' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const headerStyle = { marginBottom: '2rem' };

export default Dashboard;
