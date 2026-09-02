---
type: dashboard
topic: "Research Dashboard"
created: 2026-09-02
updated: 2026-09-02
tags:
  - dashboard
  - dataview
  - research
---

# Research Dashboard

## Active Research Projects

```dataview
TABLE status as "Status", start_date as "Started", methodology as "Methodology"
FROM "Research"
WHERE type = "research-project"
SORT start_date DESC
```

## Research by Status

### In Progress
```dataview
TABLE start_date as "Started", methodology as "Methodology"
FROM "Research"
WHERE type = "research-project" AND status = "In Progress"
SORT start_date DESC
```

### Completed
```dataview
TABLE start_date as "Started", end_date as "Completed"
FROM "Research"
WHERE type = "research-project" AND status = "Completed"
SORT end_date DESC
```

## Research by Domain

### Time Series Forecasting
```dataview
TABLE status as "Status", start_date as "Started"
FROM "Research"
WHERE contains(tags, "forecasting") OR contains(tags, "time-series")
SORT start_date DESC
```

### Queueing Theory
```dataview
TABLE status as "Status", start_date as "Started"
FROM "Research"
WHERE contains(tags, "queueing") OR contains(tags, "erlang")
SORT start_date DESC
```

### 9-1-1 Operations
```dataview
TABLE status as "Status", start_date as "Started"
FROM "Research"
WHERE contains(tags, "911") OR contains(tags, "psap")
SORT start_date DESC
```

## Research Timeline

### Recent Research Activity
```dataview
TABLE file.mtime as "Last Modified", status as "Status"
FROM "Research"
SORT file.mtime DESC
LIMIT 10
```

### Research Progress Log
```dataview
TABLE progress_log as "Recent Updates"
FROM "Research"
WHERE progress_log
SORT file.mtime DESC
LIMIT 10
```

## Research Resources

### Time Series Papers
```dataview
TABLE file.name as "Paper Collection"
FROM "Research/Time-Series"
WHERE file.name != "ARIMA vs Prophet.md"
```

### Related References
```dataview
LIST
FROM "references"
WHERE contains(tags, "research") OR contains(tags, "forecasting")
```

## Research Connections

### Linked Research
```dataview
TABLE file.links as "Outgoing Links"
FROM "Research"
WHERE length(file.links) > 0
SORT file.name ASC
```

### Backlinked Research
```dataview
TABLE length(file.backlinks) as "Backlinks"
FROM "Research"
WHERE length(file.backlinks) > 0
SORT length(file.backlinks) DESC
```

## Quick Actions

### Create New Research Project
Use the [[Research Project]] template to start a new research project.

### Update Existing Projects
- [[Time-Series/168-Point Forecast Comparison - Discrete vs Continuous]]
- [[PSAP Staffing Model]]
- [[ARIMA vs Prophet]]

## Related Dashboards

- [[Journal Dashboard]] - Daily activity tracking
- [[DMA Projects MOC]] - DMA project status
- [[Research MOC]] - Research connections

---

*Last updated: 2026-09-02*
