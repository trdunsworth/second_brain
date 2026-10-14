---
type: moc
topic: "Research Dashboard"
created: 2026-09-02
updated: 2026-10-14
status: active
tags:
  - dashboard
  - dataview
  - research
---

# Research Dashboard

> **Fixed 2026-10-14.** Every query scoped to `FROM "Research"` and filtered on
> `type = "research-project"`, which returned two notes. The seven `Staffing/` notes
> (2,100+ lines) and the `Synthetic_Data/` research plan were invisible because they sit
> outside that folder and use different type values.
>
> **The fix is `FROM ""`** — search the whole vault. Type and status filters do the scoping.
> This assumes the closed vocabularies in [[USERSGUIDE]] § Frontmatter Reference.

---

## Active research projects

```dataview
TABLE status AS "Status", start_date AS "Started", methodology AS "Methodology"
FROM ""
WHERE type = "research-project" AND status = "active"
SORT start_date DESC
```

## Everything with a lifecycle

```dataview
TABLE type AS "Type", status AS "Status", created AS "Created", updated AS "Updated"
FROM ""
WHERE type
SORT status ASC, updated DESC
LIMIT 60
```

> If this table is long but *uninformative*, the type/status fields need converting.
> **Apply forward, not backward** — see [[USERSGUIDE]].

## By status

```dataview
TABLE WITHOUT ID
  length(rows) AS "Count"
FROM ""
WHERE status
GROUP BY status
```

### Parked and abandoned

```dataview
TABLE type AS "Type", updated AS "Last touched"
FROM ""
WHERE status = "parked" OR status = "abandoned"
SORT updated DESC
```

> These two states did not exist before 2026-10-14. Anything genuinely stopped is currently
> indistinguishable from work still in progress.

---

## By domain

### Time series and forecasting
```dataview
TABLE type AS "Type", status AS "Status", updated AS "Updated"
FROM ""
WHERE contains(tags, "forecasting") OR contains(tags, "time-series")
SORT updated DESC
```

### Queueing and staffing
```dataview
TABLE type AS "Type", status AS "Status", updated AS "Updated"
FROM ""
WHERE contains(tags, "queueing") OR contains(tags, "staffing") OR contains(tags, "erlang")
SORT updated DESC
```

### 9-1-1 / PSAP
```dataview
TABLE type AS "Type", status AS "Status", updated AS "Updated"
FROM ""
WHERE contains(tags, "911") OR contains(tags, "psap")
SORT updated DESC
```

### Synthetic data
```dataview
TABLE type AS "Type", status AS "Status", updated AS "Updated"
FROM ""
WHERE contains(tags, "synthetic") OR contains(tags, "synthccd")
SORT updated DESC
```

---

## Recent activity

```dataview
TABLE file.mtime AS "Last modified", type AS "Type", status AS "Status"
FROM ""
WHERE type
SORT file.mtime DESC
LIMIT 20
```

## Stale notes — not touched in 90 days

```dataview
TABLE file.mtime AS "Last touched", type AS "Type", status AS "Status"
FROM ""
WHERE type AND status != "complete" AND duration(file.mtime) > duration(90 days)
SORT file.mtime ASC
LIMIT 30
```

> This is the one that earns its keep. It surfaces notes that *look* current but have not
> been touched since June. Several of them are dead work that never got marked.

---

## Entry points

- [[Research MOC]] — the narrative map
- [[Time Series Reading and Practice Hub]] — time series reference set and practice series
- [[Staffing/README]] — the staffing feasibility track
- [[USERSGUIDE]] — vault conventions, frontmatter schema, tagging

## Other dashboards

- [[Journal Dashboard]] — daily activity tracking
- [[DMA Projects MOC]] — DMA project status

---

*Last updated: 2026-10-14*