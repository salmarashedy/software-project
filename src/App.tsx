import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'

function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-dev-bg min-h-screen">
        <Header />
        <div className="p-8">
          <p className="text-dev-text-muted">Foundation Ready</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
