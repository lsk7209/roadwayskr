import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { GET } from "@/app/api/health/route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Health route", () => {
  it("rejects requests without the cron bearer token", async () => {
    process.env.CRON_SECRET = "test-secret";

    const response = await GET(new Request("http://localhost:3000/api/health"));
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.deepEqual(body, { error: "unauthorized" });
  });

  it("returns missing env before touching the database", async () => {
    process.env.CRON_SECRET = "test-secret";
    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
    delete process.env.TOUR_API_SERVICE_KEY;
    delete process.env.SITE_URL;

    const response = await GET(
      new Request("http://localhost:3000/api/health", {
        headers: {
          authorization: "Bearer test-secret",
        },
      }),
    );
    const body = await response.json();

    assert.equal(response.status, 503);
    assert.equal(body.status, "fail");
    assert.equal(body.reason, "missing_env");
    assert.deepEqual(body.missingEnv, [
      "TURSO_DATABASE_URL",
      "TURSO_AUTH_TOKEN",
      "TOUR_API_SERVICE_KEY",
      "SITE_URL",
    ]);
  });
});
