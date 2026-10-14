import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(
        'http://localhost:5000/api/students'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error('Unable to connect to the server.')
      }

      const students = Array.isArray(data)
        ? data
        : data.students

      const student = students?.find(
        (item) =>
          item.email?.toLowerCase() ===
            email.trim().toLowerCase() &&
          item.studentId === studentId.trim()
      )

      if (student) {
        setMessage(`Welcome, ${student.name}!`)

        sessionStorage.setItem('studentName', student.name)
        sessionStorage.setItem('studentEmail', student.email)
        sessionStorage.setItem('studentId', student.studentId)
        sessionStorage.setItem('studentCourse', student.course)
        sessionStorage.setItem('studentMongoId', student._id)

        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        setMessage('Invalid email or Student ID.')
      }
    } catch (error) {
      setMessage(
        error.message || 'Cannot connect to the server.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon">🎓</div>

        <p className="login-label">WELCOME BACK</p>

        <h1>Student Login</h1>

        <p className="login-description">
          Sign in to access your CampusSphere student portal.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="login-email">Email Address</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-student-id">Student ID</label>

          <input
            id="login-student-id"
            type="text"
            placeholder="Enter your Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? 'Logging in...'
              : 'Login to CampusSphere →'}
          </button>
        </form>

        {message && (
          <p
            className={`login-message ${
              message.startsWith('Welcome')
                ? 'success'
                : 'error'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
