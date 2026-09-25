"""check_lab.py — verifier for quarto-lab. Stdlib only.

Usage (from quarto-lab/):  python check_lab.py
What it does:
  1. Renders smoke.qmd to html + docx + typst (full execute; no code cells,
     so this needs only the Quarto CLI — proves project config + writers).
  2. Renders weekly.qmd to html with --no-execute (validates YAML front
     matter, {{< include >}} partials, and markdown without needing jupyter).
     Full execution needs jupyter + duckdb + pandas + great_tables + plotnine.
  3. Lints weekly.qmd structure (params, parameters tag, includes, labels).
  4. Lints params/*.yml key sets and render-all.ps1 syntax (PowerShell parser).
Exit code 0 = all green, 1 = failure.
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

LAB = Path(__file__).resolve().parent
OUT = LAB / "_out"
QUARTO = shutil.which("quarto")
PWSH = shutil.which("pwsh") or shutil.which("powershell")

EXPECTED_PARAM_KEYS = {"audience", "week_start", "period"}


def run(cmd):
    return subprocess.run(
        cmd, cwd=LAB, capture_output=True,
        encoding="utf-8", errors="replace", timeout=600,
    )


def failed(result):
    combined = (result.stdout + result.stderr).lower()
    return result.returncode != 0 or "error:" in combined


def check(name, cmd, outputs):
    result = run(cmd)
    missing = [o for o in outputs if not (OUT / o).exists()]
    if failed(result) or missing:
        print(f"FAIL {name}")
        if missing:
            print(f"  missing outputs: {missing}")
        tail = (result.stderr or result.stdout)[-2000:]
        if tail.strip():
            print(f"  {tail.strip()}")
        return False
    print(f"PASS {name}")
    return True


def main():
    ok = True
    if QUARTO is None:
        print("FAIL quarto CLI not found on PATH")
        return 1

    # 1. Toolchain proof: no-compute doc through all three writers.
    ok &= check("smoke html", [QUARTO, "render", "smoke.qmd", "--to", "html"], ["smoke.html"])
    ok &= check("smoke docx", [QUARTO, "render", "smoke.qmd", "--to", "docx"], ["smoke.docx"])
    ok &= check("smoke typst", [QUARTO, "render", "smoke.qmd", "--to", "typst"], ["smoke.pdf"])

    # 2. Template structure proof (no jupyter needed).
    ok &= check(
        "weekly no-execute",
        [QUARTO, "render", "weekly.qmd", "--to", "html", "--no-execute"],
        ["weekly.html"],
    )

    # 3. Template lint.
    weekly = (LAB / "weekly.qmd").read_text(encoding="utf-8")
    lint = {
        "params block": "params:" in weekly,
        "parameters tag": "tags: [parameters]" in weekly,
        "verdict include": "{{< include _partials/verdict.qmd >}}" in weekly,
        "thresholds include": "{{< include _partials/thresholds.qmd >}}" in weekly,
        "methods include": "{{< include _partials/methods.qmd >}}" in weekly,
        "reproducibility include": "{{< include _partials/reproducibility.qmd >}}" in weekly,
        "tbl-kpi label": "#| label: tbl-kpi" in weekly,
        "fig-volume label": "#| label: fig-volume" in weekly,
        "cross-refs": "@tbl-kpi" in weekly and "@fig-volume" in weekly,
    }
    for name, passed in lint.items():
        print(f"{'PASS' if passed else 'FAIL'} lint {name}")
        ok &= passed

    # 4. Params files: exact key sets, simple scalar lines only.
    for yml in sorted((LAB / "params").glob("*.yml")):
        lines = [ln.strip() for ln in yml.read_text(encoding="utf-8").splitlines() if ln.strip()]
        keys = set()
        simple = True
        for ln in lines:
            m = re.fullmatch(r"([A-Za-z_][A-Za-z0-9_]*): (.+)", ln)
            if not m:
                simple = False
                break
            keys.add(m.group(1))
        passed = simple and keys == EXPECTED_PARAM_KEYS
        print(f"{'PASS' if passed else 'FAIL'} params/{yml.name} keys={sorted(keys)}")
        ok &= passed

    # 5. render-all.ps1 syntax via the PowerShell parser (no execution).
    ps1 = LAB / "render-all.ps1"
    if PWSH is None:
        print("SKIP render-all.ps1 syntax (no pwsh on PATH)")
    else:
        probe = (
            "$e=$null; $null=[System.Management.Automation.Language.Parser]::"
            f"ParseFile('{ps1}', [ref]$null, [ref]$e); $e.Count"
        )
        result = run([PWSH, "-NoProfile", "-Command", probe])
        count = result.stdout.strip().splitlines()
        passed = result.returncode == 0 and count and count[-1] == "0"
        print(f"{'PASS' if passed else 'FAIL'} render-all.ps1 syntax errors={count[-1] if count else '?'}")
        ok &= passed

    print("\nOK - lab check passed." if ok else "\nFAILED - see above.")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
