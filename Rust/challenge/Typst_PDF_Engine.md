---
type: guide
topic: Typst PDF engine — embedding typst 0.15 in Rust: World implementation, M0 hello-PDF skeleton, fonts, diagnostics, PDF options and performance
date: 2026-10-06
status: active
tags:
  - rust
  - typst
  - pdf
  - engine
  - challenge
---

# Typst PDF Engine

> Goal: milestone **M0** of [[Carve_Parser_Challenge]] — a working `Typst source → vector PDF` module you can copy into the project today, plus the know-how to diagnose when it misbehaves. All API signatures verified against docs.rs 0.15.1 on 2026-10-06 (see [[Typst_Engine_Cheatsheet]] for the lookup version).
> Related: [[Typst_Engine_Cheatsheet]] (one-page API) · [[Carve_to_Typst_Mapping]] (the source we feed it) · [[Rust_Installation]] §1 (Rust 1.92+)

## 1. The contract in three lines

1. **Implement `World`** — a file/font provider the compiler asks (`source()`, `font()`, `library()`…).
2. **`typst::compile::<PagedDocument>(&world)`** → `Warned { output, warnings }`; `output` is `Result<PagedDocument, Vec<SourceDiagnostic>>`.
3. **`typst_pdf::pdf(&doc, &PdfOptions::default())`** → `Vec<u8>` → write file.

The PDF is vector by construction: Typst emits path operators + **subset-embedded** font glyphs. No raster stage exists. Proof on any output: zoom a PDF to 800% — text stays crisp.

## 2. M0 skeleton (copy → `src/engine.rs`)

```toml
# Cargo.toml (versions verified 2026-10-06; MSRV 1.92)
[dependencies]
typst = "0.15"
typst-layout = "0.15"     # PagedDocument lives here in 0.15, not in `typst`
typst-pdf = "0.15"
typst-kit = { version = "0.15", features = ["embedded-fonts", "scan-fonts", "datetime"] }
thiserror = "2"
```

```rust
use typst::diag::{FileError, SourceResult, Warned};
use typst::foundations::LazyHash;          // confirm exact path at compile time
use typst::syntax::{FileId, RootedPath, Source, VirtualPath, VirtualRoot};
use typst::{Library, LibraryExt, World};
use typst_layout::PagedDocument;

pub struct SimpleWorld {
    source: Source,                  // main file, id matches main()
    fonts: Vec<typst::font::Font>,   // loaded once
    book: LazyHash<typst::text::FontBook>,
    library: LazyHash<Library>,
}

impl SimpleWorld {
    pub fn new(source_text: String) -> typst::diag::Result<Self> {
        let id = RootedPath::new(VirtualRoot::Project, VirtualPath::new("/main.typ")).intern();
        let source = Source::new(id, source_text);

        // Fonts: bundled with Typst (feature "embedded-fonts")
        let mut fonts = Vec::new();
        let mut book = typst::text::FontBook::new();
        for font_data in typst_kit::fonts::embedded() {
            // FontBook insert API: check docs.rs for exact name (font book push/insert)
            if let Ok(font) = typst::font::Font::new(font_data) {   // verify Font::new signature
                // book.push(font.info().clone());                  // exact call: docs.rs
                fonts.push(font);
            }
        }
        Ok(Self {
            source,
            fonts,
            book: LazyHash::new(book),
            library: LazyHash::new(Library::default()),
        })
    }
}

impl World for SimpleWorld {
    fn library(&self) -> &LazyHash<Library> { &self.library }
    fn book(&self) -> &LazyHash<typst::text::FontBook> { &self.book }
    fn main(&self) -> FileId { self.source.id() }

    fn source(&self, id: FileId) -> Result<Source, FileError> {
        if id == self.source.id() { Ok(self.source.clone()) }      // Source is Arc-backed: cheap
        else { Err(FileError::NotFound(None)) }
    }
    fn file(&self, _id: FileId) -> Result<typst::foundations::Bytes, FileError> {
        Err(FileError::NotFound(None))                             // no images yet (M4)
    }
    fn font(&self, index: usize) -> Option<typst::font::Font> {
        self.fonts.get(index).cloned()                             // Arc clone
    }
    fn today(&self, _offset: Option<std::time::Duration>) -> Option<typst::foundations::Datetime> {
        None                                                        // datetime feature can fill this
    }
    // Also required: typst::WorldExt (usually a provided extension — check if it has methods)
}

/// Render Typst source → PDF bytes. Any error here = emitter bug or engine config.
pub fn render_pdf(ty_source: &str) -> Result<Vec<u8>, EngineError> {
    let world = SimpleWorld::new(ty_source.to_string()).map_err(EngineError::WorldInit)?;

    let Warned { output, warnings } = typst::compile::<PagedDocument>(&world);
    for w in warnings { eprintln!("typst warning: {w}"); }

    let doc = output.map_err(|diags| EngineError::Compile(render_diagnostics(&diags)))?;
    let bytes = typst_pdf::pdf(&doc, &typst_pdf::PdfOptions::default())
        .map_err(|e| EngineError::Pdf(format!("{e:?}")))?;
    Ok(bytes)
}

#[derive(Debug, thiserror::Error)]
pub enum EngineError {
    #[error("failed to initialize Typst world: {0}")]
    WorldInit(String),
    #[error("Typst compile failed:\n{0}")]
    Compile(String),
    #[error("PDF export failed: {0}")]
    Pdf(String),
}

fn render_diagnostics(diags: &[typst::diag::SourceDiagnostic]) -> String {
    diags.iter().map(|d| {
        // d.span → find source & line/col via world/Source; v1: Display the diagnostic
        format!("{d}")   // upgrade: include the offending generated line ([[Rust_Tutorial]] §8)
    }).collect::<Vec<_>>().join("\n")
}
```

> [!warning] Verify-at-compile-time spots
> The skeleton above marks every spot where 0.15 naming must be confirmed against docs.rs (LazyHash import path, `FontBook` insert method, `Font::new` signature, `WorldExt`/`DateTime` details): **compile M0 once with `cargo doc --open typst` beside you.** The *flow* (World → compile → Warned → pdf) is verified; the small method names are where versions bite. Update [[Typst_Engine_Cheatsheet]] if you learn a correction.

```rust
// src/main.rs (M0)
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let src = r#"
        #set page(paper: "a4", margin: 2cm)
        #set text(font: "Libertinus Serif", size: 12pt)
        = Hello, Carve
        This is *M0*: `engine.rs` compiles Typst to a vector PDF.
    "#;
    let pdf = engine::render_pdf(src)?;
    std::fs::write("out/hello.pdf", pdf)?;
    println!("wrote out/hello.pdf");
    Ok(())
}
```

**M0 smoke test:** open the PDF — text must be crisp and correctly shaped (Libertinus serif). Boxes/tofu = font path broken (§4). Then `cargo test` green with a tiny `#[test] fn hello() { render_pdf(...).is_ok() }`.

## 3. Compile pipeline notes

- `typst::compile::<T>(&dyn World)` is generic over `typst::foundations::Output`; paged/PDF path uses `typst_layout::PagedDocument`, HTML path uses `HtmlDocument`. We're paged-only.
- Returns `Warned<SourceResult<T>>` = **both** warnings and errors: always print warnings (they're your emitter's lint feed — e.g. unknown functions show up here in some forms).
- `SourceResult` error = `Vec<SourceDiagnostic>` — each has `span` + message (+ hints). Span → `Source` → line/col: map via the same `World` you compiled with.
- Errors mean: **bug in emitted source** (challenge context) — your error type should say that explicitly: `EmitError::TypstRejected { line, message, snippet }`.
- `PdfOptions::default()` is fine for v1. Knobs later: `Timestamp` (pin it — PDFs embed creation time and **bytes differ run-to-run**, breaking naive golden tests), `PdfStandard`/`PdfStandards` for PDF/A, page ranges.

## 4. Fonts — the #1 silent failure

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty boxes / tofu glyphs | `font(i)` never returns data or `book` empty | feature `embedded-fonts` on typst-kit; load in `new()` once |
| Wrong font family | `#set text(font: "…")` names a font not in book | stick to bundled: Libertinus Serif/Sans/Mono, New Computer Math |
| Weird spacing/math | math font missing | ensure embedded set includes New Computer Math |
| Slow startup | fonts re-parsed per document | **load once per process**, keep `Vec<Font>` + book for batch mode ([[Typst_Engine_Cheatsheet]] §9) |

Bundled fonts cover Latin text + math. System fonts (`scan-fonts` feature → `typst_kit::fonts::system()`) add CJK/emoji but make output machine-dependent — only if needed, and then document it.

## 5. Diagnostics UX

```rust
// v1: join Display of diagnostics.
// v2: miette/ariadne report pointing at the GENERATED .typ (persist it with --keep-typst)
//     so the caret lands on the line YOUR emitter produced.
```

- Keep `--emit-typst` / `--keep-typst` flags on the CLI from M2 onward ([[Carve_Parser_Challenge]] §4) — the `.typ` file is the debugging interface between emitter and engine.
- When debugging hard: copy generated `.typ` → run `typst watch file.typ file.pdf` manually → read Typst's own terminal output with your own eyes. The CLI and library share the compiler.

## 6. Performance

- Compile times are single-digit ms to low tens of ms per page for text docs — parser+emitter will be the bottleneck first; only optimize if batch M7 shows otherwise (then criterion-bench the lexer, [[Parser_Cheatsheet]] §8).
- Cache across compiles: fonts/book static; `Source` rebuilt per document (they're `Arc`-backed — cheap).
- Comemo (Typst's incremental memoizer) benefits when inputs are stable between runs — constructing the world the same way each time helps.

## 7. Fallback: subprocess the Typst CLI

If the embedded path stalls (MSRV, API churn):

```powershell
cargo install typst-cli
typst compile input.typ out.pdf    # same compiler, no World impl needed
```

Keep the seam: emitter writes `.typ`, then either in-process **or** `std::process::Command` runs the CLI. Both produce the same vector PDF. The subprocess mode is also a great **cross-check test** ("embedded and CLI agree byte-for-byte when `Timestamp` pinned").

## 8. Acceptance checklist (M0 exit criteria)

- [ ] `cargo run` writes `out/hello.pdf`; opens in a viewer, text crisp at 800% zoom (vector proof)
- [ ] A deliberate error in the source (e.g. `#unknown-fn()`) produces a **readable** compile diagnostic, not a panic
- [ ] Warning path exercised (some harmless construct that warns → printed)
- [ ] Fonts: bundled set visible via `book()` — test asserts `font(0).is_some()`
- [ ] No `unwrap()` outside tests; `EngineError` covers world/compile/pdf stages
- [ ] MSRV: builds on stable ≥ 1.92 (toolchain per [[Rust_Installation]])

## Status

- [x] API flow verified vs docs.rs 0.15.1 (2026-10-06): compile/Warned, typst_pdf::pdf, FileId/RootedPath/VirtualRoot, typst-kit features
- [ ] Compile M0 and resolve the verify-at-compile-time spots (§2); update [[Typst_Engine_Cheatsheet]] with corrections
- [ ] M0 exit criteria checked above
