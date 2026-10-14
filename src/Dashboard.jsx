
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Timetable from './pages/Timetable.jsx'
import Results from './pages/Results.jsx'
import Announcements from './pages/Announcements.jsx'

const API = 'http://localhost:5000/api'

const menu = [
  ['Dashboard', '⌂'],
  ['My Courses', '▤'],
  ['Assignments', '✎'],
  ['Timetable', '▦'],
  ['Results', '▥'],
  ['Announcements', '♧'],
]

function Dashboard() {
  const navigate = useNavigate()

  const [active, setActive] = useState('Dashboard')
  const [courses, setCourses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const studentName = sessionStorage.getItem('studentName') || 'Student'
  const studentEmail = sessionStorage.getItem('studentEmail') || ''
  const studentId = sessionStorage.getItem('studentId') || ''
  const studentCourse = sessionStorage.getItem('studentCourse') || 'Undergraduate'

  const normalizedStudentCourse = studentCourse.trim().toLowerCase()

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ST'

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [coursesResponse, assignmentsResponse] = await Promise.all([
          fetch(`${API}/courses`),
          fetch(`${API}/assignments`),
        ])

        if (!coursesResponse.ok || !assignmentsResponse.ok) {
          throw new Error('Unable to load dashboard data.')
        }

        const coursesData = await coursesResponse.json()
        const assignmentsData = await assignmentsResponse.json()

        setCourses(coursesData.courses || [])
        setAssignments(assignmentsData.assignments || [])
      } catch (err) {
        setError(err.message || 'Could not connect to the backend.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  
  const myCourses = courses.filter((course) => {
    const courseName = course.courseName?.trim().toLowerCase() || ''
    const courseCode = course.courseCode?.trim().toLowerCase() || ''

    // Match the student's selected course or course code.
    if (
      courseName === normalizedStudentCourse ||
      courseCode === normalizedStudentCourse
    ) {
      return true
    }

    // The existing database contains IT101 and IT102.
    // A student registered under "IT" can see those courses.
    if (
      normalizedStudentCourse === 'it' &&
      courseCode.startsWith('it')
    ) {
      return true
    }

    return false
  })

  const myAssignments = assignments.filter((assignment) => {
    return myCourses.some((course) => {
      const assignmentCourse =
        assignment.course?.trim().toLowerCase() || ''

      return (
        assignmentCourse === course.courseName?.trim().toLowerCase() ||
        assignmentCourse === course.courseCode?.trim().toLowerCase()
      )
    })
  })

  function handleLogout() {
    sessionStorage.removeItem('studentName')
    sessionStorage.removeItem('studentEmail')
    sessionStorage.removeItem('studentId')
    sessionStorage.removeItem('studentCourse')
    sessionStorage.removeItem('studentMongoId')
    navigate('/login')
  }

  function handleMenuClick(name) {
    if (name === 'My Courses') {
      navigate('/courses')
    } else if (name === 'Assignments') {
      navigate('/assignments')
    } else {
      setActive(name)
    }
  }

  function formatDate(value) {
    if (!value) return 'No due date'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'No due date'

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const pendingCount = myAssignments.filter(
    (item) => item.status === 'Pending'
  ).length

  const inProgressCount = myAssignments.filter(
    (item) => item.status === 'In Progress'
  ).length

  const completedCount = myAssignments.filter(
    (item) => item.status === 'Completed'
  ).length

  const progress = myAssignments.length
    ? Math.round((completedCount / myAssignments.length) * 100)
    : 0

  const stats = [
    {
      label: 'Enrolled Courses',
      value: myCourses.length,
      icon: '📚',
      note: 'Matching your course',
    },
    {
      label: 'Pending Assignments',
      value: pendingCount,
      icon: '📝',
      note: 'Needs your attention',
    },
    {
      label: 'Overall Progress',
      value: `${progress}%`,
      icon: '📈',
      note: 'Based on completed assignments',
    },
    {
      label: 'In Progress',
      value: inProgressCount,
      icon: '⏳',
      note: 'Assignments in progress',
    },
  ]

  const statusStyle = (status) => {
    if (status === 'Completed') {
      return 'bg-emerald-50 text-emerald-700'
    }

    if (status === 'Pending') {
      return 'bg-amber-50 text-amber-700'
    }

    return 'bg-blue-50 text-blue-700'
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="bg-slate-900 p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">CampusSphere</h1>
          <p className="mt-1 text-xs text-slate-400">
            STUDENT LEARNING PORTAL
          </p>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Learning
        </p>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          {menu.map(([name, icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => handleMenuClick(name)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
                active === name
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{icon}</span>
              {name}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-xl bg-slate-800 p-4">
          <p className="text-sm font-semibold">Need help?</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Contact your university support team for assistance.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Student Portal / {active}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-blue-900 sm:text-3xl">
              {active}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {studentName}! Here is your learning overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold">{studentName}</p>
              <p className="text-xs text-slate-500">{studentCourse}</p>
              {studentId && (
                <p className="text-xs text-slate-500">ID: {studentId}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        {studentEmail && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-blue-900">
                My Student Profile
              </h3>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                View / Edit Profile →
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <p className="break-words text-sm text-slate-600">
                <strong>Name: </strong>{studentName}
              </p>
              <p className="break-words text-sm text-slate-600">
                <strong>Email: </strong>{studentEmail}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Student ID: </strong>{studentId || 'Not available'}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Course: </strong>{studentCourse}
              </p>
            </div>
          </section>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            Loading data from MongoDB...
          </div>
        ) : (
          <>
            {active === 'Dashboard' && (
              <>
                <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-slate-500">{item.label}</p>
                        <span className="text-xl">{item.icon}</span>
                      </div>
                      <p className="mt-4 text-3xl font-bold text-blue-900">
                        {item.value}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                    </div>
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">
                          My Courses
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Courses matching your profile
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/courses')}
                        className="text-sm font-semibold text-blue-700"
                      >
                        View all →
                      </button>
                    </div>

                    {myCourses.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        No matching course found. Check your registered course name.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {myCourses.slice(0, 5).map((course) => (
                          <div
                            key={course._id || course.courseCode}
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <p className="text-xs font-semibold text-blue-700">
                              {course.courseCode}
                            </p>
                            <h4 className="mt-1 font-semibold">
                              {course.courseName}
                            </h4>
                            {course.description && (
                              <p className="mt-1 text-sm text-slate-500">
                                {course.description}
                              </p>
                            )}
                            <p className="mt-2 text-xs text-slate-500">
                              Duration: {course.duration || 'Not specified'}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">
                          Recent Assignments
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Assignments matching your course
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/assignments')}
                        className="text-sm font-semibold text-blue-700"
                      >
                        View all →
                      </button>
                    </div>

                    {myAssignments.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                        No assignments found for your matching course.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {myAssignments.slice(0, 5).map((item) => (
                          <div
                            key={item._id || item.title}
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="font-semibold">{item.title}</h4>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(item.status)}`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">
                              {item.course}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              Due: {formatDate(item.dueDate)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-bold text-blue-900">
                    Assignment Progress
                  </h3>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {completedCount} of {myAssignments.length} assignments completed ({progress}%).
                  </p>
                </section>
              </>
            )}

            {active === 'My Courses' && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-xl font-bold text-blue-900">My Courses</h3>
                {myCourses.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No matching course found for your profile.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {myCourses.map((course) => (
                      <div
                        key={course._id || course.courseCode}
                        className="rounded-xl border border-slate-200 p-5"
                      >
                        <p className="text-sm font-semibold text-blue-700">
                          {course.courseCode}
                        </p>
                        <h4 className="mt-2 font-bold">{course.courseName}</h4>
                        <p className="mt-2 text-sm text-slate-500">
                          {course.description}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Duration: {course.duration || 'Not specified'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Manage Courses
                </button>
              </section>
            )}

            {active === 'Assignments' && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-xl font-bold text-blue-900">Assignments</h3>
                {myAssignments.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    No assignments found for your matching course.
                  </p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {myAssignments.map((item) => (
                      <div
                        key={item._id || item.title}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{item.course}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Due: {formatDate(item.dueDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/assignments')}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Manage Assignments
                </button>
              </section>
            )}
             {active === 'Timetable' && <Timetable />}
            
            {active === 'Results' && <Results />}

            {active === 'Announcements' && <Announcements />}
          </>
        )}

        <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          © 2026 CampusSphere · University Learning Management System
        </footer>
      </main>
    </div>
  )
}

export default Dashboard
