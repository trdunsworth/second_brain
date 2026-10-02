# Mathematical & Analytical Programming Language

## Architecture & Specification Blueprint

## 1. Vision & Core Philosophy

This programming language is designed to combine the best ergonomics and mechanics from top analytical, functional, and statistical programming environments:

* **Python:** Clean, readable syntax and intuitive function declarations.

* **R:** Native first-class formulas (`y ~ x1 + x2`), data frames, and built-in missing value (`NA`) mechanics.

* **Julia:** High performance, type stability, broadcasting syntax (`.*`, `.^`), and multiple dispatch.

* **Haskell:** Strong typing hints, functional pipelines (`|>`), and expression-oriented design.

* **Lisp / Clojure:** Homoiconic AST representations enabling rich macros and symbolic meta-programming.

## 2. Formal EBNF Grammar Specification

```
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

## 5. Parser Architecture: Pratt Parsing Engine (Rust)

Pratt parsing (Top-Down Operator Precedence) is chosen for parsing expressions because it gracefully handles custom binding powers for matrix operators (`@`), Julia-style element-wise operations (`.*`, `.+`), right-associative exponentiation (`^`), pipes (`|>`), and statistical formulas (`~`).

### 5.1 AST Node Definitions

```rust
#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Number(f64),
    Identifier(String),
    Plus, Minus, Star, Slash, Caret, At,       // Standard & Matrix Operators
    DotPlus, DotMinus, DotStar, DotSlash, DotCaret, // Vectorized Ops
    Tilde, PipeGreater,                        // Formula & Pipe
    LParen, RParen, LBracket, RBracket,
    Comma, Semicolon, Let, Equal,
    EOF,
}

#[derive(Debug, Clone, PartialEq)]
pub enum BinaryOp {
    Add, Sub, Mul, Div, Pow, MatrixMul,
    DotAdd, DotSub, DotMul, DotDiv, DotPow,
    Formula, Pipe,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    Literal(f64),
    Variable(String),
    Binary { op: BinaryOp, left: Box<Expr>, right: Box<Expr> },
    Vector(Vec<Expr>),
    Matrix(Vec<Vec<Expr>>), // Rows of expressions
    Call { callee: String, args: Vec<Expr> },
}
```

### 5.2 Binding Power & Pratt Parser Implementation

```rust
pub struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    pub fn new(tokens: Vec<Token>) -> Self {
        Self { tokens, pos: 0 }
    }

    fn peek(&self) -> Token {
        self.tokens.get(self.pos).cloned().unwrap_or(Token::EOF)
    }

    fn advance(&mut self) -> Token {
        let tok = self.peek();
        if tok != Token::EOF { self.pos += 1; }
        tok
    }

    /// Binding powers define operator precedence & associativity
    fn infix_binding_power(op: &Token) -> Option<(u8, u8)> {
        match op {
            Token::Tilde => Some((1, 2)),        // Lowest precedence (Formula: y ~ x)
            Token::PipeGreater => Some((3, 4)),  // Pipe: x |> f()
            Token::Plus | Token::Minus | Token::DotPlus | Token::DotMinus => Some((5, 6)),
            Token::Star | Token::Slash | Token::At | Token::DotStar | Token::DotSlash => Some((7, 8)),
            Token::Caret | Token::DotCaret => Some((10, 9)), // Right-associative exponentiation
            _ => None,
        }
    }

    pub fn parse_expr(&mut self, min_bp: u8) -> Expr {
        let mut left = match self.advance() {
            Token::Number(n) => Expr::Literal(n),
            Token::Identifier(name) => {
                if self.peek() == Token::LParen {
                    self.advance(); // consume '('
                    let mut args = Vec::new();
                    while self.peek() != Token::RParen && self.peek() != Token::EOF {
                        args.push(self.parse_expr(0));
                        if self.peek() == Token::Comma { self.advance(); }
                    }
                    self.advance(); // consume ')'
                    Expr::Call { callee: name, args }
                } else {
                    Expr::Variable(name)
                }
            },
            Token::LParen => {
                let expr = self.parse_expr(0);
                self.advance(); // consume ')'
                expr
            },
            Token::LBracket => self.parse_matrix_or_vector(),
            tok => panic!("Unexpected prefix token: {:?}", tok),
        };

        loop {
            let op = self.peek();
            if op == Token::EOF { break; }

            if let Some((l_bp, r_bp)) = Self::infix_binding_power(&op) {
                if l_bp < min_bp { break; }
                self.advance(); // consume op

                let binary_op = match op {
                    Token::Plus => BinaryOp::Add,
                    Token::Minus => BinaryOp::Sub,
                    Token::Star => BinaryOp::Mul,
                    Token::Slash => BinaryOp::Div,
                    Token::At => BinaryOp::MatrixMul,
                    Token::Caret => BinaryOp::Pow,
                    Token::DotStar => BinaryOp::DotMul,
                    Token::PipeGreater => BinaryOp::Pipe,
                    Token::Tilde => BinaryOp::Formula,
                    _ => unreachable!(),
                };

                let right = self.parse_expr(r_bp);
                left = Expr::Binary { op: binary_op, left: Box::new(left), right: Box::new(right) };
            } else {
                break;
            }
        }

        left
    }

    fn parse_matrix_or_vector(&mut self) -> Expr {
        let mut rows = Vec::new();
        let mut current_row = Vec::new();
        let mut is_matrix = false;

        while self.peek() != Token::RBracket && self.peek() != Token::EOF {
            current_row.push(self.parse_expr(0));
            match self.peek() {
                Token::Comma => { self.advance(); },
                Token::Semicolon => {
                    self.advance();
                    is_matrix = true;
                    rows.push(current_row);
                    current_row = Vec::new();
                },
                _ => {}
            }
        }
        self.advance(); // consume ']'

        if is_matrix || !rows.is_empty() {
            if !current_row.is_empty() { rows.push(current_row); }
            Expr::Matrix(rows)
        } else {
            Expr::Vector(current_row)
        }
    }
}
```

## 6. Execution Engine Architecture

The runtime execution strategy follows a two-tier model:

1. **Phase 1: Tree-Walking Interpreter with Environment Frame Stack** (Fast prototyping and macro expansion)
2. **Phase 2: Bytecode Compiler + Vectorized Kernel VM** (Production runtime)

```
                            ┌────────────────────────┐
                            │   AST Expression Tree  │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │ Vectorized Kernel Fusion│
                            │   & IR Optimization    │
                            └───────────┬────────────┘
                                        │
                                        ▼
                            ┌────────────────────────┐
                            │ Bytecode Virtual Machine│
                            │  or JIT Execution Loop │
                            └────────────────────────┘
```

### 6.1 Value Representation & Environment Evaluation Loop

```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub enum RuntimeValue {
    Scalar(f64),
    Vector(Vec<f64>),
    Matrix { data: Vec<f64>, rows: usize, cols: usize },
    Formula { lhs: Box<Expr>, rhs: Box<Expr> },
    NA,
}

pub struct Environment {
    bindings: HashMap<String, RuntimeValue>,
}

pub fn eval(expr: &Expr, env: &mut Environment) -> RuntimeValue {
    match expr {
        Expr::Literal(val) => RuntimeValue::Scalar(*val),
        Expr::Variable(name) => env.bindings.get(name).cloned().unwrap_or(RuntimeValue::NA),
        Expr::Binary { op, left, right } => {
            let l_val = eval(left, env);
            let r_val = eval(right, env);
            eval_binary_op(op, l_val, r_val)
        },
        Expr::Call { callee, args } => {
            let evaluated_args: Vec<RuntimeValue> = args.iter().map(|a| eval(a, env)).collect();
            dispatch_function(callee, evaluated_args)
        },
        Expr::Matrix(rows) => {
            let num_rows = rows.len();
            let num_cols = rows[0].len();
            let mut data = Vec::with_capacity(num_rows * num_cols);
            for row in rows {
                for cell in row {
                    if let RuntimeValue::Scalar(s) = eval(cell, env) {
                        data.push(s);
                    }
                }
            }
            RuntimeValue::Matrix { data, rows: num_rows, cols: num_cols }
        },
        Expr::Vector(elements) => {
            let vec_data = elements.iter().map(|e| {
                match eval(e, env) {
                    RuntimeValue::Scalar(s) => s,
                    _ => f64::NAN,
                }
            }).collect();
            RuntimeValue::Vector(vec_data)
        }
    }
}

fn eval_binary_op(op: &BinaryOp, left: RuntimeValue, right: RuntimeValue) -> RuntimeValue {
    match (op, left, right) {
        // Element-wise addition
        (BinaryOp::DotAdd, RuntimeValue::Vector(a), RuntimeValue::Vector(b)) => {
            let res = a.iter().zip(b.iter()).map(|(x, y)| x + y).collect();
            RuntimeValue::Vector(res)
        },
        // Matrix multiplication (@)
        (BinaryOp::MatrixMul, RuntimeValue::Matrix { data: a, rows: r1, cols: c1 },
                              RuntimeValue::Matrix { data: b, rows: r2, cols: c2 }) => {
            assert_eq!(c1, r2, "Matrix dimension mismatch for multiplication");
            let mut out = vec![0.0; r1 * c2];
            for i in 0..r1 {
                for j in 0..c2 {
                    for k in 0..c1 {
                        out[i * c2 + j] += a[i * c1 + k] * b[k * c2 + j];
                    }
                }
            }
            RuntimeValue::Matrix { data: out, rows: r1, cols: c2 }
        },
        // Formula expression (y ~ x)
        (BinaryOp::Formula, _, _) => {
            // Formula returns delayed expression without executing
            RuntimeValue::NA
        },
        _ => RuntimeValue::NA,
    }
}

fn dispatch_function(name: &str, args: Vec<RuntimeValue>) -> RuntimeValue {
    match name {
        "mean" => match &args[0] {
            RuntimeValue::Vector(v) => RuntimeValue::Scalar(v.iter().sum::<f64>() / v.len() as f64),
            _ => RuntimeValue::NA,
        },
        _ => RuntimeValue::NA,
    }
}
```

## 7. Systems Implementation Language Evaluation (SWOT)

### 7.1 Language Comparison Matrix

| Language | Memory Model | Arrow / C FFI Interop | Parser & AST Suitability | Evaluation Engine Suitability |
| :--- | :--- | :--- | :--- | :--- |
| **Rust** | Compile-time Borrow Checker | Production Native Ecosystem (`arrow-rs`, `polars`) | Excellent (Enums + Pattern Matching) | Exceptional (Multithreaded Rayon, Vectorized Kernels) |
| **Zig** | Explicit Allocator Passing | Direct Native C ABI Integration | Outstanding (Arena Allocators clear ASTs in $O(1)$) | Excellent (Direct Memory & SIMD Cache Control) |
| **Nim** | ARC/ORC Scope Reference Counting | Seamless Direct C Code Generation | Outstanding (Native Compiler AST Metaprogramming) | Very Good (Zero-Overhead Wrappers for C Libraries) |
| **Austral**| Strict Linear Types | Thin C ABI Compatibility Layer | High Theoretical Safety (Compile-time verified) | High Safety (Zero leaks, guaranteed single-use buffers) |

### 7.2 Detailed SWOT Breakdown

```
                      PARSER & AST ENGINE                  EVALUATION & DATAFRAME ENGINE
           ┌───────────────────────────────────────┬────────────────────────────────────────┐
  RUST     │ S: Pattern matching, Enum variants    │ S: Apache Arrow & Polars ecosystem     │
           │ W: Lifetime noise in recursive ASTs   │ W: Steep mental overhead & slow builds │
           ├───────────────────────────────────────┼────────────────────────────────────────┤
   NIM     │ S: Native AST macros, Nim-Node types  │ S: Direct C/C++ compilation, ARC memory│
           │ W: Smaller parser ecosystem tooling   │ W: FFI wrappers needed for Arrow C ABI │
           ├───────────────────────────────────────┼────────────────────────────────────────┤
 AUSTRAL   │ S: Linear types enforce leak-free ASTs│ S: Direct C ABI, zero dangling buffers │
           │ W: Strict single-use verbosity        │ W: Pre-1.0 ecosystem, no Arrow bindings│
           ├───────────────────────────────────────┼────────────────────────────────────────┤
   ZIG     │ S: Arena allocators clean AST in O(1) │ S: Direct C-ABI native Arrow interop   │
           │ W: Manual tagged unions (no match)    │ W: No borrow checker, manual safety    │
           └───────────────────────────────────────┴────────────────────────────────────────┘
```

## 8. Development Roadmap & Implementation Plan

1. **Phase 1: Lexer & Pratt Parser**
   * Write tokenizer and Pratt parser for operator precedence (`^`, `@`, `.*`, `|>`).
   * Output AST as homogeneous s-expressions.

2. **Phase 2: Core Memory Engine**
   * Wrap Arrow arrays and construct vectorized broadcast iteration kernels in Rust or Zig.

3. **Phase 3: Execution Runtime & FFI**
   * Implement environment evaluation loop and zero-copy data passing with Polars/DuckDB via C Data Interface.

4. **Phase 4: REPL & JIT Pipeline**
   * Implement interactive REPL and explore LLVM/C-FFI for JIT compilation.