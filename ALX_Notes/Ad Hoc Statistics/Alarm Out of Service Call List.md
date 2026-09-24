---
title: Ad-Hoc Query - AlarmOOS.sql
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-09-22
created: 2026-09-22
creator: Tony Dunsworth
requestor: Destiny Carlisle
status: complete
---

# Alarm Out of Service Call List

---

## Request Information

**Query Name:** AlarmOOS.sql  
**Date Requested:** 2026-09-22  
**Requestor:** Destiny Carlisle  
**Creator:** Tony Dunsworth  

---

## What Was Requested

List of Alarm out of service calls

---

## What Was Accessed

| System | Database         | Table(s)                 | Notes |
| ------ | ---------------- | ------------------------ | ----- |
| RPT01  | Reporting_System | Response_Master_Incident |       |
|        |                  |                          |       |

---

## SQL Statement

```sql
USE Reporting_System;
GO

SELECT ID,
	Master_Incident_Number,
	Response_Date,
	Address,
	City,
	State,
	Postal_Code,
	Location_Name,
	Problem,
	Caller_Name,
	Call_Back_Phone
FROM Response_Master_Incident
WHERE Response_Date BETWEEN '2026-01-01' AND '2026-10-01'
AND Problem = 'ALARM OUT OF SERVICE'
AND Master_Incident_Number != ' '
AND Call_Is_Active = 1;
```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| | | |
|---|---|---|
| | | |
| | | |

**Outcome Summary:** 3,379 rows returned - When filtering for active calls, the list is reduced to 73.

---

## Analysis Information

List of Alarm Out of Service calls. Destiny asked me to expand the fields that were reported on 22 Sep 2026, the query above reflects the request for additional information. 

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes |  X No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


