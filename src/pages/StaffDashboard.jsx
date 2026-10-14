
import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api'

export default function StaffDashboard() {
  const [section, setSection] = useState('Announcements')
  const [announcements, setAnnouncements] = useState([])
  const [results, setResults] = useState([])
  const [timetable, setTimetable] = useState([])
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '',
    message: '',
    category: 'General',
  })
  const [editingId, setEditingId] = useState(null)

  const role = sessionStorage.getItem('staffRole')
  const name = sessionStorage.getItem('staffName') || 'Staff'
  const token = sessionStorage.getItem('staffToken')

  async function loadData() {
    try {
      const [a, r, t] = await Promise.all([
        fetch(`${API}/announcements`),
        fetch(`${API}/results`),
        fetch(`${API}/timetable`),
      ])

      const ad = await a.json()
      const rd = await r.json()
      const td = await t.json()

      setAnnouncements(ad.announcements || [])
      setResults(rd.results || [])
      setTimetable(td.timetable || [])
    } catch {
      setMessage('Could not load dashboard data.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function saveAnnouncement(e) {
    e.preventDefault()
    setMessage('')

    if (!token) {
      setMessage('Please log in again.')
      return
    }

    try {
      const response = await fetch(
        editingId
          ? `${API}/announcements/${editingId}`
          : `${API}/announcements`,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not save announcement.')
      }

      setForm({ title: '', message: '', category: 'General' })
      setEditingId(null)
      setMessage('Announcement saved successfully.')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Request failed.')
    }
  }

  async function deleteAnnouncement(id) {
    if (!window.confirm('Delete this announcement?')) return

    try {
      const response = await fetch(`${API}/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Delete failed.')

      setMessage('Announcement deleted.')
      await loadData()
    } catch (error) {
      setMessage(error.message || 'Delete failed.')
    }
  }

  function editAnnouncement(item) {
    setEditingId(item._id)
    setForm({
      title: item.title || '',
      message: item.message || '',
      category: item.category || 'General',
    })
  }

  function logout() {
    sessionStorage.removeItem('staffToken')
    sessionStorage.removeItem('staffName')
    sessionStorage.removeItem('staffEmail')
    sessionStorage.removeItem('staffRole')
    window.location.href = '/staff-login'
  }

  if (!token || !['Admin', 'Lecturer'].includes(role)) {
    return (
      <main className="p-8">
        <h1 className="text-xl font-bold">Staff login required</h1>
        <a className="text-blue-600 underline" href="/staff-login">
          Go to Staff Login
        </a>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            CampusSphere Staff
          </h1>
          <p className="mt-2 text-slate-600">
            Welcome, {name} · {role}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          Logout
        </button>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {['Announcements', 'Results', 'Timetable'].map((item) => (
          <button
            key={item}
            onClick={() => setSection(item)}
            className={`rounded-lg px-4 py-2 font-semibold ${
              section === item
                ? 'bg-blue-700 text-white'
                : 'border bg-white text-blue-900'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {message && (
        <p role="status" className="mb-5 rounded-lg bg-blue-50 p-3 text-blue-800">
          {message}
        </p>
      )}

      {section === 'Announcements' && (
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-blue-900">
            {editingId ? 'Edit Announcement' : 'Add Announcement'}
          </h2>

          <form onSubmit={saveAnnouncement} className="mb-8 grid gap-4">
            <input
              className="rounded-lg border p-3"
              placeholder="Announcement title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              required
            />

            <select
              className="rounded-lg border p-3"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option>General</option>
              <option>Exam</option>
              <option>Event</option>
              <option>Important</option>
            </select>

            <textarea
              className="min-h-28 rounded-lg border p-3"
              placeholder="Announcement message"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              required
            />

            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-blue-700 px-5 py-2 text-white">
                {editingId ? 'Save Changes' : 'Add Announcement'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm({
                      title: '',
                      message: '',
                      category: 'General',
                    })
                  }}
                  className="rounded-lg border px-5 py-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h3 className="mb-3 font-bold">Existing Announcements</h3>

          <div className="space-y-3">
            {announcements.map((item) => (
              <article key={item._id} className="rounded-xl border p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.category} · By {item.author}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap">
                      {item.message}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => editAnnouncement(item)}
                      className="rounded-lg bg-amber-100 px-3 py-2 text-amber-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(item._id)}
                      className="rounded-lg bg-red-100 px-3 py-2 text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {announcements.length === 0 && (
              <p className="text-slate-500">No announcements yet.</p>
            )}
          </div>
        </section>
      )}

      {section === 'Results' && (
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold text-blue-900">Results</h2>
          <p className="mt-2 text-slate-600">
            {results.length} result record(s) currently available.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Result management form eka next step eke connect karamu.
          </p>
        </section>
      )}

      {section === 'Timetable' && (
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-bold text-blue-900">Timetable</h2>
          <p className="mt-2 text-slate-600">
            {timetable.length} timetable class(es) currently available.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Timetable management form eka next step eke connect karamu.
          </p>
        </section>
      )}
    </main>
  )
}
