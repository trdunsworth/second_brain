"""run_lab.py — smoke test for duckdb-lab. Stdlib only; uses the DuckDB CLI.

Usage (from duckdb-lab/):
    python run_lab.py
What it does:
    1. Executes sql/ files in dependency order against :memory: DuckDB
       (seed -> preamble -> eda -> outliers -> standards -> audiences
       -> timeseries -> exports), each step cumulative so ordering is validated.
    2. Lints visuals/*.sql for required ggsql clauses (VISUALISE + DRAW + LABEL).
       Full rendering needs R ggsql (see ggsql_notes.md §2); the linter only
       checks structural conventions + pins.txt presence.
Exit code 0 = all green, 1 = failure (per-file PASS/FAIL printed).
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

LAB = Path(__file__).resolve().parent
SQL = LAB / "sql"
VIS = LAB / "visuals"
CLI = shutil.which("duckdb")

SQL_ORDER = [
    "seed_demo.sql",
    "00_preamble.sql",
    "eda.sql",
    "outliers.sql",
    "standards.sql",
    "audiences.sql",
    "timeseries.sql",
    "exports.sql",
]

VISUAL_FILES = [
    "eda_01_12.sql",
    "distributions.sql",
    "exec_circadian.sql",
    "ops_heatmap.sql",
    "shift_faceted.sql",
    "forecast_overlay.sql",
]


def run_duckdb(script: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [CLI, ":memory:", "-csv"],
        input=script,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=300,
        cwd=LAB,
    )


def failed(result: subprocess.CompletedProcess) -> bool:
    combined = (result.stdout + result.stderr).lower()
    return result.returncode != 0 or "error:" in combined


def main() -> int:
    if CLI is None:
        print("FAIL duckdb CLI not found on PATH (winget install DuckDB.cli)")
        return 1
    ok = True

    # 1. Cumulative SQL execution (validates dependency order too).
    cumulative = ""
    for name in SQL_ORDER:
        path = SQL / name
        if not path.exists():
            print(f"FAIL {name} — file missing")
            ok = False
            continue
        cumulative += "\n" + path.read_text()
        result = run_duckdb(cumulative)
        if failed(result):
            ok = False
            print(f"FAIL {name}")
            print((result.stderr or result.stdout)[-2000:])
        else:
            print(f"PASS {name}")

    # 2. ggsql structural lint.
    for name in VISUAL_FILES:
        path = VIS / name
        if not path.exists():
            print(f"FAIL visuals/{name} — file missing")
            ok = False
            continue
        text = path.read_text()
        has_vis = bool(re.search(r"VISUALI[SZ]E", text))
        has_draw = "DRAW" in text
        has_label = "LABEL" in text
        if has_vis and has_draw and has_label:
            print(f"PASS visuals/{name} (lint)")
        else:
            ok = False
            print(
                f"FAIL visuals/{name} (lint) — "
                f"VISUALISE={has_vis} DRAW={has_draw} LABEL={has_label}"
            )
    if not (VIS / "pins.txt").exists():
        print("FAIL visuals/pins.txt — file missing")
        ok = False
    else:
        print("PASS visuals/pins.txt")

    print("\nOK - lab smoke test passed." if ok else "\nFAILED - see above.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
