import React, { useState, useEffect } from 'react'
import './App.css'

// Simple hash function for passwords (use bcrypt in production)
const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

// Database simulation (will be replaced with real DB calls)
const mockDatabase = {
  users: [],
  workouts: []
}

const AuthForm = ({ isLogin, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (isLogin) {
      // Login logic
      const user = mockDatabase.users.find(u => u.email === email && u.password === simpleHash(password))
      if (user) {
        localStorage.setItem('user', JSON.stringify({ id: user.id, email: user.email }))
        onSuccess()
      } else {
        setError('Invalid credentials')
      }
    } else {
      // Registration logic
      if (mockDatabase.users.find(u => u.email === email)) {
        setError('Email already exists')
        return
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password: simpleHash(password),
        createdAt: new Date().toISOString()
      }
      
      mockDatabase.users.push(newUser)
      localStorage.setItem('user', JSON.stringify({ id: newUser.id, email: newUser.email }))
      onSuccess()
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login to FitFiddle' : 'Join FitFiddle'}</h2>
        <p>Musical Fitness App</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
          <button type="submit">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? (
            <p>Don't have an account? <button onClick={() => window.location.href='?register'}>Register</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => window.location.href='?login'}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [workouts, setWorkouts] = useState([])

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      // Load user workouts from database
      const userWorkouts = mockDatabase.workouts.filter(w => w.userId === JSON.parse(storedUser).id)
      setWorkouts(userWorkouts)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const addWorkout = () => {
    const newWorkout = {
      id: Date.now().toString(),
      userId: user.id,
      exercise: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 135,
      date: new Date().toISOString()
    }
    
    mockDatabase.workouts.push(newWorkout)
    setWorkouts([...workouts, newWorkout])
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
            <p>{workouts.length}</p>
          </div>
          
