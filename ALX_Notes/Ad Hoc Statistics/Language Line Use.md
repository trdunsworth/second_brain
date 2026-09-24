---
title: Ad-Hoc Query - LanguageLineUse.sql
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-09-24
created: 2026-09-24
creator: Tony Dunsworth
requestor: Walt Kaplan, MPH
status: complete
---

# Ad-Hoc Query - Language Line Use

---

## Request Information

**Query Name:** LanguageLineUse.sql  
**Date Requested:** 2026-09-24  
**Requestor:** Walt Kaplan, MPH  
**Creator:** Tony Dunsworth  

---

## What Was Requested

The number of times that the Language Line was accessed in the last year.

---

## What Was Accessed

| System | Database         | Table(s)                                    | Notes |
| ------ | ---------------- | ------------------------------------------- | ----- |
| RPT01  | Reporting_System | Response_Master_Incident, Response_Comments |       |
|        |                  |                                             |       |

---

## SQL Statement

```sql
USE Reporting_System;
GO

SELECT DISTINCT(i.Master_Incident_Number) AS [Call Number],
i.Response_Date AS [Response Date],
c.Comment AS [Comment]
FROM Response_Master_Incident i INNER JOIN Response_Comments c ON i.ID = c.Master_Incident_ID
WHERE --c.Comment LIKE '%|~~FOREIGN LANGUAGE POTENTIAL~~|%'
c.Comment LIKE '%LANGUAGE LINE%'
AND i.Response_Date > DATEADD(YEAR, -1, SYSDATETIME())
ORDER BY i.Response_Date;
```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| | | |
|---|---|---|
| | | |
| | | |

**Outcome Summary:**  The Language Line was invoked for 866 distinct service calls.

---

## Analysis Information

Over the last 12-month window, we have documented the use of the Language Line 866 times.

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes | ☐ No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


