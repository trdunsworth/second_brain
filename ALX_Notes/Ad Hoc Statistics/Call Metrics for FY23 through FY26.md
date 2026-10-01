---
title: Ad-Hoc Query - Call Metrics FY23 through FY26
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-09-23
created: 2026-09-23
creator: Tony Dunsworth
requestor: Tenesia Walls
status: complete
---

# Call Metrics for FY23 through FY26

---

## Request Information

**Query Name:** Call Metrics for FY23 through FY26  
**Date Requested:** 2026-09-23  
**Requestor:** Tenesia Wells  
**Creator:** Tony Dunsworth  

---

## What Was Requested

EcaTS Numbers for FY23 through FY26

---

## What Was Accessed

| System | Database | Table(s)     | Notes |
| ------ | -------- | ------------ | ----- |
| EcaTS  |          | Call Summary |       |
|        |          |              |       |

---

## SQL Statement

```sql
-- Paste or build your SQL statement here

```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| **Type**               |   FY23    | FY24      | Δ 24                                   | %Δ 24                                   | FY25      | Δ 25                                       | %Δ 25                                   | FY26      | Δ 26                                       | %Δ 26                                   |
| ---------------------- | :-------: | --------- | -------------------------------------- | --------------------------------------- | --------- | ------------------------------------------ | --------------------------------------- | --------- | ------------------------------------------ | --------------------------------------- |
| *911 In*               |  66,954   | 65,825    | <span style="color:red;">-1,129</span> | <span style="color:red;">-1.69%</span>  | 62,247    | <span style="color:red;">-3,578</span>     | <span style="color:red;">-5.44%</span>  | 63,335    | 908                                        | 1.45%                                   |
| *911 AB*               |  13,877   | 11,398    | <span style="color:red;">-2,479</span> | <span style="color:red;">-17.86%</span> | 9,949     | <span style="color:red;">-1,449</span>     | <span style="color:red;">-12.71%</span> | 9,397     | <span style="color:red;">-552</span>       | <span style="color:red;">-5.55%</span>  |
| *ADM In*               |  157,193  | 165,592   | 8,399                                  | 5.34%                                   | 163,016   | <span style="color:red;">-2,576</span>     | <span style="color:red;">-1.56%</span>  | 163,912   | 896                                        | 0.55%                                   |
| *ADM Out*              |   5,521   | 4,446     | <span style="color:red;">-1,075</span> | <span style="color:red;">-19.47%</span> | 3,626     | <span style="color:red;">-820</span>       | <span style="color:red;">-18.44%</span> | 3,676     | 50                                         | 1.38%                                   |
| *OUT*                  |  83,877   | 74,015    | <span style="color:red;">-9,862</span> | <span style="color:red;">-11.76%</span> | 76,793    | 2,778                                      | 3.75%                                   | 70,970    | <span style="color:red;">-5,023</span>     | <span style="color:red;">-7.58%</span>  |
| *TOTAL*                |  327,122  | 321,278   | <span style="color:red;">-5,844</span> | <span style="color:red;">-1.79%</span>  | 315,811   | <span style="color:red;">-5,467</span><br> | <span style="color:red;">-1.70%</span>  | 311,490   | <span style="color:red;">-4,321</span>     | <span style="color:red;">-1.37%</span>  |
| *AVG Phone*            | 106.4 sec | 108.3 sec | 1.9 sec                                | 1.79%                                   | 112.7 sec | 4.4 sec                                    | 4.06%                                   | 109.1 sec | <span style="color:red;">-3.6 sec</span>   | <span style="color:red;">-3.19%</span>  |
| *911 Pct 10 sec*       |  87.06%   | 87.49%    | 0.43%                                  | ---                                     | 86.54%    | <span style="color:red;">-0.95%</span>     | ---                                     | 89.27%    | 2.73%                                      | ---                                     |
| *911 Pct 15 sec*       |  94.01%   | 94.46%    | 0.45%                                  | ---                                     | 94.41%    | <span style="color:red;">-0.05%</span>     | ---                                     | 95.73%    | 1.37%                                      | ---                                     |
| *911 Pct 20 sec*       |  96.16%   | 96.47%    | 0.31%                                  | ---                                     | 96.63%    | 0.16%                                      | ---                                     | 97.44%    | 0.81%                                      | ---                                     |
| *Text Sessions*        |    233    | 199       | <span style="color:red;">-34</span>    | <span style="color:red;">-14.59%</span> | 185       | <span style="color:red;">-14</span>        | <span style="color:red;">-7.04%</span>  | 308       | 123                                        | 66.49%                                  |
| *Msg Recd*             |   1408    | 1295      | <span style="color:red;">-113</span>   | <span style="color:red;">-8.03%</span>  | 1101      | <span style="color:red;">-194</span>       | <span style="color:red;">-14.98%</span> | 1613      | 512                                        | 46.05%                                  |
| *Msgs Sent*            |   1503    | 1056      | <span style="color:red;">-447</span>   | <span style="color:red;">-29.74%</span> | 1268      | 212                                        | 20.08%                                  | 1737      | 469                                        | 36.99%                                  |
| *Avg Session Duration* | 471.1 sec | 477.0 sec | 5.9 sec                                | 1.25%                                   | 862.2 sec | 385.2 sec                                  | 80.75%                                  | 366.7 sec | <span style="color:red;">-495.5 sec</span> | <span style="color:red;">-57.47%</span> |

**Outcome Summary:**  

---

## Analysis Information

EcaTS Reports, FY23 through FY26

It appears that call volumes have shown a downward trend through the last 4 fiscal years. The most precipitous drops occurred between FY24 over FY23 and FY25 over FY24. Analytically, I would suggest that call volumes have started to stabilize in FY26.

Looking at the new additional numbers, I can see that emergency line answer percentages generally increased over the four year period. The percentages successfully answered in 20 seconds from presentation increased throughout the cycle without exception.

We've added SMS/Text sessions to the matrix. I think that this could prove interesting. It's hard to see the trend lines so far, but I'm certain something will come out in time. 

---

## Follow-Up Required

**Follow-Up Needed:** X Yes | ☐ No

**Due Date:** 07 JUL 2027
**Reason:** Annual follow-up 

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


