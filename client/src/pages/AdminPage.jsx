import { useEffect, useState } from "react";
import { getFeedback } from "../api";

export function AdminPage({ user }) {
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "" });

  useEffect(() => {
    setError("");
    getFeedback(user, filters)
      .then((response) => setFeedback(response.feedback))
      .catch((requestError) => setError(requestError.message));
  }, [user, filters]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const filtersAreActive = filters.category || filters.status;

  return (
    <main className="page-shell admin-shell">
      <div className="page-heading">
        <div className="eyebrow">Admin workspace</div>
        <h1>Feedback inbox</h1>
        <p>A simple view of feedback received from members of the public.</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <section className="feedback-list">
        <div className="filter-controls" aria-label="Filter feedback">
          <label>
            Category
            <select name="category" value={filters.category} onChange={updateFilter}>
              <option value="">All categories</option>
              <option value="Estate">Estate</option>
              <option value="Transport">Transport</option>
              <option value="Environment">Environment</option>
              <option value="Other">Other</option>
              <option value="General">General</option>
            </select>
          </label>
          <label>
            Status
            <select name="status" value={filters.status} onChange={updateFilter}>
              <option value="">All statuses</option>
              <option value="New">New</option>
              <option value="In review">In review</option>
              <option value="Closed">Closed</option>
            </select>
          </label>
          <button
            className="text-button clear-filters"
            type="button"
            onClick={() => setFilters({ category: "", status: "" })}
            disabled={!filtersAreActive}
          >
            Clear filters
          </button>
        </div>
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
      </section>
    </main>
  );
}
