import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');

  // Simple "Login" for the demo - saves to localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('fitFiddleUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) return;
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h1>FitFiddle</h1>
          <p>Enter your email to start tracking</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input 
              type="email" 
              placeholder="email@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ddd' }}
              required
            />
            <button type="submit" style={{ padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard currentUser={user} onLogout={handleLogout} />;
}

export default App;
