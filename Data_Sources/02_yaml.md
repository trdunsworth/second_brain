# YAML Learning Guide

## Overview
YAML (YAML Ain't Markup Language) is a human-readable data serialization standard that can be used in conjunction with all programming languages and is often used for configuration files and data exchange. YAML emphasizes readability and uses indentation instead of braces or brackets.

## Quick Template

```yaml
# config.yaml
server:
  host: localhost
  port: 8080
  debug: true

database:
  type: postgres
  host: db.example.com
  port: 5432
  name: myapp
  user: admin
  password: secret

logging:
  level: INFO
  file: logs/app.log
```

## Core Syntax Cheatsheet

| Element | Syntax | Example |
|---------|--------|---------|
| Scalar values | `key: value` | `name: John` |
| Strings | Quoted or unquoted | `name: "John"` or `name: John` |
| Numbers | Integers or floats | `port: 8080`, `price: 19.99` |
| Booleans | `true`, `false`, `yes`, `no`, `on`, `off` | `debug: yes` |
| Arrays | `- item` (one per line) | `items:\n- apple\n- banana\n- cherry` |
| Multiline array | `[item1, item2]` | `tags: [tag1, tag2]` |
| Nested mapping | Indented blocks | `server:\n  host: localhost` |
| Block scalar | `|` (literal) or `>` (folded) | `message: |-\nHello\nWorld` |
| YAML 1.1 `&` & `*` | Anchors & aliases | `default: &default\nvalue: 1\nactual: *default` |
| Comments | `# comment` | `# This is a comment` |

## Practical Examples

### 1. Basic Configuration File

```yaml
# app.conf
appName: myApplication
version: 1.0.0
debug: true
port: 3000

# Logging configuration
logging:
  level: debug
  format: json
  file: logs/application.log
```

### 2. Complex Nested Structure

```yaml
# database.yml
development:
  adapter: sqlite3
  database: db/development.sqlite3
  pool:
    minimum: 5
    maximum: 25
    timeout: 5000

test:
  adapter: sqlite3
  database: db/test.sqlite3
  pool: &default
    minimum: 1
    maximum: 10
    timeout: 1000

production:
  adapter: postgresql
  database: db/production
  username: <%= ENV['DB_USER'] %>
  password: <%= ENV['DB_PASSWORD'] %>
  pool:
    <<: *default
```

### 3. YAML with Multi-line Strings

```yaml
# descriptions.yml
description: |
  This is a multi-line
  string that preserves
  line breaks.

summary: >
  This is a folded string.
  Lines are combined into
  one with spaces.
```

### 4. YAML Anchors and Aliases

```yaml
# defaults.yml
default_settings: &defaults
  language: en
  theme: light
  font_size: 12

development:
  <<: *defaults
  debug: true

production:
  <<: *defaults
  debug: false
  log_level: warn
```

## Working with YAML in Different Languages

### Python

```python
import yaml

# Parse YAML file
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Convert to JSON
import json
json_str = json.dumps(config)

# Dump YAML
yaml_str = yaml.dump(config, default_flow_style=False)
```

### JavaScript/Node.js

```javascript
const yaml = require('js-yaml');

// Parse YAML string
const config = yaml.load('#{ "host: localhost" }');

// Stringify YAML
const yamlStr = yaml.dump({host: 'localhost'});

// Read from file
const config = yaml.loadFile('config.yaml');
```

### Bash

```bash
# Parse YAML with python
python3 -c "import yaml; print(yaml.safe_load(open('config.yaml')))"

# Convert YAML to JSON
yq . config.yaml > config.json

# Validate YAML
python3 -c "import yaml; yaml.safe_load(open('config.yaml'))" && echo "Valid"
```

## Common YAML Uses

- **Configuration files** (Docker, Kubernetes, Ansible)
- **CI/CD pipelines** (GitHub Actions, GitLab CI)
- **Data serialization** between languages
- **Environment variables** management
- **Deployment** manifests
- **Feature flags** and toggles
- **API specifications**

## YAML Advantages

- **Human-readable** - Easy to read and write
- **Indentation-based** - No braces or brackets
- **Supports comments** - `# comment` works
- **Anchor/alias system** - Reuse common structures
- **Multi-language** - Almost all languages have YAML parsers
- **Flexible** - Loose type system

## YAML Pitfalls

- **Indentation matters** - Wrong indentation breaks the file
- **Tabs vs spaces** - Always use spaces (2 or 4)
- **Ambiguity** - Some values can be interpreted differently
- **No standard schema** - Validation can be tricky
- **Security** - Never load untrusted YAML (YAML deserialization attacks)

## Awesome YAML Resources

- **[YAML Official Site](https://yaml.org)** - Specification and tutorials
- **[YAML Ain't Markup Language](https://yaml.github.io)** - Official documentation
- **[Learn YAML in Y minutes](https://learnxinyminutes.com/docs/yaml.html)** - Quick reference
- **[Kubernetes YAML](https://kubernetes.io/docs/concepts/configuration/)** - Best practices
- **[Ansible YAML](https://docs.ansible.com/ansible/latest/userguide/YAML.html)** - Guide
- **[awesome-yaml](https://github.com/duereg/awesome-yaml)** - Curated resources
- **[YAML Validator](https://www.yamllint.com)** - Validation tool

## YAML vs Other Formats

| Feature | JSON | YAML | TOML |
|---------|------|------|------|
| Comments | No | Yes | Yes |
| Readability | Good | Excellent | Good |
| Indentation | No | Yes | Yes |
| Arrays | `[item1, item2]` | `- item` or `[item1, item2]` | `[item1, item2]` |
| Datetime | String | Native types | String/Date |
| Tables | No | Basic | INI-style |
| Best for | Data interchange | Config files | Config files |

## YAML Quick Checklist

1. Use 2 or 4 spaces for indentation (never tabs)
2. Strings with special chars must be quoted
3. Comments start with `#`
4. Use anchors (`&`) and aliases (`*`) for reuse
5. Validate with `yamllint` or online tools
6. Be careful with boolean values (`true/false`, `yes/no/on/off`)
7. Multi-line strings use `|` (literal) or `>` (folded)
8. YAML 1.2 is the current standard