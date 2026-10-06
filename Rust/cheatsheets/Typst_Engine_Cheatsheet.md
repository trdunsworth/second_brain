---
type: cheatsheet
topic: Typst engine cheatsheet — typst 0.15 API: World trait, compile, typst_pdf, FileId, typst-kit features, verified against docs.rs
date: 2026-10-06
status: active
tags:
  - rust
  - typst
  - cheatsheet
  - reference
  - pdf
---

# Typst Engine Cheatsheet

> Goal: the embedded-engine API on one page — **every signature below was verified against docs.rs for typst 0.15.1 / typst-pdf 0.15.1 / typst-kit 0.15.1 (released 2026-09-28) on 2026-10-06.** Re-check after any typst minor bump; this API moves.
> Related: [[Typst_PDF_Engine]] (the full walkthrough with a World impl), [[Carve_to_Typst_Mapping]] (the source you feed it), [[03_typst]] (Typst language guide)

## 1. The crate set (all version-locked to each other)

| Crate | Version | Role |
|-------|---------|------|
| `typst` | 0.15.1 | the compiler front door: `compile`, `World`, `Library` |
| `typst-layout` | 0.15.1 | layout engine → `PagedDocument` (the compile output type) |
| `typst-pdf` | 0.15.1 | `pdf(&PagedDocument, &PdfOptions) → Vec<u8>` |
| `typst-svg` | 0.15.1 | `svg(&frame)` / `svg_merged(&doc)` — pure-vector per-page SVG |
| `typst-kit` | 0.15.1 | fonts/files/packages/diagnostics helpers (heavily feature-gated) |
| `typst-assets` | 0.15.1 | bundled fonts (pulled via typst-kit's `embedded-fonts`) |

```toml
[dependencies]
typst = "0.15"
typst-layout = "0.15"          # for PagedDocument in scope
typst-pdf = "0.15"
typst-kit = { version = "0.15", features = ["embedded-fonts", "scan-fonts", "datetime"] }
```

> [!warning] MSRV
> typst-pdf 0.15.1 requires **Rust 1.92**, edition 2024. See [[Rust_Installation]] §1.

## 2. The two functions you call

```rust
use typst::diag::Warned;

// 1) compile — generic over the Output trait (typst::foundations::Output)
let Warned { output, warnings } = typst::compile::<typst_layout::PagedDocument>(&world);
for w in &warnings { eprintln!("warning: {w}"); }
let doc = output.map_err(render_diagnostics)?;   // Err = Vec<SourceDiagnostic>

// 2) export — separate crate!
let pdf_bytes: Vec<u8> = typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())?;
std::fs::write("out.pdf", pdf_bytes)?;
```

- `typst::compile::<T>(&dyn World) -> Warned<SourceResult<T>> where T: Output` — `T` is `PagedDocument` (paged/PDF) or `HtmlDocument`.
- `typst_pdf::pdf(document: &PagedDocument, options: &PdfOptions) -> SourceResult<Vec<u8>>`.
- `PdfOptions` knobs: `PdfStandard` (PDF/A etc. via `PdfStandards`), `Timestamp` (PDF creation time — **bytes differ run-to-run unless you pin it**), per-page ranges.
- Other exports: `typst_svg::svg(&frame)` per frame, `typst_svg::svg_merged(&doc)` for multi-page; PNG in the `typst-png` crate.
- There is **no** `typst::export::pdf` in 0.15 — older blog posts will mislead you; it lives in `typst-pdf`.

## 3. The `World` trait — what you must implement

```rust
pub trait World: Send + Sync {
    fn library(&self) -> &LazyHash<Library>;               // std lib: Library::default()
    fn book(&self)    -> &LazyHash<FontBook>;              // font metadata index
    fn main(&self)    -> FileId;                           // id of the entry file
    fn source(&self, id: FileId) -> Result<Source, FileError>;
    fn file(&self, id: FileId)   -> Result<Bytes, FileError>;
    fn font(&self, index: usize) -> Option<Font>;          // index into book()
    fn today(&self, offset: Option<Duration>) -> Option<Datetime>;
}
```

| Method | Minimal answer for the challenge |
|--------|----------------------------------|
| `library` | `LazyHash::new(Library::default())` (bring `typst::LibraryExt` into scope) |
| `book` | build once: `FontBook` from the fonts you loaded (`FontBook::new()` + push per font — check exact push method on docs.rs) |
| `main` | the `FileId` you made for the generated source |
| `source` | `Ok(generated_source.clone())` for main id, `Err(FileError::NotFound(None))` otherwise |
| `file` | same story for images/assets you embed; `NotFound` for the rest |
| `font(i)` | `self.fonts.get(i).cloned()` — fonts are refcounted, cheap to clone |
| `today` | `None` (Typst `datetime.today()` will error) or wire `typst-kit` `datetime` feature |

All loading fns should **cache** (the docs say so): `Source`, `Bytes`, `Font` are `Arc`-backed and cheap to clone.

## 4. FileId / paths (0.15 renamed things — this trips people)

```rust
use typst::syntax::{FileId, RootedPath, VirtualPath, VirtualRoot, Source};

let id = RootedPath::new(VirtualRoot::Project, VirtualPath::new("/main.typ")).intern();
// equivalently: FileId::new(RootedPath::new(VirtualRoot::Project, VirtualPath::new("/main.typ")))
let source = Source::new(id, typst_source_string);

// VirtualRoot::Project | VirtualRoot::Package(PackageSpec)  ← the 0.15 enum
// FileId::unique(path)  ← for "virtual" files like stdin content
```

`FileId` is interned, `Copy`, globally unique by path — pass it around freely.

## 5. Fonts (the #1 "why is my PDF empty" cause)

```toml
typst-kit = { version = "0.15", features = ["embedded-fonts", "scan-fonts"] }
```

| Feature | Provides |
|---------|----------|
| `embedded-fonts` | `typst_kit::fonts::embedded()` — yields Typst's bundled fonts (Libertinus, New Computer Math, …) |
| `scan-fonts` | `fonts::scan(path)` for a directory, `fonts::system()` for OS fonts (fontdb-based) |
| — | `FontStore` holds loaded fonts; `FontSource` trait serves them on demand |

Flow: gather font data → `Font::new(bytes)` → push into `FontBook` + keep `Vec<Font>` for `font(index)`. Without this, layout falls back and text renders as *missing glyph boxes* (compilation still "succeeds" — inspect the PDF!).

## 6. typst-kit features (0.15 feature names changed from 0.14)

`embedded-fonts` · `scan-fonts` · `system-files` · `system-packages` · `universe-packages` · `emit-diagnostics` · `datetime` · `system-downloader` · `watcher` · `timer` · `http-server` · `bundle` · `vendor-openssl`

Useful modules: `typst_kit::fonts`, `::files` (`SystemFiles`), `::packages` (`SystemPackages`, `UniversePackages`), `::diagnostics::emit` (pretty terminal diagnostics — verify signature on docs.rs), `::datetime::Time`.

> 0.14's `fonts`/`embed-fonts`/`packages` feature names are **gone** — if an old example says `features = ["fonts"]`, it won't compile.

## 7. Diagnostics & errors

```rust
use typst::diag::{SourceResult, SourceDiagnostic, Warned, FileError};
// compile errors: Vec<SourceDiagnostic> — each has message, span, hints (Display works)
// World errors:   FileError (NotFound / AccessDenied / InvalidUtf8 / …)
```

Rendering strategy: for each `SourceDiagnostic`, map `span → source` (via your `World`) and print with line/column; or use `typst_kit::diagnostics::emit` (feature `emit-diagnostics`). **Remember the meaning in this project:** a Typst diagnostic = a bug in *your emitter*, so include the offending generated line in the message ([[Rust_Tutorial]] §8 layer 3).

## 8. What "Typst layout calls" means in practice

You don't call layout functions directly — you *emit Typst source* that contains them, then `compile` runs layout. The calls your emitter will emit most:

```typst
#set page(paper: "a4", margin: (x: 2cm, y: 2.4cm))
#set text(font: "Libertinus Serif", size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em)
#set document(title: "…", author: "…")
#show heading.where(level: 1): it => block(above: 1.5em, it)
#outline(depth: 3, indent: auto)          // optional TOC
#figure(image("fig.png"), caption: [..]) <fig-id>
#table(columns: 3, table.header([a], [b]), [1], [2])
#footnote[...]
#link("https://…")[label]
#quote(block: true)[…]
#highlight[…]; #underline[…]; #sup[…]; #sub[…]
```

Full Carve → call mapping: [[Carve_to_Typst_Mapping]]. Direct programmatic layout (`typst_layout::layout_frame` over hand-built `Content`) is possible but couples you to internal element structs — not recommended for M0–M7 (see [[Carve_to_Typst_Mapping]] §4 strategy B).

## 9. Advanced: cache across compiles (batch mode)

`World` docs: fonts rarely change → cache `FontBook`/`Vec<Font>` for the whole process; sources change per document → rebuild per file. In a batch CLI (`carve2typst *.carve`), construct the font state **once**, clone the cheap parts into each per-document world. Comemo (Typst's incremental engine) benefits from stable inputs.

## 10. Gotcha board

| Symptom | Likely cause |
|---------|--------------|
| `package requires rustc 1.92` | stale toolchain ([[Rust_Installation]] §1) |
| `cannot find type PagedDocument` | forgot `typst-layout` dep |
| empty/garbled text in PDF | no fonts in your `World` (§5) |
| `file not found: /main.typ` | `main()` id ≠ the id you built the `Source` with (§4) |
| PDF bytes differ every run | `Timestamp` in `PdfOptions` — pin it for golden tests |
| old blog: `typst::export::pdf` | removed — it's `typst_pdf::pdf` now (§2) |
| `features = ["fonts"]` fails | typst-kit 0.15 renamed features (§6) |

## Status

- [x] Signatures verified vs docs.rs 0.15.1 (2026-10-06): `compile`, `World`, `typst_pdf::pdf`, `RootedPath`/`VirtualRoot`, typst-kit feature list
- [ ] Re-verify after any typst 0.16 bump
