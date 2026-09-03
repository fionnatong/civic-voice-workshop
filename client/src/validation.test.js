import { describe, expect, it } from "vitest";
import { isValidWorkshopId, normalizeWorkshopId } from "./validation";

describe("workshop ID validation", () => {
  it("accepts the seeded workshop IDs", () => {
    expect(isValidWorkshopId("S0000001A")).toBe(true);
    expect(isValidWorkshopId("S0000002B")).toBe(true);
  });

  it("normalizes surrounding whitespace and letter case", () => {
    expect(normalizeWorkshopId(" s0000001a ")).toBe("S0000001A");
    expect(isValidWorkshopId(" s0000001a ")).toBe(true);
  });

  it.each(["", "S0000001", "S0000001AA", "X0000001A", "S123ABC1A"])("rejects malformed ID %j", (id) => {
    expect(isValidWorkshopId(id)).toBe(false);
  });
});
