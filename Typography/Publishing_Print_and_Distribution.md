---
type: reference
status: active
topic: "Getting a finished manuscript to readers — which output formats to build, print-on-demand file geometry and preflight, ISBN and metadata rules, and the distribution channels that accept what you produced."
created: 2026-10-16
updated: 2026-10-16
aliases:
  - Print and Distribution
  - Self-Publishing Distribution
  - POD Guide
tags:
  - typography
  - publishing
  - print-on-demand
  - isbn
  - epub
  - distribution
---

# Publishing — Print, Metadata, and Distribution

> Goal: decide which formats to build, produce print-ready and retail-valid files, get the identifiers right, and pick where the book actually goes.
> This is where self-publishing projects fail — not at typesetting, at upload validation.
> Related: [[Publishing|Hub]] · [[Publishing_Typst|Typst]] · [[Publishing_LaTeX|LaTeX]] · [[Publishing_Pandoc|Pandoc]]

## How to use this note

**Do not read this until the manuscript is real.** Distribution decisions made before the book exists are usually wrong — and the ISBN choices in §3 are hard to reverse.

---

## 1. Output formats: what to actually build

| Format | Build it when | Built with | Watch out for |
|--------|---------------|------------|---------------|
| **HTML** (site) | Web is the primary product | Any engine | Version drift; broken links in nav |
| **HTML** (single file) | Email, Drive, a PDF-less deliverable | Pandoc `--standalone`, or any engine's print view | Absolute asset paths, missing CSS |
| **PDF** (screen) | Reading on a laptop/tablet | Typst, LaTeX, Chromium, WeasyPrint | File size from embedded images |
| **PDF** (print interior) | POD or a printer | LaTeX/Typst at the book's trim size | **No crop marks, no bleed unless required** |
| **PDF** (cover wrap) | Print editions | Design tool or Typst template | Size depends on final page count |
| **PDF/A** | Archives, libraries | `-V pdfstandard=PDF/A-2b` (LuaLaTeX) | Fonts must be embedded |
| **PDF/X** | Commercial print | `-V pdfstandard="PDF/X-4"` | CMYK, no transparency surprises |
| **EPUB 3** | Retail ebook stores, libraries | Pandoc, tex4ebook, Asciidoctor EPUB3 | MathML support varies by device |
| **EPUB 2** | Old e-ink devices | Same | **No MathML** — math becomes broken images |
| **DOCX** | Editors, co-authors, corporate review | Pandoc, Quarto | Styles must be set via `reference-doc` |
| **JATS XML** | Biomedical, accessibility | LaTeXML from LaTeX | Only meaningful from a real LaTeX source |
| **MOBI/AZW3** | Kindle upload | Calibre `ebook-convert`, tex4ebook | Amazon prefers its own conversion; KPF is an option |

**The default build for a modern book:** HTML + PDF (screen) + EPUB 3. Add PDF/X + cover wrap only when print is actually happening. Build a format because a channel requires it, not because you could.

---

## 2. Print-ready files (POD)

### 2.1 Three different files

| File | What it is | Who needs it |
|------|-----------|--------------|
| **Interior PDF** | Every page of the book at the book's trim size | Print editions |
| **Cover wrap PDF** | The *entire* cover flattened — back, spine, front — sized from trim + pages + paper | Print editions |
| **Ebook cover image** | Front cover only, RGB, high resolution | Ebook editions |

The cover wrap is the one people get wrong. Its width is a function of the interior page count, which is a function of the manuscript, which changes whenever you add a sentence. **Generate the wrap at release time from the final page count, never store it as a static asset.**

### 2.2 Geometry

| Property | Typical value | Notes |
|----------|---------------|-------|
| Trim size | 6 × 9 in (most POD), 8.5 × 11 (workbooks) | KDP and IngramSpark have different size catalogs |
| Bleed | 0.125 in on top, bottom, and outside edges | Only for full-bleed art; adds pages, so it can push page count over a threshold |
| Margins | ≥ 0.25 in text-safe; gutter (inside) margin larger | Publisher minimums are hard rules, not preferences |
| Spine text | Omit on short paperbacks | KDP: under ~79 pages; IngramSpark: under ~48 |
| Barcode | Leave the zone clear if the printer prints it | Remove your own barcode if uploading to B&N Press; place EAN-13 exactly where the template says |
| Fonts | Embedded, subset, licensed for embedding | Check with `pdffonts` |
| Color | CMYK for commercial print; RGB for POD | Do this on purpose |

> These are typical values, not rules of law. Each platform publishes a current *file requirements* page — read it at upload time, not from this table or from a blog post.

### 2.3 Preflight

```bash
# fonts embedded?
pdffonts dist/interior.pdf

# PDF/X-4 conformance check
gs -dBATCH -dNOPAUSE -sDEVICE=pdfwrite -dPDFX -dPDFXProfile=/PDF/X-4 \
   -sOutputFile=checked.pdf dist/interior.pdf && echo "PDF/X-4 OK"

# EPUB validation (W3C EPUBCheck — the standard every retailer tests with)
java -jar epubcheck.jar dist/book.epub

# page count (drives the cover wrap)
pdfinfo dist/interior.pdf | grep Pages
```

Then open the PDF and read three pages: the first, a middle one with a figure, and the last. Automations catch structural problems; only reading catches widows, orphan headings, and a figure that ate a page.

---

## 3. Metadata and identifiers

### 3.1 One metadata file

```yaml
# metadata.yaml — consumed by Pandoc, or read by your own build script
title: "A Real Book"
subtitle: "Subtitle Goes Here"
author:
  - "Tony Dunsworth"
date: "2026-10-16"
lang: en-US
rights: "Copyright © 2026 Tony Dunsworth. Licensed under CC BY-NC-SA 4.0."
publisher: "Self-published"
isbn-print: "978-1-000000-00-0"
isbn-ebook: "978-1-000000-01-7"
doi: "10.0000/book.2026.001"
description: >
  One-sentence abstract used for every store listing.
keywords: [typography, publishing, self-hosting]
cover-image: cover.jpg
```

Everything downstream — the title page, the copyright page, the EPUB metadata, the store listing, the citation block — reads from this file. If a string appears twice, it is a bug.

### 3.2 ISBN rules that actually bite

| Rule | Detail |
|------|--------|
| **One ISBN per format per edition** | Paperback, hardcover, and EPUB are three different products → three ISBNs |
| **A new edition needs a new ISBN** | A substantially revised second edition is a new edition |
| **An ISBN identifies the product, not the platform** | Your own ISBN works on KDP *and* IngramSpark for the same print edition |
| **Platform-issued ISBNs are locked** | KDP's free ISBN (imprint "Independently published") is KDP-only. IngramSpark's free ISBN ("Indy Pub") is IngramSpark-only |
| **Buying your own preserves your imprint** | Bowker (US) is the official registry; KDP and IngramSpark resell Bowker ISBNs at a markup |
| **Kindle doesn't need one** | Amazon assigns an ASIN; ISBN optional for Kindle-only distribution |
| **Libraries generally require one** | OverDrive and most public/school library systems will not ingest without an ISBN |
| **Owning ≠ registered** | You must also register full metadata in Books in Print (MyIdentifiers) or it won't reach industry databases |

> Prices and program terms change annually — verify at Bowker/KDP/IngramSpark before spending anything. The lock-in rules above are the durable part.

### 3.3 Other identifiers

- **DOI** — for anything with a version and a public landing page. DataCite for non-journal content, Crossref for registered journals. A GitHub Pages + Zenodo DOI pipeline gives every release a citable snapshot.
- **EPUB unique identifier** — every EPUB must declare one; use the DOI or ISBN, not a placeholder URI.
- **ORCID** — for authors in scholarly publishing.
- **Dublin Core / schema.org metadata** — embedded in HTML `<head>`; this is what makes a web book discoverable.

---

## 4. Distribution channels

| Channel | Best for | What you upload | Notes |
|---------|----------|-----------------|-------|
| **GitHub Pages** | Technical books, public good | The built site | Free, versioned, no ISBN needed; readers must be technical |
| **Quarto Publish** | Quarto projects, quick sharing | The project | `quarto publish gh` |
| **Netlify / Cloudflare Pages** | Any static site | `dist/` | Generous free tier, form handling, deploy previews |
| **itch.io** | Games, TTRPG content, indie dev | PDF + zip | Also handles community forums and itch-based storefronts |
| **Amazon KDP** | Maximum reach, Amazon-first | EPUB/KPF/DOCX + interior PDF + wrap PDF | Free ISBN option (locked); Kindle Previewer to check; Expanded Distribution has rules |
| **IngramSpark** | Bookstore and library distribution | EPUB + CMYK wrap + interior | Wholesale terms, return settings, wider trim/binding options; free ISBN ("Indy Pub") |
| **Draft2Digital** | Ebook aggregation across stores | EPUB | Feed Apple, Kobo, Barnes & Noble, libraries, OverDrive |
| **Leanpub** | Technical ebooks, author retains rights | EPUB/MOBI | Author sets price and discount; royalty share |
| **Gumroad** | Digital products, direct sales | Anything | Payment + delivery + license keys in one place |
| **Lulu / Blurb** | Short-run, high-quality photo books | Print-ready PDF + cover | More control, higher unit cost |
| **Leanpub/Gumroad + your own site** | Maximum control | Anything | You handle support, tax, and updates |

### 4.1 The two-platform print setup

The common serious arrangement: KDP for direct Amazon sales, IngramSpark for trade distribution, **with an ISBN you own** so the same print edition carries one number everywhere. The consequences to accept up front:

- Buy the ISBN *before* upload — swapping ISBNs means unpublishing and relisting, and reviews tied to the old listing may not survive.
- Keep title, author, trim size, binding, and edition metadata identical across both platforms.
- Do **not** enroll that paperback in KDP Expanded Distribution if IngramSpark is distributing it.
- Generate a separate cover wrap per platform — the templates differ.
- Order proofs from both printers before launch. Passing one validator does not mean passing the other.

---

## Resources

- [EPUBCheck](https://www.w3.org/publishing/epubcheck/) — W3C EPUB validator
- [Kindle Previewer](https://kdp.amazon.com/en_US/help) (KDP Help → Kindle Previewer) — Amazon's own reader
- [Ghostscript PDF/X profiles](https://www.ghostscript.com/doc/current/UsePDFX.html)
- [Calibre](https://calibre-ebook.com/) — `ebook-convert`, `ebook-edit`, library management
- [KDP](https://kdp.amazon.com/) · [IngramSpark](https://www.ingramspark.com/) · [Draft2Digital](https://www.draft2digital.com/) · [Leanpub](https://leanpub.com/) · [Gumroad](https://gumroad.com/)
- [Bowker MyIdentifiers](https://www.myidentifiers.com/) (US ISBNs) · [International ISBN Agency directory](https://www.isbn-international.org/agencies) (everyone else)
- [Crossref](https://www.crossref.org/) · [DataCite](https://datacite.org/) · [Zenodo](https://zenodo.org/) — DOIs for non-journal content

---

*Last updated: 2026-10-16. POD program terms, ISBN prices, and file requirements change — verify at the source before every release.*
