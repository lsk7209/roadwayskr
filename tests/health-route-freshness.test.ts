import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  evaluateHealth,
  STUCK_RUN_THRESHOLD_MS,
  SOURCE_WARNING_THRESHOLD_MS,
  SOURCE_FAILURE_THRESHOLD_MS,
} from "@/lib/http/health-evaluation";

describe("evaluateHealth", () => {
  it("is not healthy when there is no sync history at all, even with existing rows", () => {
    const now = Date.now();
    const result = evaluateHealth(5, undefined, now);

    assert.equal(result.status, "failed");
    assert.equal(result.httpStatus, 503);
    assert.equal(result.lastRunState, "none");
  });

  it("is healthy when the last run succeeded recently", () => {
    const now = Date.now();
    const result = evaluateHealth(10, {
      ranAt: new Date(now - 60_000),
      finishedAt: new Date(now - 30_000),
      insertedCount: 2,
      updatedCount: 3,
      errorCount: 0,
    }, now);

    assert.equal(result.status, "healthy");
    assert.equal(result.httpStatus, 200);
    assert.equal(result.lastRunState, "success");
    assert.equal(result.backlog, false);
  });

  it("does not hide a stale successful sync behind a nonempty database", () => {
    const now = Date.now();
    const staleFinishedAt = new Date(now - SOURCE_FAILURE_THRESHOLD_MS - 60_000);
    const result = evaluateHealth(500, {
      ranAt: new Date(staleFinishedAt.getTime() - 60_000),
      finishedAt: staleFinishedAt,
      insertedCount: 2,
      updatedCount: 3,
      errorCount: 0,
    }, now);

    // Old festival rows exist, but the source data is stale; must not be
    // reported healthy just because festivalCount > 0.
    assert.equal(result.status, "failed");
    assert.equal(result.httpStatus, 503);
  });

  it("degrades (but does not fail) when success data is aging past the warning threshold", () => {
    const now = Date.now();
    const agingFinishedAt = new Date(now - SOURCE_WARNING_THRESHOLD_MS - 60_000);
    const result = evaluateHealth(500, {
      ranAt: new Date(agingFinishedAt.getTime() - 60_000),
      finishedAt: agingFinishedAt,
      insertedCount: 2,
      updatedCount: 3,
      errorCount: 0,
    }, now);

    assert.equal(result.status, "degraded");
    assert.equal(result.httpStatus, 200);
  });

  it("does not treat a briefly running sync (with prior rows) as an immediate outage", () => {
    const now = Date.now();
    const result = evaluateHealth(50, {
      ranAt: new Date(now - 5 * 60 * 1000), // started 5 minutes ago
      finishedAt: null,
      insertedCount: 0,
      updatedCount: 0,
      errorCount: 0,
    }, now);

    assert.equal(result.lastRunState, "running");
    assert.notEqual(result.status, "failed");
  });

  it("treats a run stuck without finishedAt past the threshold as failed, not running", () => {
    const now = Date.now();
    const result = evaluateHealth(50, {
      ranAt: new Date(now - STUCK_RUN_THRESHOLD_MS - 60_000),
      finishedAt: null,
      insertedCount: 0,
      updatedCount: 0,
      errorCount: 0,
    }, now);

    assert.equal(result.lastRunState, "failed");
  });

  it("classifies errors with some successful writes as partial, not a hard failure", () => {
    const now = Date.now();
    const result = evaluateHealth(50, {
      ranAt: new Date(now - 60_000),
      finishedAt: new Date(now - 30_000),
      insertedCount: 3,
      updatedCount: 1,
      errorCount: 2,
    }, now);

    assert.equal(result.lastRunState, "partial");
    assert.equal(result.status, "degraded");
    assert.equal(result.httpStatus, 200);
  });

  it("classifies a completed run with only errors and no writes as failed", () => {
    const now = Date.now();
    const result = evaluateHealth(50, {
      ranAt: new Date(now - 60_000),
      finishedAt: new Date(now - 30_000),
      insertedCount: 0,
      updatedCount: 0,
      errorCount: 5,
    }, now);

    assert.equal(result.lastRunState, "failed");
    assert.equal(result.status, "failed");
  });

  it("reports backlog=true and fails when there are zero festival rows", () => {
    const now = Date.now();
    const result = evaluateHealth(0, {
      ranAt: new Date(now - 60_000),
      finishedAt: new Date(now - 30_000),
      insertedCount: 0,
      updatedCount: 0,
      errorCount: 0,
    }, now);

    assert.equal(result.backlog, true);
    assert.equal(result.status, "failed");
  });
});
