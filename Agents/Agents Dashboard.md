---
type: dashboard
status: active
topic: "Dataview dashboard for the Agents folder."
created: "2026-10-22"
tags:
  - dashboard
  - dataview
  - agents
---

# Agents Dashboard

## All agent notes

```dataview
TABLE status, topic, updated
FROM "Agents"
WHERE type
SORT updated DESC
```

## Active research/projects

```dataview
LIST
FROM "Agents"
WHERE status = "active"
SORT file.name ASC
```
