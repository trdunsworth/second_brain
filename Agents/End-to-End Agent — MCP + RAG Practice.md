---
type: practice
status: active
topic: "Worked end-to-end example combining an MCP server, a RAG pipeline, and an agent loop in Python — build, run, and extend."
created: 2026-10-19
updated: 2026-10-19
tags:
  - agents
  - mcp
  - rag
  - python
  - practice
---

# End-to-End Agent — MCP + RAG Practice

A complete, runnable example that ties together the three core agent capabilities: an **MCP server** exposing tools, a **RAG pipeline** for knowledge retrieval, and an **agent loop** that orchestrates them. Build it, run it, then extend it.

---

## Table of Contents

1. [What We're Building](#what-were-building)
2. [Project Structure](#project-structure)
3. [Step 1: The MCP Server](#step-1-the-mcp-server)
4. [Step 2: The RAG Pipeline](#step-2-the-rag-pipeline)
5. [Step 3: The Agent](#step-3-the-agent)
6. [Step 4: Wire It Together](#step-4-wire-it-together)
7. [Run It](#run-it)
8. [Extend It](#extend-it)
9. [Troubleshooting](#troubleshooting)
10. [Sources](#sources)

---

## What We're Building

A **research assistant** that:
- Answers questions about a document corpus using RAG
- Can query a live "database" via an MCP tool
- Orchestrates both through an agent loop

```
User Question
     │
     ▼
┌─────────────────────────────────────────┐
│           Agent Loop                     │
│  (decides which tool to call)           │
└──────────┬──────────────┬───────────────┘
           │              │
           ▼              ▼
   ┌──────────────┐ ┌──────────────┐
   │  RAG Tool    │  │  MCP Tool    │
   │  (retrieve   │  │  (query DB   │
   │   docs)      │  │   via MCP)   │
   └──────────────┘ └──────────────┘
```

---

## Project Structure

```
mcp_rag_agent/
├── mcp_server.py          # MCP server with tools
├── rag_pipeline.py        # RAG ingestion + retrieval
├── agent.py               # Agent loop
├── data/                  # Documents to index
│   └── sample.md
├── requirements.txt
└── README.md
```

### requirements.txt

```text
mcp>=1.0.0
openai>=1.0.0
chromadb>=0.4.0
sentence-transformers>=3.0.0
duckdb>=1.0.0
```

---

## Step 1: The MCP Server

The MCP server exposes a `query_database` tool that the agent can call.

```python
# mcp_server.py
from mcp.server.fastmcp import FastMCP
import duckdb

mcp = FastMCP("analytics-server")

@mcp.tool()
def query_database(sql: str) -> str:
    """Execute a read-only SQL query against the analytics database.
    
    Args:
        sql: A valid DuckDB SELECT query. Only SELECT statements are allowed.
    
    Returns:
        Query results formatted as a markdown table.
    
    Example:
        "SELECT country, COUNT(*) as total FROM users GROUP BY country"
    """
    if not sql.strip().lower().startswith("select"):
        raise ValueError("Only SELECT queries are allowed for safety")
    
    con = duckdb.connect("analytics.db", read_only=True)
    try:
        cursor = con.execute(sql)
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        
        if not rows:
            return "Query returned no results."
        
        lines = ["| " + " | ".join(columns) + " |"]
        lines.append("| " + " | ".join(["---"] * len(columns)) + " |")
        for row in rows:
            lines.append("| " + " | ".join(str(c) for c in row) + " |")
        return "\n".join(lines)
    finally:
        con.close()

@mcp.tool()
def get_db_schema() -> str:
    """Get the database schema (table names and columns).
    
    Returns:
        A description of all tables and their columns.
    """
    con = duckdb.connect("analytics.db", read_only=True)
    try:
        tables = con.execute("SHOW TABLES").fetchall()
        schema = []
        for (table_name,) in tables:
            columns = con.execute(f"DESCRIBE {table_name}").fetchall()
            col_names = [c[0] for c in columns]
            schema.append(f"- {table_name}: {', '.join(col_names)}")
        return "Database schema:\n" + "\n".join(schema)
    finally:
        con.close()

if __name__ == "__main__":
    mcp.run()
```

---

## Step 2: The RAG Pipeline

The RAG pipeline ingests documents and retrieves relevant chunks.

```python
# rag_pipeline.py
import chromadb
from sentence_transformers import SentenceTransformer
from pathlib import Path

class RAGPipeline:
    def __init__(self, data_dir: str = "./data", collection_name: str = "docs"):
        self.data_dir = Path(data_dir)
        self.chroma = chromadb.Client()
        self.collection = self.chroma.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        self.encoder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        self._indexed = False
    
    def ingest(self):
        """Load all .md files from data_dir, chunk, embed, and store."""
        chunks = []
        metadatas = []
        ids = []
        
        for file_path in sorted(self.data_dir.glob("*.md")):
            text = file_path.read_text(encoding="utf-8")
            # Simple chunk: split by headers
            sections = text.split("\n## ")
            for i, section in enumerate(sections):
                section = section.strip()
                if not section:
                    continue
                chunk_id = f"{file_path.stem}_{i}"
                chunks.append(section)
                metadatas.append({
                    "source": file_path.name,
                    "section": i,
                    "char_start": text.find(section),
                })
                ids.append(chunk_id)
        
        if not chunks:
            raise ValueError(f"No documents found in {self.data_dir}")
        
        # Embed in batches
        embeddings = self.encoder.encode(chunks, show_progress_bar=True)
        
        self.collection.add(
            ids=ids,
            documents=chunks,
            metadatas=metadatas,
            embeddings=embeddings.tolist(),
        )
        self._indexed = True
        print(f"Indexed {len(chunks)} chunks from {len(list(self.data_dir.glob('*.md')))} files.")
    
    def retrieve(self, query: str, k: int = 5) -> list[dict]:
        """Retrieve the k most relevant chunks for a query."""
        if not self._indexed:
            self.ingest()
        
        query_embedding = self.encoder.encode([query])
        results = self.collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=k,
        )
        
        chunks = []
        for i, doc in enumerate(results["documents"][0]):
            chunks.append({
                "text": doc,
                "source": results["metadatas"][0][i]["source"],
                "score": results["distances"][0][i],
            })
        return chunks
    
    def format_context(self, chunks: list[dict]) -> str:
        """Format retrieved chunks into a context string."""
        parts = []
        for chunk in chunks:
            parts.append(f"[Source: {chunk['source']}]\n{chunk['text']}")
        return "\n\n---\n\n".join(parts)
```

### Sample Data

```markdown
<!-- data/sample.md -->
# Company Handbook

## Remote Work Policy
Employees may work remotely up to 3 days per week. Core collaboration hours are 10am-2pm ET. All remote work requires manager approval.

## Benefits
Health insurance starts on day 1. 401k matching is 4% after 6 months. Annual learning stipend is $2,000.

## Engineering Practices
We use trunk-based deployment. All code requires review. Deploys happen on Tuesdays and Thursdays.
```

---

## Step 3: The Agent

The agent loop decides when to use RAG vs. the MCP tool.

```python
# agent.py
from openai import OpenAI
from rag_pipeline import RAGPipeline
import json

class ResearchAgent:
    def __init__(self):
        self.client = OpenAI()
        self.rag = RAGPipeline()
        self.mcp_tools = {
            "query_database": self._query_database_stub,
            "get_db_schema": self._get_db_schema_stub,
        }
        self.conversation_history = []
    
    def _query_database_stub(self, sql: str) -> str:
        """Stub — in production, this calls the MCP server."""
        # This would be replaced with an actual MCP client call
        return f"[MCP] query_database called with: {sql}"
    
    def _get_db_schema_stub(self) -> str:
        """Stub — in production, this calls the MCP server."""
        return "[MCP] get_db_schema called"
    
    def _build_system_prompt(self) -> str:
        return """You are a research assistant. You have access to:

1. A document corpus (company handbook, policies) — use search_docs for this
2. An analytics database — use query_database for this

Guidelines:
- Use search_docs for questions about policies, procedures, handbooks
- Use query_database for questions about metrics, user data, analytics
- Use get_db_schema first if you need to understand the database structure
- Always cite your sources
- If you're unsure, say so"""
    
    def _get_tool_definitions(self) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": "search_docs",
                    "description": "Search the document corpus for relevant passages.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query"},
                            "k": {"type": "integer", "default": 5, "description": "Number of results"},
                        },
                        "required": ["query"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "query_database",
                    "description": "Execute a read-only SQL query against the analytics database.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "sql": {"type": "string", "description": "SELECT SQL query"},
                        },
                        "required": ["sql"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_db_schema",
                    "description": "Get the database schema (tables and columns).",
                    "parameters": {"type": "object", "properties": {}},
                },
            },
        ]
    
    def run(self, user_input: str) -> str:
        self.conversation_history.append({"role": "user", "content": user_input})
        
        max_iterations = 10
        for i in range(max_iterations):
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self._build_system_prompt()},
                    *self.conversation_history,
                ],
                tools=self._get_tool_definitions(),
                tool_choice="auto",
            )
            
            msg = response.choices[0].message
            self.conversation_history.append(msg)
            
            # No tool call — final answer
            if not msg.tool_calls:
                return msg.content
            
            # Execute tool calls
            for tool_call in msg.tool_calls:
                func_name = tool_call.function.name
                args = json.loads(tool_call.function.arguments)
                
                if func_name == "search_docs":
                    chunks = self.rag.retrieve(args["query"], args.get("k", 5))
                    result = self.rag.format_context(chunks)
                elif func_name == "query_database":
                    result = self.mcp_tools["query_database"](args["sql"])
                elif func_name == "get_db_schema":
                    result = self.mcp_tools["get_db_schema"]()
                else:
                    result = f"Unknown tool: {func_name}"
                
                self.conversation_history.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })
        
        return "Max iterations reached without a final answer."
```

---

## Step 4: Wire It Together

```python
# main.py
from agent import ResearchAgent

def main():
    agent = ResearchAgent()
    
    # Ingest documents on startup
    print("Indexing documents...")
    agent.rag.ingest()
    
    print("\nResearch Assistant ready. Type 'quit' to exit.\n")
    
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ("quit", "exit", "q"):
            break
        if not user_input:
            continue
        
        response = agent.run(user_input)
        print(f"\nAssistant: {response}\n")

if __name__ == "__main__":
    main()
```

---

## Run It

```bash
# Setup
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Create the analytics database
python -c "
import duckdb
con = duckdb.connect('analytics.db')
con.execute('CREATE TABLE users (id INTEGER, name VARCHAR, country VARCHAR, active BOOLEAN)')
con.execute(\"INSERT INTO users VALUES (1, 'Alice', 'US', true), (2, 'Bob', 'UK', true), (3, 'Carol', 'US', false)\")
con.close()
print('Database created.')
"

# Run
python main.py
```

### Example Conversation

```
You: How many active users are in each country?

Assistant: Let me query the database for that.

[Calls: query_database(sql="SELECT country, COUNT(*) as active_users FROM users WHERE active = true GROUP BY country")]

Based on the query results:

| country | active_users |
|---------|-------------|
| US      | 1           |
| UK      | 1           |

There is 1 active user in the US and 1 active user in the UK.

You: What is the remote work policy?

Assistant: Let me search the documentation.

[Calls: search_docs(query="remote work policy")]

According to the Company Handbook:

> Employees may work remotely up to 3 days per week. Core collaboration hours are 10am-2pm ET. All remote work requires manager approval.

Source: sample.md (section 1)
```

---

## Extend It

### Ideas for Building On This

1. **Connect the real MCP server** — Replace the stub functions with an actual [MCP client](https://github.com/modelcontextprotocol/python-sdk) connection:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def call_mcp_tool(tool_name: str, args: dict) -> str:
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_server.py"],
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, args)
            return result.content[0].text
```

2. **Add memory** — Store conversation history in a vector store for long-term memory across sessions.

3. **Add guardrails** — Wrap the agent with input/output validation per [[Secure Agent Guardrails]].

4. **Add evaluation** — Create a golden test set and evaluate with [RAGAS](https://docs.ragas.io/en/stable/concepts/metrics/).

5. **Add a UI** — Build a [Shiny](https://shiny.posit.co/) (R) or [Gradio](https://www.gradio.app/) (Python) frontend.

6. **Add hybrid search** — Combine vector search with BM25 keyword search for better recall.

7. **Add streaming** — Stream the agent's response token by token for better UX.

8. **Add multi-agent** — Split into a "researcher" agent (RAG) and an "analyst" agent (database).

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `ModuleNotFoundError: No module named 'mcp'` | SDK not installed | `pip install mcp` |
| `No documents found` | Data directory empty or wrong path | Check `data_dir` and ensure `.md` files exist |
| `Only SELECT queries are allowed` | LLM generated non-SELECT SQL | Strengthen system prompt or add SQL validation |
| Slow first query | Embedding model loading | Normal — model loads once, then cached |
| Agent loops indefinitely | Tool returns unhelpful result | Add max_iterations limit (already set to 10) |
| MCP connection fails | Server path incorrect | Verify `args=["mcp_server.py"]` matches your file path |

---

## Sources

| Source | URL |
|--------|-----|
| MCP Specification — Tools | [modelcontextprotocol.io/specification/2026-07-28/server/tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) |
| MCP Python SDK | [github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk) |
| Chroma Vector Store | [docs.trychroma.com/docs/overview/introduction](https://docs.trychroma.com/docs/overview/introduction) |
| LlamaIndex Ingestion Pipeline | [developers.llamaindex.ai/python/framework/module_guides/loading/ingestion_pipeline](https://developers.llamaindex.ai/python/framework/module_guides/loading/ingestion_pipeline/) |
| Pinecone RAG Guide | [pinecone.io/learn/retrieval-augmented-generation](https://www.pinecone.io/learn/retrieval-augmented-generation/) |
| RAG Original Paper | [arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401) |

---

## Related Notes

- [[MCP — Model Context Protocol Guide]] — Full MCP server/client guide
- [[RAG Systems — Retrieval-Augmented Generation]] — Deep dive into RAG patterns
- [[Agent Architecture Patterns]] — Where this fits in the bigger picture
- [[Secure Agent Guardrails]] — Add security to this agent
- [[Agent Personality Development]] — Give this agent a personality
- [[Building LLM Agents — Python Guide]] — Broader Python agent guide

---

*Created: 2026-10-19*
