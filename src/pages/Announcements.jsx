
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api/announcements';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load announcements');
        }

        setAnnouncements(data.announcements || []);
      } catch {
        setError('Announcements load karanna bari una. Backend eka run wenawada balanna.');
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          University Announcements
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Important university news, exams and events.
        </p>
      </div>

      {loading && <p>Loading announcements...</p>}

      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && announcements.length === 0 && (
        <div className="rounded-xl bg-slate-50 p-5 text-slate-600">
          No announcements available at the moment.
        </div>
      )}

      <div className="space-y-4">
        {announcements.map((item) => (
          <article
            key={item._id}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-blue-900">
                {item.title}
              </h3>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
                {item.category}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-slate-700">
              {item.message}
            </p>

            <p className="mt-4 text-xs text-slate-500">
              By {item.author} ·{' '}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : ''}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
