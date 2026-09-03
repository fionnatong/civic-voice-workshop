import { useEffect, useRef, useState } from "react";
import { submitFeedback } from "../api";

export function CitizenPage({ user }) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const successRef = useRef(null);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      await submitFeedback({ nric: user.nric, name: user.name, message });
      setSubmitted(true);
      setMessage("");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div className="eyebrow">Public feedback</div>
        <h1>What would you like us to know?</h1>
        <p>Tell us about an issue, an idea, or a positive experience in your community.</p>
      </div>
      <section className="form-card">
        {submitted && (
          <div className="success-banner" role="status" tabIndex="-1" ref={successRef}>
            Thank you. Your feedback has been received.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label htmlFor="feedback-message">Your feedback
            <textarea
              aria-describedby="feedback-guidance"
              aria-invalid={Boolean(error)}
              id="feedback-message"
              required
              rows="7"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share your feedback here..."
            />
          </label>
          <div className="form-footer">
            <span className="muted" id="feedback-guidance">Please do not include sensitive personal information.</span>
            <button className="primary-button">Submit feedback</button>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
        </form>
      </section>
    </main>
  );
}
