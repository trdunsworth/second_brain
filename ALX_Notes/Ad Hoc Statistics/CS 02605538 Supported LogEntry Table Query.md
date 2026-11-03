---
title: Ad-Hoc Query - Log_Inspection_Query_v8.sql
tags:
  - ad-hoc
  - data-query
  - statistics
  - sql
  - alx
date: 2026-11-03
created: 2026-11-03
creator: Tony Dunsworth
requestor: Destiny Carlisle
status: complete
---

# Ad-Hoc Query - CS 02605538 Supported LogEntry Table Query

---

## Request Information

**Query Name:** Log_Inspection_v8.sql  
**Date Requested:** 2026-11-03  
**Requestor:** Destiny Carlisle  
**Creator:** Tony Dunsworth  

---

## What Was Requested

Full details from the LogEntry table on 2026-09-23 from 1530 hours to 1730 hours.

---

## What Was Accessed

| System | Database | Table(s)                                                            | Notes |
| ------ | -------- | ----------------------------------------------------------- | ----- |
| CAD LogEntry, Machine, OSUser, Application, Category, Severity  ,  ,  ,  ,  ,  ,  ,  ,  |                                                                                                   |       |

---

## SQL Statement

```sql
USE Log;
GO

DECLARE @start datetime = '2026-09-23 15:30:00'
DECLARE @end   datetime = '2026-09-23 17:30:00'

SELECT
    le.LogEntryID                                                                    AS [Transaction ID],
    CAST(le.LogEntryTime AS date)                                                    AS [Transaction Date],
    CAST(le.LogEntryTime AS time(3))                                                 AS [Transaction Time],
    REPLACE(m.Name, '.', ' ')                                                        AS [Machine Name],
    REPLACE(o.Name, '.', ' ')                                                        AS [Account Name],
    REPLACE(a.Name, '.', ' ')                                                        AS [Application],
    c.Name                                                                           AS [Category],
    s.Name                                                                           AS [Severity],
    le.Title                                                                         AS [Message Header],
    REPLACE(REPLACE(le.Message, CHAR(10), CHAR(32)), CHAR(13), CHAR(32))            AS [Message],
    REPLACE(REPLACE(le.Details, CHAR(10), CHAR(32)), CHAR(13), CHAR(32))            AS [Details],
    le.ExtendedProperties                                                            AS [Return Data]
FROM dbo.LogEntry le
INNER JOIN dbo.Machine      m ON le.MachineID      = m.MachineID
INNER JOIN dbo.OSUser       o ON le.OSUserID        = o.OSUserID
INNER JOIN dbo.Application  a ON le.ApplicationID   = a.ApplicationID
INNER JOIN dbo.Category     c ON le.CategoryID      = c.CategoryID
INNER JOIN dbo.Severity     s ON le.SeverityID      = s.SeverityID
WHERE le.LogEntryTime >= @start
  AND le.LogEntryTime <  DATEADD(second, 1, @end)
--AND REPLACE(REPLACE(le.Message, CHAR(10), CHAR(32)), CHAR(13), CHAR(32))  <> 'Send Ptt Pressed failed. At least PhysicalRadioId or RadioCode are required'
--AND REPLACE(REPLACE(le.Message, CHAR(10), CHAR(32)), CHAR(13), CHAR(32)) <> 'At least PhysicalRadioId is required'
--AND le.Title <> 'TSSINTMotorolaPTT'
--AND REPLACE(o.Name,'.',' ') LIKE '%COAWNT\KYLAH DOGAN%'
--AND s.Name = 'ERROR'
--AND le.MachineID = 30
--AND m.Name = 'DECWKSOPS13'
--AND le.Message NOT LIKE '%APP_NAME=TSSIntRMS  MODULE_NAME=frmMain  ROUTINE_NAME=LogInc01  LINE_NUMBER=0ERROR_NUM=0  ERROR_DESC=Cannot log incident information%'
--AND (le.Message LIKE '%SSPI%' OR le.Title LIKE 'AdoRecordsetOpen')
--AND le.Message = 'Long Running Action'
--AND le.Details LIKE '%3055971%'
--AND le.Title LIKE '%Long Running Action%'
--AND REPLACE(a.Name,'.',' ') = 'TRITECH VISICAD AUTOMATICDISPATCHPROCESSOR'
--AND s.Name = 'ERROR'
--AND le.ExtendedProperties.exist('//*[text()[contains(.,sql:variable("@search_string"))]]') = 1
ORDER BY le.LogEntryTime;

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

CS requested all LogEvent table entires for a period of 2 hours from 1530 to 1730 on 2026-09-23. The output is 7215 rows of data

---

## Follow-Up Required

**Follow-Up Needed:** ☐ Yes | X No

**Due Date:**   
**Reason:**   

---

*Template version: Ad-Hoc Query v1.0 | Templater-compliant | ALX_Notes/Ad Hoc Statistics*


