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
  
  const [profileName, setProfileName] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedEx, setSelectedEx] = useState('Bench Press');
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
    } catch (e) { console.error("Load Error:", e); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('fitnessUser');
    if (saved) setUser(JSON.parse(saved));
    else setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const handleAuth = async (isReg) => {
    setLoading(true);
    const res = await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ action: 'auth', email, password, isRegistering: isReg })
    });
    const data = await res.json();
    if (res.ok) {
      const userData = { email: data.email };
      setUser(userData);
      localStorage.setItem('fitnessUser', JSON.stringify(userData));
    } else alert(data.error);
    setLoading(false);
  };

  const updateProfile = async () => {
    await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ action: 'update_profile', email: user.email, displayName: profileName, profilePic })
    });
    setShowProfile(false);
    loadData();
  };

  const finishWorkout = async () => {
    setIsLogging(false);
    await fetch('/.netlify/functions/database', {
      method: 'POST',
      body: JSON.stringify({ 
        userEmail: user.email, 
        exercises: [{ exercise_name: selectedEx, weight: Number(weight) || 0 }] 
      })
    });
    loadData();
  };

  const stats = (() => {
    const myLogs = allData?.workouts?.filter(w => w.user_email === user?.email) || [];
    const league = Object.entries((allData?.workouts || []).reduce((acc, w) => {
      acc[w.user_email] = (acc[w.user_email] || 0) + 1;
      return acc;
    }, {})).map(([email, count]) => {
      const u = allData?.users?.find(usr => usr.email === email);
      return { email, count, name: u?.display_name || email.split('@')[0], pic: u?.profile_pic };
    }).sort((a,b) => b.count - a.count);

    return { myLogs, league };
  })();

  if (!user) return (
    <div style={styles.container}>
      <div style={styles.authCard}>
        <Sparkles size={40} color="#6366f1" />
        <h2 style={{margin: '20px 0'}}>Workout League</h2>
        <input style={styles.input} placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button style={styles.mainBtn} onClick={() => handleAuth(false)}>Sign In</button>
        <button style={styles.textBtn} onClick={() => handleAuth(true)}>Create Account</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.brandTitle}>Fit as a Fiddle</h1>
        <div style={styles.profileTrigger} onClick={() => setShowProfile(true)}>
          <div style={{textAlign:'right', marginRight:'10px'}}>
            <div style={{fontSize:'10px', color:'#94a3b8'}}>MY PROFILE</div>
            <div style={{fontWeight:'bold', fontSize:'14px'}}>{profileName || user.email.split('@')[0]}</div>
          </div>
          {profilePic ? <img src={profilePic} style={styles.avatar} alt="Profile" /> : <div style={styles.avatar}><User size={20}/></div>}
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}><Calendar size={18} color="#6366f1" /><h3>Your History</h3></div>
          <div style={styles.scrollArea}>
            {stats.myLogs.length > 0 ? stats.myLogs.map((w, i) => (
              <div key={i} style={styles.historyItem}>
                <span style={styles.dateText}>{new Date(w.created_at).toLocaleDateString(undefined, {day:'numeric', month:'short'})}</span>
                <span style={{flex:1, fontSize:'14px'}}>{w.exercises?.[0]?.exercise_name || 'Workout'}</span>
                <span style={{color:'#6366f1', fontWeight:'bold'}}>{w.exercises?.[0]?.weight || 0}kg</span>
              </div>
            )) : <div style={styles.empty}>No workouts yet</div>}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}><Trophy size={18} color="#fbbf24" /><h3>Global League</h3></div>
          <div style={styles.scrollArea}>
            {stats.league.map((entry, i) => (
              <div key={i} style={styles.leagueItem}>
                <div style={styles.rankCircle}>{i+1}</div>
                {entry.pic ? <img src={entry.pic} style={styles.smallAvatar} alt="user" /> : <div style={styles.smallAvatar}><User size={12}/></div>}
                <div style={{flex:1}}>
                  <div style={{fontSize:'14px'}}>{entry.name}</div>
                  <small style={{color:'#94a3b8'}}>{entry.count} Sessions</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showProfile && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}><h3>Profile Settings</h3><X onClick={()=>setShowProfile(false)} style={{cursor:'pointer'}}/></div>
            <div style={{textAlign:'center'}}>
              <div style={styles.avatarLarge}>
                {profilePic ? <img src={profilePic} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Preview" /> : <Camera size={40} color="#334155"/>}
              </div>
              <input style={styles.input} placeholder="Display Name" value={profileName} onChange={e=>setProfileName(e.target.value)} />
              <input style={styles.input} placeholder="Profile Image URL" value={profilePic} onChange={e=>setProfilePic(e.target.value)} />
              <button style={styles.mainBtn} onClick={updateProfile}>Save Changes</button>
              <button style={styles.textBtn} onClick={() => {setUser(null); localStorage.removeItem('fitnessUser');}}>Logout</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.fabContainer}>
        <button onClick={() => {setWorkoutType('strength'); setIsLogging(true)}} style={{...styles.fab, background: '#6366f1'}}><Dumbbell size={18}/> Strength</button>
        <button onClick={() => {setWorkoutType('cardio'); setIsLogging(true)}} style={{...styles.fab, background: '#ec4899'}}><Heart size={18}/> Cardio</button>
        <button onClick={() => {setWorkoutType('stretch'); setIsLogging(true)}} style={{...styles.fab, background: '#10b981'}}><Wind size={18}/> Stretch</button>
      </div>

      {isLogging && (
         <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
               <div style={styles.modalHeader}><h3>Log {workoutType}</h3><X onClick={()=>setIsLogging(false)} style={{cursor:'pointer'}}/></div>
               <select style={styles.input} value={selectedEx} onChange={e=>setSelectedEx(e.target.value)}>
                  {Object.keys(EXERCISES[workoutType]).map(ex => <option key={ex} value={ex}>{ex}</option>)}
               </select>
               <input style={styles.input} type="number" placeholder="Weight (kg)" value={weight} onChange={e=>setWeight(e.target.value)} />
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
  brandTitle: { color:'#6366f1', margin:0, fontWeight:'800', fontSize:'24px' },
  profileTrigger: { display:'flex', alignItems:'center', cursor:'pointer', padding:'5px 15px', borderRadius:'20px', background:'rgba(255,255,255,0.03)' },
  avatar: { width:'42px', height:'42px', borderRadius:'50%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'2px solid #6366f1' },
  smallAvatar: { width:'32px', height:'32px', borderRadius:'50%', background:'#0a0f1d', objectFit:'cover', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  avatarLarge: { width:'100px', height:'100px', borderRadius:'50%', background:'#1e293b', margin:'0 auto 20px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', border:'3px solid #6366f1' },
  mainGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', paddingBottom:'100px' },
  card: { background:'#161d2f', padding:'25px', borderRadius:'25px', border:'1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px' },
  historyItem: { display:'flex', padding:'15px', background:'rgba(255,255,255,0.02)', borderRadius:'15px', marginBottom:'10px', alignItems:'center' },
  dateText: { color:'#6366f1', fontWeight:'bold', width:'65px', fontSize:'12px' },
  leagueItem: { display:'flex', alignItems:'center', gap:'15px', padding:'12px', background:'rgba(255,255,255,0.02)', borderRadius:'15px', marginBottom:'10px' },
  rankCircle: { width:'24px', height:'24px', background:'#0a0f1d', borderRadius:'50%', textAlign:'center', fontSize:'11px', lineHeight:'24px' },
  fabContainer: { position:'fixed', bottom:'30px', left:'50%', transform:'translateX(-50%)', display:'flex', gap:'15px', zisLoggingIndex: 50 },
  fab: { padding:'15px 25px', borderRadius:'25px', color:'#fff', border:'none', cursor:'pointer', display:'flex', gap:'10px', fontWeight:'bold', boxShadow:'0 10px 20px rgba(0,0,0,0.4)' },
  modalOverlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 },
  modalContent: { background:'#161d2f', padding:'30px', borderRadius:'30px', width:'90%', maxWidth:'400px', border:'1px solid rgba(255,255,255,0.1)' },
  modalHeader: { display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center' },
  input: { width:'100%', padding:'15px', borderRadius:'15px', background:'#0a0f1d', color:'#fff', border:'1px solid #1e293b', marginBottom:'15px', boxSizing:'border-box', outline:'none' },
  mainBtn: { width:'100%', padding:'16px', background:'#6366f1', color:'#fff', border:'none', borderRadius:'15px', fontWeight:'bold', cursor:'pointer' },
  textBtn: { background:'none', border:'none', color:'#ef4444', cursor:'pointer', marginTop:'15px', fontWeight:'bold' },
  authCard: { maxWidth:'380px', margin:'100px auto', background:'#161d2f', padding:'40px', borderRadius:'35px', textAlign:'center', border:'1px solid rgba(255,255,255,0.05)' },
  empty: { textAlign:'center', color:'#475569', padding:'40px' }
};

export default Dashboard;
