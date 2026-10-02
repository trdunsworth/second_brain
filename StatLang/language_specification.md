# Mathematical & Analytical Programming Language
## Architecture & Specification Blueprint

---

## 1. Vision & Core Philosophy

This programming language is designed to combine the best ergonomics and mechanics from top analytical, functional, and statistical programming environments:

* **Python:** Clean, readable syntax and intuitive function declarations.
* **R:** Native first-class formulas (`y ~ x1 + x2`), data frames, and built-in missing value (`NA`) mechanics.
* **Julia:** High performance, type stability, broadcasting syntax (`.*`, `.^`), and multiple dispatch.
* **Haskell:** Strong typing hints, functional pipelines (`|>`), and expression-oriented design.
* **Lisp / Clojure:** Homoiconic AST representations enabling rich macros and symbolic meta-programming.

---

## 2. Formal EBNF Grammar Specification

```ebnf
(* ========================================================================== *)
(* Program Structure & Statements                                            *)
(* ========================================================================== *)

Program         ::= StatementList ;
StatementList   ::= { Statement ( Semicolon | Newline ) } ;

Statement       ::= VariableDecl
                  | FunctionDecl
                  | MacroDecl
                  | Expression ;

VariableDecl    ::= "let" Identifier [ ":" TypeAnnotation ] "=" Expression ;

FunctionDecl    ::= "fn" Identifier "(" [ ParameterList ] ")" [ "->" TypeAnnotation ] Block ;
ParameterList   ::= Parameter { "," Parameter } ;
Parameter       ::= Identifier [ ":" TypeAnnotation ] [ "=" Expression ] ;

MacroDecl       ::= "macro" Identifier "(" [ ParameterList ] ")" Block ;

Block           ::= "{" StatementList "}" ;

TypeAnnotation  ::= Identifier [ "<" TypeAnnotation { "," TypeAnnotation } ">" ] ;

(* ========================================================================== *)
(* Expressions & Pipeline Operations                                          *)
(* ========================================================================== *)

Expression      ::= FormulaExpr ;

(* Formula expressions (R-style statistical formulas: y ~ x1 + x2) *)
FormulaExpr     ::= PipeExpr [ "~" PipeExpr ] ;

(* Pipe operator (Haskell/Elixir/R native pipe: x |> f(y)) *)
PipeExpr        ::= LogicalOrExpr { "|>" Identifier "(" [ ArgumentList ] ")" } ;

LogicalOrExpr   ::= LogicalAndExpr { "or" LogicalAndExpr } ;
LogicalAndExpr  ::= EqualityExpr { "and" EqualityExpr } ;

EqualityExpr    ::= RelationalExpr { ( "==" | "!=" ) RelationalExpr } ;
RelationalExpr  ::= AdditiveExpr { ( "<" | "<=" | ">" | ">=" ) AdditiveExpr } ;

(* ========================================================================== *)
(* Mathematical & Matrix Operators                                           *)
(* ========================================================================== *)

AdditiveExpr    ::= MultiplicativeExpr { ( "+" | "-" ) MultiplicativeExpr } ;

(* Matrix multiplication (@) vs Standard multiplication (*) *)
MultiplicativeExpr ::= PowerExpr { ( "*" | "/" | "%" | "@" ) PowerExpr } ;

(* Exponentiation (right-associative) *)
PowerExpr       ::= UnaryExpr [ "^" PowerExpr ] ;

UnaryExpr       ::= ( "-" | "!" ) UnaryExpr 
                  | VectorizedOp ;

(* Julia-style element-wise / vectorized operations (e.g., .*, .+, ./, .^) *)
VectorizedOp    ::= "." ( "+" | "-" | "*" | "/" | "^" ) PrimaryExpr
                  | PrimaryExpr ;

(* ========================================================================== *)
(* Primaries, Functions, Collections & Literals                               *)
(* ========================================================================== *)

PrimaryExpr     ::= Literal
                  | Identifier
                  | FunctionCall
                  | MatrixLiteral
                  | VectorLiteral
                  | AnonymousFunction
                  | "(" Expression ")" ;

FunctionCall    ::= Identifier "(" [ ArgumentList ] ")" ;
ArgumentList    ::= Expression { "," Expression } ;

AnonymousFunction ::= "(" [ ParameterList ] ")" "=>" ( Expression | Block ) ;

(* Vector and Matrix Literals *)
VectorLiteral   ::= "[" [ ArgumentList ] "]" ;

(* Matrix Literal Syntax: [1, 2; 3, 4] where semi-colons separate rows *)
MatrixLiteral   ::= "[" MatrixRow { ";" MatrixRow } "]" ;
MatrixRow       ::= Expression { "," Expression } ;

(* ========================================================================== *)
(* Tokens & Lexical Grammar                                                   *)
(* ========================================================================== *)

Identifier      ::= ( Letter | "_" ) { Letter | Digit | "_" | "!" | "?" } ;

Literal         ::= NumberLiteral
                  | StringLiteral
                  | BooleanLiteral
                  | MissingLiteral ;

NumberLiteral   ::= IntegerLiteral | FloatLiteral ;
IntegerLiteral  ::= [ "-" ] Digit { Digit } ;
FloatLiteral    ::= [ "-" ] Digit { Digit } "." Digit { Digit } [ Exponent ] ;
Exponent        ::= ( "e" | "E" ) [ "+" | "-" ] Digit { Digit } ;

StringLiteral   ::= '"' { Character } '"' ;
BooleanLiteral  ::= "true" | "false" ;
MissingLiteral  ::= "NA" | "null" ;

Letter          ::= "a".."z" | "A".."Z" ;
Digit           ::= "0".."9" ;
Semicolon       ::= ";" ;
Newline         ::= "\n" | "\r\n" ;
```

---

## 3. Type System & Missing Value (`NA`) Architecture

### 3.1 Type System Layout
The language uses a dynamic-first, type-stable object model backed by Julia-style **Multiple Dispatch**:

```
                         Value / Any
                              │
          ┌───────────────────┴───────────────────┐
      Primitive                               Container
   (Int, Float, Bool, String)        (Vector<T>, Matrix<T>, DataFrame)
          │                                       │
     Option<T> / NA                            Type-Stable Arrays
```

### 3.2 Memory Layout for `NA`
To avoid pointer overhead or single NaN sentinels, missing values use an **Apache Arrow bitmask model**:
1. **Data Buffer:** Contiguous values (e.g., `f64` array).
2. **Validity Bitmap:** Bit mask where `1` = valid data, `0` = `NA`.

| Index | Data Buffer (Float64) | Validity Bitmask | Logical Value |
| :--- | :--- | :--- | :--- |
| `0` | `10.5` | `1` | `10.5` |
| `1` | `0.0` (ignored) | `0` | `NA` |
| `2` | `42.1` | `1` | `42.1` |

### 3.3 Three-Valued Logic Propagation
```
# Arithmetic
10 + NA      => NA
Matrix @ NA  => NA

# Kleene Logic
true  and NA => NA
false and NA => false
true  or  NA => true
```

### 3.4 Broadcasting via Zero-Copy Striding
* **Shape Matching Rule:** Compares shapes right-to-left. Dimensions match if equal or if one is `1`.
* **Zero-Stride Trick:** Expanding dimension `1` to `N` sets `stride = 0`, broadcasting values without memory allocation:
$$\text{offset} = (\text{row\_idx} \times \text{row\_stride}) + (\text{col\_idx} \times \text{col\_stride})$$

---

## 4. High-Performance DataFrame & Zero-Copy Arrow Architecture

### 4.1 Apache Arrow C Data Interface Structs
```c
#include <stdint.h>

// Metadata struct for exporting schema across FFI boundaries
struct ArrowSchema {
  const char* format;       
  const char* name;         
  const char* metadata;     
  int64_t flags;            
  int64_t n_children;       
  struct ArrowSchema** children;
  struct ArrowSchema* dictionary;
  
  void (*release)(struct ArrowSchema*);
  void* private_data;       
};

// Memory pointer struct for zero-copy data passing
struct ArrowArray {
  int64_t length;           
  int64_t null_count;       
  int64_t offset;           
  int64_t n_buffers;        
  int64_t n_children;       
  const void** buffers;     
  struct ArrowArray** children;
  struct ArrowArray* dictionary;

  void (*release)(struct ArrowArray*); 
  void* private_data;       
};
```

### 4.2 Rust Interoperability Implementation
```rust
use std::sync::Arc;
use arrow::array::{ArrayRef, RecordBatch};
use arrow::datatypes::Schema;
use arrow::ffi::{FFI_ArrowArray, FFI_ArrowSchema};
use polars::prelude::*;

/// DataFrame abstraction holding Arrow arrays
#[derive(Clone, Debug)]
pub struct DataFrame {
    schema: Arc<Schema>,
    columns: Vec<ArrayRef>,
    length: usize,
}

impl DataFrame {
    pub fn new(schema: Arc<Schema>, columns: Vec<ArrayRef>) -> Self {
        let length = columns.first().map(|c| c.len()).unwrap_or(0);
        Self { schema, columns, length }
    }

    /// Export column to Arrow C Data Interface (zero-copy)
    pub fn export_column_to_c(&self, col_idx: usize) -> (FFI_ArrowArray, FFI_ArrowSchema) {
        let array = &self.columns[col_idx];
        let field = self.schema.field(col_idx);
        
        let ffi_array = FFI_ArrowArray::new(array.to_data());
        let ffi_schema = FFI_ArrowSchema::try_from(field).unwrap();
        
        (ffi_array, ffi_schema)
    }

    /// Import column from C Data Interface (zero-copy)
    pub unsafe fn import_from_c(
        ffi_array: FFI_ArrowArray, 
        ffi_schema: FFI_ArrowSchema
    ) -> ArrayRef {
        let array_data = arrow::ffi::from_ffi(ffi_array, &ffi_schema).unwrap();
        arrow::array::make_array(array_data)
    }
}

/// Zero-copy conversion from Polars DataFrame
pub fn polars_to_custom_df(p_df: polars::frame::DataFrame) -> DataFrame {
    let mut custom_cols = Vec::new();

    for series in p_df.get_columns() {
        let arrow_array: arrow::array::ArrayRef = series.chunks()[0].to_boxed();
        custom_cols.push(arrow_array);
    }

    DataFrame::new(
        Arc::new(p_df.schema().to_arrow()), 
        custom_cols
    )
}
```

---

## 5. Development Roadmap & Implementation Plan

1. **Phase 1: Lexer & Pratt Parser**
   * Write tokenizer and Pratt parser for operator precedence (`^`, `@`, `.*`, `|>`).
   * Output AST as homogeneous s-expressions.
2. **Phase 2: Core Memory Engine**
   * Wrap Arrow arrays and construct vectorized broadcast iteration kernels in Rust.
3. **Phase 3: FFI & Engine Integrations**
   * Expose Arrow C Data Interface and integrate zero-copy data passing with Polars and DuckDB.
4. **Phase 4: REPL & JIT Pipeline**
   * Implement interactive REPL and explore LLVM/C-FFI for JIT compilation.