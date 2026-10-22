import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { notifySearchEngines } from "@/lib/search-indexing";

const originalEnv = { ...process.env };
const originalFetch = global.fetch;

afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
});

describe("notifySearchEngines", () => {
  it("never calls the deprecated Google/Bing sitemap ping endpoints", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    const calledUrls: string[] = [];
    const fetchMock = mock.fn(async (url: string | URL | Request) => {
      calledUrls.push(String(url));
      return new Response("{}", { status: 200 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await notifySearchEngines(["https://roadways.kr/festivals/1"]);

    for (const url of calledUrls) {
      assert.ok(!url.includes("google.com/ping"), `unexpected call: ${url}`);
      assert.ok(!url.includes("bing.com/ping"), `unexpected call: ${url}`);
    }
    assert.equal(fetchMock.mock.callCount(), 2); // indexnow.org + naver only
  });

  it("returns disabled with zero external requests when INDEXNOW_KEY is unset", async () => {
    delete process.env.INDEXNOW_KEY;
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const results = await notifySearchEngines(["https://roadways.kr/festivals/1"]);

    assert.equal(fetchMock.mock.callCount(), 0);
    assert.ok(results.every((r) => r.status === "disabled"));
  });

  it("returns disabled with zero external requests when there are no urls", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const results = await notifySearchEngines([]);

    assert.equal(fetchMock.mock.callCount(), 0);
    assert.ok(results.every((r) => r.status === "disabled"));
  });

  it("distinguishes accepted vs failed per endpoint instead of assuming success", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    let call = 0;
    const fetchMock = mock.fn(async () => {
      call += 1;
      return call === 1
        ? new Response("{}", { status: 200 })
        : new Response("{}", { status: 500 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const results = await notifySearchEngines(["https://roadways.kr/festivals/1"]);

    assert.equal(results[0].status, "accepted_pending_validation");
    assert.equal(results[1].status, "failed");
  });

  it("dedupes urls before sending", async () => {
    process.env.INDEXNOW_KEY = "test-key";
    const fetchMock = mock.fn(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await notifySearchEngines([
      "https://roadways.kr/festivals/1",
      "https://roadways.kr/festivals/1",
    ]);

    const firstCall = fetchMock.mock.calls[0].arguments as unknown as [
      string,
      RequestInit,
    ];
    const sentBody = JSON.parse(firstCall[1].body as string);
    assert.deepEqual(sentBody.urlList, ["https://roadways.kr/festivals/1"]);
  });
});
