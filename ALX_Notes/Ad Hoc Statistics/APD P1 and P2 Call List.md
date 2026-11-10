---
title: Ad-Hoc Query - APD_HP_Call_List.sql
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-11-10
created: 2026-11-10
creator: Tony Dunsworth
requestor: Lt. Patricio Alvarez
status: complete
---

# Ad-Hoc Query - APD P1 and P2 Call List

---

## Request Information

**Query Name:** APD_HP_Call_List.sql  
**Date Requested:** 2026-11-10  
**Requestor:** Lt. Patricio Alvarez  
**Creator:** Tony Dunsworth  

---

## What Was Requested

List of APD P1 and P2 calls for 2025

---

## What Was Accessed

| System | Database         | Table(s)                 | Notes                |
| ------ | ---------------- | ------------------------ | -------------------- |
| RPT01  | Reporting_System | Response_Master_Incident | 66,874 rows returned |
|        |                  |                          |                      |

---

## SQL Statement

```sql
USE Reporting_System;
GO

SELECT Master_Incident_Number,
    Response_Date,
    Problem,
    Priority_Number,
    Priority_Description,
    CAST(Latitude AS FLOAT)/1000000 AS Latitude,
    CAST(Longitude AS FLOAT)/1000000 AS Longitude,
    Call_Disposition
FROM Response_Master_Incident
WHERE Agency_Type = 'LAW'
AND Priority_Number <= 2
AND Response_Date BETWEEN '2025-01-01' AND '2026-01-01'
AND ((Master_Incident_Number IS NOT NULL) AND (Master_Incident_Number != ''))
ORDER BY Response_Date;

```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| | | |
|---|---|---|
| | | |
| | | |

**Outcome Summary:**  66,874 rows were returned

---

## Analysis Information

List of APD P1 and P2 calls for 2025

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes | X No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


