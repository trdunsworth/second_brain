---
type: reference
status: active
topic: "Design patterns for LLM-based agents — interactive development assistants vs. embedded product agents, with architecture diagrams and decision frameworks."
created: 2026-10-19
updated: 2026-10-19
tags:
  - agents
  - architecture
  - python
  - r
  - reference
---

# Agent Architecture Patterns

Design patterns for LLM-based agents. Covers the two primary archetypes — interactive development agents and embedded product agents — with decision frameworks, architecture diagrams, and implementation guidance.

---

## Table of Contents

1. [The Two Archetypes](#the-two-archetypes)
2. [Interactive Development Agents](#interactive-development-agents)
3. [Embedded Product Agents](#embedded-product-agents)
4. [Decision Framework](#decision-framework)
5. [Common Patterns](#common-patterns)
6. [Multi-Agent Systems](#multi-agent-systems)
7. [Sources & Further Reading](#sources--further-reading)

---

## The Two Archetypes

| Dimension | Interactive Development Agent | Embedded Product Agent |
|-----------|------------------------------|------------------------|
| **User** | Developer, power user | End-user, non-technical |
| **Goal** | Write code, debug, ship | Complete a task within the product |
| **Interaction** | Multi-turn, conversational | Single-turn or short multi-turn |
| **Trust** | High — can run arbitrary code | Low — sandboxed, scoped tools |
| **Latency tolerance** | Seconds to minutes | Sub-second to seconds |
| **Permissions** | Broad (file system, shell, network) | Narrow (specific API calls) |
| **Error handling** | Retry, ask user, escalate | Graceful fallback, suggest alternatives |
| **Examples** | Claude Code, Cursor, Copilot Chat | Support copilot, form assistant, data Q&A |

---

## Interactive Development Agents

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User (Developer)                     │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Agent Runtime                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ System      │  │ Memory       │  │ Tool          │  │
│  │ Prompt      │  │ (short-term +│  │ Registry      │  │
│  │             │  │  long-term)  │  │               │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              LLM (orchestrator)                   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Tools                               │
│  ┌──────┐ ┌──────┐ ┌───────┐ ┌──────┐ ┌────────────┐  │
│  │ File │ │Shell │ │Search │ │MCP   │ │Custom Tool │  │
│  │ I/O  │ │      │ │       │ │Server│ │            │  │
│  └──────┘ └──────┘ └───────┘ └──────┘ └────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Permission model** — what can the agent do without asking?
   - Claude Code: read anything, write needs approval, shell needs approval
   - Cursor: similar with auto-accept mode for trusted operations

2. **Context window management** — how to handle long conversations?
   - Sliding window (keep last N turns)
   - Summarization (compress older turns)
   - Retrieval (store in vector DB, retrieve relevant)

3. **Tool scope** — start narrow, expand as trust builds
   - Begin with read-only tools
   - Add write tools with confirmation
   - Shell access last

### Implementation: Minimal Interactive Agent

```python
from dataclasses import dataclass, field
from typing import Callable, Any
import json

@dataclass
class Agent:
    llm: Any  # Your LLM client
    tools: dict[str, Callable] = field(default_factory=dict)
    memory: list = field(default_factory=list)
    max_iterations: int = 10
    
    def run(self, user_input: str) -> str:
        self.memory.append({"role": "user", "content": user_input})
        
        for _ in range(self.max_iterations):
            response = self.llm.chat(
                messages=self.memory,
                tools=[t.schema for t in self.tools.values()]
            )
            
            if not response.tool_calls:
                self.memory.append({"role": "assistant", "content": response.text})
                return response.text
            
            for tool_call in response.tool_calls:
                tool = self.tools[tool_call.name]
                result = tool(**tool_call.arguments)
                self.memory.append({
                    "role": "tool",
                    "name": tool_call.name,
                    "content": str(result)
                })
        
        return "Max iterations reached"
```

---

## Embedded Product Agents

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Product UI                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Agent Panel / Chat Widget / Form Assistant       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Agent Gateway                            │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ Auth & Rate  │ │ Request      │ │ Audit Logging  │  │
│  │ Limiting     │ │ Validation   │ │                │  │
│  └──────────────┘ └──────────────┘ └────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Agent Runtime                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  System Prompt (product-specific, guardrailed)    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  LLM (scoped to product tools only)              │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Product API (safe, scoped tools)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Get User │ │ Get Order│ │ Search   │ │ Update   │  │
│  │ Profile  │ │ Status   │ │ Products │ │ Profile  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Tool scoping** — tools can only access the current user's data
   - Enforce user ID in every tool call
   - Never expose admin or bulk operations

2. **Prompt design** — system prompt defines product-specific behavior
   - What the agent can and cannot do
   - Tone and personality
   - Fallback behavior when uncertain

3. **Fallback strategy** — what happens when the agent fails?
   - Graceful degradation ("I couldn't find that. Try...")
   - Human handoff
   - Form-based fallback

4. **Observability** — every interaction is logged
   - Token usage per request
   - Tool call success/failure rates
   - User satisfaction signals

### Implementation: Embedded Agent with FastAPI

```python
from fastapi import FastAPI, Depends
from pydantic_ai import Agent

app = FastAPI()

# Scoped to support questions only
support_agent = Agent(
    "openai:gpt-4o",
    system_prompt="""You are a support assistant for Product X.
    Only answer questions about Product X features, billing, and troubleshooting.
    If asked about other topics, politely redirect.
    Never make promises about refunds or account changes.""",
    tools=[get_faq, lookup_order_status, get_billing_info],
)

@app.post("/api/assist")
async def assist(
    message: str,
    user: User = Depends(get_current_user)
):
    # Inject user context into the tool scope
    result = await support_agent.run(
        message,
        user_id=user.id  # Tools can only access this user's data
    )
    
    # Log for observability
    await log_interaction(user.id, message, result)
    
    return {"response": result.data}
```

---

## Decision Framework

```
Start: What is the agent's primary user?
│
├── Developer / Power User
│   └── Interactive Development Agent
│       ├── Needs shell access? → Yes → Claude Code pattern
│       ├── Needs file editing? → Yes → Cursor/Copilot pattern  
│       └── Single task focus? → Yes → Script-based agent
│
└── End-User (non-technical)
    └── Embedded Product Agent
        ├── Data Q&A? → RAG pattern
        ├── Form assistance? → Guided flow pattern
        ├── Support? → Knowledge base + escalation pattern
        └── Creative? → Structured output pattern
```

---

## Common Patterns

### 1. ReAct (Reasoning + Acting)

The agent alternates between reasoning about the problem and taking actions.

```
Thought: I need to find the user's order status
Action: lookup_order_status(user_id="1233)
Observation: Order #456 is shipped
Thought: The order is shipped, I can tell the user
Answer: Your order #456 has been shipped and arrives Thursday.
```

### 2. Plan-and-Execute

The agent first creates a plan, then executes it step by step.

```
Plan:
1. Get user's order history
2. Identify the most recent order
3. Check shipping status
4. Summarize for user

Execution: [step 1] → [step 2] → [step 3] → [step 4]
```

### 3. Router Pattern

A lightweight router directs queries to specialized sub-agents.

```
User Query → Router LLM
                ├── "billing question" → Billing Agent
                ├── "tech issue" → Support Agent
                └── "account change" → Account Agent
```

### 4. Human-in-the-Loop

Agent requests human approval before executing sensitive operations.

```
Agent: I found 3 issues in your code. Want me to fix them?
Human: Yes, fix issues 1 and 2 but not 3.
Agent: [fixes 1 and 2]
```

---

## Multi-Agent Systems

When tasks are complex, multiple specialized agents can collaborate.

### Orchestrator Pattern

```
┌─────────────────────────────────────────────────────────┐
│                   Orchestrator Agent                     │
│  (Routes tasks, synthesizes results)                     │
└──────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Researcher  │ │ Coder       │ │ Reviewer    │
│ Agent       │ │ Agent       │ │ Agent       │
│             │ │             │ │             │
│ - Search    │ │ - Write code│ │ - Review    │
│ - Retrieve  │ │ - Test      │ │ - Validate  │
│ - Summarize │ │ - Debug     │ │ - Critique  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### Handoff Pattern (OpenAI Agents SDK)

```python
from agents import Agent, Router

triage_agent = Agent(
    name="Triage",
    instructions="Determine the type of request and hand off to the right agent.",
    handoffs=[billing_agent, support_agent, sales_agent]
)
```

### When to Use Multi-Agent

| Use Multi-Agent When | Stick to Single Agent When |
|----------------------|---------------------------|
| Tasks require different expertise | One LLM can handle the end-to-end task |
| Context windows are too small for all tools | All tools fit in one prompt |
| Need parallel execution | Sequential is fine |
| Different security clearance levels | Uniform access level |

---

## Sources & Further Reading

- [Anthropic — Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [LangChain](https://docs.langchain.com/oss/python/langchain/overview)
- [Lilian Weng — LLM Powered Autonomous Agents](https://lilianweng.github.io/posts/2023-06-23-agent/)
- [Eugene Yan — Patterns for LLM Systems](https://eugeneyan.com/writing/llm-patterns/)
- [Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/)
- [Google ADK](https://adk.dev/)

---

*Created: 2026-10-19*
