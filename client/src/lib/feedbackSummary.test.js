import { describe, expect, it } from "vitest";
import { getFeedbackSummary } from "./feedbackSummary";

describe("getFeedbackSummary", () => {
  it("counts the currently loaded inbox by status", () => {
    expect(getFeedbackSummary([
      { status: "New" },
      { status: "New" },
      { status: "In review" },
      { status: "Closed" },
      { status: "Other" },
    ])).toEqual({ total: 5, new: 2, inReview: 1, closed: 1 });
  });
});
