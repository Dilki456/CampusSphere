
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/timetable";

const emptyForm = {
  courseCode: "",
  courseName: "",
  day: "Monday",
  startTime: "08:00",
  endTime: "10:00",
  location: "",
};

function Timetable() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
  ];

  // Load classes from MongoDB through the backend API
  const loadClasses = async () => {
    try {
      setError("");
      const response = await fetch(API);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load timetable.");
      }

      setClasses(data.timetable || []);
    } catch (err) {
      setError(err.message || "Failed to load timetable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.startTime >= form.endTime) {
      alert("End time must be later than start time.");
      return;
    }

    try {
      setError("");

      const payload = {
        ...form,
        subject: `${form.courseCode} - ${form.courseName}`,
      };

      const url = editingId
        ? `${API}/${editingId}`
        : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not save class.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadClasses();
    } catch (err) {
      setError(err.message || "Failed to save class.");
    }
  };

  const handleEdit = (item) => {
    const subjectParts = (item.subject || "").split(" - ");

    setForm({
      courseCode: item.courseCode || subjectParts[0] || "",
      courseName: item.courseName || subjectParts.slice(1).join(" - ") || "",
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      location: item.location || "",
    });

    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class from your timetable?")) return;

    try {
      setError("");

      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete class.");
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      await loadClasses();
    } catch (err) {
      setError(err.message || "Failed to delete class.");
    }
  };

  const sortedClasses = [...classes].sort((a, b) => {
    const dayDifference = days.indexOf(a.day) - days.indexOf(b.day);
    return dayDifference || a.startTime.localeCompare(b.startTime);
  });

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>CAMPUSSPHERE • STUDENT PORTAL</p>
          <h1 style={styles.heading}>My Timetable</h1>
          <p style={styles.subtitle}>Organize your weekly classes in one place.</p>
        </div>
        <div style={styles.calendarIcon}>📅</div>
      </div>

      {error && (
        <div role="alert" style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <span>📚</span>
          <div>
            <h2>{classes.length}</h2>
            <p>Total Classes</p>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span>🗓️</span>
          <div>
            <h2>{new Set(classes.map((item) => item.day)).size}</h2>
            <p>Active Days</p>
          </div>
        </div>
      </div>

      <section style={styles.card}>
        <h2 style={styles.sectionHeading}>
          {editingId ? "Edit Class" : "Add New Class"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <label style={styles.label}>
              Course Code
              <input
                style={styles.input}
                name="courseCode"
                placeholder="e.g. IT103"
                value={form.courseCode}
                onChange={handleChange}
                required
              />
            </label>

            <label style={styles.label}>
              Course Name
              <input
                style={styles.input}
                name="courseName"
                placeholder="e.g. Data Science"
                value={form.courseName}
                onChange={handleChange}
                required
              />
            </label>

            <label style={styles.label}>
              Day
              <select style={styles.input} name="day" value={form.day} onChange={handleChange}>
                {days.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </label>

            <label style={styles.label}>
              Location / Lecture Hall
              <input
                style={styles.input}
                name="location"
                placeholder="e.g. Lab 02"
                value={form.location}
                onChange={handleChange}
                required
              />
            </label>

            <label style={styles.label}>
              Start Time
              <input style={styles.input} type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
            </label>

            <label style={styles.label}>
              End Time
              <input style={styles.input} type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
            </label>
          </div>

          <div style={styles.formActions}>
            <button style={styles.primaryButton} type="submit">
              {editingId ? "Save Changes" : "+ Add Class"}
            </button>

            {editingId && (
              <button
                style={styles.cancelButton}
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={styles.card}>
        <div style={styles.listHeader}>
          <div>
            <h2 style={styles.sectionHeading}>Weekly Schedule</h2>
            <p style={styles.subtitle}>Your classes, organized by day.</p>
          </div>
          <span style={styles.countBadge}>{classes.length} classes</span>
        </div>

        {loading ? (
          <p>Loading timetable...</p>
        ) : sortedClasses.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 42 }}>🗓️</div>
            <h3>No classes added yet</h3>
            <p>Add your first class using the form above.</p>
          </div>
        ) : (
          days.map((day) => {
            const dayClasses = sortedClasses.filter((item) => item.day === day);
            if (dayClasses.length === 0) return null;

            return (
              <div key={day} style={styles.dayGroup}>
                <h3 style={styles.dayHeading}>{day}</h3>

                {dayClasses.map((item) => {
                  const parts = (item.subject || "").split(" - ");
                  const code = item.courseCode || parts[0] || "";
                  const name = item.courseName || parts.slice(1).join(" - ") || item.subject;

                  return (
                    <div key={item._id} style={styles.classRow}>
                      <div style={styles.timeBlock}>
                        <strong>{item.startTime}</strong>
                        <span>{item.endTime}</span>
                      </div>

                      <div style={styles.classDetails}>
                        <span style={styles.courseCode}>{code}</span>
                        <h3>{name}</h3>
                        <p>📍 {item.location}</p>
                      </div>

                      <div style={styles.itemActions}>
                        <button style={styles.editButton} onClick={() => handleEdit(item)} type="button">Edit</button>
                        <button style={styles.deleteButton} onClick={() => handleDelete(item._id)} type="button">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

const styles = {
  page: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", color: "#1e293b", fontFamily: "Arial, sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  eyebrow: { color: "#64748b", fontSize: "12px", fontWeight: "bold", letterSpacing: "1.5px" },
  heading: { fontSize: "32px", margin: "8px 0" },
  subtitle: { color: "#64748b", margin: "6px 0" },
  calendarIcon: { fontSize: "42px" },
  summary: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  summaryCard: { display: "flex", alignItems: "center", gap: "16px", padding: "22px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px" },
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", marginBottom: "24px" },
  sectionHeading: { fontSize: "20px", margin: "0 0 20px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" },
  label: { display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", fontWeight: "600" },
  input: { boxSizing: "border-box", width: "100%", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", background: "#ffffff" },
  formActions: { display: "flex", gap: "10px", marginTop: "22px" },
  primaryButton: { background: "#4f46e5", color: "#ffffff", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" },
  cancelButton: { background: "#e2e8f0", color: "#1e293b", border: "none", padding: "12px 20px", borderRadius: "8px", cursor: "pointer" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  countBadge: { background: "#eef2ff", color: "#4338ca", padding: "8px 12px", borderRadius: "20px", fontSize: "13px" },
  emptyState: { textAlign: "center", padding: "40px 16px", color: "#64748b" },
  dayGroup: { marginTop: "24px" },
  dayHeading: { fontSize: "16px", color: "#4338ca", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" },
  classRow: { display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap", padding: "18px 0", borderBottom: "1px solid #f1f5f9" },
  timeBlock: { display: "flex", flexDirection: "column", gap: "6px", minWidth: "75px" },
  classDetails: { flex: "1", minWidth: "180px" },
  courseCode: { color: "#4f46e5", fontSize: "12px", fontWeight: "bold" },
  itemActions: { display: "flex", gap: "8px" },
  editButton: { border: "1px solid #cbd5e1", background: "#ffffff", padding: "8px 12px", borderRadius: "7px", cursor: "pointer" },
  deleteButton: { border: "1px solid #fecaca", color: "#b91c1c", background: "#fff1f2", padding: "8px 12px", borderRadius: "7px", cursor: "pointer" },
  error: { color: "#b91c1c", background: "#fff1f2", border: "1px solid #fecaca", padding: "12px", borderRadius: "8px", marginBottom: "16px" },
};

export default Timetable;
