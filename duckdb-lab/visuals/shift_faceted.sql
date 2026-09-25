-- shift_faceted.sql — faceted distributions + violin overlap + NFPA reference layer.
SELECT shift_label, dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW histogram
FACET shift_label
LABEL title => 'Dispatch Queue Time by Shift (faceted)';

SELECT agency, total_elapsed_seconds FROM ev WHERE total_elapsed_seconds IS NOT NULL
VISUALISE agency AS x, total_elapsed_seconds AS y, agency AS fill
DRAW violin
DRAW point
SETTING position => 'jitter'
LABEL title => 'Total Elapsed Time by Agency';

SELECT interview_seconds, dispatch_queue_seconds, agency FROM ev
WHERE interview_seconds IS NOT NULL AND dispatch_queue_seconds IS NOT NULL
VISUALISE interview_seconds AS x, dispatch_queue_seconds AS y, agency AS color
DRAW point
DRAW smooth
DRAW rule
SETTING y => 64
LABEL title => 'Interview vs Queue (NFPA 64s reference)';
