-- forecast_overlay.sql — time-series displays (ggsql draws; DuckDB/Python fit).
-- Requires hourly view + hod band table from sql/timeseries.sql.
SELECT CAST(hour AS DATE) AS day, SUM(ncalls) AS n FROM hourly GROUP BY 1
VISUALISE day AS x, n AS y
DRAW line
LABEL title => 'Daily Call Volume', x => 'Date', y => 'Calls';

SELECT hod, mean_n, lo, hi FROM (
    SELECT EXTRACT(HOUR FROM hour)::INT AS hod, AVG(ncalls) AS mean_n,
           AVG(ncalls) - 2 * STDDEV(ncalls) AS lo,
           AVG(ncalls) + 2 * STDDEV(ncalls) AS hi
    FROM hourly GROUP BY 1
)
VISUALISE hod AS x, mean_n AS y
DRAW line
DRAW ribbon
MAPPING ymin => lo, ymax => hi
LABEL title => 'Circadian Volume with ±2σ Band', x => 'Hour', y => 'Calls';

-- Actual vs forecast overlay (forecasts exported from seasonal-naive / ETS / SARIMA)
SELECT day, n, 'actual' AS series FROM daily_actual
UNION ALL
SELECT day, n, 'forecast' AS series FROM daily_forecast
VISUALISE day AS x, n AS y, series AS color
DRAW line
LABEL title => 'Actual vs 7-Day Forecast';

-- Seasonal shape panels (circadian stability check)
SELECT dow, EXTRACT(HOUR FROM hour)::INT AS hod, AVG(ncalls) AS mean_n
FROM (SELECT *, CASE EXTRACT(DOW FROM hour)
        WHEN 0 THEN 'Sun' WHEN 1 THEN 'Mon' WHEN 2 THEN 'Tue'
        WHEN 3 THEN 'Wed' WHEN 4 THEN 'Thu' WHEN 5 THEN 'Fri'
        WHEN 6 THEN 'Sat' END AS dow FROM hourly) s
GROUP BY 1, 2
VISUALISE hod AS x, mean_n AS y
DRAW line
FACET dow
LABEL title => 'Circadian Shape by Day of Week';
