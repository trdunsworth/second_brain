---
type: reference
status: active
topic: "Model Context Protocol (MCP) — architecture, building servers in Python, consuming MCP servers, security, and best practices."
created: 2026-10-19
updated: 2026-10-19
tags:
  - agents
  - mcp
  - python
  - reference
---

# MCP — Model Context Protocol Guide

A practical guide to the Model Context Protocol (MCP): what it is, how to build servers, how to consume them, and how to secure them.

---

## Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Architecture](#architecture)
3. [MCP Primitives](#mcp-primitives)
4. [Building a Server in Python](#building-a-server-in-python)
5. [Building a Server in R](#building-a-server-in-r)
6. [Consuming MCP Servers](#consuming-mcp-servers)
7. [Transports](#transports)
8. [Security](#security)
9. [Best Practices](#best-practices)
10. [Ecosystem](#ecosystem)
11. [Sources](#sources)

---

## What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro) is an open protocol that standardizes how LLM applications connect to external data sources and tools. It replaces the custom integrations that each agent framework previously needed with a single, universal protocol.

> **Analogy:** MCP is to AI applications what USB-C is to devices — one connector for everything.

### Why MCP Matters

| Without MCP | With MCP |
|-------------|----------|
| Every tool needs a custom integration per framework | Write once, works with any MCP client |
| Proprietary function-calling formats | Standardized JSON-RPC 2.0 |
| Hard to share tools across teams | Share MCP servers like packages |
| Each agent reimplements auth, transport | Protocol handles transport and auth |

---

## Architecture

MCP uses a **client-server** architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    MCP Host                              │
│  (Claude Desktop, OpenCode, Cursor, your app)            │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ MCP Client   │  │ MCP Client   │  │ MCP Client   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
└─────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │
          ▼                 ▼                 ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ MCP Server  │  │ MCP Server  │  │ MCP Server  │
   │ (filesystem)│  │ (database)  │  │ (API)       │
   └─────────────┘  └─────────────┘  └─────────────┘
```

**Key roles:**

- **MCP Host** — the application that manages MCP clients (e.g., Claude Desktop, OpenCode)
- **MCP Client** — maintains 1:1 connections to MCP servers, handles protocol negotiation
- **MCP Server** — exposes tools, resources, and prompts via the MCP protocol

For the full specification, see [MCP Architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture).

---

## MCP Primitives

MCP defines three primitives that servers can expose:

### 1. Tools

Functions the LLM can call. Defined in the [Tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

```
Server → Client: "Here are the tools I offer:"
  - read_file(path: str) -> str
  - write_file(path: str, content: str) -> str
  - query_database(sql: str) -> DataFrame
```

### 2. Resources

Data the LLM can read (files, database records, API responses). Defined in the [Resources specification](https://modelcontextprotocol.io/specification/2026-07-28/server/resources).

```
Server → Client: "Here are the resources I expose:"
  - file:///project/data.csv
  - db://users/123
  - api://weather/current
```

### 3. Prompts

Pre-defined prompt templates the user can invoke. Defined in the [Prompts specification](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts).

```
Server → Client: "Here are the prompts I offer:"
  - code_review(language: str, code: str)
  - summarize_document(doc_path: str)
  - debug_error(error_message: str)
```

---

## Building a Server in Python

The [Python SDK](https://github.com/modelcontextprotocol/python-sdk) makes MCP server development straightforward.

### Installation

```bash
pip install mcp
```

### Minimal Server (FastMCP)

```python
from mcp.server.fastmcp import FastMCP

# Create server
mcp = FastMCP("my-server")

# Define a tool
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

@mcp.tool()
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Sunny, 72°F in {city}"

# Define a resource
@mcp.resource("config://app")
def get_config() -> str:
    """Get the application configuration."""
    return '{"debug": true, "version": "1.0"}'

# Define a prompt
@mcp.prompt()
def code_review(code: str, language: str) -> str:
    """Generate a code review request."""
    return f"Review this {language} code:\n\n{code}\n\nFocus on bugs and style."

# Run the server
if __name__ == "__main__":
    mcp.run()
```

### Low-Level Server (for full control)

```python
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.types as types

server = Server("my-low-level-server")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="search",
            description="Search for documents",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "limit": {"type": "integer", "default": 10},
                },
                "required": ["query"],
            },
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "search":
        results = do_search(arguments["query"], arguments.get("limit", 10))
        return [types.TextContent(type="text", text=str(results))]
    raise ValueError(f"Unknown tool: {name}")
```

### Server with Database Tool

```python
from mcp.server.fastmcp import FastMCP
import duckdb

mcp = FastMCP("analytics-server")

@mcp.tool()
def query_analytics(sql: str) -> str:
    """Execute a SQL query against the analytics database.
    
    Args:
        sql: A valid DuckDB SQL query. Only SELECT statements are allowed.
    
    Returns:
        Query results as a formatted string.
    """
    # Safety: only allow read-only queries
    if not sql.strip().lower().startswith("select"):
        raise ValueError("Only SELECT queries are allowed")
    
    con = duckdb.connect("analytics.db", read_only=True)
    try:
        result = con.execute(sql).fetchall()
        columns = [desc[0] for desc in con.description]
        
        # Format as markdown table
        lines = ["| " + " | ".join(columns) + " |"]
        lines.append("| " + " | ".join(["---"] * len(columns)) + " |")
        for row in result:
            lines.append("| " + " | ".join(str(c) for c in row) + " |")
        return "\n".join(lines)
    finally:
        con.close()
```

---

## Building a Server in R

While there is no official R SDK for MCP servers, you can:

1. **Use plumber to create an HTTP endpoint** and wrap it with an MCP-to-HTTP bridge
2. **Call Python MCP servers from R** via `reticulate`
3. **Use the `httpuv` package** to build a minimal JSON-RPC server

### Option 1: Call Python MCP Server from R

```r
library(reticulate)

# Use the Python MCP client from R
mcp <- import("mcp")

# Connect to a Python MCP server
client <- mcp$Client("http://localhost:8000")

# List tools
tools <- client$list_tools()
print(tools)

# Call a tool
result <- client$call_tool("add", list(a = 5, b = 3))
print(result)
```

### Option 2: Bridge R Function to MCP via Python

```r
# In R: define the function you want to expose
analyze_data <- function(data, method = "summary") {
  if (method == "summary") {
    summary(data)
  } else {
    cor(data, use = "complete.obs")
  }
}

# In Python: wrap it with MCP
# bridge_server.py
from mcp.server.fastmcp import FastMCP
import rpy2.robjects as robjects

mcp = FastMCP("r-bridge")

@mcp.tool()
def analyze_data(data_json: str, method: str = "summary") -> str:
    """Analyze data using R statistical functions.
    
    Args:
        data_json: JSON array of numeric values
        method: 'summary' for descriptive stats, 'correlation' for correlation matrix
    """
    import json
    data = json.loads(data_json)
    
    # Call R function
    robjects.r(f"""
        result <- analyze_data(c({','.join(map(str, data))}), method="{method}")
        print(result)
    """)
    return str(robjects.r("result")[0])
```

---

## Consuming MCP Servers

### In Python

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Connect to a server
server_params = StdioServerParameters(
    command="python",
    args=["my_mcp_server.py"],
)

async with stdio_client(server_params) as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()
        
        # List available tools
        tools = await session.list_tools()
        for tool in tools.tools:
            print(f"  {tool.name}: {tool.description}")
        
        # Call a tool
        result = await session.call_tool("add", {"a": 5, "b": 3})
        print(result.content[0].text)  # "8"
```

### In Claude Desktop / OpenCode

Add to your MCP config:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["C:/path/to/my_mcp_server.py"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

---

## Transports

MCP supports two transport mechanisms:

| Transport | Use Case | Description |
|-----------|----------|-------------|
| **stdio** | Local servers | Communication via stdin/stdout. Simplest, most common for local tools. |
| **Streamable HTTP** | Remote servers | HTTP-based with Server-Sent Events. For cloud-hosted MCP servers. |

### stdio Transport (default)

```python
# Server
mcp.run()  # defaults to stdio

# Client
server_params = StdioServerParameters(command="python", args=["server.py"])
```

### Streamable HTTP Transport

```python
# Server
mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)

# Client
from mcp.client.streamable_http import streamablehttp_client

async with streamablehttp_client("http://localhost:8000/mcp") as (read, write, _):
    async with ClientSession(read, write) as session:
        await session.initialize()
        # ... use session
```

---

## Security

### Threats Specific to MCP

| Threat | Description | Mitigation |
|--------|-------------|------------|
| **Tool poisoning** | Malicious server injects instructions via tool descriptions | Audit server source before installing; use trusted registries |
| **Prompt injection via tools** | Tool returns malicious instructions as "data" | Treat tool output as untrusted data, not instructions |
| **Confused deputy** | Client trusts server more than it should | Least-privilege permissions; user consent per tool call |
| **Data exfiltration** | Server sends data to external endpoints | Network egress controls; audit server code |

### Security Best Practices

1. **Only install MCP servers from trusted sources**
   - Review the source code before running
   - Prefer official/community-audited servers
   - Pin versions

2. **Run servers with least privilege**
   - Filesystem servers: restrict to specific directories
   - Database servers: read-only credentials
   - API servers: scoped API tokens

3. **Use environment variables for secrets**
   ```json
   {
     "env": {
       "API_KEY": "${MY_API_KEY}"  // resolved from host environment
     }
   }
   ```

4. **Log all tool calls** for audit trails

5. **Validate tool outputs** before passing to the LLM

For more, see the [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28) and the [Python SDK](https://github.com/modelcontextprotocol/python-sdk).

---

## Best Practices

### Tool Design

1. **Write clear docstrings** — the LLM uses these to decide when to call the tool
2. **Use descriptive names** — `get_user_email` not `gue`
3. **Validate inputs** — use Pydantic models for structured inputs
4. **Return structured data** — JSON or markdown tables, not raw strings
5. **Handle errors gracefully** — return informative error messages

### Server Design

1. **Single responsibility** — one server per domain (files, database, API)
2. **Stateless when possible** — easier to scale and debug
3. **Support both stdio and HTTP** — for local and remote use
4. **Version your tools** — breaking changes should be explicit
5. **Include examples** — in docstrings or as prompt templates

### Client Design

1. **Cache tool listings** — don't call `list_tools()` on every request
2. **Handle connection failures** — retry with exponential backoff
3. **Respect server capabilities** — check protocol version compatibility
4. **Implement timeouts** — don't let a hung server block the agent

---

## Ecosystem

### Official SDKs

| Language | SDK | URL |
|----------|-----|-----|
| Python | `mcp` | [github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) |
| TypeScript | `@modelcontextprotocol/sdk` | [npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) |
| Java | `io.modelcontextprotocol` | [Maven Central](https://central.sonatype.com/artifact/io.modelcontextprotocol/sdk) |
| Go | `github.com/modelcontextprotocol/go-sdk` | [GitHub](https://github.com/modelcontextprotocol/go-sdk) |
| Rust | `rmcp` | [GitHub](https://github.com/modelcontextprotocol/rust-sdk) |

### Notable MCP Servers

| Server | Purpose | URL |
|--------|---------|-----|
| Filesystem | Read/write local files | `@modelcontextprotocol/server-filesystem` |
| Brave Search | Web search | `@brave/brave-search-mcp-server` |
| GitHub | Repository operations | `@modelcontextprotocol/server-github` |
| PostgreSQL | Database queries | `@modelcontextprotocol/server-postgres` |
| Puppeteer | Browser automation | `@modelcontextprotocol/server-puppeteer` |
| Memory | Knowledge graph for agents | `@modelcontextprotocol/server-memory` |

### Registries

- [MCP Registry](https://registry.modelcontextprotocol.io/) — official server registry
- [smithery.ai](https://smithery.ai/) — community MCP server registry
- [Glama MCP Directory](https://glama.ai/mcp/servers) — browsable MCP server directory

---

## Sources

| Source | URL |
|--------|-----|
| MCP Introduction | [modelcontextprotocol.io/docs](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro) |
| MCP Specification | [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification/2026-07-28) |
| MCP Architecture | [modelcontextprotocol.io/specification/2026-07-28/architecture](https://modelcontextprotocol.io/specification/2026-07-28/architecture) |
| Tools Specification | [modelcontextprotocol.io/specification/2026-07-28/server/tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) |
| Resources Specification | [modelcontextprotocol.io/specification/2026-07-28/server/resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources) |
| Prompts Specification | [modelcontextprotocol.io/specification/2026-07-28/server/prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts) |
| Python SDK | [github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) |
| TypeScript SDK | [npmjs.com/package/@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) |

---

## Related Notes

- [[Secure Agent Guardrails]] — MCP security considerations
- [[Agent Architecture Patterns]] — Where MCP fits in agent architecture
- [[Building LLM Agents — Python Guide]] — Tool use patterns
- [[RAG Systems — Retrieval-Augmented Generation]] — Complementary data access patterns

---

*Created: 2026-10-19*
