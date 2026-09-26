# JSON Learning Guide

## Overview
JSON (JavaScript Object Notation) is a lightweight data interchange format that's easy for humans to read and write, and easy for machines to parse and generate. It's based on a subset of JavaScript but is language-independent, with parsers available for almost every programming language.

## Quick Template

```json
{
  "title": "My Document",
  "author": "Author Name",
  "date": "2024-01-15",
  "tags": ["json", "data"],
  "metadata": {
    "version": "1.0",
    "description": "A sample JSON document"
  }
}
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Object | `{ }` | `{ "key": "value" }` |
| String | `" "` | `"Hello, World"` |
| Number | `123` or `1.23` | `42`, `3.14` |
| Boolean | `true` / `false` | `true`, `false` |
| Array | `[ ]` | `[1, 2, 3]` |
| Null | `null` | `null` |
| Key-Value | `"key": value` | `"name": "John"` |
| Nested Object | `{ "obj": { "inner": "value" } }` | `{ "user": { "name": "John" } }` |
| Nested Array | `[ 1, 2, { "key": "val" } ]` | `[ {"id": 1}, {"id": 2} ]` |

## Practical Examples

### 1. Basic JSON Object

```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "isActive": true
}
```

### 2. JSON Array of Objects

```json
[
  {
    "id": 1,
    "title": "First item",
    "completed": false
  },
  {
    "id": 2,
    "title": "Second item",
    "completed": true
  }
]
```

### 3. Nested JSON Structure

```json
{
  "user": {
    "profile": {
      "name": "John",
      "age": 30,
      "email": "john@example.com"
    },
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  },
  "metadata": {
    "created": "2024-01-15T10:30:00Z",
    "modified": "2024-01-16"
  }
}
```

### 4. JSON with Special Characters

```json
{
  "message": "Hello \"World\"",
  "path": "C:\\Users\\John",
  "newline": "Line 1\nLine 2",
  "unicode": "Hello \u0048\u0065\u006C\u006C\u006F"
}
```

## Working with JSON in Different Languages

### Python

```python
import json

# Parse JSON string
data = json.loads('{"key": "value"}')

# Convert to JSON string
json_str = json.dumps({"key": "value"}, indent=2)

# Write to file
with open('data.json', 'w') as f:
    json.dump(data, f, indent=2)

# Read from file
with open('data.json', 'r') as f:
    data = json.load(f)
```

### JavaScript

```javascript
// Parse JSON
const data = JSON.parse('{"key": "value"}');

// Stringify to JSON
const jsonStr = JSON.stringify({key: "value"});

// Fetch from API
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Bash/curl

```bash
# Validate JSON
echo '{"key": "value"}' | python3 -m json.tool

# Extract values with jq
cat data.json | jq '.name'

# Format JSON
jq '.' data.json > formatted.json
```

## Common JSON Uses

- **API responses** from web services
- **Configuration files**
- **Data storage** and interchange
- **Session data** in web applications
- **File-based databases** (small datasets)
- **Game state** storage
- **Logging** data structures

## JSON Validation

- Use `python3 -m json.tool` to validate and format
- Use `jq '.'` to validate and format from command line
- Online validators: [JSONLint](https://jsonlint.com/)
- IDE built-in validation (VS Code, WebStorm, etc.)

## Common JSON Mistakes

- Trailing commas (not allowed)
- Unquoted keys (must be strings)
- Control characters without escaping
- Mixing single and double quotes
- Invalid escape sequences

## Awesome JSON Resources

- **[json.org](https://json.org)** - Official JSON specification and tutorial
- **[JSON School](https://json-school.github.io)** - Interactive JSON learning
- **[JSON Checker](https://jsoncheck.com)** - Validation tool
- **[RFC 8259](https://datatracker.ietf.org/doc/html/rfc8259)** - The official JSON standard
- **[awesome-json](https://github.com/jdnoorman/awesome-json)** - Curated JSON resources
- **[JSON Pointer (RFC 6901)](https://datatracker.ietf.org/doc/html/rfc6901)** - JSON Pointer specification
- **[JSON Patch (RFC 6902)](https://datatracker.ietf.org/doc/html/rfc6902)** - JSON Patch specification

## JSON vs Other Formats

| Feature | JSON | XML | YAML |
|---------|------|-----|------|
| Readability | Good | Fair | Excellent |
| Conciseness | Excellent | Verbose | Good |
| Comments | No | Yes | Yes |
| Native to JS | Yes | No | No |
| Arrays | Native | Via `<item>` | Via `-` |
| Booleans | `true`/`false` | `true`/`false`/`1`/`0` | `true`/`false`/`yes`/`no` |
| Best for | Data interchange | Complex documents | Config files |

## JSON Quick Checklist

1. Always use double quotes for strings and keys
2. No trailing commas allowed
3. Use `indent` parameter for readability
4. Validate with `json.tool` or `jq`
5. Escape special characters properly
6. Use meaningful key names
7. Keep JSON flat when possible
8. Version your JSON schemas