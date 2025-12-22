import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const ACTIVITY_CONFIG = {
  'Bench Press': { group: 'Chest', unit: 'kg' },
  'Squat': { group: 'Legs', unit: 'kg' },
  'Deadlift': { group: 'Back', unit: 'kg' },
  'Rows': { group: 'Back', unit: 'kg' },
  'Pull-ups': { group: 'Back', unit: 'Reps' },
  'Running (Distance)': { group: 'Cardio', unit: 'km' },
  'Swimming': { group: 'Full Body', unit: 'm' },
  'Pilates': { group: 'Core', unit: 'Intensity' }
};

const Dashboard = ({ currentUser, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [draftExercises, setDraftExercises] = useState([]);
  const [exercise, setExercise] = useState('Bench Press');
  const [val1, setVal1] = useState(''); // Sets
  const [val2, setVal2] = useState(''); // Reps
  const [val3, setVal3] = useState(''); // Weight
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [currentUser]);

  const loadData = async () => {
    try {
      const res = await fetch(`/.netlify/functions/database?user=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Fetch error", e); }
  };

  const addToDraft = () => {
    if (!val1 || !val2) return alert("Enter sets and reps");
    const newEntry = {
      name: exercise,
      sets: parseInt(val1),
      reps: parseInt(val2),
      weight: parseFloat(val3) || 0,
      group: ACTIVITY_CONFIG[exercise].group
    };
    setDraftExercises([...draftExercises, newEntry]);
    setVal1(''); setVal2(''); setVal3('');
  };

  const handleFinishWorkout = async () => {
    if (draftExercises.length === 0) return;
    setSaving(true);
    try {
      await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser.email,
          exercises: draftExercises
        })
      });
      setDraftExercises([]);
      loadData();
    } catch (err) { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  // Charts Logic
  const volumeData = {
    labels: history.slice(0, 5).map(w => new Date(w.created_at).toLocaleDateString()).reverse(),
    datasets: [{
      label: 'Volume',
      data: history.slice(0, 5).map(w => w.total_volume).reverse(),
      backgroundColor: '#38bdf8',
    }]
  };

  return (
    <div style={theme.wrapper}>
      <header style={theme.header}>
        <div style={theme.profileSection}>
          <div style={theme.avatar}>{currentUser.email[0].toUpperCase()}</div>
          <div>
            <h2 style={{ margin: 0 }}>{currentUser.email.split('@')[0]}</h2>
            <span style={theme.badge}>{history.length} SESSIONS LOGGED</span>
          </div>
        </div>
        <button onClick={onLogout} style={theme.logoutBtn}>Sign Out</button>
      </header>

      <div style={theme.dashboardGrid}>
        {/* Left Column: Analytics */}
        <div style={theme.column}>
          <div style={theme.glassCard}>
            <h3 style={theme.cardTitle}>Volume Trend</h3>
            <Bar data={volumeData} options={chartOptions} />
          </div>
          
          <div style={{...theme.glassCard, marginTop: '20px'}}>
            <h3 style={theme.cardTitle}>Recent History</h3>
            {history.slice(0, 3).map((session, i) => (
              <div key={i} style={theme.historyItem}>
                <strong>{new Date(session.created_at).toLocaleDateString()}</strong>
                <span>{session.exercise_count} Exercises</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Active Session Builder */}
        <div style={theme.column}>
          <div style={theme.actionCard}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>New Session</h3>
            
            <div style={theme.inputGroup}>
              <select value={exercise} onChange={e => setExercise(e.target.value)} style={theme.input}>
                {Object.keys(ACTIVITY_CONFIG).map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <div style={theme.row}>
                <input type="number" placeholder="Sets" value={val1} onChange={e => setVal1(e.target.value)} style={theme.input} />
                <input type="number" placeholder="Reps" value={val2} onChange={e => setVal2(e.target.value)} style={theme.input} />
                <input type="number" placeholder="kg" value={val3} onChange={e => setVal3(e.target.value)} style={theme.input} />
              </div>
              <button onClick={addToDraft} style={theme.secondaryBtn}>+ Add to Session</button>
            </div>

            {draftExercises.length > 0 && (
              <div style={theme.draftList}>
                {draftExercises.map((ex, i) => (
                  <div key={i} style={theme.draftItem}>
                    {ex.name} — {ex.sets}x{ex.reps} {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                  </div>
                ))}
                <button 
                  onClick={handleFinishWorkout} 
                  disabled={saving} 
                  style={theme.primaryBtn}
                >
                  {saving ? 'Uploading...' : 'Finish & Save Workout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const theme = {
  wrapper: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '40px' },
  profileSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatar: { width: '45px', height: '45px', borderRadius: '12px', background: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#0f172a' },
  badge: { fontSize: '11px', color: '#94a3b8' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  glassCard: { background: '#1e293b', borderRadius: '20px', padding: '24px', border: '1px solid #334155' },
  actionCard: { background: '#4f46e5', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' },
  cardTitle: { fontSize: '14px', color: '#94a3b8', marginBottom: '20px', textTransform: 'uppercase' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
  secondaryBtn: { padding: '12px', borderRadius: '10px', border: '1px solid #fff', background: 'transparent', color: '#fff', cursor: 'pointer' },
  primaryBtn: { marginTop: '20px', padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: '#fff', color: '#4f46e5', fontWeight: 'bold', cursor: 'pointer', width: '100%' },
  draftList: { marginTop: '20px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' },
  draftItem: { padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px' },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #334155' },
  logoutBtn: { background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }
};

const chartOptions = { responsive: true, plugins: { legend: { display: false } } };

export default Dashboard;
