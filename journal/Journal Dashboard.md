---
type: dashboard
topic: "Journal Dashboard"
created: 2026-09-02
updated: 2026-09-05
tags:
  - dashboard
  - dataview
  - journal
---

# Journal Dashboard

## Recent Journal Entries

```dataview
TABLE creation-date AS "Date", workday AS "Workday"
FROM "journal"
SORT file.name DESC
LIMIT 14
```

## Journal Statistics

### Total Entries
```dataview
TABLE length(rows) AS "Count"
FROM "journal"
GROUP BY file.folder
```

### Entries by Month
```dataview
TABLE length(rows) AS "Entries"
FROM "journal"
GROUP BY dateformat(date(file.name), "yyyy-MM") AS "Month"
SORT Month DESC
LIMIT 12
```

## Workday vs Non-Workday Entries

### Workday Entries
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE workday = true
SORT file.name DESC
LIMIT 10
```

### Non-Workday Entries
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE workday = false
SORT file.name DESC
LIMIT 10
```

## Tag Analysis

### Entries with Tags
```dataview
TABLE tags AS "Tags"
FROM "journal"
WHERE tags
SORT file.name DESC
LIMIT 20
```

### Tag Distribution
```dataview
TABLE length(rows) AS "Count"
FROM "journal"
WHERE tags
FLATTEN tags AS Tag
GROUP BY Tag
SORT Count DESC
```

## Project Activity in Journals

### ALX Activity
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE contains(file.content, "ALX")
SORT file.name DESC
LIMIT 10
```

### DMA Activity
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE contains(file.content, "DMA")
SORT file.name DESC
LIMIT 10
```

### Toastmasters Activity
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE contains(file.content, "Toastmasters")
SORT file.name DESC
LIMIT 10
```

### Research Activity
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE contains(file.content, "research") OR contains(file.content, "Research")
SORT file.name DESC
LIMIT 10
```

## Mood & Reflection Tracking

### Entries with Mood Data
```dataview
TABLE creation-date AS "Date", mood AS "Mood"
FROM "journal"
WHERE mood
SORT file.name DESC
LIMIT 20
```

### Gratitude Entries
```dataview
TABLE creation-date AS "Date"
FROM "journal"
WHERE contains(file.content, "gratitude") OR contains(file.content, "Gratitude")
SORT file.name DESC
LIMIT 20
```

## Quick Navigation

### This Week
```dataview
TABLE creation-date AS "Date", workday AS "Workday"
FROM "journal"
WHERE file.name >= dateformat(date(today) - dur(7 days), "yyyy-MM-dd")
SORT file.name DESC
```

### This Month
```dataview
TABLE creation-date AS "Date", workday AS "Workday"
FROM "journal"
WHERE file.name >= dateformat(date(today), "yyyy-MM") + "-01"
SORT file.name DESC
```

## Related Dashboards

- [[Research Dashboard]] - Research project tracking
- [[DMA Projects MOC]] - DMA project status
- [[Wisdom Sources MOC]] - Philosophical and psychological resources

---

*Last updated: 2026-09-05*
