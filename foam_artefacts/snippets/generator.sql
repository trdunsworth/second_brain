USE Reporting_System;
GO        

-- Create inline function for parsing elapsed time strings
IF OBJECT_ID('dbo.fn_ParseElapsedTime') IS NOT NULL
    DROP FUNCTION dbo.fn_ParseElapsedTime;
GO

CREATE FUNCTION dbo.fn_ParseElapsedTime(@elapsed_time NVARCHAR(50))
RETURNS INT
AS
BEGIN
    DECLARE @result INT;
    
    IF @elapsed_time IS NULL 
        RETURN NULL;
    
    IF LEN(@elapsed_time) - LEN(REPLACE(@elapsed_time, ':', '')) = 2
    BEGIN
        IF ISNUMERIC(SUBSTRING(@elapsed_time, 1, 2)) = 1 
           AND ISNUMERIC(SUBSTRING(@elapsed_time, 4, 2)) = 1 
           AND ISNUMERIC(LEFT(SUBSTRING(@elapsed_time, 7, 10), CHARINDEX('.', SUBSTRING(@elapsed_time, 7, 10) + '.') - 1)) = 1
        BEGIN
            SET @result = CAST(SUBSTRING(@elapsed_time, 1, 2) AS INT) * 3600 +
                         CAST(SUBSTRING(@elapsed_time, 4, 2) AS INT) * 60 +
                         CAST(LEFT(SUBSTRING(@elapsed_time, 7, 10), CHARINDEX('.', SUBSTRING(@elapsed_time, 7, 10) + '.') - 1) AS INT);
        END
        ELSE
            SET @result = -9999;
    END
    ELSE
    BEGIN
        IF ISNUMERIC(SUBSTRING(@elapsed_time, 1, 2)) = 1 
           AND ISNUMERIC(LEFT(SUBSTRING(@elapsed_time, 4, 10), CHARINDEX('.', SUBSTRING(@elapsed_time, 4, 10) + '.') - 1)) = 1
        BEGIN
            SET @result = CAST(SUBSTRING(@elapsed_time, 1, 2) AS INT) * 60 +
                         CAST(LEFT(SUBSTRING(@elapsed_time, 4, 10), CHARINDEX('.', SUBSTRING(@elapsed_time, 4, 10) + '.') - 1) AS INT);
        END
        ELSE
            SET @result = -9999;
    END
    
    RETURN @result;
END;
GO

DECLARE @year INT = 2026;
DECLARE @week INT = 21;
DECLARE @start_date DATE = DATEADD(WEEK, @week - 1, DATEADD(YEAR, @year - 1900, '1900-01-01'));
DECLARE @end_date DATE = DATEADD(DAY, 7, @start_date);

WITH CTE_disp AS (
	SELECT rmi.ID,
		rmi.Master_Incident_Number,
		rmi.Response_Date,
		rmi.Agency_Type,
		rmi.Jurisdiction,
		rmi.Problem,
		rmi.Priority_Number,
        rmi.MethodofCallRcvd,
		rmi.CallTaking_Performed_By,
		rmi.ClockStartTime,
		rmi.Time_PhonePickUp,
		rmi.Fixed_Time_PhonePickUp,
		rmi.Time_FirstCallTakingKeystroke,
		rmi.TimeCallViewed,
        rmi.Time_CallEnteredQueue,
		rmi.Fixed_Time_CallEnteredQueue,
		al.First_Queue_Time,
        rmi.Time_CallTakingComplete,
        rmi.Fixed_Time_CallTakingComplete,
        rmi.Time_First_Unit_Assigned,
        al.First_Dispatch_Time,
        al.First_Dispatcher_Init,
        p.Emp_Name,
        e.TimeFirstUnitDispatchAcknowledged,
        rmi.Time_First_Unit_Enroute,
        al.First_Enroute_Time,
        rmi.Time_First_Unit_Arrived,
        al.First_OnScene_Time,
        rmi.TimeFirstCallCleared,
        rmi.Fixed_Time_CallClosed,
        rmi.Time_CallClosed,
        al.First_Closed_Time,
        al.First_Reopen_Time,
        al.Final_Closed_Time,
        rmi.Call_Disposition,
        rmi.Elapsed_CallRcvd2InQueue,
        rmi.Elapsed_CallRcvd2CalTakDone,
        rmi.Elapsed_InQueue_2_FirstAssign,
        rmi.Elapsed_CallRcvd2FirstAssign,
        rmi.Elapsed_Assigned2FirstEnroute,
        rmi.Elapsed_Enroute2FirstAtScene,
        rmi.Elapsed_CallRcvd2CallClosed,
        dbo.fn_ParseElapsedTime(rmi.Elapsed_CallRcvd2InQueue) AS [Elapsed_PS_Queue],
        dbo.fn_ParseElapsedTime(rmi.Elapsed_CallRcvd2CalTakDone) AS [Elapsed_PS_CTD],
        dbo.fn_ParseElapsedTime(rmi.Elapsed_InQueue_2_FirstAssign) AS [Elapsed_Queue_Disp],
        dbo.fn_ParseElapsedTime(rmi.Elapsed_CallRcvd2FirstAssign) AS [Elapsed_Processing],
        dbo.fn_ParseElapsedTime(rmi.Elapsed_Assigned2FirstEnroute) AS [Elapsed_Rollout],
        dbo.fn_ParseElapsedTime(rmi.Elapsed_Enroute2FirstAtScene) AS [Elapsed_Transit],
        dbo.fn_ParseElapsedTime(rmi.Elapsed_CallRcvd2CallClosed) AS [Elapsed_Call_Time],
        -- Pre-calculate minimum times to avoid repetitive subqueries in main SELECT
        (SELECT MIN(t) FROM (VALUES (rmi.Response_Date), (rmi.ClockStartTime), (rmi.Time_PhonePickUp), (rmi.Fixed_Time_PhonePickUp)) AS times(t) WHERE t IS NOT NULL) AS Min_Start_Time,
        (SELECT MIN(t) FROM (VALUES (rmi.Time_CallEnteredQueue), (rmi.Fixed_Time_CallEnteredQueue), (al.First_Queue_Time)) AS times(t) WHERE t IS NOT NULL) AS Min_Queue_Time,
        (SELECT MIN(t) FROM (VALUES (rmi.Time_First_Unit_Assigned), (al.First_Dispatch_Time)) AS times(t) WHERE t IS NOT NULL) AS Min_Dispatch_Time,
        (SELECT MIN(t) FROM (VALUES (rmi.Time_CallTakingComplete), (rmi.Fixed_Time_CallTakingComplete)) AS times(t) WHERE t IS NOT NULL) AS Min_Phone_Stop_Time,
        (SELECT MIN(t) FROM (VALUES (rmi.Time_CallClosed), (rmi.Fixed_Time_CallClosed), (al.First_Closed_Time)) AS times(t) WHERE t IS NOT NULL) AS Min_Close_Time
    FROM Response_Master_Incident rmi 
        JOIN Response_Master_Incident_Ext e ON rmi.ID = e.Master_Incident_ID
        LEFT JOIN (
            SELECT 
                Master_Incident_ID,
                MIN(CASE WHEN Activity = 'Incident in Waiting Queue' THEN Date_Time END) AS First_Queue_Time,
                MIN(CASE WHEN Activity = 'Dispatched' THEN Date_Time END) AS First_Dispatch_Time,
                MIN(CASE WHEN Activity = 'En Route' THEN Date_Time END) AS First_Enroute_Time,
                MIN(CASE WHEN Activity = 'On Scene' THEN Date_Time END) AS First_OnScene_Time,
                MIN(CASE WHEN Activity = 'Response Closed' THEN Date_Time END) AS First_Closed_Time,
                MAX(CASE WHEN Activity = 'Response Closed' THEN Date_Time END) AS Final_Closed_Time,
                MIN(CASE WHEN Activity = 'Incident Reopen' THEN Date_Time END) AS First_Reopen_Time,
                MIN(CASE WHEN Activity = 'Dispatched' THEN Dispatcher_Init END) AS First_Dispatcher_Init
            FROM Activity_Log
            GROUP BY Master_Incident_ID
        ) al ON rmi.ID = al.Master_Incident_ID
        LEFT JOIN Personnel p ON al.First_Dispatcher_Init = p.Emp_ID
    WHERE DATEPART(WEEK, Response_Date) = @week
    AND DATEPART(YEAR, Response_Date) = @year
    AND ((al.First_Dispatch_Time IS NOT NULL) OR (al.First_Dispatch_Time != ''))
)

SELECT Master_Incident_Number,
    Response_Date,
    CAST(DATEPART(WEEK, Response_Date) AS NVARCHAR(2)) AS [WeekNo],
    UPPER(FORMAT(Response_Date, 'ddd')) AS [DOW],
    CAST(DATEPART(DAY, Response_Date) AS NVARCHAR(2)) AS [Day],
    CAST(DATEPART(Hour, Response_Date) AS NVARCHAR(2)) AS [Hour],
    CASE
        WHEN @week % 2 = 0 AND FORMAT(Response_Date, 'ddd') IN ('MON', 'TUE', 'FRI', 'SAT') THEN 
            CASE 
                WHEN DATEPART(HOUR, Response_Date) BETWEEN 6 AND 18 THEN 'A'
                ELSE 'C'
            END
        WHEN @week % 2 = 0 AND FORMAT(Response_Date, 'ddd') NOT IN ('MON', 'TUE', 'FRI', 'SAT') THEN 
            CASE 
                WHEN DATEPART(HOUR, Response_Date) BETWEEN 6 AND 18 THEN 'B'
                ELSE 'D'
            END
        WHEN @week % 2 != 0 AND FORMAT(Response_Date, 'ddd') IN ('MON', 'TUE', 'FRI', 'SAT') THEN
            CASE
                WHEN DATEPART(HOUR, Response_Date) BETWEEN 6 AND 18 THEN 'B'
                ELSE 'D'
            END
        WHEN @week % 2 != 0 AND FORMAT(Response_Date, 'ddd') NOT IN ('MON', 'TUE', 'FRI', 'SAT') THEN 
            CASE 
                WHEN DATEPART(HOUR, Response_Date) BETWEEN 6 AND 18 THEN 'A'
                ELSE 'C'
            END
        ELSE NULL
    END AS [Shift],
    CASE 
        WHEN DATEPART(HOUR, Response_Date) BETWEEN 6 AND 18 THEN 'DAY'
        ELSE 'NIGHT'
    END AS  [Day_Night],
    CASE
        WHEN DATEPART(HOUR, Response_Date) IN (6,7,8,9,18,19,20,21) THEN 'EARLY'
        WHEN DATEPART(HOUR, Response_Date) IN (2,3,4,5,14,15,16,17) THEN 'LATE'
        ELSE 'MIDS'
    END AS [ShiftPart],
    CASE
        WHEN Agency_Type = 'LAW' THEN 'POLICE'
		WHEN Agency_Type = 'FIRE' AND (Problem LIKE ('%ALS%') OR Problem LIKE ('%BLS%') OR Problem IN ('CONSTRUCTION SITE INJURY','PSYCHIATRIC EMERGENCY VIOLENT','PUBLIC SERVICE EMS', 'MUTUAL CPR')) THEN 'EMS'
        WHEN Agency_Type = 'FIRE' AND NOT (Problem LIKE ('%ALS%') OR Problem LIKE ('%BLS%') OR Problem IN ('CONSTRUCTION SITE INJURY','PSYCHIATRIC EMERGENCY VIOLENT','PUBLIC SERVICE EMS')) THEN 'FIRE'
		ELSE 'DECC'
	END AS [Agency],
    Problem,
    Priority_Number,
    CASE
		WHEN MethodofCallRcvd IS NULL AND Problem LIKE 'MUTUAL%' THEN 'C2C'
		WHEN MethodofCallRcvd IS NULL AND Problem IN ('TRAFFIC STOP', 'OCCUPIED VEHICLE CHECK', 'SUBJECT STOP', 'FLAG DOWN') THEN 'OFFICER'
		WHEN MethodofCallRcvd IS NULL AND Problem NOT IN ('TRAFFIC STOP', 'OCCUPIED VEHICLE CHECK', 'SUBJECT STOP', 'FLAG DOWN') THEN 'NOT CAPTURED'
		ELSE MethodOfCallRcvd
	END AS [Call_Reception],
	CASE
		WHEN CallTaking_Performed_By IS NULL AND Problem LIKE 'MUTUAL%' THEN 'C2C'
		ELSE CallTaking_Performed_By
	END AS [Call_Taker],
    CASE
        WHEN First_Dispatcher_Init IS NULL AND Problem LIKE 'MUTUAL%' THEN 'C2C'
        WHEN First_Dispatcher_Init IS NULL AND Problem NOT LIKE 'MUTUAL%' THEN 'NOT CAPTURED'
        ELSE Emp_Name
    END AS [Dispatcher],
    Min_Start_Time AS [Incident_Start_Time],
    TimeCallViewed,
    Min_Queue_Time AS [Incident_Queue_Time],
    DATEDIFF(SECOND, Min_Start_Time, Min_Queue_Time) AS [Time_To_Queue],
    --Elapsed_CallRcvd2InQueue,
    Elapsed_PS_Queue,
    (DATEDIFF(SECOND, Min_Start_Time, Min_Queue_Time) - ISNULL(Elapsed_PS_Queue, 0)) AS [Time_To_Queue_Diff],
    Min_Dispatch_Time AS [Incident_Dispatch_Time],
    DATEDIFF(SECOND, Min_Queue_Time, Min_Dispatch_Time) AS [Time_To_Dispatch],
    --Elapsed_InQueue_2_FirstAssign,
    Elapsed_Queue_Disp,
    DATEDIFF(SECOND, Min_Queue_Time, Min_Dispatch_Time) - ISNULL(Elapsed_Queue_Disp, 0) AS [Time_To_Disp_Diff],
    Min_Phone_Stop_Time AS [Incident_Phone_Stop],
    DATEDIFF(SECOND,
        (SELECT MIN(start_time) 
        FROM (VALUES 
            (Response_Date),
            (ClockStartTime),
            (Time_PhonePickUp),
            (Fixed_Time_PhonePickUp)
        ) AS start_times(start_time)
        WHERE start_time IS NOT NULL
        ),
        (SELECT MIN(phone_stop)
        FROM (VALUES
            (Time_CallTakingComplete),
            (Fixed_Time_CallTakingComplete)
        ) AS phone_stops(phone_stop)
        WHERE phone_stop IS NOT NULL
        )
    ) AS [Phone_Time],
    --Elapsed_CallRcvd2CalTakDone,
    Elapsed_PS_CTD,
    DATEDIFF(SECOND,
        (SELECT MIN(start_time) 
        FROM (VALUES 
            (Response_Date),
            (ClockStartTime),
            (Time_PhonePickUp),
            (Fixed_Time_PhonePickUp)
        ) AS start_times(start_time)
        WHERE start_time IS NOT NULL
        ),
        (SELECT MIN(phone_stop)
        FROM (VALUES
            (Time_CallTakingComplete),
            (Fixed_Time_CallTakingComplete)
        ) AS phone_stops(phone_stop)
        WHERE phone_stop IS NOT NULL
        )
    ) - ISNULL(Elapsed_PS_CTD, 0) AS [Phone_Time_Diff],
    TimeFirstUnitDispatchAcknowledged,
    DATEDIFF(SECOND,
        (SELECT MIN(start_time) 
        FROM (VALUES 
            (Response_Date),
            (ClockStartTime),
            (Time_PhonePickUp),
            (Fixed_Time_PhonePickUp)
        ) AS start_times(start_time)
        WHERE start_time IS NOT NULL
        ),
        (SELECT MIN(dispatch_time)
        FROM (VALUES
            (Time_First_Unit_Assigned),
            (First_Dispatch_Time)
        ) AS dispatch_times(dispatch_time)
        WHERE dispatch_time IS NOT NULL
        )) AS [Processing_Time],
    --Elapsed_InQueue_2_FirstAssign,
    Elapsed_Processing,
    DATEDIFF(SECOND,
        (SELECT MIN(start_time) 
        FROM (VALUES 
            (Response_Date),
            (ClockStartTime),
            (Time_PhonePickUp),
            (Fixed_Time_PhonePickUp)
        ) AS start_times(start_time)
        WHERE start_time IS NOT NULL
        ),
        (SELECT MIN(dispatch_time)
        FROM (VALUES
            (Time_First_Unit_Assigned),
            (First_Dispatch_Time)
        ) AS dispatch_times(dispatch_time)
        WHERE dispatch_time IS NOT NULL
        ))  - ISNULL(Elapsed_Processing, 0) AS [Diff_Proc_Time],
    (SELECT MIN(enroute_time)
    FROM (VALUES
        (Time_First_Unit_Enroute),
        (First_Enroute_Time)
    ) AS enroute_times(enroute_time)
    WHERE enroute_time IS NOT NULL
    ) AS [Incident_Enroute_Time],
    DATEDIFF(SECOND,
        (SELECT MIN(dispatch_time)
        FROM (VALUES
            (Time_First_Unit_Assigned),
            (First_Dispatch_Time)
        ) AS dispatch_times(dispatch_time)
        WHERE dispatch_time IS NOT NULL
        ),
        (SELECT MIN(enroute_time)
    FROM (VALUES
        (Time_First_Unit_Enroute),
        (First_Enroute_Time)
    ) AS enroute_times(enroute_time)
    WHERE enroute_time IS NOT NULL
    )) AS [Rollout_Time],
    --Elapsed_CallRcvd2FirstAssign,
    Elapsed_Rollout,
    DATEDIFF(SECOND,
        (SELECT MIN(dispatch_time)
        FROM (VALUES
            (Time_First_Unit_Assigned),
            (First_Dispatch_Time)
        ) AS dispatch_times(dispatch_time)
        WHERE dispatch_time IS NOT NULL
        ),
        (SELECT MIN(enroute_time)
    FROM (VALUES
        (Time_First_Unit_Enroute),
        (First_Enroute_Time)
    ) AS enroute_times(enroute_time)
    WHERE enroute_time IS NOT NULL
    )) - ISNULL(Elapsed_Rollout, 0) AS [Diff_Rollout_Time],
    (SELECT MIN(arrival_time)
    FROM (VALUES
        (Time_First_Unit_Arrived),
        (First_OnScene_Time)
    ) AS arrival_times(arrival_time)
    WHERE arrival_time IS NOT NULL
    ) AS [Incident_Arrival_Time],
    DATEDIFF(SECOND,
        (SELECT MIN(enroute_time)
        FROM (VALUES
            (Time_First_Unit_Enroute),
            (First_Enroute_Time)
        ) AS enroute_times(enroute_time)
        WHERE enroute_time IS NOT NULL
        ),
        (SELECT MIN(arrival_time)
    FROM (VALUES
        (Time_First_Unit_Arrived),
        (First_OnScene_Time)
    ) AS arrival_times(arrival_time)
    WHERE arrival_time IS NOT NULL
    )) AS [Transit_Time],
    --Elapsed_Assigned2FirstEnroute,
    Elapsed_Transit,
    DATEDIFF(SECOND,
        (SELECT MIN(enroute_time)
        FROM (VALUES
            (Time_First_Unit_Enroute),
            (First_Enroute_Time)
        ) AS enroute_times(enroute_time)
        WHERE enroute_time IS NOT NULL
        ),
        (SELECT MIN(arrival_time)
    FROM (VALUES
        (Time_First_Unit_Arrived),
        (First_OnScene_Time)
    ) AS arrival_times(arrival_time)
    WHERE arrival_time IS NOT NULL
    )) - ISNULL(Elapsed_Transit, 0) AS [Diff_Transit_Time],
    TimeFirstCallCleared,
    (SELECT MIN(first_close)
    FROM (VALUES
        (Time_CallClosed),
        (Fixed_Time_CallClosed),
        (First_Closed_Time)
    ) AS first_closes(first_close)
    WHERE first_close IS NOT NULL
    ) AS [Incident_First_Close_Time],
    CASE 
        WHEN First_Reopen_Time IS NOT NULL THEN 1 
        ELSE 0 
    END AS [Call_Reopened],
    First_Reopen_Time,
    Final_Closed_Time,
    DATEDIFF(SECOND,
        (SELECT MIN(start_time) 
        FROM (VALUES 
            (Response_Date),
            (ClockStartTime),
            (Time_PhonePickUp),
            (Fixed_Time_PhonePickUp)
        ) AS start_times(start_time)
        WHERE start_time IS NOT NULL
        ),
        (SELECT MIN(first_close)
        FROM (VALUES
            (Time_CallClosed),
            (Fixed_Time_CallClosed),
            (First_Closed_Time)
        ) AS first_closes(first_close)
        WHERE first_close IS NOT NULL
        )) AS [Total_Call_Time],
    --Elapsed_Enroute2FirstAtScene,
    Elapsed_Call_Time,
    DATEDIFF(SECOND,
        (SELECT MIN(start_time) 
        FROM (VALUES 
            (Response_Date),
            (ClockStartTime),
            (Time_PhonePickUp),
            (Fixed_Time_PhonePickUp)
        ) AS start_times(start_time)
        WHERE start_time IS NOT NULL
        ),
        (SELECT MIN(first_close)
        FROM (VALUES
            (Time_CallClosed),
            (Fixed_Time_CallClosed),
            (First_Closed_Time)
        ) AS first_closes(first_close)
        WHERE first_close IS NOT NULL
        )) - ISNULL(Elapsed_Call_Time, 0) AS [Diff_Total_Call_Time],
    --Elapsed_CallRcvd2CallClosed,
    ISNULL(Call_Disposition, 'UNDEFINED') AS [Disposition]
FROM CTE_disp
ORDER BY Response_Date;
