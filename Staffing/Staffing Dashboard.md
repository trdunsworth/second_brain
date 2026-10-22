---
type: dashboard
status: active
topic: "Dataview dashboard for the Staffing folder."
created: "2026-10-22"
tags:
  - dashboard
  - dataview
  - staffing
---

# Staffing Dashboard

## All staffing notes

```dataview
TABLE status, topic, updated
FROM "Staffing"
WHERE type
SORT updated DESC
```

## Active

```dataview
LIST
FROM "Staffing"
WHERE status = "active"
SORT file.name ASC
```
