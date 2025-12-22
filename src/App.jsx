import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('fitFiddleUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // For now, this mimics a successful login/register
    // In the next step, we can connect this to a 'users' table in Neon
    const userData = { email };
    localStorage.setItem('fitFiddleUser', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('fitFiddleUser');
    setUser(null);
  };

  if (!user) {
    return (
      <div style={authContainer}>
        <div style={authCard}>
          <h1 style={{ color: '#4f46e5', marginBottom: '10px' }}>FitFiddle</h1>
          <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {isRegistering ? 'Join the community' : 'Sign in to track your progress'}
          </p>
          
          <form onSubmit={handleSubmit} style={formStyle}>
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <button type="submit" style={btnPrimary}>
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={toggleBtn}
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard currentUser={user} onLogout={handleLogout} />;
}

// --- STYLES ---
const authContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc' };
const authCard = { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '400px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px' };
const btnPrimary = { padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', marginTop: '10px' };
const toggleBtn = { background: 'none', border: 'none', color: '#4f46e5', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline' };

export default App;
