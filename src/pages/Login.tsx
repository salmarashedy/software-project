import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react' // Added useState
import { authService } from '../services/authService' // Import our service

function Login() {
  const navigate = useNavigate()
  
  // State to hold form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const result = await authService.login(email, password)
      if (result.success) {
        // SAVE THE TOKEN! This is the most important part
        localStorage.setItem('token', result.token);
        
        alert(`Welcome back, ${result.username}!`);
        navigate('/dashboard')
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("Server error: Make sure your Python backend is running!");
    }
  }

  return (
    <div className="min-h-screen bg-dev-bg flex items-center justify-center">
      <div className="w-full max-w-md bg-dev-surface border border-dev-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-dev-text-main mb-2">Welcome Back</h1>
        <p className="text-dev-text-muted mb-8">Sign in to continue to DevCollab</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-dev-text-main mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dev-card border border-dev-border rounded-lg px-4 py-3 text-dev-text-main focus:outline-none focus:border-dev-primary"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-dev-text-main mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dev-card border border-dev-border rounded-lg px-4 py-3 text-dev-text-main focus:outline-none focus:border-dev-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-dev-accent to-dev-primary text-white font-bold py-3 rounded-lg hover:opacity-90"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-dev-text-muted mt-6">
          Don't have an account? 
          <span 
            className="text-dev-primary cursor-pointer hover:underline ml-1"
            onClick={() => navigate('/register')}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
