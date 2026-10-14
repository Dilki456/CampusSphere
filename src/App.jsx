
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import Register from './Register.jsx'
import Login from './Login.jsx'
import Profile from './Profile.jsx'
import Courses from './Courses.jsx'
import Assignments from './Assignments.jsx'
import Timetable from './pages/Timetable.jsx'
import Results from './pages/Results.jsx'
import StaffLogin from './pages/StaffLogin'
import StaffDashboard from './pages/StaffDashboard'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <nav className="main-navbar">
        <Link to="/" className="brand">CampusSphere</Link>

        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/register">Registration</Link>
          <Link to="/login">Login</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/assignments">Assignments</Link>
        </div>
      </nav>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/results" element={<Results />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
