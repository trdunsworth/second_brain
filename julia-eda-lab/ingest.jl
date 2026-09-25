# ingest.jl — CSV → typed DataFrame + validation helpers.
# Promoted from julia_notes.md §5.1. Pure DataFrames/CSV/Dates.
using DataFrames, CSV, Dates

const DEFAULT_EVENT_DATETIME_COLS = [
    :call_start_time, :incident_start_time, :time_phone_pickup,
    :time_first_unit_assigned, :time_unit_arrived, :time_call_closed,
]

"""Try several datetime formats on a string column; return parsed vector or original."""
function _parse_datetime_col(col::AbstractVector, formats=("m/d/y H:M", "y-m-d H:M:S", "y-m-d H:M", "m/d/Y H:M"))
    vals = string.(coalesce.(col, ""))
    for fmt in formats
        try
            return DateTime.(vals, fmt)
        catch
            continue
        end
    end
    return col  # leave untouched if no format matches
end

"""
    load_events(path; datetime_cols=DEFAULT_EVENT_DATETIME_COLS) -> DataFrame

Read an event-level CSV, parse known datetime columns, and derive
`date`, `dow` (abbrev Sun..Sat), `hour` (floored), and `zip5`.
"""
function load_events(path::AbstractString; datetime_cols=DEFAULT_EVENT_DATETIME_COLS)
    df = CSV.read(path, DataFrame)
    for c in datetime_cols
        sc = string(c)
        col = Symbol(sc) in names(df) ? Symbol(sc) : (sc in names(df) ? sc : nothing)
        isnothing(col) && continue
        if eltype(df[!, col]) <: AbstractString || eltype(df[!, col]) <: Union{Missing,AbstractString}
            parsed = _parse_datetime_col(df[!, col])
            parsed isa AbstractVector{<:DateTime} && (df[!, col] = parsed)
        end
    end
    if "call_start_time" in names(df) || :call_start_time in names(df)
        cst = :call_start_time in names(df) ? df[!, :call_start_time] : df[!, "call_start_time"]
        if eltype(cst) <: Union{Missing,DateTime,Date}
            df[!, :date] = Date.(coalesce.(cst, DateTime(2000)))
            dows = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
            df[!, :dow] = [ismissing(t) ? missing : dows[dayofweek(Date(t))] for t in cst]
            df[!, :hour] = floor.(coalesce.(cst, DateTime(2000)), Hour(1))
        end
    end
    for zc in ("postal_code", "zip", "ZIP")
        if zc in names(df)
            df[!, :zip5] = first.(string.(coalesce.(df[!, zc], "")), 5)
            break
        end
    end
    return df
end

"""
    load_hourly(path; hour_col="hour_start") -> DataFrame

Read an already-aggregated hourly CSV and parse its hour column.
"""
function load_hourly(path::AbstractString; hour_col="hour_start")
    df = CSV.read(path, DataFrame)
    if hour_col in names(df)
        col = df[!, hour_col]
        if !(eltype(col) <: Union{Missing,DateTime,Date})
            df[!, hour_col] = _parse_datetime_col(col)
        end
        sort!(df, hour_col)
    end
    return df
end

"""
    ensure_regular_hours(df, hourcol, valuecol) -> DataFrame

Fill gaps in an hourly series with 0 so models see regular spacing.
Returns columns `[hourcol, valuecol]` sorted.
"""
function ensure_regular_hours(df::DataFrame, hourcol::Symbol, valuecol::Symbol)
    @assert hourcol in Symbol.(names(df)) "hour column $hourcol not found"
    hrs = minimum(df[!, hourcol]):Hour(1):maximum(df[!, hourcol])
    base = DataFrame(hourcol => collect(hrs))
    rename!(base, string(hourcol) => string(hourcol))
    out = leftjoin(base, df[:, [string(hourcol), string(valuecol)]], on=string(hourcol))
    out[!, string(valuecol)] = coalesce.(out[!, string(valuecol)], 0)
    sort!(out, string(hourcol))
    return out
end
