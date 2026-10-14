import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Courses.css'

const API_URL = 'http://localhost:5000/api/courses'

function Courses() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState(null)

  const emptyForm = {
    courseCode: '',
    courseName: '',
    description: '',
    duration: '',
  }

  const [form, setForm] = useState(emptyForm)

  async function loadCourses() {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch(API_URL)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load courses.')
      }

      setCourses(data.courses)
    } catch (error) {
      setMessage(error.message || 'Failed to fetch courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function startEdit(course) {
    setEditingId(course._id)
    setForm({
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      description: course.description || '',
      duration: course.duration || '',
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseCode: form.courseCode.trim(),
          courseName: form.courseName.trim(),
          description: form.description.trim(),
          duration: form.duration.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save course.')
      }

      setMessage(data.message || 'Course saved successfully.')
      setEditingId(null)
      setForm(emptyForm)
      await loadCourses()
    } catch (error) {
      setMessage(error.message || 'Failed to save course.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCourse(course) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${course.courseName}?`
    )

    if (!confirmed) return

    setMessage('')

    try {
      const response = await fetch(`${API_URL}/${course._id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to delete course.')
      }

      if (editingId === course._id) {
        setEditingId(null)
        setForm(emptyForm)
      }

      setMessage(data.message || 'Course deleted successfully.')
      await loadCourses()
    } catch (error) {
      setMessage(error.message || 'Failed to delete course.')
    }
  }

  return (
    <main className="courses-page">
      <div className="courses-container">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="courses-back"
        >
          ← Back to Dashboard
        </button>

        <header className="courses-header">
          <div>
            <p className="courses-eyebrow">CAMPUSSPHERE LEARNING</p>
            <h1>Course Management</h1>
            <p>Manage your university courses in one place.</p>
          </div>

          <div className="courses-count">
            <span>{courses.length}</span>
            <small>Available Courses</small>
          </div>
        </header>

        {message && (
          <p className="courses-message" role="status">
            {message}
          </p>
        )}

        <section className="course-form-card">
          <h2>{editingId ? 'Edit Course' : 'Add a New Course'}</h2>
          <p className="courses-section-description">
            Enter the course details below.
          </p>

          <form onSubmit={handleSubmit} className="course-form">
            <div className="course-fields">
              <div className="course-field">
                <label htmlFor="courseCode">Course Code</label>
                <input
                  id="courseCode"
                  name="courseCode"
                  value={form.courseCode}
                  onChange={handleChange}
                  placeholder="e.g. IT101"
                  required
                />
              </div>

              <div className="course-field">
                <label htmlFor="courseName">Course Name</label>
                <input
                  id="courseName"
                  name="courseName"
                  value={form.courseName}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  required
                />
              </div>

              <div className="course-field">
                <label htmlFor="duration">Duration</label>
                <input
                  id="duration"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 months"
                  required
                />
              </div>

              <div className="course-field course-field-full">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the course"
                  rows="4"
                />
              </div>
            </div>

            <div className="course-form-actions">
              <button type="submit" disabled={saving} className="course-primary">
                {saving ? 'Saving...' : editingId ? 'Update Course' : '+ Add Course'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="course-cancel"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="available-courses">
          <h2>Available Courses</h2>

          {loading ? (
            <p className="courses-empty">Loading courses...</p>
          ) : courses.length === 0 ? (
            <div className="courses-empty">
              <h3>No courses available</h3>
              <p>Add your first course using the form above.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <article key={course._id} className="course-card">
                  <div className="course-card-top">
                    <span className="course-code">{course.courseCode}</span>
                    <span className="course-duration">{course.duration}</span>
                  </div>

                  <h3>{course.courseName}</h3>
                  <p className="course-description">
                    {course.description || 'No description available.'}
                  </p>

                  <div className="course-card-actions">
                    <button
                      type="button"
                      onClick={() => startEdit(course)}
                      className="course-edit"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCourse(course)}
                      className="course-delete"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Courses