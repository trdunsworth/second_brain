---
title: Ad-Hoc Query - Tenesia_JDC_Query_2
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-10-29
created: 2026-10-29
creator: Tony Dunsworth
requestor: Esmond Marvray
status: complete
---

# Ad-Hoc Query - JDC Calls 2026

---

## Request Information

**Query Name:** Teneia_JDQ_Query_2.sql  
**Date Requested:** 2026-10-29  
**Requestor:** Esmond Marvray  
**Creator:** Tony Dunsworth  

---

## What Was Requested

A list of calls with comments and units responding

---

## What Was Accessed

| System | Database         | Table(s)                                                               | Notes |
| ------ | ---------------- | ---------------------------------------------------------------------- | ----- |
| CAD    | Reporting_System | Response_Master_Incident, Response_Comment, Response_Vehicles_Assigned |       |
|        |                  |                                                                        |       |

---

## SQL Statement

```sql
USE Reporting_System;

GO

  

SELECT rmi.ID,

    rmi.Master_Incident_Number,

    rmi.Response_Date,

    rmi.Agency_Type,

    rmi.Problem,

    rmi.Priority_Number,

    STUFF((

        SELECT ', ' + rc2.Comment

        FROM Response_Comments rc2

        WHERE rc2.Master_Incident_ID = rmi.ID

        ORDER BY rc2.Comment

        FOR XML PATH(''), TYPE

    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS Comments,

    STUFF((

        SELECT ', ' + rva.Radio_Name

        FROM Response_Vehicles_Assigned rva

        WHERE rva.Master_Incident_ID = rmi.ID

        ORDER BY rva.Radio_Name

        FOR XML PATH(''), TYPE

    ).value('.', 'NVARCHAR(MAX)'), 1, 2, '') AS Units,

    rmi.Call_Disposition

FROM Response_Master_Incident rmi

WHERE rmi.Response_Date > '2026-01-01'

AND (rmi.Address = '200 S Whiting St' OR rmi.Location_Name = 'JUVENILE DETENTION CENTER - 200 S WHITING ST')

AND EXISTS (SELECT 1 FROM Response_Comments rc WHERE rc.Master_Incident_ID = rmi.ID)

AND Problem != ''

ORDER BY ID;
```

---

## Results

*Build a table or provide a brief description of results and outcome below.*

| | | |
|---|---|---|
| | | |
| | | |

**Outcome Summary:**  This is a list of 162 calls that have occurred at the Alexandria Juvenile Detention Center (JDC)

---

## Analysis Information

The request is for a list of calls that have occurred at the JDC in 2026

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes | X No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


