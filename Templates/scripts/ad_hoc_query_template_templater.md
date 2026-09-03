---
title: "Ad-Hoc Query - <% tp.system.prompt('Query Name:', '', false) %>"
tags: ["ad-hoc", "data-query", "statistics", "sql", "alx"]
date: "<% tp.date.now('YYYY-MM-DD') %>"
created: "<% tp.date.now('YYYY-MM-DD') %>"
creator: "Tony Dunsworth"
requestor: "<% tp.system.prompt('Requestor Name:', '', false) %>"
status: "complete"
---

# Ad-Hoc Query - <% tp.file.title %>

---

## Request Information

**Query Name:** <% tp.system.prompt('Query Name:', '', false) %>  
**Date Requested:** <% tp.date.now('YYYY-MM-DD') %>  
**Requestor:** <% tp.system.prompt('Requestor Name:', '', false) %>  
**Creator:** Tony Dunsworth  

---

## What Was Requested

<% tp.system.prompt('Describe what was requested:', '', true) %>

---

## What Was Accessed

| System | Database | Table(s) | Notes |
|--------|----------|----------|-------|
| | | | |
| | | | |

---

## SQL Statement

```sql
-- Paste or build your SQL statement here

```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| | | |
|---|---|---|
| | | |
| | | |

**Outcome Summary:**  

---

## Analysis Information

<% tp.system.prompt('Analysis notes, observations, or context:', '', true) %>

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes &nbsp; | &nbsp; ☐ No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*

<%* tp.file.cursor() %>
