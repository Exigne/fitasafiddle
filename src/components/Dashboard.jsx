import React, { useState, useEffect, useCallback } from 'react';
import { Dumbbell, Calendar, Heart, Sparkles, Trash2, X, Trophy, Medal, Sun, User, Camera, Target, Zap, Wind } from 'lucide-react';

const EXERCISES = {
  strength: { 'Bench Press': 'Chest', 'Squat': 'Legs', 'Deadlift': 'Back', 'Overhead Press': 'Shoulders', 'Rows': 'Back', 'Bicep Curls': 'Arms' },
  cardio: { 'Running': 'Cardio', 'Cycling': 'Cardio', 'Swimming': 'Cardio' },
  stretch: { 'Yoga': 'Flexibility', 'Mobility Work': 'Flexibility' }
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allData, setAllData] = useState({ workouts: [], users: [] });
  const [isLogging, setIsLogging] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [workoutType, setWorkoutType] = useState('strength');
  const [loading, setLoading] = useState(true);
  
  // Profile & Inputs
  const [profileName, setProfileName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedEx, setSelectedEx] = useState('Bench Press');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/database`);
      const data = await res.json();
      setAllData(data || { workouts: [], users: [] });
      const curr = data?.users?.find(u => u.email === user?.email);
      if (curr) { setProfileName(curr.display_name || ''); setProfilePic(curr.profile_pic || ''); }
    } catch (e) { console.error("Sync Error", e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
    else setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const finishWorkout = async () => {
    setIsLogging(false);
    const payload = [{ exercise_name: selectedEx, sets: Number(sets), reps: Number(reps), weight: Number(weight) }];
    await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ userEmail: user.email, exercises: payload })
    });
    setSets(''); setReps(''); setWeight('');
    loadData();
  };

  const deleteWorkout = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    await fetch(`/.netlify/functions/database?workoutId=${id}`, { method: 'DELETE' });
    loadData();
  };

  // Helper to find the name in messy database objects
  const getExName = (w) => {
    const first = w.exercises?.[0];
    return first?.exercise_name || first?.name || first || "Workout";
  };

  const stats = (() => {
    const myLogs = allData?.workouts?.filter(w => w.user_email === user?.email) || [];
    const muscleSplit = { Chest: 0, Legs: 0, Back: 0, Shoulders: 0, Arms: 0, Cardio: 0, Flexibility: 0 };
    const pbs = {};

    myLogs.forEach(w => {
      const ex = Array.isArray(w.exercises) ? w.exercises[0] : null;
      if (ex) {
        const name = ex.exercise_name || ex.name;
        const group = EXERCISES.strength[name] || EXERCISES.cardio[name] || EXERCISES.stretch[name];
        if (group) muscleSplit[group]++;
        if (ex.weight && (!pbs[name] || ex.weight > pbs[name])) pbs[name] = ex.weight;
      }
    });

    const league = Object.entries((allData?.workouts || []).reduce((acc, w) => {
      acc[w.user_email] = (acc[w.user_email] || 0) + 1;
      return acc;
    }, {})).map(([email, count]) => {
      const u = allData?.users?.find(usr => usr.email === email);
      return { email, count, name: u?.display_name || email.split('@')[0], pic: u?.profile_pic };
    }).sort((a,b) => b.count - a.count);

    return { myLogs, muscleSplit, pbs, league };
  })();

  if (!user) return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        <Sparkles size={40} color="#6366f1" />
        <h2 style={{margin:'20px 0'}}>Fit as a Fiddle</h2>
        <input style={styles.input} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button style={styles.mainBtn} onClick={async () => {
            const res = await fetch('/.netlify/functions/database', { method: 'POST', body: JSON.stringify({ action: 'auth', email, password }) });
            if (res.ok) { const d = await res.json(); setUser({email: d.email}); localStorage.setItem('fitnessUser', JSON.stringify({email: d.email})); }
        }}>Enter Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
        <div style={styles.profileTrigger} onClick={() => setShowProfile(true)}>
          <div style={{textAlign:'right', marginRight:'12px'}}>
            <div style={{fontSize:'10px', color:'#94a3b8'}}>ATHLETE</div>
            <div style={{fontWeight:'bold', fontSize:'14px'}}>{profileName || user.email.split('@')[0]}</div>
          </div>
          {profilePic ? <img src={profilePic} style={styles.avatar} alt="P" /> : <div style={styles.avatar}><User size={18}/></div>}
        </div>
      </div>

      <div style={styles.gridTop}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Target size={18} color="#6366f1" /><h3>Personal Bests</h3></div>
          {Object.entries(stats.pbs).slice(0, 4).map(([name, val]) => (
            <div key={name} style={styles.pbItem}><span>{name}</span><span style={{color:'#6366f1', fontWeight:'bold'}}>{val}kg</span></div>
          ))}
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Zap size={18} color="#fbbf24" /><h3>Muscle Balance</h3></div>
          {Object.entries(stats.muscleSplit).map(([group, count]) => (
            <div key={group} style={styles.balanceRow}>
              <span style={styles.groupLabel}>{group}</span>
              <div style={styles.barBg}><div style={{...styles.barFill, width: `${Math.min(100, count * 20)}%`}} /></div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.gridBottom}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Calendar size={18} color="#6366f1" /><h3>Workout History</h3></div>
          <div style={styles.scrollArea}>
            {stats.myLogs.map((w, i) => (
              <div key={i} style={styles.historyItem}>
                <span style={styles.dateText}>{new Date(w.created_at).toLocaleDateString(undefined, {day:'numeric', month:'short'})}</span>
                <span style={{flex:1, fontSize:'14px', fontWeight:'500'}}>{getExName(w)}</span>
                <div style={{textAlign:'right', marginRight:'15px'}}>
                   <div style={{fontWeight:'bold', color:'#6366f1'}}>{w.exercises?.[0]?.weight || 0}kg</div>
                   <div style={{fontSize:'10px', color:'#94a3b8'}}>{w.exercises?.[0]?.sets || 0} x {w.exercises?.[0]?.reps || 0}</div>
                </div>
                <Trash2 size={14} color="#ef4444" style={{cursor:'pointer'}} onClick={() => deleteWorkout(w.id)} />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}><Trophy size={18} color="#fbbf24" /><h3>League Standings</h3></div>
          <div style={styles.scrollArea}>
            {stats.league.map((entry, i) => (
              <div key={i} style={styles.leagueItem}>
                <div style={styles.rankCircle}>{i+1}</div>
                {entry.pic ? <img src={entry.pic} style={styles.smallAvatar} alt="u" /> : <div style={styles.smallAvatar}><User size={12}/></div>}
                <div style={{flex:1}}>{entry.name}</div>
                <div style={{fontSize:'12px', fontWeight:'bold', color:'#fbbf24'}}>{entry.count} sessions</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.fabContainer}>
        <button onClick={() => {setWorkoutType('strength'); setIsLogging(true); setSelectedEx('Bench Press')}} style={{...styles.fab, background:'#6366f1'}}><Dumbbell size={18}/> Strength</button>
        <button onClick={() => {setWorkoutType('cardio'); setIsLogging(true); setSelectedEx('Running')}} style={{...styles.fab, background:'#ec4899'}}><Heart size={18}/> Cardio</button>
        <button onClick={() => {setWorkoutType('stretch'); setIsLogging(true); setSelectedEx('Yoga')}} style={{...styles.fab, background:'#10b981'}}><Wind size={18}/> Stretch</button>
      </div>

      {showProfile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}><h3>Profile Settings</h3><X onClick={()=>setShowProfile(false)} style={{cursor:'pointer'}}/></div>
            <div style={{textAlign:'center'}}>
              <div style={styles.avatarLarge}>
                {profilePic ? <img src={profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <Camera size={40} color="#334155"/>}
              </div>
              <input style={styles.input} placeholder="Display Name" value={profileName} onChange={e=>setProfileName(e.target.value)} />
              <input style={styles.input} placeholder="Image URL" value={profilePic} onChange={e=>setProfilePic(e.target.value)} />
              <button style={styles.mainBtn} onClick={async () => {
                await fetch('/.netlify/functions/database', { method:'POST', body:JSON.stringify({action:'update_profile', email:user.email, displayName:profileName, profilePic}) });
                setShowProfile(false); loadData();
              }}>Update Profile</button>
              <button style={styles.logoutBtn} onClick={()=>{setUser(null); localStorage.removeItem('fitnessUser');}}>Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {isLogging && (
         <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
               <div style={styles.modalHeader}><h3>New {workoutType}</h3><X onClick={()=>setIsLogging(false)} style={{cursor:'pointer'}}/></div>
               <label style={styles.label}>EXERCISE</label>
               <select style={styles.input} value={selectedEx} onChange={e=>setSelectedEx(e.target.value)}>
                  {Object.keys(EXERCISES[workoutType]).map(ex => <option key={ex} value={ex}>{ex}</option>)}
               </select>
               <div style={styles.inputGrid}>
                  <div><label style={styles.label}>SETS</label><input style={styles.input} type="number" value={sets} onChange={e=>setSets(e.target.value)} /></div>
                  <div><label style={styles.label}>REPS</label><input style={styles.input} type="number" value={reps} onChange={e=>setReps(e.target.value)} /></div>
                  <div><label style={styles.label}>KG/MIN</label><input style={styles.input} type="number" value={weight} onChange={e=>setWeight(e.target.value)} /></div>
               </div>
               <button style={styles.mainBtn} onClick={finishWorkout}>Save Workout</button>
            </div>
         </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' },
  header: { display:'flex', justifyContent:'space-between', marginBottom:'40px', alignItems:'center' },
  brandTitle: { color:'#6366f1', margin:0, fontWeight:'900', fontSize:'28px', letterSpacing:'-1px' },
  profileTrigger: { display:'flex', alignItems:'center', cursor:'pointer', padding:'8px 16px', borderRadius:'18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' },
  avatar: { width:'40px', height:'40px', borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'2px solid #6366f1' },
  avatarLarge: { width:'100px', height:'100px', borderRadius:'50%', background:'#1e293b', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'3px solid #6366f1' },
  smallAvatar: { width:'30px', height:'30px', borderRadius:'50%', background:'#0a0f1d', objectFit:'cover', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  gridTop: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginBottom:'25px' },
  gridBottom: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', paddingBottom:'100px' },
  card: { background:'#161d2f', padding:'25px', borderRadius:'28px', border:'1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px' },
  pbItem: { display:'flex', justifyContent:'space-between', padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'14px', marginBottom:'10px' },
  balanceRow: { display:'flex', alignItems:'center', gap:'15px', marginBottom:'15px' },
  groupLabel: { width:'85px', fontSize:'11px', color:'#94a3b8', fontWeight:'bold' },
  barBg: { flex:1, height:'8px', background:'#0a0f1d', borderRadius:'10px' },
  barFill: { height:'100%', background:'#6366f1', borderRadius:'10px', transition:'width 0.5s ease' },
  scrollArea: { maxHeight:'380px', overflowY:'auto' },
  historyItem: { display:'flex', padding:'16px', background:'rgba(255,255,255,0.02)', borderRadius:'18px', marginBottom:'12px', alignItems:'center', border:'1px solid rgba(255,255,255,0.02)' },
  dateText: { color:'#6366f1', fontWeight:'bold', width:'65px', fontSize:'12px' },
  leagueItem: { display:'flex', alignItems:'center', gap:'15px', padding:'14px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', marginBottom:'10px' },
  rankCircle: { width:'24px', height:'24px', background:'#0a0f1d', borderRadius:'50%', textAlign:'center', fontSize:'11px', lineHeight:'24px', fontWeight:'bold' },
  fabContainer: { position:'fixed', bottom:'30px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'15px', zIndex: 100 },
  fab: { padding:'16px 28px', borderRadius:'22px', color:'#fff', border:'none', cursor:'pointer', display:'flex', gap:'10px', fontWeight:'bold', boxShadow:'0 15px 35px rgba(0,0,0,0.5)' },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modalContent: { background:'#161d2f', padding:'35px', borderRadius:'32px', width:'90%', maxWidth:'420px', border:'1px solid rgba(255,255,255,0.1)' },
  modalHeader: { display:'flex', justifyContent:'space-between', marginBottom:'25px', alignItems:'center' },
  label: { fontSize:'10px', color:'#94a3b8', marginBottom:'8px', display:'block', fontWeight:'bold' },
  inputGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px' },
  input: { width:'100%', padding:'16px', borderRadius:'16px', background:'#0a0f1d', color:'#fff', border:'1px solid #1e293b', marginBottom:'18px', boxSizing:'border-box', outline:'none' },
  mainBtn: { width:'100%', padding:'18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'18px', fontWeight:'bold', cursor:'pointer', fontSize:'16px' },
  logoutBtn: { background:'none', border:'none', color:'#ef4444', cursor:'pointer', marginTop:'20px', fontWeight:'bold', fontSize:'14px' },
  authCard: { maxWidth:'400px', margin:'100px auto', background:'#161d2f', padding:'50px', borderRadius:'40px', textAlign:'center', border:'1px solid rgba(255,255,255,0.05)' }
};

export default Dashboard;
