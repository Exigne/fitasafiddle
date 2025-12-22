import React, { useState, useEffect } from 'react'
import './App.css'

// Basic components for now - we'll build these out
const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    // For now, just simulate login
    localStorage.setItem('user', JSON.stringify({ email, id: 1 }))
    window.location.reload()
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>FitFiddle Login</h2>
        <p>Musical Fit Fiddle</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.reload()
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>FitFiddle Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="quick-stats">
          <div className="stat-card">
            <h3>Total Workouts</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>This Week</h3>
            <p>0</p>
          </div>
          <div className="stat-card">
            <h3>Streak</h3>
            <p>0 days</p>
          </div>
        </div>

        <div className="action-sections">
          <div className="action-card">
            <h3>Log Workout</h3>
            <p>Track your exercise</p>
            <button className="action-btn">Start Workout</button>
          </div>
          <div className="action-card">
            <h3>View Progress</h3>
            <p>See your analytics</p>
            <button className="action-btn">View Charts</button>
          </div>
          <div className="action-card">
            <h3>Muscle Groups</h3>
            <p>Track by muscle</p>
            <button className="action-btn">Breakdown</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    setIsAuthenticated(!!user)
  }, [])

  return (
    <div className="App">
      {isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  )
}

export default App
