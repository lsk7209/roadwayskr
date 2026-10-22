import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { POST } from "@/app/api/indexnow/route";

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
});

let testIpSeq = 0;

function req(body: unknown, headers: Record<string, string> = {}) {
  testIpSeq += 1;
  return new Request("http://localhost:3000/api/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `127.0.0.${testIpSeq}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("/api/indexnow", () => {
  it("rejects unauthenticated requests before any outbound fetch", async () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(req({ urls: ["https://roadways.kr/festivals/1"] }));

    assert.equal(res.status, 401);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("rejects when CRON_SECRET is not configured, even with a bearer header", async () => {
    delete process.env.CRON_SECRET;
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(
      req(
        { urls: ["https://roadways.kr/festivals/1"] },
        { authorization: "Bearer whatever" },
      ),
    );

    assert.equal(res.status, 401);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("returns disabled when INDEXNOW_KEY is missing, without fetching", async () => {
    process.env.CRON_SECRET = "test-secret";
    delete process.env.INDEXNOW_KEY;
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(
      req(
        { urls: ["https://roadways.kr/festivals/1"] },
        { authorization: "Bearer test-secret" },
      ),
    );
    const json = await res.json();

    assert.equal(res.status, 503);
    assert.equal(json.status, "disabled");
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("rejects external hosts, http, other ports and userinfo urls", async () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(
      req(
        {
          urls: [
            "https://evil.example.com/x",
            "http://roadways.kr/festivals/1",
            "https://roadways.kr:8443/festivals/1",
            "https://user:pass@roadways.kr/festivals/1",
            "//roadways.kr/festivals/1",
          ],
        },
        { authorization: "Bearer test-secret" },
      ),
    );
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.error, "no valid same-origin https urls");
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("rejects admin/api paths and dedupes, sending only allowed unique urls", async () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(
      req(
        {
          urls: [
            "https://roadways.kr/festivals/1",
            "https://roadways.kr/festivals/1",
            "https://roadways.kr/api/health",
            "https://roadways.kr/admin/panel",
            "",
          ],
        },
        { authorization: "Bearer test-secret" },
      ),
    );
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.submittedCount, 1);
    assert.equal(fetchMock.mock.callCount(), 2); // one call per provider endpoint
    const firstCall = fetchMock.mock.calls[0].arguments as unknown as [
      string,
      RequestInit,
    ];
    const sentBody = JSON.parse(firstCall[1].body as string);
    assert.deepEqual(sentBody.urlList, ["https://roadways.kr/festivals/1"]);
  });

  it("rejects request bodies exceeding the url count cap", async () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const urls = Array.from(
      { length: 1001 },
      (_, i) => `https://roadways.kr/festivals/${i}`,
    );
    const res = await POST(
      req({ urls }, { authorization: "Bearer test-secret" }),
    );

    assert.equal(res.status, 413);
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  it("reports provider accepted/failed status distinctly, not as indexed", async () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.INDEXNOW_KEY = "test-key";
    let call = 0;
    const fetchMock = mock.fn(async () => {
      call += 1;
      return call === 1
        ? new Response("{}", { status: 202 })
        : new Response("{}", { status: 500 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const res = await POST(
      req(
        { urls: ["https://roadways.kr/festivals/1"] },
        { authorization: "Bearer test-secret" },
      ),
    );
    const json = await res.json();

    assert.equal(res.status, 200);
    assert.equal(json.statuses[0].result, "accepted_pending_validation");
    assert.equal(json.statuses[1].result, "failed");
  });

  it("rate-limits excessive requests from the same IP before any outbound fetch", async () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const headers = {
      authorization: "Bearer test-secret",
      "x-forwarded-for": "198.51.100.42",
    };

    for (let i = 0; i < 5; i++) {
      const res = await POST(
        req({ urls: ["https://roadways.kr/festivals/1"] }, headers),
      );
      assert.equal(res.status, 200);
    }

    const callsBeforeBlocked = fetchMock.mock.callCount();
    const blockedRes = await POST(
      req({ urls: ["https://roadways.kr/festivals/1"] }, headers),
    );
    const blockedJson = await blockedRes.json();

    assert.equal(blockedRes.status, 429);
    assert.equal(blockedJson.error, "too many requests");
    assert.equal(fetchMock.mock.callCount(), callsBeforeBlocked);
  });
});
