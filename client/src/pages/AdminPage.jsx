import { useEffect, useState } from "react";
import { getFeedback } from "../api";

export function AdminPage({ user }) {
  const [feedback, setFeedback] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleFeedback = normalizedQuery
    ? feedback.filter((item) => [item.name, item.message]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)))
    : feedback;

  useEffect(() => {
    getFeedback(user).then((response) => setFeedback(response.feedback)).catch((requestError) => setError(requestError.message));
  }, [user]);

  return (
    <main className="page-shell admin-shell">
      <div className="page-heading">
        <div className="eyebrow">Admin workspace</div>
        <h1>Feedback inbox</h1>
        <p>A simple view of feedback received from members of the public.</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <section className="feedback-list">
        <div className="list-header"><strong>Latest feedback</strong><span>{visibleFeedback.length} of {feedback.length} items</span></div>
        <label className="feedback-search" htmlFor="feedback-search">
          Search feedback
          <input
            id="feedback-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or message"
          />
        </label>
        {visibleFeedback.map((item) => (
          <article className="feedback-row" key={item.id}>
            <div>
              <div className="feedback-meta">{item.name} · {new Date(item.createdAt).toLocaleDateString()}</div>
              <p>{item.message}</p>
            </div>
            <span className="status-pill">{item.status}</span>
          </article>
        ))}
        {!error && visibleFeedback.length === 0 && (
          <p className="empty-state">
            {normalizedQuery ? `No feedback matches “${query.trim()}”.` : "No feedback has been received yet."}
          </p>
        )}
      </section>
    </main>
  );
}
