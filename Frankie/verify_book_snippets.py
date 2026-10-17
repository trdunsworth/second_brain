#!/usr/bin/env python3
"""
verify_book_snippets.py -- parse every .fk listing in The Frankie Programming
Language and report the ones that do not parse.

Method (validated 2026-10-16; see Book Review.md):
  1. Read code spans by FONT, not by text order. pdftotext scrambles line order
     in this book; PyMuPDF span geometry does not.
  2. Reject lines clipped by the annotation column -- Quarto typesets a truncated
     duplicate of each listing beside the margin, and those are never valid.
  3. Reject watermark fragments. "Copy - Tony Dunsworth" is set in the mono font
     and its pieces leak into listings.
  4. Reject shell blocks and appendix quick-reference tables (contain "...").
  5. Parse with tree-sitter using the frankie grammar; on failure retry once
     merged with the neighbouring block, since listings span page boundaries.

Usage:
  pip install pymupdf
  python3 verify_book_snippets.py path/to/book.pdf [path/to/tree-sitter-frankie]

Exit code 0 if every listing parses, 1 otherwise.
"""

import pymupdf, re, json, pathlib, subprocess, os, sys

BOOK = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else "book.pdf")
GRAM = pathlib.Path(sys.argv[2] if len(sys.argv)>2
                    else os.path.expanduser("~/Documents/projects/tree-sitter-frankie"))
G=GRAM
doc=pymupdf.open(str(BOOK)); MONO=re.compile(r"LMMono")
WM = {"Co","py","\u2013","\u2014","To","ny","Du","nsw","orth","o","r","t","h","n","s"}
def is_wm(line):
    s=line.strip()
    if s in WM: return True
    return bool(re.fullmatch(r"(Co|py|To|ny|Du|nsw|ew|orth|Tony|Copy|--?)", s))

def page_lines(page):
    d=page.get_text("dict"); mi=[]; rom={}
    for blk in d["blocks"]:
        if blk.get("type")!=0: continue
        for ln in blk["lines"]:
            for sp in ln["spans"]:
                y=round(sp["bbox"][1],1); x=sp["bbox"][0]
                if MONO.search(sp["font"]): mi.append((y,x,sp["text"]))
                elif sp["text"].strip(): rom.setdefault(y,[]).append(x)
    if not mi: return []
    mi.sort(); out=[]; cur=[]; cy=None
    for y,x,s in mi:
        if cy is None or abs(y-cy)<2.5: cur.append((x,s))
        else: out.append((cy,"".join(t for _,t in sorted(cur)))); cur=[(x,s)]
        cy=y
    if cur: out.append((cy,"".join(t for _,t in sorted(cur))))
    return [(y,t, any(abs(ry-y)<3.0 and rx>250 for ry,rxs in rom.items() for rx in rxs)) for y,t in out]

blocks=[]; nclip=0; nwm=0
for pno,page in enumerate(doc,1):
    cur=[]
    for y,s,clip in page_lines(page):
        if clip:
            nclip+=1
            if cur: blocks.append({"page":pno,"lines":[c[1] for c in cur]}); cur=[]
            continue
        if is_wm(s):
            nwm+=1; continue
        if cur:
            g=y-cur[-1][0]
            if g>=30: blocks.append({"page":pno,"lines":[c[1] for c in cur]}); cur=[]
            elif 25<=g<30: cur.append((y,""))
        cur.append((y,s))
    if cur: blocks.append({"page":pno,"lines":[c[1] for c in cur]})
print(f"dropped {nclip} clipped margin lines, {nwm} watermark fragments")

SHELL=re.compile(r"^\s*(\$|frankiec\b|git\b|pip\b|npm\b|uv\b|python3?\b|brew\b|cd\b|ls\b|export\b|source\b|curl\b|cargo\b|tree-sitter\b|[A-Z_]+=)")
CODEY=re.compile(r"^\s*(def |end$|record |puts |if |elsif |else$|begin|rescue|ensure|loop |while |until |for |each\b|return\b|raise\b|next\b|break\b|\w+\s*=[^=]|#)")
def keep(b):
    L=[l for l in b["lines"] if l.strip() and not l.strip().startswith("#")]
    if not L: return False
    if all(SHELL.match(l) for l in L): return False
    if any(l.strip()=="..." for l in b["lines"]): return False
    return sum(1 for l in L if CODEY.match(l))>0
cands=[b for b in blocks if keep(b)]

work=pathlib.Path("verify-snippets"); work.mkdir(parents=True,exist_ok=True)
def parses(lines,tag):
    f=work/f"{tag}.fk"; f.write_text("\n".join(lines)+"\n",encoding="utf-8")
    p=subprocess.run(["tree-sitter","parse",str(f.resolve())],cwd=G,capture_output=True,text=True)
    return ("ERROR" not in p.stdout and "MISSING" not in p.stdout), p.stdout

res=[]
for i,b in enumerate(cands):
    L=b["lines"]; ok,raw=parses(L,f"a{i:04d}"); how=None
    if not ok and i>0 and b["page"]-cands[i-1]["page"]<=1:
        ok,raw=parses(cands[i-1]["lines"]+L,f"bp{i:04d}")
        if ok: how="merged-prev"
    if not ok and i+1<len(cands) and cands[i+1]["page"]-b["page"]<=1:
        ok2,_=parses(L+cands[i+1]["lines"],f"fn{i:04d}")
        if ok2: ok,how=ok2,"merged-next"
    res.append({"i":i,"page":b["page"],"ok":ok,"lines":L,"raw":raw,"merged":how})
n=sum(r["ok"] for r in res)
print(f"candidates {len(cands)}  clean {n}  failing {len(cands)-n}")
json.dump(res, open("verify-snippets/results.json","w"), indent=1)
print("\nFAILURES")
for r in res:
    if r["ok"]: continue
    print(f"\n--- page {r['page']}  ({len(r['lines'])} lines)")
    for l in r["lines"]: print("   ", l)
print(f"\n{sum(not r['ok'] for r in res)} failing of {len(res)}")
sys.exit(1 if any(not r["ok"] for r in res) else 0)
