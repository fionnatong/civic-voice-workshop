import { describe, expect, it } from "vitest";
import { maskNric } from "./maskNric";

describe("maskNric", () => {
  it("keeps only the first and final two characters of an NRIC-like ID", () => {
    expect(maskNric("S0000001A")).toBe("S••••••1A");
  });

  it("does not expose a short or absent identifier", () => {
    expect(maskNric("S1A")).toBe("•••");
    expect(maskNric(" ")).toBe("");
    expect(maskNric()).toBe("");
  });
});
