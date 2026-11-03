---
title: Ad-Hoc Query - Teresa_Annual_Dispatch_v2.sql
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-11-03
created: 2026-11-03
creator: Tony Dunsworth
requestor: Walt Kaplan
status: complete
---

# Ad-Hoc Query - Collected Volumes for 2025

---

## Request Information

**Query Name:** Teresa_Annual_Count_v2.sql  
**Date Requested:** 2026-11-03  
**Requestor:** Walt Kaplan  
**Creator:** Tony Dunsworth  

---

## What Was Requested

Phone Call Counts and Dispatch Volumes for 2025

---

## What Was Accessed

| System | Database         | Table(s)                 | Notes                    |
| ------ | ---------------- | ------------------------ | ------------------------ |
| EcaTS  |                  | Call Summary             | No query to report       |
| CAD    | Reporting_System | Response_Master_Incident | via a CTE as shown below |

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
           Agency_Type,
           Problem
    FROM   Response_Master_Incident
    WHERE  Response_Date >= @sdate
           AND Response_Date < @fdate
           AND (Call_Disposition NOT IN ('TEST1-TEST CALL', 'TST-Test Call', 'TEST-Test Call', 'DUPPD-Duplicate Police', 'DUPFD-Duplicate Call Fire', 'IS-SYSTEM BACK IN SERVICE', 'SYSTEM BACK IN SERVICE')
                OR Call_Disposition IS NULL)
           AND (Time_First_Unit_Assigned IS NOT NULL
                AND Time_First_Unit_Assigned <> '')
           AND Problem NOT IN ('WARRANT SERVICE', 'WARRANT ISSUED', 'test1')
           AND Agency_Type IN ('LAW', 'FIRE', 'DEC')
),
AgencyCounts AS
(
    SELECT CASE
               WHEN Agency_Type = 'LAW' THEN 'Law'
               WHEN Agency_Type = 'FIRE'
                    AND (Problem LIKE '%ALS%'
                         OR Problem LIKE '%BLS%'
                         OR Problem IN ('CONSTRUCTION SITE INJURY', 'PSYCHIATRIC EMERGENCY VIOLENT', 'PUBLIC SERVICE EMS')) THEN 'EMS'
               WHEN Agency_Type = 'FIRE' THEN 'Fire'
               WHEN Agency_Type = 'DEC' THEN 'DEC'
           END AS Category,
           CASE
               WHEN Agency_Type = 'LAW' THEN 1
               WHEN Agency_Type = 'FIRE'
                    AND (Problem LIKE '%ALS%'
                         OR Problem LIKE '%BLS%'
                         OR Problem IN ('CONSTRUCTION SITE INJURY', 'PSYCHIATRIC EMERGENCY VIOLENT', 'PUBLIC SERVICE EMS')) THEN 3
               WHEN Agency_Type = 'FIRE' THEN 2
               WHEN Agency_Type = 'DEC' THEN 4
           END AS SortOrder,
           COUNT(DISTINCT ID) AS CallCount
    FROM   Base
    GROUP  BY CASE
                  WHEN Agency_Type = 'LAW' THEN 'Law'
                  WHEN Agency_Type = 'FIRE'
                       AND (Problem LIKE '%ALS%'
                            OR Problem LIKE '%BLS%'
                            OR Problem IN ('CONSTRUCTION SITE INJURY', 'PSYCHIATRIC EMERGENCY VIOLENT', 'PUBLIC SERVICE EMS')) THEN 'EMS'
                  WHEN Agency_Type = 'FIRE' THEN 'Fire'
                  WHEN Agency_Type = 'DEC' THEN 'DEC'
              END,
              CASE
                  WHEN Agency_Type = 'LAW' THEN 1
                  WHEN Agency_Type = 'FIRE'
                       AND (Problem LIKE '%ALS%'
                            OR Problem LIKE '%BLS%'
                            OR Problem IN ('CONSTRUCTION SITE INJURY', 'PSYCHIATRIC EMERGENCY VIOLENT', 'PUBLIC SERVICE EMS')) THEN 3
                  WHEN Agency_Type = 'FIRE' THEN 2
                  WHEN Agency_Type = 'DEC' THEN 4
              END
)
SELECT Category,
       CallCount,
       SortOrder
FROM   AgencyCounts
UNION ALL
SELECT 'Total (Law + Fire + EMS)',
       SUM(CASE WHEN Category IN ('Law', 'Fire', 'EMS') THEN CallCount ELSE 0 END),
       5
FROM   AgencyCounts
ORDER  BY SortOrder;

```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| Calls   | Received | Abandoned |  Total  |
| ------- | :------: | :-------: | :-----: |
| *9-1-1* |  61,050  |  10,075   | 71,125  |
| *Admin* | 159,944  |   3,520   | 163,464 |
| *Total* | 220,994  |  13.595   | 234,589 |
**2025 Outbound Calls Placed**: 75,867

| Discipline             | Dispatches |
| ---------------------- | ---------- |
| LAW (APD/ASO)          | 75,106     |
| FIRE (AFD Non-Medical) | 10,262     |
| EMS (AFD Medical)      | 18,693     |
| TOTAL                  | 104,061    |

**Outcome Summary:**  

---

## Analysis Information

2025 Call and Dispatch Volumes

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes | X No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


