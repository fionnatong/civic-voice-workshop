import { describe, expect, it } from "vitest";
import { resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("uses a saved theme ahead of the OS preference", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("uses a dark OS preference when no theme is saved", () => {
    expect(resolveTheme(null, true)).toBe("dark");
  });
});
