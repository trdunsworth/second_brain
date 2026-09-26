# TOML Learning Guide

## Overview
TOML (Tom's Obvious, Minimal Language) is a configuration file format designed to be easily human-readable and writable, while also being machine-parseable. Created by Tom Preston-Werner (co-founder of GitHub), it's the official configuration format for tools like Pelican, Pipenv, and many others.

## Quick Template

```toml
# config.toml
title = "My Project"

[server]
host = "localhost"
port = 8080
debug = true

[database]
host = "db.example.com"
port = 5432
username = "admin"
password = "secret"

[features]
enabled = true
items = ["item1", "item2"]
version = "1.0.0"
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| String | `"value"` or `value` | `host = "localhost"` or `host = localhost` |
| Integer | `42` | `port = 8080` |
| Float | `3.14` | `price = 19.99` |
| Boolean | `true` / `false` | `debug = true` |
| Array | `[item1, item2]` | `items = ["a", "b"]` |
| Date/Time | `1970-01-01T00:00:00Z` | `created = 2024-01-15T10:30:00Z` |
| Table (header) | `[section]` | `[server]` |
| Key-value in table | `key = value` | `host = "localhost"` |
| Literal string | `''` single quotes | `description = '''hello'''` |
| Soft string | `""` double quotes | `description = "hello"` |
| Comment | `# comment` | `# This is a comment` |

## Practical Examples

### 1. Basic TOML Configuration

```toml
# settings.toml
title = "My Application"

[server]
host = "0.0.0.0"
port = 3000
ssl = true

[database]
name = "mydb"
user = "admin"
password = "secret123"

[logging]
level = "info"
file = "/var/log/app.log"
```

### 2. TOML with Arrays and Nested Tables

```toml
# features.toml
packages = ["web", "api", "auth"]

[profile]
name = "default"

[profile.social]
twitter = "@user"
github = "userhandle"

[profile.contacts]
email = "user@example.com"
phone = "+1-555-123-4567"
```

### 3. TOML Date/Time Values

```toml
# release.toml
title = "Version 2.0"

[release]
date = "2024-06-15T14:30:00Z"
description = "New features and improvements"

[changelog]
"2024-06-10" = "Fixed critical bug"
"2024-06-01" = "Added new feature"
"2024-05-15" = "Improved performance"
```

### 4. TOML with Multiple Tables

```toml
# full-config.toml
title = "Application"

[application]
name = "MyApp"
version = "2.0.0"

[application.database]
host = "localhost"
port = 5432

[application.server]
port = 8080
host = "0.0.0.0"

[tools]
editor = "vscode"
terminal = "wezterm"
browser = "firefox"
```

## Working with TOML in Different Languages

### Python

```python
import tomllib  # Python 3.11+
# or
import toml  # pip install toml

# Read TOML file
with open('config.toml', 'rb') as f:
    config = tomllib.load(f)

# Or (older Python)
import toml
config = toml.load('config.toml')

# Access values
port = config['server']['port']
```

### Rust

```rust
// Add to Cargo.toml: toml = "0.8"

// Read from file
use std::fs;
use toml;

fn main() {
    let content = fs::read_to_string("config.toml").expect("Failed to read config");
    let config: toml::Value = content.parse().expect("Failed to parse TOML");
    
    // Access values
    let port = config["server"]["port"].as_integer().unwrap();
}
```

### Ruby

```ruby
# Add to Gemfile: gem 'toml-rb'

require 'toml-rb'

# Parse TOML file
config = TOML.parse(File.read('config.toml'))

# Access values
port = config['server']['port']
```

### Bash

```bash
# Parse TOML with python 3.11+
python3 -c "import tomllib; print(tomllib.load(open('config.toml')))"

# Or with toml-cli
toml-cli get server.port config.toml
```

## Common TOML Uses

- **Configuration files** (Pipenv, Poetry, Pip)
- **Project metadata** (package configurations)
- **Server configurations**
- **Database settings**
- **Feature flags**
- **Build configurations**
- **Environment-specific settings**

## TOML Advantages

- **Inspired by INI** - Familiar structure
- **Date/time support** - Native datetime handling
- **Explicit tables** - Clear section organization
- **Minimal syntax** - Small specification
- **Tom's Obvious** - Easy to read and write
- **Growing adoption** - Official format for many tools

## TOML Pitfalls

- **Version compatibility** - Different parsers support different features
- **Date format** - Must follow ISO 8601
- **String quoting** - Inconsistent between parsers
- **Comment support** - Not all parsers support comments
- **Float precision** - May vary between implementations

## Awesome TOML Resources

- **[Toml-lang.org](https://toml-lang.org)** - Official TOML specification
- **[Toml Specification](https://github.com/toml-lang/toml)** - GitHub repo with full spec
- **[Pipenv TOML](https://github.com/pypa/pipenv)** - TOML usage in Pipenv
- **[Poetry TOML](https://python-poetry.org/docs/#project-configuration)** - TOML in Poetry
- **[INI vs TOML](https://toml-lang.org/#specification-comparison)** - Comparison guide
- **[awesome-toml](https://github.com/sindresorhus/awesome-toml)** - Curated resources
- **[TOML Validator](https://toml.testfy.net)** - Validation tool

## TOML vs Other Formats

| Feature | JSON | YAML | TOML |
|---------|------|------|------|
| Comments | No | Yes | Yes |
| Readability | Good | Excellent | Excellent |
| Date/Time | String (ISO) | Native | Native ISO |
| Tables | `[items]` | Nested | `[section]` |
| Arrays | `[a, b]` | `- a` or `[a, b]` | `[a, b]` |
| Floats | Number | Number | Number |
| Best for | Data interchange | Config files | Config files |

## TOML Quick Checklist

1. Use `[section]` headers for tables/groups
2. Strings can be quoted or unquoted (recommended: quote)
3. Arrays use `[item1, item2]` syntax
4. Dates/times follow ISO 8601 format
5. Booleans are `true` or `false`
6. Comments start with `#` (supported by most parsers)
7. Soft strings use `""`, literal strings use `''`
8. Validate with online TOML validators
9. Python 3.11+ has `tomllib` built-in
10. Keep it flat when possible (avoid deep nesting)