import { useState } from 'react'
import './Register.css'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    course: '',
  })

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      setMessage('Student registered successfully!')

      setFormData({
        name: '',
        email: '',
        studentId: '',
        course: '',
      })
    } catch (error) {
      setMessage(error.message || 'Cannot connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-icon">🎓</div>

        <p className="register-label">JOIN OUR CAMPUS</p>

        <h1>Student Registration</h1>

        <p className="register-description">
          Create your student account to access your university learning portal.
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="text"
            name="studentId"
            placeholder="Enter your student ID"
            value={formData.studentId}
            onChange={handleChange}
            required
          />

          <label htmlFor="course">Select Course</label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
          >
            <option value="">Choose your course</option>
            <option value="IT">Information Technology</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Data Science">Data Science</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create Student Account →'}
          </button>
        </form>

        {message && (
          <p className={`register-message ${
            message.includes('successfully') ? 'success' : 'error'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default Register
