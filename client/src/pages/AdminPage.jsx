import { useEffect, useState } from "react";
import { getFeedback } from "../api";

export function AdminPage({ user }) {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    getFeedback(user, page)
      .then((response) => {
        setFeedback(response.feedback);
        setPagination(response.pagination);
        if (response.pagination.page !== page) setPage(response.pagination.page);
      })
      .catch((requestError) => setError(requestError.message));
  }, [user, page]);

  return (
    <main className="page-shell admin-shell">
      <div className="page-heading">
        <div className="eyebrow">Admin workspace</div>
        <h1>Feedback inbox</h1>
        <p>A simple view of feedback received from members of the public.</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <section className="feedback-list">
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
        {pagination && <nav className="pagination" aria-label="Feedback pages">
          <button type="button" className="text-button" disabled={pagination.page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button type="button" className="text-button" disabled={pagination.page === pagination.totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
        </nav>}
      </section>
    </main>
  );
}
