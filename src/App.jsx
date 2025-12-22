import React from 'react'; // Simplified import
import { databaseAPI } from './api/database.js';
import Dashboard from './components/Dashboard';
import './App.css';

const AuthForm = ({ isLogin, onSuccess, onSwitch }) => {
  // Use React. prefix to guarantee they are defined
  const [formData, setFormData] = React.useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [debugInfo, setDebugInfo] = React.useState('');

  const testDatabase = async () => {
    setDebugInfo('Testing connection...');
    try {
      const response = await fetch('/.netlify/functions/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'getUser', 
          email: formData.email || 'test@test.com', 
          password: formData.password || 'test123' 
        })
      });
      const text = await response.text();
      setDebugInfo(`Raw response: "${text}"`);
    } catch (err) {
      setDebugInfo(`❌ Error: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      let user;
      if (isLogin) {
        user = await databaseAPI.getUser(formData.email, formData.password);
        if (!user) {
          setError('Invalid credentials - user not found');
          setLoading(false);
          return;
        }
      } else {
        user = await databaseAPI.createUser(formData.email, formData.password);
      }
      onSuccess(user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                    textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ color: '#4a5568', marginBottom: '0.5rem' }}>{isLogin ? 'Login' : 'Join'} FitFiddle</h2>
        {error && <div style={{ background: '#fed7d7', color: '#c53030', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px' }}
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              style={{ padding: '1rem', border: '2px solid #e2e8f0', borderRadius: '12px' }}
            />
          )}
          <button type="submit" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', cursor: 'pointer'
          }} disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <button onClick={onSwitch} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer' }}>
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLogin, setIsLogin] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'register') {
      setIsLogin(false);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard currentUser={currentUser} onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <AuthForm 
          isLogin={isLogin} 
          onSuccess={handleAuthSuccess}
          onSwitch={() => setIsLogin(!isLogin)}
        />
      )}
    </div>
  );
}

export default App;
