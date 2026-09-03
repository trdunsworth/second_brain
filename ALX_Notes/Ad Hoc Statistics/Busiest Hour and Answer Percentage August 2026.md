---
title: Ad-Hoc Query - Busiest Hour and Answer Percentage
tags:
  - ad-hoc
  - data-query
  - statistics
  - alx
  - ecats
date: 2026-09-03
created: 2026-09-03
creator: Tony Dunsworth
requestor: Tiana Allen
status: complete
---

# Ad-Hoc Query - Busiest Hour and Answer Percentage

---

## Request Information

**Query Name:**  
**Date Requested:** 2026-09-03  
**Requestor:** Tiana Allen  
**Creator:** Tony Dunsworth  

---

## What Was Requested

What were the busiest hour and 9-1-1 10-second answer rates for August

---

## What Was Accessed

| System | Database | Table(s)         | Notes |
| ------ | -------- | ---------------- | ----- |
| EcaTS  |          | PSAP Ring Time   |       |
| EcaTS  |          | Top Busiest Hour |       |

---

## SQL Statement

```sql
-- Paste or build your SQL statement here

```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| Requested Variable                      | Result |
| --------------------------------------- | ------ |
| 9-1-1 Calls Answered in 10 seconds      | 4,951  |
| 9-1-1 Calls Answered August 2026        | 5,427  |
| 9-1-1 10-second Answer Percentage       | 91.23% |
| Busiest Hour for 9-1-1 Calls            | 1600   |
| Busiest Hour for Non-Emergency Calls    | 1300   |
| Busiest Hour for all calls              | 1600   |
| 9-1-1 calls in the busiest hour         | 382    |
| Non-Emergency calls in the busiest hour | 917    |
| Total calls in the busiest hour         | 1,194  |

**Outcome Summary:**  Report generated and sent by email

---

## Analysis Information

The busiest hour for 9-1-1 calls is not what I would have expected, but with school starting back up, there may have been a slight shift in the volume. This may change over time as school settles into session. The admin line calls at 1300 hours is part of the expected range from 1100 hours to 1600 hours. 

The successful answer percentage for the month is better than NENA guidelines. We might want to look at the percentage successfully answered in the busiest hour. Looking at that busiest hour, 342 calls or 89.53% of calls were answered in <= 10 seconds. 

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes |  X No

**Due Date:**   None
**Reason:**   No Follow Up Required

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


