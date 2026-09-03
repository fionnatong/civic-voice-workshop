const trackedStatuses = ["New", "In review", "Closed"];

export function getFeedbackSummary(feedback) {
  const summary = {
    total: feedback.length,
    new: 0,
    inReview: 0,
    closed: 0,
  };

  for (const item of feedback) {
    if (item.status === trackedStatuses[0]) summary.new += 1;
    if (item.status === trackedStatuses[1]) summary.inReview += 1;
    if (item.status === trackedStatuses[2]) summary.closed += 1;
  }

  return summary;
}
