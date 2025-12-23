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
  
  // Profile & Auth
  const [profileName, setProfileName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // WORKOUT INPUT FIELDS (Restored)
  const [selectedEx, setSelectedEx] = useState('Bench Press');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/.netlify/functions/database`);
      const data = await res.json();
      setAllData(data || { workouts: [], users: [] });
      const currentUser = data?.users?.find(u => u.email === user?.email);
      if (currentUser) {
        setProfileName(currentUser.display_name || '');
        setProfilePic(currentUser.profile_pic || '');
      }
    } catch (e) { console.error("Sync Error:", e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
    else setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const finishWorkout = async () => {
    if (!selectedEx) return;
    setLoading(true);
    
    // CAPTURING ALL FIELDS
    const payload = [{
      exercise_name: selectedEx,
      sets: Number(sets) || 0,
      reps: Number(reps) || 0,
      weight: Number(weight) || 0
    }];

    await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ userEmail: user.email, exercises: payload })
    });
    
    // Reset and Refresh
    setIsLogging(false);
    setSets(''); setReps(''); setWeight('');
    loadData();
  };

  const stats = (() => {
    const myLogs = allData?.workouts?.filter(w => w.user_email === user?.email) || [];
    const muscleSplit = { Chest: 0, Legs: 0, Back: 0, Shoulders: 0, Arms: 0, Cardio: 0, Flexibility: 0 };
    const pbs = {};

    myLogs.forEach(w => {
      const exArray = Array.isArray(w.exercises) ? w.exercises : [];
      exArray.forEach(ex => {
        const group = EXERCISES.strength[ex.exercise_name] || EXERCISES.cardio[ex.exercise_name] || EXERCISES.stretch[ex.exercise_name];
        if (group) muscleSplit[group]++;
        if (!pbs[ex.exercise_name] || ex.weight > pbs[ex.exercise_name]) pbs[ex.exercise_name] = ex.weight;
      });
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
        <h2 style={{margin: '20px 0'}}>Fit as a Fiddle</h2>
        <input style={styles.input} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button style={styles.mainBtn} onClick={async () => {
            const res = await fetch('/.netlify/functions/database', { method: 'POST', body: JSON.stringify({ action: 'auth', email, password }) });
            const data = await res.json();
            if (res.ok) { setUser({email: data.email}); localStorage.setItem('fitnessUser', JSON.stringify({email: data.email})); }
        }}>Sign In</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
        <div style={styles.profileTrigger} onClick={() => setShowProfile(true)}>
          <div style={{textAlign:'right', marginRight:'12px'}}>
            <div style={{fontSize:'10px', color:'#94a3b8'}}>MY PROFILE</div>
            <div style={{fontWeight:'bold', fontSize:'14px'}}>{profileName || user.email.split('@')[0]}</div>
          </div>
          {profilePic ? <img src={profilePic} style={styles.avatar} /> : <div style={styles.avatar}><User size={20}/></div>}
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
              <div style={styles.barBg}><div style={{...styles.barFill, width: `${Math.min(100, count * 15)}%`}} /></div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.gridBottom}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Calendar size={18} color="#6366f1" /><h3>Your History</h3></div>
          <div style={styles.scrollArea}>
            {stats.myLogs.map((w, i) => (
              <div key={i} style={styles.historyItem}>
                <span style={styles.dateText}>{new Date(w.created_at).toLocaleDateString(undefined, {day:'numeric', month:'short'})}</span>
                <span style={{flex:1, fontSize:'14px'}}>{w.exercises?.[0]?.exercise_name || 'Workout'}</span>
                <div style={{textAlign:'right'}}>
                   <div style={{fontWeight:'bold', color:'#6366f1'}}>{w.exercises?.[0]?.weight || 0}kg</div>
                   <div style={{fontSize:'10px', color:'#94a3b8'}}>{w.exercises?.[0]?.sets} x {w.exercises?.[0]?.reps}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}><Trophy size={18} color="#fbbf24" /><h3>Global League</h3></div>
          <div style={styles.scrollArea}>
            {stats.league.map((entry, i) => (
              <div key={i} style={styles.leagueItem}>
                <div style={styles.rankCircle}>{i+1}</div>
                {entry.pic ? <img src={entry.pic} style={styles.smallAvatar} /> : <div style={styles.smallAvatar}><User size={12}/></div>}
                <div style={{flex:1}}>{entry.name}</div>
                <div style={{fontSize:'12px', color:'#94a3b8'}}>{entry.count} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div style={styles.fabContainer}>
        <button onClick={() => {setWorkoutType('strength'); setIsLogging(true); setSelectedEx('Bench Press')}} style={{...styles.fab, background: '#6366f1'}}><Dumbbell size={18}/> Strength</button>
        <button onClick={() => {setWorkoutType('cardio'); setIsLogging(true); setSelectedEx('Running')}} style={{...styles.fab, background: '#ec4899'}}><Heart size={18}/> Cardio</button>
        <button onClick={() => {setWorkoutType('stretch'); setIsLogging(true); setSelectedEx('Yoga')}} style={{...styles.fab, background: '#10b981'}}><Wind size={18}/> Stretch</button>
      </div>

      {/* LOGGING MODAL WITH ALL FIELDS */}
      {isLogging && (
         <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
               <div style={styles.modalHeader}><h3>Log {workoutType}</h3><X onClick={()=>setIsLogging(false)} style={{cursor:'pointer'}}/></div>
               <label style={styles.label}>EXERCISE</label>
               <select style={styles.input} value={selectedEx} onChange={e=>setSelectedEx(e.target.value)}>
                  {Object.keys(EXERCISES[workoutType]).map(ex => <option key={ex} value={ex}>{ex}</option>)}
               </select>

               {workoutType === 'strength' ? (
                 <div style={styles.inputGrid}>
                    <div><label style={styles.label}>SETS</label><input style={styles.input} type="number" value={sets} onChange={e=>setSets(e.target.value)} /></div>
                    <div><label style={styles.label}>REPS</label><input style={styles.input} type="number" value={reps} onChange={e=>setReps(e.target.value)} /></div>
                    <div><label style={styles.label}>KG</label><input style={styles.input} type="number" value={weight} onChange={e=>setWeight(e.target.value)} /></div>
                 </div>
               ) : (
                 <div><label style={styles.label}>MINUTES</label><input style={styles.input} type="number" value={reps} onChange={e=>setReps(e.target.value)} /></div>
               )}

               <button style={styles.mainBtn} onClick={finishWorkout}>Save to Database</button>
            </div>
         </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0a0f1d', color: '#f8fafc', padding: '40px', fontFamily: 'sans-serif' },
  header: { display:'flex', justifyContent:'space-between', marginBottom:'40px', alignItems:'center' },
  brandTitle: { color:'#6366f1', margin:0, fontWeight:'800', fontSize:'26px' },
  profileTrigger: { display:'flex', alignItems:'center', cursor:'pointer', padding:'8px 15px', borderRadius:'15px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' },
  avatar: { width:'42px', height:'42px', borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'2px solid #6366f1' },
  avatarLarge: { width:'100px', height:'100px', borderRadius:'50%', background:'#1e293b', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'3px solid #6366f1' },
  smallAvatar: { width:'32px', height:'32px', borderRadius:'50%', background:'#0a0f1d', objectFit:'cover', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  gridTop: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginBottom:'30px' },
  gridBottom: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', paddingBottom:'100px' },
  card: { background:'#161d2f', padding:'25px', borderRadius:'25px', border:'1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px' },
  pbItem: { display:'flex', justifyContent:'space-between', padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'12px', marginBottom:'10px' },
  balanceRow: { display:'flex', alignItems:'center', gap:'15px', marginBottom:'15px' },
  groupLabel: { width:'80px', fontSize:'11px', color:'#94a3b8' },
  barBg: { flex:1, height:'6px', background:'#0a0f1d', borderRadius:'10px' },
  barFill: { height:'100%', background:'#6366f1', borderRadius:'10px' },
  scrollArea: { maxHeight:'400px', overflowY:'auto' },
  historyItem: { display:'flex', padding:'15px', background:'rgba(255,255,255,0.02)', borderRadius:'15px', marginBottom:'10px', alignItems:'center' },
  dateText: { color:'#6366f1', fontWeight:'bold', width:'65px', fontSize:'12px' },
  leagueItem: { display:'flex', alignItems:'center', gap:'15px', padding:'15px', background:'rgba(255,255,255,0.02)', borderRadius:'15px', marginBottom:'10px' },
  rankCircle: { width:'24px', height:'24px', background:'#0a0f1d', borderRadius:'50%', textAlign:'center', fontSize:'11px', lineHeight:'24px' },
  fabContainer: { position:'fixed', bottom:'30px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'15px', zIndex: 100 },
  fab: { padding:'15px 25px', borderRadius:'25px', color:'#fff', border:'none', cursor:'pointer', display:'flex', gap:'10px', fontWeight:'bold', boxShadow:'0 10px 30px rgba(0,0,0,0.5)' },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 },
  modalContent: { background:'#161d2f', padding:'35px', borderRadius:'30px', width:'90%', maxWidth:'420px', border:'1px solid rgba(255,255,255,0.1)' },
  modalHeader: { display:'flex', justifyContent:'space-between', marginBottom:'25px', alignItems:'center' },
  label: { fontSize:'10px', color:'#94a3b8', marginBottom:'5px', display:'block' },
  inputGrid: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'15px' },
  input: { width:'100%', padding:'15px', borderRadius:'15px', background:'#0a0f1d', color:'#fff', border:'1px solid #1e293b', marginBottom:'15px', boxSizing:'border-box', outline:'none' },
  mainBtn: { width:'100%', padding:'18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'15px', fontWeight:'bold', cursor:'pointer' },
  authCard: { maxWidth:'400px', margin:'100px auto', background:'#161d2f', padding:'50px', borderRadius:'40px', textAlign:'center' }
};

export default Dashboard;
