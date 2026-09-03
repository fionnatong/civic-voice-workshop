import { useEffect, useState } from "react";
import { getFeedback } from "../api";

export function AdminPage({ user }) {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadFeedback() {
    setLoading(true);
    setError("");
    try {
      const response = await getFeedback(user);
      setFeedback(response.feedback);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFeedback(); }, [user]);

  return (
    <main className="page-shell admin-shell">
      <div className="page-heading">
        <div className="eyebrow">Admin workspace</div>
        <h1>Feedback inbox</h1>
        <p>A simple view of feedback received from members of the public.</p>
      </div>
      {loading && <section className="feedback-list inbox-state" aria-live="polite">Loading feedback…</section>}
      {error && !loading && (
        <section className="feedback-list inbox-state" role="alert">
          <p className="error-message">Unable to load feedback: {error}</p>
          <button className="primary-button" type="button" onClick={loadFeedback}>Try again</button>
        </section>
      )}
      {!loading && !error && feedback.length === 0 && (
        <section className="feedback-list inbox-state">
          <h2>No feedback yet</h2>
          <p className="muted">New public submissions will appear here.</p>
        </section>
      )}
      {!loading && !error && feedback.length > 0 && <section className="feedback-list">
        <div className="list-header"><strong>Latest feedback</strong><span>{feedback.length} items</span></div>
        {feedback.map((item) => (
          <article className="feedback-row" key={item.id}>
            <div>
              <div className="feedback-meta">{item.name} · {new Date(item.createdAt).toLocaleDateString()}</div>
              <p>{item.message}</p>
            </div>
            <span className="status-pill">{item.status}</span>
          </article>
        ))}
      </section>}
    </main>
  );
}
