---
title: "Ad-Hoc Query - "
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-11-02
created: 2026-11-02
creator: Tony Dunsworth
requestor: Destiny Carlisly
status: complete
---

# Ad-Hoc Query - Call Type by Accessor

---

## Request Information

**Query Name:**   
**Date Requested:** 2026-11-02  
**Requestor:** Destiny Carlisle  
**Creator:** Tony Dunsworth  

---

## What Was Requested

List of Call Types by the role allowed to see them

---

## What Was Accessed

| System | Database         | Table(s) | Notes |
| ------ | ---------------- | -------- | ----- |
| CAD    | Reporting_System | Problem  |       |
|        |                  |          |       |

---

## SQL Statement

```sql
USE Reporting_System;
GO

SELECT Description AS [Problem Nature],
	CASE WHEN Agency_TypeID = 1 THEN 'DECC'
		WHEN Agency_TypeID = 2 THEN 'LAW'
		WHEN Agency_TypeID = 3 THEN 'FIRE'
		ELSE 'UNKNOWN'
	END AS [Agency]
FROM Problem
WHERE IsActive = 1
ORDER BY [Agency], Description;

```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| | | |
|---|---|---|
| | | |
| | | |

**Outcome Summary:** This 

---

## Analysis Information



---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes &nbsp; | &nbsp; ☐ No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


