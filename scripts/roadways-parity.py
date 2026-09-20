"""Build an isolated local DB from the SELECT-only snapshot, without synthetic rows."""
import json
from pathlib import Path
import sqlite3

root = Path(__file__).resolve().parent.parent
source = root / "local.db"
target = root / ".goal-harness/private/parity.db"
snapshot = json.loads((target.parent / "production-20260920.json").read_text(encoding="utf-8"))
if target.exists():
    raise SystemExit("Parity DB already exists; preserved without modification")
if snapshot["table"] != "festivals" or len(snapshot["rows"]) > 10000:
    raise SystemExit("Invalid bounded festival snapshot")
with sqlite3.connect(source.as_uri()+"?mode=ro", uri=True) as src:
    with sqlite3.connect(target) as dst:
        src.backup(dst)
        columns = [row[1] for row in dst.execute("PRAGMA table_info(festivals)")]
        if set(columns) != set(snapshot["columns"]):
            raise SystemExit("Snapshot schema differs; do not infer migrations")
        # This connection is ONLY the new, private local copy above.
        dst.execute("DELETE FROM festivals")
        names = ",".join('"'+name+'"' for name in columns)
        values = ",".join("?" for _ in columns)
        dst.executemany(f"INSERT INTO festivals ({names}) VALUES ({values})",
                        [tuple(row[name] for name in columns) for row in snapshot["rows"]])
        count = dst.execute("SELECT count(*) FROM festivals").fetchone()[0]
        assert count == len(snapshot["rows"])
        print(f"Isolated parity DB: {count} source rows; no synthetic additions")
