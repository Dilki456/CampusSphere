import { useEffect, useState } from 'react'
import './Assignments.css'

const API_URL = 'http://localhost:5000/api/assignments'

function Assignments() {
const [assignments, setAssignments] = useState([])
const [loading, setLoading] = useState(true)
const [message, setMessage] = useState('')
const [editingId, setEditingId] = useState(null)

const emptyForm = {
title: '',
course: '',
description: '',
dueDate: '',
status: 'Pending',
}

const [form, setForm] = useState(emptyForm)

async function loadAssignments() {
try {
const response = await fetch(API_URL)
const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load assignments')
  }

  setAssignments(data.assignments || [])
} catch (error) {
  setMessage(error.message || 'Cannot connect to the server.')
} finally {
  setLoading(false)
}

}

useEffect(() => {
loadAssignments()
}, [])

function handleChange(event) {
const { name, value } = event.target
setForm((previous) => ({ ...previous, [name]: value }))
}

async function handleSubmit(event) {
event.preventDefault()
setMessage('')

try {
  const url = editingId
    ? `${API_URL}/${editingId}`
    : API_URL

  const response = await fetch(url, {
    method: editingId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Could not save assignment')
  }

  setMessage(
    editingId
      ? 'Assignment updated successfully!'
      : 'Assignment added successfully!'
  )

  setForm(emptyForm)
  setEditingId(null)
  setLoading(true)
  await loadAssignments()
} catch (error) {
  setMessage(error.message || 'Something went wrong.')
}

}

function handleEdit(assignment) {
setEditingId(assignment._id)

setForm({
  title: assignment.title || '',
  course: assignment.course || '',
  description: assignment.description || '',
  dueDate: assignment.dueDate
    ? assignment.dueDate.slice(0, 10)
    : '',
  status: assignment.status || 'Pending',
})

setMessage('')
window.scrollTo({ top: 0, behavior: 'smooth' })

}

async function handleDelete(id) {
const confirmed = window.confirm(
'Are you sure you want to delete this assignment?'
)

if (!confirmed) return

try {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Could not delete assignment')
  }

  setMessage('Assignment deleted successfully!')
  setLoading(true)
  await loadAssignments()
} catch (error) {
  setMessage(error.message || 'Something went wrong.')
}

}

function cancelEdit() {
setEditingId(null)
setForm(emptyForm)
setMessage('')
}

const pendingCount = assignments.filter(
(item) => item.status === 'Pending'
).length

const progressCount = assignments.filter(
(item) => item.status === 'In Progress'
).length

const completedCount = assignments.filter(
(item) => item.status === 'Completed'
).length

return (
<div className="assignments-page">
<div className="assignments-container">

    {/* Blue Header */}
    <header className="assignments-header">
      <p className="assignments-eyebrow">
        CampusSphere Student Portal
      </p>

      <h1>Assignments Management</h1>

      <p className="assignments-subtitle">
        Manage your assignments, deadlines, and progress in one place.
      </p>
    </header>

    {/* Message */}
    {message && (
      <div className="assignments-message" role="status">
        {message}
      </div>
    )}

    {/* Add / Edit Form */}
    <section className="assignments-panel">
      <div className="assignments-section-heading">
        <div className="assignments-icon">📝</div>

        <div>
          <h2>
            {editingId ? 'Edit Assignment' : 'Add New Assignment'}
          </h2>

          <p>Enter the assignment details below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="assignments-form-grid">
          <div className="assignments-field">
            <label htmlFor="assignment-title">
              Assignment Title *
            </label>

            <input
              id="assignment-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={150}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div className="assignments-field">
            <label htmlFor="assignment-course">
              Course Name *
            </label>

            <input
              id="assignment-course"
              type="text"
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Enter course name or code"
              required
            />
          </div>

          <div className="assignments-field">
            <label htmlFor="assignment-date">Due Date *</label>

            <input
              id="assignment-date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="assignments-field">
            <label htmlFor="assignment-status">
              Assignment Status
            </label>

            <select
              id="assignment-status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="assignments-field assignments-full-width">
            <label htmlFor="assignment-description">
              Description
            </label>

            <textarea
              id="assignment-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={2000}
              placeholder="Enter assignment instructions or details"
              rows={4}
            />
          </div>
        </div>

        <div className="assignments-form-actions">
          <button type="submit" className="assignments-primary-button">
            {editingId ? '✓ Update Assignment' : '+ Add Assignment'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="assignments-cancel-button"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>

    {/* Assignment List */}
    <section className="assignments-panel">
      <div className="assignments-list-heading">
        <div>
          <h2>Assignment List</h2>
          <p>View and manage all assignments.</p>
        </div>

        <button
          type="button"
          className="assignments-refresh-button"
          onClick={() => {
            setLoading(true)
            loadAssignments()
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {!loading && (
        <div className="assignments-stats">
          <div className="assignments-stat-card stat-blue">
            <span>Total Assignments</span>
            <strong>{assignments.length}</strong>
          </div>

          <div className="assignments-stat-card stat-orange">
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>

          <div className="assignments-stat-card stat-purple">
            <span>In Progress</span>
            <strong>{progressCount}</strong>
          </div>

          <div className="assignments-stat-card stat-green">
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>
      )}

      {loading ? (
        <p className="assignments-empty">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <div className="assignments-empty">
          <div className="assignments-empty-icon">📚</div>
          <h3>No Assignments Yet</h3>
          <p>
            Use the form above to add your first assignment.
          </p>
        </div>
      ) : (
        <div className="assignments-list">
          {assignments.map((assignment) => (
            <article
              className="assignment-card"
              key={assignment._id}
            >
              <div className="assignment-card-content">
                <h3>{assignment.title}</h3>

                <p>
                  <strong>Course:</strong> {assignment.course}
                </p>

                <p>
                  <strong>Due date:</strong>{' '}
                  {assignment.dueDate
                    ? new Date(
                        assignment.dueDate
                      ).toLocaleDateString()
                    : 'Not set'}
                </p>

                <p className="assignment-description">
                  {assignment.description ||
                    'No description provided.'}
                </p>

                <span
                  className={`assignment-status ${
                    assignment.status === 'Completed'
                      ? 'status-completed'
                      : assignment.status === 'In Progress'
                        ? 'status-progress'
                        : 'status-pending'
                  }`}
                >
                  {assignment.status}
                </span>
              </div>

              <div className="assignment-card-actions">
                <button
                  type="button"
                  className="assignments-edit-button"
                  onClick={() => handleEdit(assignment)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="assignments-delete-button"
                  onClick={() => handleDelete(assignment._id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <footer className="assignments-footer">
      CampusSphere • Assignments Management
    </footer>
  </div>
</div>

)
}

export default Assignments