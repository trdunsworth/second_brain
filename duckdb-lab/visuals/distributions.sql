-- distributions.sql — histogram / density / boxplot trio.
-- Run one per numeric column during Phase 1 EDA.
SELECT dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW histogram
SETTING binwidth => 10
LABEL title => 'Dispatch Queue Time (histogram)';

SELECT dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE dispatch_queue_seconds AS x
DRAW density
LABEL title => 'Dispatch Queue Time (density)';

SELECT shift_label, dispatch_queue_seconds FROM ev WHERE dispatch_queue_seconds IS NOT NULL
VISUALISE shift_label AS x, dispatch_queue_seconds AS y, shift_label AS fill
DRAW boxplot
LABEL title => 'Dispatch Queue Time by Shift';
