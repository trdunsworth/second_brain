-- outliers.sql — IQR + Z + MAD + p01/p99 flags, votes, consensus.
-- Requires: ev view. Promoted from duckdb_notes.md §5.4.
CREATE OR REPLACE VIEW ev_outliers AS
WITH q AS (
    SELECT QUANTILE(dispatch_queue_seconds, 0.25) AS q1,
           QUANTILE(dispatch_queue_seconds, 0.75) AS q3,
           MEDIAN(dispatch_queue_seconds) AS med,
           AVG(dispatch_queue_seconds) AS mu,
           STDDEV(dispatch_queue_seconds) AS sigma,
           QUANTILE(dispatch_queue_seconds, 0.01) AS p01,
           QUANTILE(dispatch_queue_seconds, 0.99) AS p99
    FROM ev WHERE dispatch_queue_seconds IS NOT NULL
),
mad AS (
    SELECT MEDIAN(ABS(dispatch_queue_seconds - q.med)) AS mad_v FROM ev, q
    WHERE dispatch_queue_seconds IS NOT NULL
)
SELECT ev.*,
       ((dispatch_queue_seconds < q.q1 - 1.5 * (q.q3 - q.q1)) OR
        (dispatch_queue_seconds > q.q3 + 1.5 * (q.q3 - q.q1)))::INT AS f_iqr,
       (ABS((dispatch_queue_seconds - q.mu) / NULLIF(q.sigma, 0)) > 3)::INT AS f_z,
       (ABS(0.6745 * (dispatch_queue_seconds - q.med) / NULLIF(mad.mad_v, 0)) > 3.5)::INT AS f_mad,
       ((dispatch_queue_seconds < q.p01) OR (dispatch_queue_seconds > q.p99))::INT AS f_p01_99
FROM ev, q, mad;

-- Vote distribution (consensus = votes >= 2)
SELECT f_iqr + f_z + f_mad + f_p01_99 AS votes, COUNT(*) AS n
FROM ev_outliers GROUP BY 1 ORDER BY 1;

-- Consensus outliers by shift (where to look first)
SELECT shift_label, COUNT(*) AS consensus_n
FROM ev_outliers
WHERE f_iqr + f_z + f_mad + f_p01_99 >= 2
GROUP BY shift_label ORDER BY consensus_n DESC;
