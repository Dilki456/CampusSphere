
import { useState } from 'react'

const courses = [
  { code: 'IT4010', name: 'Web Application Development', lecturer: 'Dr. Perera', progress: 75, color: 'bg-blue-600' },
  { code: 'IT4020', name: 'Database Management Systems', lecturer: 'Ms. Fernando', progress: 60, color: 'bg-violet-600' },
  { code: 'IT4030', name: 'Software Engineering', lecturer: 'Mr. Silva', progress: 85, color: 'bg-emerald-600' },
]

const assignments = [
  { title: 'React Web Application', course: 'Web Application Development', due: 'Oct 18, 2026', status: 'Pending' },
  { title: 'Database Design Report', course: 'Database Management Systems', due: 'Oct 20, 2026', status: 'In progress' },
  { title: 'Project Proposal', course: 'Software Engineering', due: 'Oct 24, 2026', status: 'Pending' },
]

function App() {
  const [active, setActive] = useState('Dashboard')

  const menu = [
    ['Dashboard', '⌂'],
    ['My Courses', '▤'],
    ['Assignments', '✎'],
    ['Timetable', '▦'],
    ['Results', '▥'],
    ['Announcements', '♧'],
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="bg-slate-900 p-5 text-white md:min-h-screen md:w-64 md:shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">CampusSphere</h1>
          <p className="mt-1 text-xs text-slate-400">STUDENT LEARNING PORTAL</p>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Learning
        </p>

        <nav className="flex flex-wrap gap-2 md:flex-col">
          {menu.map(([name, icon]) => (
            <button
              key={name}
              onClick={() => setActive(name)}
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
            <p className="text-sm text-slate-500">Student Portal / {active}</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{active}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Here is your learning overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActive('Announcements')}
              className="rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-100"
              aria-label="View announcements"
            >
              🔔
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              ST
            </div>
            <div>
              <p className="text-sm font-semibold">Student Name</p>
              <p className="text-xs text-slate-500">Undergraduate</p>
            </div>
          </div>
        </header>

        {active === 'Dashboard' ? (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Enrolled Courses', value: '06', icon: '📚', note: 'This semester' },
                { label: 'Pending Assignments', value: '03', icon: '📝', note: 'Needs your attention' },
                { label: 'Overall Progress', value: '78%', icon: '📈', note: 'Across your courses' },
                { label: 'Upcoming Classes', value: '04', icon: '📅', note: 'This week' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <p className="mt-4 text-3xl font-bold">{item.value}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                </div>
              ))}
            </section>

            <section className="mb-8 grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">My Courses</h3>
                    <p className="mt-1 text-sm text-slate-500">Your learning progress</p>
                  </div>
                  <button onClick={() => setActive('My Courses')} className="text-sm font-semibold text-blue-700">
                    View all →
                  </button>
                </div>

                <div className="space-y-6">
                  {courses.map((course) => (
                    <div key={course.code}>
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-blue-700">{course.code}</p>
                          <h4 className="mt-1 font-semibold">{course.name}</h4>
                          <p className="mt-1 text-xs text-slate-500">{course.lecturer}</p>
                        </div>
                        <p className="font-bold">{course.progress}%</p>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-bold">Upcoming Classes</h3>
                <p className="mt-1 text-sm text-slate-500">Your weekly schedule</p>
                <div className="mt-6 space-y-5">
                  {[
                    { day: 'MON', time: '09:00 AM', name: 'Web Development', room: 'Lab 02' },
                    { day: 'TUE', time: '11:00 AM', name: 'Database Systems', room: 'Room 104' },
                    { day: 'WED', time: '01:00 PM', name: 'Software Engineering', room: 'Room 205' },
                    { day: 'FRI', time: '10:00 AM', name: 'UI/UX Workshop', room: 'Lab 01' },
                  ].map((item) => (
                    <div key={item.name} className="flex gap-3">
                      <div className="h-fit min-w-14 rounded-lg bg-blue-50 px-3 py-2 text-center">
                        <p className="text-xs font-bold text-blue-700">{item.day}</p>
                        <p className="mt-1 text-xs text-blue-600">{item.time}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.room}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
                <div className="mb-5">
                  <h3 className="text-lg font-bold">Recent Assignments</h3>
                  <p className="mt-1 text-sm text-slate-500">Keep track of your deadlines</p>
                </div>
                <div className="space-y-4">
                  {assignments.map((item) => (
                    <div key={item.title} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.course}</p>
                        <p className="mt-1 text-xs text-slate-500">Due: {item.due}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActive('Assignments')} className="mt-5 text-sm font-semibold text-blue-700">
                  View assignments →
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-bold">Announcements</h3>
                <p className="mt-1 text-sm text-slate-500">Latest university updates</p>
                <div className="mt-5 space-y-5">
                  <div className="border-l-4 border-blue-600 pl-3">
                    <p className="text-sm font-semibold">Semester Examination</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Check the examination timetable before the deadline.</p>
                  </div>
                  <div className="border-l-4 border-violet-500 pl-3">
                    <p className="text-sm font-semibold">Library Notice</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Remember to return borrowed books on time.</p>
                  </div>
                  <div className="border-l-4 border-emerald-500 pl-3">
                    <p className="text-sm font-semibold">Project Submissions</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Review your course pages for submission guidelines.</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h3 className="text-xl font-bold">{active}</h3>
            <p className="mt-2 text-slate-500">
              This section is ready for the next development step.
            </p>

            {active === 'My Courses' && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {courses.map((course) => (
                  <div key={course.code} className="rounded-xl border border-slate-200 p-5">
                    <p className="text-sm font-semibold text-blue-700">{course.code}</p>
                    <h4 className="mt-2 font-bold">{course.name}</h4>
                    <p className="mt-2 text-sm text-slate-500">Lecturer: {course.lecturer}</p>
                    <p className="mt-3 text-sm">Progress: {course.progress}%</p>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {active === 'Assignments' && (
              <div className="mt-6 space-y-4">
                {assignments.map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-200 p-4">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{item.course}</p>
                    <p className="mt-2 text-sm">Due: {item.due}</p>
                    <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">{item.status}</span>
                  </div>
                ))}
              </div>
            )}

            {active === 'Timetable' && (
              <div className="mt-6 space-y-3">
                {[
                  'Monday — 09:00 AM — Web Development — Lab 02',
                  'Tuesday — 11:00 AM — Database Systems — Room 104',
                  'Wednesday — 01:00 PM — Software Engineering — Room 205',
                  'Friday — 10:00 AM — UI/UX Workshop — Lab 01',
                ].map((item) => (
                  <p key={item} className="rounded-lg bg-slate-50 p-4 text-sm">{item}</p>
                ))}
              </div>
            )}

            {active === 'Results' && (
              <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm">
                Your grades and examination results will appear here when they are added by your university.
              </p>
            )}

            {active === 'Announcements' && (
              <div className="mt-6 space-y-4">
                {[
                  ['Semester Examination', 'Check the examination timetable before the deadline.'],
                  ['Library Notice', 'Remember to return borrowed books on time.'],
                  ['Project Submissions', 'Review your course pages for submission guidelines.'],
                ].map(([title, message]) => (
                  <div key={title} className="rounded-lg border border-slate-200 p-4">
                    <h4 className="font-semibold">{title}</h4>
                    <p className="mt-1 text-sm text-slate-500">{message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <footer className="mt-8 border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
          © 2026 CampusSphere · University Learning Management System
        </footer>
      </main>
    </div>
  )
}

export default App
