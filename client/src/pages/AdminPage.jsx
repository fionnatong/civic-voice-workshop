import { useEffect, useState } from "react";
import { getFeedback, getFeedbackDetail } from "../api";

export function AdminPage({ user }) {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    getFeedback(user).then((response) => setFeedback(response.feedback)).catch((requestError) => setError(requestError.message));
  }, [user]);

  async function viewFeedback(id) {
    setError("");
    setLoadingDetail(true);
    try {
      const response = await getFeedbackDetail(user, id);
      setSelectedFeedback(response.feedback);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  if (selectedFeedback) {
    const item = selectedFeedback;
    return (
      <main className="page-shell admin-shell">
        <button className="back-button" type="button" onClick={() => setSelectedFeedback(null)}>
          ← Back to feedback inbox
        </button>
        <div className="page-heading">
          <div className="eyebrow">Feedback detail</div>
          <h1>Feedback from {item.name}</h1>
          <p>Submitted {new Date(item.createdAt).toLocaleString()}.</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        <section className="feedback-detail" aria-label="Feedback details">
          <dl>
            <div><dt>Reference</dt><dd>{item.id}</dd></div>
            <div><dt>Name</dt><dd>{item.name}</dd></div>
            <div><dt>NRIC</dt><dd>{item.nric}</dd></div>
            <div><dt>Category</dt><dd>{item.category}</dd></div>
            <div><dt>Status</dt><dd><span className="status-pill">{item.status}</span></dd></div>
            <div><dt>Submitted</dt><dd>{new Date(item.createdAt).toLocaleString()}</dd></div>
            <div className="detail-message"><dt>Message</dt><dd>{item.message}</dd></div>
          </dl>
        </section>
      </main>
    );
  }

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
            <div className="feedback-actions">
              <span className="status-pill">{item.status}</span>
              <button className="text-button" type="button" onClick={() => viewFeedback(item.id)} disabled={loadingDetail}>
                View details
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
