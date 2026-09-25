-- ops_heatmap.sql — compliance heatmap + daily bar with NENA reference.
SELECT dow, EXTRACT(HOUR FROM hour_start)::INT AS hod, AVG(nine_one_one_answered_20s_pct) AS compliance
FROM ph GROUP BY 1, 2
VISUALISE hod AS x, dow AS y, compliance AS fill
DRAW tile
SCALE fill CONTINUOUS
LABEL title => '9-1-1 Answered <=20s (%) by Day/Hour';

SELECT CAST(hour_start AS DATE) AS day, AVG(nine_one_one_answered_20s_pct) AS compliance
FROM ph GROUP BY 1
VISUALISE day AS x, compliance AS y
DRAW bar
DRAW rule
SETTING y => 90
LABEL title => 'Daily 20s Compliance (NENA 90% line)', y => 'Compliance %';
