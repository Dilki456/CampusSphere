import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function StaffLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/staff/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed.')
      }

      if (!['Admin', 'Lecturer'].includes(data.user?.role)) {
        throw new Error('Staff access only.')
      }

      sessionStorage.setItem('staffToken', data.token)
      sessionStorage.setItem('staffName', data.user.name)
      sessionStorage.setItem('staffEmail', data.user.email)
      sessionStorage.setItem('staffRole', data.user.role)

      navigate('/staff-dashboard')
    } catch (error) {
      setMessage(error.message || 'Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f6fb',
        padding: '20px',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#fff',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1>Staff Login</h1>
        <p>CampusSphere Admin &amp; Lecturer Portal</p>

        <label htmlFor="staff-email">Email Address</label>
        <input
          id="staff-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            margin: '8px 0 18px',
            boxSizing: 'border-box',
          }}
        />

        <label htmlFor="staff-password">Password</label>
        <input
          id="staff-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            margin: '8px 0 20px',
            boxSizing: 'border-box',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#2447a8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {message && (
          <p role="status" style={{ marginTop: '16px' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

export default StaffLogin 