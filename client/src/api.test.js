import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "./api";

describe("api", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("exposes the API error code and message from structured error responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: vi.fn().mockResolvedValue({
        error: { code: "FORBIDDEN", message: "Admin access required." },
      }),
    }));

    await expect(api("/api/feedback")).rejects.toMatchObject({
      name: "ApiError", code: "FORBIDDEN", message: "Admin access required.", status: 403,
    });
  });

  it("falls back to a safe error when a response is not JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false, status: 500, json: vi.fn().mockRejectedValue(new Error("not json")),
    }));

    await expect(api("/api/feedback")).rejects.toEqual(expect.any(ApiError));
    await expect(api("/api/feedback")).rejects.toMatchObject({
      code: "UNKNOWN_ERROR", message: "Something went wrong.", status: 500,
    });
  });
});
