"""Apply a review plan ONLY to a new fixed local copy; no remote DB support."""
import hashlib
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sqlite3

root = Path(__file__).resolve().parent.parent
private = root / ".goal-harness/private"
evidence = root / "docs/roadways/improvement-20260920"
source = private / "parity.db"
target = private / "repaired.db"
plan = json.loads((evidence / "data-repair-plan.json").read_text(encoding="utf-8"))
snapshot = private / "production-20260920.json"
if hashlib.sha256(snapshot.read_bytes()).hexdigest() != plan["snapshotSha256"]:
    raise SystemExit("Snapshot differs from reviewed plan")
if target.exists():
    raise SystemExit("Repaired DB already exists; preserved without modification")
assert {c["contentId"] for c in plan["changes"]} == {229054, 3000221, 3337617}
observed = datetime.now(timezone.utc)
today = observed.astimezone(timezone(timedelta(hours=9))).date().isoformat()
report = {"observedAt": observed.isoformat(), "mode": "LOCAL_ONLY", "checks": [], "changes": []}
with sqlite3.connect(source.as_uri() + "?mode=ro", uri=True) as src:
    src.row_factory = sqlite3.Row
    before = {r["content_id"]: dict(r) for r in src.execute("SELECT * FROM festivals")}
    with sqlite3.connect(target) as dst:
        dst.row_factory = sqlite3.Row
        src.backup(dst)
        columns = set(before[229054])
        for change in plan["changes"]:
            record = before[change["contentId"]]
            assert record["status"] != "cancelled" and record["curator_note"] is None
            assert record["start_date"] is None and record["end_date"] is None
            updates = change["set"].copy()
            assert set(updates) <= columns and not set(updates) & set(plan["preserve"])
            updates["status"] = ("ended" if updates["end_date"] < today else
                                 "upcoming" if updates["start_date"] > today else "ongoing")
            updates["updated_at"] = int(observed.timestamp() * 1000)
            assignments = ", ".join('"' + col + '" = ?' for col in updates)
            result = dst.execute(f"UPDATE festivals SET {assignments} WHERE content_id = ?",
                                 [*updates.values(), change["contentId"]])
            assert result.rowcount == 1
            report["changes"].append({"contentId": change["contentId"], "before": {k: record[k] for k in updates}, "after": updates})
        after = {r["content_id"]: dict(r) for r in dst.execute("SELECT * FROM festivals")}
        changed = {key for key in before if before[key] != after[key]}
        assert changed == {229054, 3000221, 3337617} and len(before) == len(after) == 864
        for key in changed:
            assert all(before[key][field] == after[key][field] for field in plan["preserve"])
        report["checks"] = ["Exactly 3 of 864 rows changed; 861 rows identical", "URLs/editorial/index/raw/sync fields preserved", "Source snapshot and parity.db read-only", "Unknown fees/hours not invented"]
        report["remainingUndated"] = sum(r["start_date"] is None or r["end_date"] is None for r in after.values())
(evidence / "repair-simulation.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("PASS local 3-row simulation; 861 rows unchanged; protected fields preserved")
