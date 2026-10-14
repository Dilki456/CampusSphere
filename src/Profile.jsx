import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()

  const [name, setName] = useState(sessionStorage.getItem('studentName') || '')
  const [email, setEmail] = useState(sessionStorage.getItem('studentEmail') || '')
  const [studentId, setStudentId] = useState(sessionStorage.getItem('studentId') || '')
  const [course, setCourse] = useState(sessionStorage.getItem('studentCourse') || '')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!name.trim() || !email.trim() || !studentId.trim() || !course.trim()) {
      setMessage('Please fill in all fields.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/students')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error('Unable to load student details.')
      }

      const student = data.students.find(
        (item) =>
          item.email === sessionStorage.getItem('studentEmail') &&
          item.studentId === sessionStorage.getItem('studentId')
      )

      if (!student) {
        setMessage('Student not found. Please log in again.')
        return
      }

      const updateResponse = await fetch(
        `http://localhost:5000/api/students/${student._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            studentId: studentId.trim(),
            course: course.trim(),
          }),
        }
      )

      const result = await updateResponse.json()

      if (!updateResponse.ok || !result.success) {
        throw new Error(result.message || 'Profile update failed.')
      }

      sessionStorage.setItem('studentName', result.student.name)
      sessionStorage.setItem('studentEmail', result.student.email)
      sessionStorage.setItem('studentId', result.student.studentId)
      sessionStorage.setItem('studentCourse', result.student.course)

      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button
          type="button"
          className="profile-back"
          onClick={() => navigate('/')}
        >
          ← Back to Dashboard
        </button>

        <div className="profile-avatar">🎓</div>
        <p className="profile-label">STUDENT ACCOUNT</p>
        <h1>My Profile</h1>
        <p className="profile-description">
          View and update your student information.
        </p>

        <form onSubmit={handleUpdate} className="profile-form">
          <label htmlFor="profile-name">Student Name</label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="profile-email">Email Address</label>
          <input
            id="profile-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="profile-id">Student ID</label>
          <input
            id="profile-id"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
          />

          <label htmlFor="profile-course">Course</label>
          <input
            id="profile-course"
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          />

          {message && (
            <p className={`profile-message ${
              message.includes('successfully') ? 'success' : 'error'
            }`}>
              {message}
            </p>
          )}

          <button type="submit" disabled={loading} className="profile-save">
            {loading ? 'Saving...' : 'Save Changes →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile