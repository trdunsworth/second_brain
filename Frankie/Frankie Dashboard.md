---
type: dashboard
status: active
topic: "Dataview dashboard for the Frankie folder."
created: "2026-10-22"
tags:
  - dashboard
  - dataview
  - frankie
---

# Frankie Dashboard

## All Frankie notes

```dataview
TABLE status, topic, updated
FROM "Frankie"
WHERE type
SORT updated DESC
```
