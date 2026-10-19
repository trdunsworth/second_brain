---
type: reference
status: active
topic: "Tutorial and guide for building LLM-based agents in Python — frameworks, patterns, code examples, and architecture."
created: 2026-10-19
updated: 2026-10-19
tags:
  - agents
  - python
  - llm
  - reference
---

# Building LLM Agents — Python Guide

A practical guide to building LLM-based agents in Python. Covers the major frameworks, core patterns, and code examples for both interactive development assistants and embedded product agents.

---

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Core Agent Loop](#core-agent-loop)
3. [Interactive Development Agents](#interactive-development-agents)
4. [Embedded Product Agents](#embedded-product-agents)
5. [Tool Use & Function Calling](#tool-use--function-calling)
6. [Retrieval-Augmented Generation (RAG)](#retrieval-augmented-generation-rag)
7. [Memory & State Management](#memory--state-management)
8. [Evaluation & Testing](#evaluation--testing)
9. [Sources & Further Reading](#sources--further-reading)

---

## Framework Overview

| Framework | Best For | Key Feature |
|-----------|----------|-------------|
| [LangChain](https://docs.langchain.com/oss/python/langchain/overview) | Rapid prototyping | Huge ecosystem of integrations |
| [LlamaIndex](https://developers.llamaindex.ai/python/framework/) | RAG-heavy agents | Best-in-class retrieval pipelines |
| [Pydantic AI](https://pydantic.dev/docs/ai/overview/) | Type-safe agents | Structured outputs, dependency injection |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) | OpenAI-native apps | Built-in handoffs, guardrails |
| [Google ADK](https://adk.dev/) | Multi-agent systems | Vertex AI integration |
| [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/) | Enterprise agents | Semantic Kernel lineage |
| [DSPy](https://dspy.ai/) | Prompt optimization | Programmatic prompt engineering |

> **Tip:** Start with the [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) or [Pydantic AI](https://pydantic.dev/docs/ai/overview/) for simplicity. Move to LangChain when you need deep integration breadth.

---

## Core Agent Loop

Every agent follows the same fundamental pattern:

```python
# Simplified agent loop (conceptual)
while not task_complete:
    # 1. Build context (system prompt + memory + user input)
    messages = build_context(user_input, memory, tool_results)

    # 2. Call the LLM
    response = llm.chat(messages, tools=available_tools)

    # 3. Check if the model wants to use a tool
    if response.tool_calls:
        # 4. Execute the tool
        tool_result = execute_tool(response.tool_calls[0])
        # 5. Add result to context and loop
        memory.append(tool_result)
    else:
        # 6. Final answer — task complete
        task_complete = True
```

### Minimal Example (OpenAI Agents SDK)

```python
from agents import Agent, Runner

agent = Agent(
    name="Code Assistant",
    instructions="You help users write and debug Python code.",
    tools=[code_interpreter, web_search],
)

result = Runner.run_sync(agent, "Write a function to calculate Fibonacci numbers.")
print(result.final_output)
```

---

## Interactive Development Agents

These agents interact with a developer (or power user) to write, debug, and ship code.

### Key Characteristics
- **Conversational** — multi-turn dialogue with the user
- **Tool-heavy** — file editing, shell execution, search
- **Iterative** — observe output, refine, repeat
- **Permission-gated** — confirm before destructive actions

### Architecture Pattern

```
User Input → System Prompt + Memory → LLM → Tool Call? 
                                              ├─ Yes → Execute Tool → Observe Result → Loop
                                              └─ No → Final Response → User
```

### Example: Claude Code

[Claude Code](https://code.claude.com/docs/en/overview) is a reference implementation. Key design decisions:
- Uses [agents.md](https://agents.md/) for project-level instructions
- Permission system gates file writes and shell commands
- Skills (via [Anthropic's spec](https://www.anthropic.com/news/skills)) load specialized instructions on demand

### Recommended Reading
- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Lilian Weng — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction)

---

## Embedded Product Agents

These agents live inside a software product and assist end-users with tasks — they are not the product itself but a feature within it.

### Key Characteristics
- **Task-focused** — narrow scope (e.g., "help me fill this form")
- **Latency-sensitive** — must feel instant
- **Guardrailed** — strict boundaries on what they can do
- **Observable** — logging and monitoring built in

### Architecture Pattern

```
Product UI → Agent Gateway (auth, rate limiting, routing)
                  ↓
         Agent Runtime (system prompt + tools + memory)
                  ↓
         Product API (safe, scoped tools only)
                  ↓
         Response Formatter → UI Component
```

### Implementation Options

| Approach | When to Use |
|----------|-------------|
| **API-only** | Simple Q&A over product data |
| **Tool-use agent** | Multi-step tasks (booking, form-filling) |
| **Multi-agent** | Complex workflows with specialization |

### Example: Embedded Agent with Pydantic AI

```python
from pydantic_ai import Agent

support_agent = Agent(
    "openai:gpt-4o",
    system_prompt="You are a support assistant for Product X. Only answer questions about Product X.",
    tools=[lookup_order_status, get_faq_answer],
    retries=3,
)

# In your API endpoint:
@api.post("/assist")
async def assist(user_message: str):
    result = await support_agent.run(user_message)
    return {"response": result.data}
```

### Key Differences from Interactive Agents

| Dimension | Interactive | Embedded |
|-----------|-------------|----------|
| User | Developer | End-user |
| Trust | High (can run arbitrary code) | Low (sandboxed) |
| Latency tolerance | Seconds | Sub-second preferred |
| Error handling | Retry + ask user | Graceful fallback |
| Permissions | Broad | Narrow, scoped |

---

## Tool Use & Function Calling

Tools are how agents act on the world. In Python, most frameworks use the OpenAI function-calling format.

### Defining a Tool

```python
from pydantic_ai import Agent

@support_agent.tool
def get_weather(city: str) -> str:
    """Get current weather for a city.
    
    Args:
        city: The city name (e.g., "New York")
    """
    # Implementation
    return f"Sunny, 72°F in {city}"
```

### Tool Design Principles

1. **Single responsibility** — each tool does one thing
2. **Typed inputs** — use Pydantic models for validation
3. **Clear docstrings** — the LLM reads these to decide when to call the tool
4. **Idempotent when possible** — safe to retry
5. **Scoped permissions** — least privilege

---

## Retrieval-Augmented Generation (RAG)

RAG connects your agent to external knowledge. Essential for embedded product agents.

### Basic RAG Pipeline

```
Document → Chunk → Embed → Store in Vector DB
                                    ↓
User Query → Embed → Retrieve Top-K Chunks → Inject into Prompt → LLM Generates Answer
```

### Libraries

| Library | Purpose |
|---------|---------|
| [LlamaIndex](https://developers.llamaindex.ai/python/framework/) | Full RAG framework |
| [LangChain](https://docs.langchain.com/oss/python/langchain/overview) | RAG + agent orchestration |
| [RAGAS](https://docs.ragas.io/en/stable/) | RAG evaluation |

### Key Patterns

- **Deconstructing RAG** — [LangChain's breakdown](https://www.langchain.com/blog/deconstructing-rag) of retrieval patterns
- **HyDE** — generate hypothetical answers before retrieval
- **Re-ranking** — use cross-encoder models to improve retrieval quality
- **Structured retrieval** — query specific tables/fields rather than raw text

---

## Memory & State Management

Agents need memory to maintain context across turns.

### Memory Types

| Type | Use Case | Implementation |
|------|----------|----------------|
| **Short-term** | Current conversation | Message list / buffer |
| **Long-term** | User preferences, past interactions | Vector store or database |
| **Episodic** | Specific past events | Structured storage |
| **Procedural** | How to use tools | System prompt |

### Example: LangChain Memory

```python
from langchain.memory import ConversationBufferWindowMemory

memory = ConversationBufferWindowMemory(k=5, return_messages=True)
# Keeps last 5 exchanges, summarizes older context
```

---

## Evaluation & Testing

### Tools

| Tool | Purpose |
|------|---------|
| [RAGAS](https://docs.ragas.io/en/stable/) | RAG pipeline evaluation |
| [DeepEval](https://deepeval.com/) | End-to-end agent evaluation |
| [Promptfoo](https://www.promptfoo.dev/) | Prompt and model regression testing |

### Evaluation Strategy

1. **Unit tests** — tool inputs/outputs
2. **Integration tests** — full agent loop with mocked LLM
3. **Human eval** — sample real conversations
4. **Regression tests** — prompt changes scored against golden dataset

---

## Sources & Further Reading

- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Lilian Weng — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Eugene Yan — Patterns for LLM Systems](https://eugeneyan.com/writing/llm-patterns/)
- [LangChain — Deconstructing RAG](https://www.langchain.com/blog/deconstructing-rag)
- [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/unit0/introduction)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [agents.md](https://agents.md/) — Agent instruction standard

---

*Created: 2026-10-19*
