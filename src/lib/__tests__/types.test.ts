import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getRunStatus,
  getTimeRemaining,
  describeExpiry,
  type ChecklistRun,
  type ExpiryConfig,
} from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NOW = new Date("2026-04-14T12:00:00Z");

function makeRun(overrides: Partial<ChecklistRun> = {}): ChecklistRun {
  return {
    id: "run_1",
    templateId: "tpl_1",
    templateName: "Test",
    expiryConfig: { type: "end-of-day" },
    items: [],
    createdAt: NOW.toISOString(),
    ...overrides,
  };
}

function minutesFromNow(mins: number): string {
  return new Date(NOW.getTime() + mins * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// getRunStatus
// ---------------------------------------------------------------------------

describe("getRunStatus", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function statusAt(run: ChecklistRun): string {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const result = getRunStatus(run);
    vi.useRealTimers();
    return result;
  }

  it("returns 'completed' when completedAt is set", () => {
    expect(statusAt(makeRun({ completedAt: NOW.toISOString() }))).toBe("completed");
  });

  it("completed takes priority over expired", () => {
    expect(
      statusAt(
        makeRun({
          completedAt: NOW.toISOString(),
          expiresAt: daysAgo(1), // already past
        })
      )
    ).toBe("completed");
  });

  it("returns 'expired' when expiresAt is in the past", () => {
    expect(
      statusAt(
        makeRun({
          expiresAt: daysAgo(1),
          startedAt: daysAgo(1),
        })
      )
    ).toBe("expired");
  });

  it("returns 'abandoned' when created more than 2 days ago and not completed/expired", () => {
    expect(
      statusAt(
        makeRun({
          createdAt: daysAgo(3),
          expiryConfig: { type: "end-of-day" },
          startedAt: daysAgo(3),
        })
      )
    ).toBe("abandoned");
  });

  it("does not return 'abandoned' if completed even if old", () => {
    expect(
      statusAt(
        makeRun({
          createdAt: daysAgo(5),
          completedAt: daysAgo(4),
        })
      )
    ).toBe("completed");
  });

  it("returns 'pending' for duration-based run with no startedAt", () => {
    expect(
      statusAt(
        makeRun({
          expiryConfig: { type: "duration", minutes: 60 },
        })
      )
    ).toBe("pending");
  });

  it("returns 'active' for end-of-day run that is current", () => {
    expect(
      statusAt(
        makeRun({
          expiresAt: minutesFromNow(360),
          startedAt: NOW.toISOString(),
        })
      )
    ).toBe("active");
  });

  it("returns 'active' for duration-based run that has started", () => {
    expect(
      statusAt(
        makeRun({
          expiryConfig: { type: "duration", minutes: 60 },
          startedAt: NOW.toISOString(),
          expiresAt: minutesFromNow(60),
        })
      )
    ).toBe("active");
  });
});

// ---------------------------------------------------------------------------
// getTimeRemaining
// ---------------------------------------------------------------------------

describe("getTimeRemaining", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function remaining(run: ChecklistRun): string | null {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    const result = getTimeRemaining(run);
    vi.useRealTimers();
    return result;
  }

  it("returns null when no expiresAt", () => {
    expect(remaining(makeRun())).toBeNull();
  });

  it("returns 'Expired' when expiresAt is in the past", () => {
    expect(remaining(makeRun({ expiresAt: daysAgo(1) }))).toBe("Expired");
  });

  it("returns hours and minutes when > 1 hour remains", () => {
    expect(remaining(makeRun({ expiresAt: minutesFromNow(150) }))).toBe("2h 30m");
  });

  it("returns only minutes when < 1 hour remains", () => {
    expect(remaining(makeRun({ expiresAt: minutesFromNow(45) }))).toBe("45m");
  });

  it("returns '0m' when about to expire", () => {
    // 30 seconds left rounds to 0m
    const almostExpired = new Date(NOW.getTime() + 30_000).toISOString();
    expect(remaining(makeRun({ expiresAt: almostExpired }))).toBe("0m");
  });
});

// ---------------------------------------------------------------------------
// describeExpiry
// ---------------------------------------------------------------------------

describe("describeExpiry", () => {
  it("describes end-of-day", () => {
    expect(describeExpiry({ type: "end-of-day" })).toBe("Expires end of day");
  });

  it("describes minutes only", () => {
    expect(describeExpiry({ type: "duration", minutes: 30 })).toBe("30m after first check");
  });

  it("describes hours only", () => {
    expect(describeExpiry({ type: "duration", minutes: 120 })).toBe("2h after first check");
  });

  it("describes hours and minutes", () => {
    expect(describeExpiry({ type: "duration", minutes: 90 })).toBe("1h 30m after first check");
  });
});
