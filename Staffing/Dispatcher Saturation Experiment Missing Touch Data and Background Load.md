# Dispatcher Saturation Experiment: Missing Touch Data and Background Load

*Design note. Status: proposed, pre-implementation. Companion to the staffing-model evaluation design (SynthCCD demand layer + independent DES).*

## 1. Context and constraints

The goal is to measure and forecast dispatcher saturation (the number of calls or incidents a dispatcher must attend to at any point, in hourly blocks) as a function of events generated in the center, using SynthCCD's event generator plus real-data calibration. Conventional call-center staffing models do not fit because a dispatcher holds many incidents at once and each needs attention in bursts.

Two data constraints shape the design:

- Real CAD data may not record per-incident dispatcher touches.
- Radio logs may capture traffic that is not attached to any incident, for example a unit going into or out of service.

A per-incident touch model therefore cannot be calibrated directly, and total dispatcher load contains a component that incident counts alone do not explain.

*Caveat: statements about SynthCCD behavior come from its README and realism guide, not its source code, and should be confirmed in the source.*

## 2. Split the workload into two sources

- **Incident-attached work:** tasks tied to an incident's lifecycle (dispatch, acknowledgements, arrival, follow-ups, clearing).
- **Background work:** unit status changes, shift sign-on and sign-off, meal breaks, record checks, unit-initiated activity, and other traffic. Its intensity should track units on duty and time of day (with spikes at shift change), not incident arrivals.

**Consequence for the research question.** Dispatchers needed is not a function of events alone. It is closer to:

`c*(h) = f(event-driven load) + g(units on duty, hour)`

A forecast built only from event counts will systematically under-predict at quiet hours, where background work is a larger share of the total. Report the event-driven component as a partial effect, not the whole requirement.

**Implementation.** SynthCCD has no background traffic, so add it as an exogenous task stream in the DES. It needs units-on-duty as an input. SynthCCD's officer-initiated and radio-received incidents (the "OFFICER" and "Radio" reception types, about 20% by default) are self-initiated work that also generates radio traffic, so check how they behave in the source.

## 3. Calibrate by decomposing aggregate radio load

If radio logs give timestamps and durations by channel, traffic does not need to be attached to incidents. Treat the radio logs as an aggregate measurement:

1. Compute transmissions or airtime per channel per 5-minute interval.
2. Regress that on incident-derived covariates: counts of incidents in each lifecycle phase, unit status changes, and units on duty. Use a count or airtime model (Poisson or negative binomial, or non-negative least squares).
3. Read the phase coefficients as per-incident traffic by phase, and the intercept plus on-duty-units terms as background load.

**Pitfalls**

- **Collinearity:** lifecycle phases lag one another. Use a distributed-lag basis, regularization, or non-negativity constraints.
- **Silent status changes:** status changes made from mobile terminals may involve no voice traffic. CAD status events therefore overstate voice load and should not be treated as touches.
- **Matching as a diagnostic:** if some transmissions can be matched to incidents by unit ID and time window, the unmatched share gives a lower bound on background load.

## 4. Use observable outcomes to locate saturation

CAD still records the queue-to-dispatch interval, so the performance layer survives. Look for the knee in dispatch delay against load proxies:

- Concurrent active incidents per dispatcher, by discipline.
- Radio channel occupancy. A single-talker channel is a physical constraint, and a busy channel is a real queue.
- Pending dispatch queue length at arrival.

Condition on staffing, since managers staff to anticipated demand. Dispatchers may also be loaded by phone and CAD entry, especially in small centers with cross-trained roles, so treat the dispatcher pool as shared where that applies.

## 5. Changes to the experiment

- **Background share as a nuisance parameter:** sweep background load from about 10% to 50% of total radio workload and report how c\* shifts.
- **Attachment-rate scenarios:** vary how much traffic is assumed attributable to incidents (for example 50% to 90%) and test whether the estimator still separates background from incident-driven load. This is the recovery study applied to the data limitation.
- **Fallback if there are no usable radio logs:** hand-code a sample of roughly 100 to 200 incidents from audio, or run a short time-and-motion observation, to get per-phase task counts. Alternatively elicit them from experienced dispatchers and treat them as sweeps. The saturation knee still comes from CAD delays.

## 6. Open question

- Are the radio logs available as push-to-talk metadata (timestamp, duration, channel, unit ID), or only as audio? This decides whether the decomposition in section 3 is possible or whether the hand-coded sample is needed.
