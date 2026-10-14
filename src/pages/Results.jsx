
import { useEffect, useState } from 'react';

const API = 'http://localhost:5000/api/results';

export default function Results() {
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    studentName: '',
    courseCode: '',
    examName: '',
    marks: '',
    grade: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  async function loadResults() {
    try {
      const response = await fetch(API);
      const data = await response.json();
      if (data.success) setResults(data.results);
    } catch {
      setMessage('Backend server eka run wenawada balanna.');
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previous) => {
      const next = { ...previous, [name]: value };
      if (name === 'marks' && value !== '') {
        const marks = Number(value);
        next.grade =
          marks >= 75 ? 'A' :
          marks >= 65 ? 'B' :
          marks >= 50 ? 'C' :
          marks >= 35 ? 'S' : 'F';
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            marks: Number(form.marks),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Save karanna bari una.');
      }

      setMessage(editingId ? 'Result updated!' : 'Result saved!');
      setForm({
        studentName: '',
        courseCode: '',
        examName: '',
        marks: '',
        grade: '',
      });
      setEditingId(null);
      await loadResults();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function editResult(result) {
    setEditingId(result._id);
    setForm({
      studentName: result.studentName,
      courseCode: result.courseCode,
      examName: result.examName,
      marks: String(result.marks),
      grade: result.grade,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteResult(id) {
    if (!window.confirm('Me result eka delete karannada?')) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Delete karanna bari una.');
      }

      setMessage('Result deleted!');
      await loadResults();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div style={{ padding: '24px', color: '#1f2937' }}>
      <h1>Student Results</h1>
      <p>Add, manage and view student examination results.</p>

      {message && (
        <p role="status" style={{ padding: '10px', background: '#f3f4f6' }}>
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '10px',
          marginBottom: '24px',
        }}
      >
        <input
          name="studentName"
          placeholder="Student name"
          value={form.studentName}
          onChange={handleChange}
          required
        />
        <input
          name="courseCode"
          placeholder="Course code (e.g. IT103)"
          value={form.courseCode}
          onChange={handleChange}
          required
        />
        <input
          name="examName"
          placeholder="Exam name"
          value={form.examName}
          onChange={handleChange}
          required
        />
        <input
          name="marks"
          type="number"
          placeholder="Marks (0–100)"
          min="0"
          max="100"
          value={form.marks}
          onChange={handleChange}
          required
        />
        <input
          name="grade"
          placeholder="Grade (auto-calculated)"
          value={form.grade}
          readOnly
          required
        />

        <button type="submit">
          {editingId ? 'Update Result' : 'Save Result'}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                studentName: '',
                courseCode: '',
                examName: '',
                marks: '',
                grade: '',
              });
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <h2>Saved Results ({results.length})</h2>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr>
              {['Student', 'Course', 'Exam', 'Marks', 'Grade', 'Actions'].map(
                (heading) => (
                  <th
                    key={heading}
                    style={{ padding: '12px', borderBottom: '1px solid #ddd' }}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result._id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {result.studentName}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {result.courseCode}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {result.examName}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {result.marks}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {result.grade}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <button onClick={() => editResult(result)}>Edit</button>{' '}
                  <button onClick={() => deleteResult(result._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '16px' }}>
                  No results added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
