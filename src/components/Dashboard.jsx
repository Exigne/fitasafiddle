import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const ACTIVITY_CONFIG = {
  'Bench Press': { group: 'Chest', label1: 'Sets', label2: 'Reps', label3: 'kg' },
  'Squat': { group: 'Legs', label1: 'Sets', label2: 'Reps', label3: 'kg' },
  'Deadlift': { group: 'Back', label1: 'Sets', label2: 'Reps', label3: 'kg' },
  'Rows': { group: 'Back', label1: 'Sets', label2: 'Reps', label3: 'kg' },
  'Yoga (Vinyasa)': { group: 'Flexibility', label1: 'Session', label2: 'Min', label3: 'Flows' },
  'Running (Distance)': { group: 'Cardio', label1: 'Laps', label2: 'Min', label3: 'km' },
  'Swimming': { group: 'Full Body', label1: 'Laps', label2: 'Min', label3: 'm' },
  'Pilates': { group: 'Core', label1: 'Sets', label2: 'Min', label3: 'Intensity' }
};

const Dashboard = ({ currentUser, onLogout }) => {
  const [workouts, setWorkouts] = useState([]);
  const [exercise, setExercise] = useState('Bench Press');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [val3, setVal3] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`/.netlify/functions/database?user=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      setWorkouts(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Fetch error", e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          exercise,
          sets: parseFloat(val1) || 0,
          reps: parseFloat(val2) || 0,
          weight: parseFloat(val3) || 0
        })
      });
      setVal1(''); setVal2(''); setVal3('');
      loadData();
    } catch (err) { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const currentConfig = ACTIVITY_CONFIG[exercise];

  const volumeData = {
    labels: workouts.slice(0, 7).map(w => new Date(w.created_at).toLocaleDateString()).reverse(),
    datasets: [{
      label: 'Volume',
      data: workouts.slice(0, 7).map(w => (w.weight || 0) * (w.reps || 0) * (w.sets || 1)).reverse(),
      backgroundColor: 'rgba(56, 189, 248, 0.6)',
      borderColor: '#38bdf8',
      borderWidth: 2,
    }]
  };

  const donutData = {
    labels: [...new Set(workouts.map(w => w.muscle_group || 'Other'))],
    datasets: [{
      data: workouts.reduce((acc, w) => {
        const idx = acc.labels.indexOf(w.muscle_group || 'Other');
        if (idx > -1) acc.data[idx]++;
        else { acc.labels.push(w.muscle_group || 'Other'); acc.data.push(1); }
        return acc;
      }, { labels: [], data: [] }).data,
      backgroundColor: ['#38bdf8', '#818cf8', '#fbbf24', '#f87171'],
    }]
  };

  return (
    <div style={theme.wrapper}>
      <header style={theme.header}>
        <div style={theme.profileSection}>
          <div style={theme.avatar}>{currentUser.email[0].toUpperCase()}</div>
          <div>
            <h2 style={{ margin: 0 }}>{currentUser.email.split('@')[0]}</h2>
            <span style={theme.badge}>{workouts.length} TOTAL SESSIONS</span>
          </div>
        </div>
        <button onClick={onLogout} style={theme.logoutBtn}>Sign Out</button>
      </header>

      <div style={theme.dashboardGrid}>
        <div style={theme.column}>
          <div style={theme.glassCard}>
            <h3 style={theme.cardTitle}>Performance</h3>
            <Bar data={volumeData} options={chartOptions} />
          </div>
        </div>

        <div style={theme.column}>
          <div style={theme.actionCard}>
            <h3 style={{ color: '#fff' }}>Log Activity</h3>
            <form onSubmit={handleSave} style={theme.inputGroup}>
              <select value={exercise} onChange={e => setExercise(e.target.value)} style={theme.input}>
                {Object.keys(ACTIVITY_CONFIG).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div style={theme.row}>
                <div>
                  <label style={theme.label}>{currentConfig.label1}</label>
                  <input type="number" value={val1} onChange={e => setVal1(e.target.value)} style={theme.input} />
                </div>
                <div>
                  <label style={theme.label}>{currentConfig.label2}</label>
                  <input type="number" value={val2} onChange={e => setVal2(e.target.value)} style={theme.input} />
                </div>
                <div>
                  <label style={theme.label}>{currentConfig.label3}</label>
                  <input type="number" value={val3} onChange={e => setVal3(e.target.value)} style={theme.input} />
                </div>
              </div>
              <button disabled={saving} style={theme.primaryBtn}>{saving ? 'Saving...' : 'Complete Session'}</button>
            </form>
          </div>
        </div>

        <div style={theme.column}>
          <div style={theme.glassCard}>
            <h3 style={theme.cardTitle}>Activity Feed</h3>
            {workouts.slice(0, 5).map((w, i) => (
              <div key={i} style={theme.activityItem}>
                <span>{w.exercise}</span>
                <span style={{ color: '#38bdf8' }}>{w.weight} {ACTIVITY_CONFIG[w.exercise]?.label3 || ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const theme = {
  wrapper: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '40px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badge: { fontSize: '12px', color: '#38bdf8' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  glassCard: { background: 'rgba(30, 41, 59, 0.7)', borderRadius: '24px', padding: '24px' },
  actionCard: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '24px', padding: '24px' },
  cardTitle: { fontSize: '16px', color: '#94a3b8', marginBottom: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { width: '100%', padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' },
  label: { fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  primaryBtn: { width: '100%', padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#4f46e5', fontWeight: 'bold' },
  activityItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  logoutBtn: { background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }
};

const chartOptions = { responsive: true, plugins: { legend: { display: false } } };

export default Dashboard;
