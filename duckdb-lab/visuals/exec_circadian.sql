-- exec_circadian.sql — executive demand curve.
SELECT EXTRACT(HOUR FROM hour_start)::INT AS hod, AVG(nine_one_one_calls_received) AS mean_calls
FROM ph GROUP BY 1
VISUALISE hod AS x, mean_calls AS y
DRAW line
LABEL title => 'Mean 9-1-1 Call Volume by Hour', x => 'Hour', y => 'Calls (mean)';
