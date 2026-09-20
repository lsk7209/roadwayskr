"""Create an offline copy of local.db with labeled test rows. Never overwrite a DB."""
from pathlib import Path
import sqlite3

root = Path(__file__).resolve().parent.parent
source = root / "local.db"
target = root / ".goal-harness" / "test-data.db"
if not source.is_file():
    raise SystemExit("Missing local.db; obtain an approved offline sample first")
if target.exists():
    raise SystemExit("Fixture already exists; preserved without modification")
target.parent.mkdir(exist_ok=True)
with sqlite3.connect(source.as_uri() + "?mode=ro", uri=True) as src:
    with sqlite3.connect(target) as dst:
        src.backup(dst)
        def add(content_id, slug, title, area, start, end):
            if dst.execute("SELECT 1 FROM festivals WHERE content_id=?", (content_id,)).fetchone():
                return
            dst.execute("""INSERT INTO festivals
                (content_id,slug,title,area_code,start_date,end_date,status,is_indexable,
                 address,event_place,description)
                VALUES (?,?,?,?,?,?,'upcoming',1,'가상 주소','가상 장소','Isolated fixture, not public event data')""",
                (content_id, slug, "[LOCAL TEST ONLY] " + title, area, start, end))
        add(229054, "229054-지상군페스티벌", "229054-지상군페스티벌", "34", "2026-10-01", "2026-10-05")
        add(3359644, "3359644-석계역-달빛야시장", "3359644-석계역-달빛야시장", "1", "2026-09-19", "2026-09-19")
        for i in range(70):
            add(9900000+i, f"synthetic-page-{i}", f"페이지 검증 {i}",
                "UNKNOWN-TEST" if i == 69 else "1", "2026-09-01", "2026-10-31")
        print(f"Created isolated fixture with {dst.execute('SELECT count(*) FROM festivals').fetchone()[0]} rows")
