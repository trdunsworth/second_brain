---
title: "Ad-Hoc Query - "
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-09-21
created: 2026-09-21
creator: Tony Dunsworth
requestor: Myah Marshall
status: complete
---

# CIMRS Performance Measures Data

---

## Request Information

**Query Name:** null  
**Date Requested:** 2026-09-21  
**Requestor:** Myah Marshall  
**Creator:** Tony Dunsworth  

---

## What Was Requested

CALEA CIMRS Performance Measures Data

---

## What Was Accessed

| System | Database         | Table(s)                 | Notes |
| ------ | ---------------- | ------------------------ | ----- |
| EcaTS  |                  |                          |       |
| RPT01  | Reporting_System | Response_Master_Incident |       |

---

## SQL Statement

```sql
USE Reporting_System;
GO

DECLARE @sdate AS DATE = '2025-01-01';
DECLARE @fdate AS DATE = DATEADD(YEAR, 1, @sdate);

;WITH Base AS
(
	SELECT ID,
	CASE 
		WHEN Agency_Type = 'LAW' THEN 1
		WHEN Agency_Type = 'FIRE' THEN
			CASE WHEN (Problem LIKE ('%ALS%')
                      OR Problem LIKE ('%BLS%')
                      OR Problem IN ('CONSTRUCTION SITE INJURY', 'PSYCHIATRIC EMERGENCY VIOLENT', 'PUBLIC SERVICE EMS'))
                 THEN 2
                 WHEN Problem IN ('ALARM OOS', 'FD - HOLD CALL', 'INVESTIGATION', 'SPECIAL EVENT', 'WELFARE CHECK', 'MUTUAL AID', 'MUTUAL AID BUILDING FIRE', 'test1', 'WORKING INCIDENT DISPATCH')
                 THEN 2
                 ELSE 3
			END
	END AS IsAgency
	FROM Response_Master_Incident
	WHERE Response_Date >= @sdate
           AND Response_Date < @fdate
           AND (Call_Disposition NOT IN ('TEST1-TEST CALL', 'TST-Test Call', 'TEST-Test Call', 'DUPPD-Duplicate Police', 'DUPFD-Duplicate Call Fire', 'IS-SYSTEM BACK IN SERVICE', 'SYSTEM BACK IN SERVICE')
                OR Call_Disposition IS NULL)
           AND (Time_First_Unit_Assigned IS NOT NULL
                AND Time_First_Unit_Assigned <> '')
           AND Agency_Type IN ('LAW', 'FIRE')
           AND Problem NOT IN ('WARRANT SERVICE', 'WARRANT ISSUED', 'test1')
)

SELECT 'Total' AS [Agency Dispatched],
       COUNT(DISTINCT ID) AS [Dispatches],
       0 AS SortOrder
FROM   Base
UNION ALL
SELECT CASE WHEN IsAgency = 1 THEN 'LAW'
        WHEN IsAgency = 2 THEN 'EMS'
        ELSE 'FIRE' END AS [Agency Dispatched],
       COUNT(DISTINCT ID) AS [Dispatches],
       IsAgency AS SortOrder
FROM   Base
GROUP  BY IsAgency
ORDER  BY SortOrder;
```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| Data Point                      | Value   |
| ------------------------------- | ------- |
| *Call Statistics*               |         |
| Incoming Emergency Calls        | 71,125  |
| Incoming Non-Emergency Calls    | 163,464 |
| Outgoing Calls                  | 75,867  |
| Total Calls                     | 310,456 |
|                                 |         |
| *Dispatched Event Statistics*   |         |
| Law Enforcement Dispatches      | 75,106  |
| Fire Department Dispatches      | 9,696   |
| Medical Dispatches              | 19,259  |
|                                 |         |
| *Processing Statsitics*         |         |
| Percentage of Abandoned Calls   | 5.80%   |
| Mean Processing Time in Minutes | 1:51    |

**Outcome Summary:**  

---

## Analysis Information

Total call volumes include the abandoned calls recorded during Calendar Year 2025. The volumes are higher than those reported for Calendar Year 2024 while showing a reduction in the percentage of abandoned calls and a lower overall mean processing time. The abandonment rate is consistent with the figures supplied for the first half of the year. The mean overall processing time also decreased by 8 seconds or about 9% from the half-year statistics. 

---

## Follow-Up Required

**Follow-Up Needed:** X Yes | ☐ No

**Due Date:**   15 September 2027
**Reason:**   CALEA Audit

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


