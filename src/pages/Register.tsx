import { useNavigate } from 'react-router-dom'
import React, { useState } from 'react' // Added useState
import { authService } from '../services/authService' // Import our service

function Register() {
  const navigate = useNavigate()
  
  // State to hold form data
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address (e.g., name@example.com)");
        return; 
    }

    try {
        const result = await authService.register(username, email, password);
    
      if (result.success) {
        alert(result.message || "Account created successfully!")
        navigate('/login')
      } else {
        alert("Error: " + result.error)
      }
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : String(error);
      alert("Server error: " + msg);
    }
  }

  return (
    <div className="min-h-screen bg-dev-bg flex items-center justify-center">
      <div className="w-full max-w-md bg-dev-surface border border-dev-border rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-dev-text-main mb-2">Create Account</h1>
        <p className="text-dev-text-muted mb-8">Join DevCollab to start collaborating</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-dev-text-main mb-2">Full Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-dev-card border border-dev-border rounded-lg px-4 py-3 text-dev-text-main focus:outline-none focus:border-dev-primary"
              placeholder="John Doe"
              required
            />
          </div>
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
            Create Account
          </button>
        </form>

        <p className="text-center text-dev-text-muted mt-6">
          Already have an account? 
          <span 
            className="text-dev-primary cursor-pointer hover:underline ml-1"
            onClick={() => navigate('/login')}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register
