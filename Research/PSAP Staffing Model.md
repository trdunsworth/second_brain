---
type: research-project
topic: "PSAP Staffing Model: Replacing Erlang-C and Erlang-A"
hypothesis: "A queueing-game model or hybrid approach can outperform traditional Erlang-C and Erlang-A models for 9-1-1 center staffing"
methodology: "Queueing theory, simulation, comparative analysis"
data_source: "9-1-1 call center operational data"
start_date: "2026-09-02"
end_date: 
status: "In Progress"
tags:
  - research
  - project
  - queueing
  - erlang
  - staffing
  - 911
  - psap
---

# PSAP Staffing Model: Replacing Erlang-C and Erlang-A

## Research Question

Can a queueing-game model or hybrid approach provide more accurate staffing recommendations for 9-1-1 Public Safety Answering Points (PSAPs) than the traditional Erlang-C and Erlang-A models currently in use?

## Hypothesis

**Queueing-game models or hybrid approaches will outperform Erlang-C and Erlang-A** for PSAP staffing because they better capture:
- Caller abandonment behavior (Erlang-A addresses this but with limitations)
- Strategic interactions between callers and agents
- Non-stationary arrival rates
- Skill-based routing complexities
- Service level agreement (SLA) constraints

## Background & Motivation

### The Erlang Problem in 9-1-1

The Erlang-C model, developed in 1917 for telephone traffic, assumes:
- Poisson arrivals
- Exponential service times
- No caller abandonment
- Infinite caller patience
- Single skill level

**Erlang-A** adds abandonment but still assumes:
- Linear patience distribution
- Poisson arrivals
- No strategic caller behavior

Neither model adequately captures:
- **Polystochastic arrival patterns** in 9-1-1 (multiple independent drivers)
- **Time-varying service times** (routine vs. critical calls)
- **Caller strategic behavior** (redialing, abandoning and calling back)
- **Cross-training and skill-based routing** effects
- **Global SLA constraints** across multiple periods

### Why Current Models Fail

Dr. Robbins' research (2006-2019) demonstrated that:
1. Erlang-C fit degrades significantly with caller abandonment
2. Arrival rate uncertainty compounds staffing errors
3. Erlang-A performs better in high-traffic scenarios but still has limitations
4. Cross-training and flexible staffing can compensate for model errors

## Data

### Source
- 9-1-1 PSAP call detail records (CDR)
- Agent scheduling data
- Service level observations

### Variables
- **Arrival rates** (hourly, by day-of-week)
- **Service times** (answer time, talk time, post-call work)
- **Abandonment rates** and patience distributions
- **Agent skills** and cross-training levels
- **SLA targets** (e.g., 90% answered in 20 seconds)

### Time Period
- Minimum: 1 year of historical data
- Preferred: 2-3 years for seasonal patterns
- Exclude COVID-19 anomalous period (2020-2021)

### Preprocessing
- [ ] Aggregate to hourly intervals
- [ ] Classify call types (routine, emergency, admin)
- [ ] Calculate abandonment distributions
- [ ] Identify service time distributions by call type
- [ ] Map agent skills and availability

## Methodology

### Approach 1: Queueing-Game Model

**Wang Jinting's Queueing-Game Framework** models strategic interactions between:
- **Callers**: Choose when to call, whether to abandon, whether to redial
- **System**: Allocates agents, sets routing rules

Key parameters:
- Caller patience distribution (non-linear)
- Redial probability
- Strategic response to queue position information
- Agent allocation strategy

### Approach 2: Enhanced Erlang-A with Corrections

Improve Erlang-A by:
- Adding arrival rate uncertainty corrections (per Robbins 2006-2010)
- Incorporating non-linear patience distributions
- Adding cross-training effects
- Including global SLA constraints

### Approach 3: Simulation-Based Optimization

Build discrete-event simulation of PSAP operations:
- Model actual arrival patterns (non-Poisson)
- Model actual service time distributions (non-exponential)
- Test staffing levels against SLA targets
- Optimize via simulation-based optimization

### Evaluation Metrics

| Metric | Description |
|--------|-------------|
| Staffing Accuracy | Predicted vs. optimal staffing level |
| SLA Achievement | % calls answered within target time |
| Abandonment Rate | % callers who hang up |
| Agent Utilization | % time agents are busy |
| Cost Efficiency | Staffing cost per call handled |

### Validation Strategy
- Backtest against historical staffing decisions
- Compare predicted vs. actual SLA achievement
- Cross-validation across different time periods
- Sensitivity analysis on key parameters

## Analysis Plan

- [ ] Step 1: Collect and preprocess 9-1-1 call data
- [ ] Step 2: Characterize arrival patterns and service time distributions
- [ ] Step 3: Implement baseline Erlang-C and Erlang-A models
- [ ] Step 4: Implement queueing-game model (Wang Jinting framework)
- [ ] Step 5: Implement enhanced Erlang-A with Robbins' corrections
- [ ] Step 6: Build discrete-event simulation of PSAP operations
- [ ] Step 7: Run comparative analysis across all models
- [ ] Step 8: Test sensitivity to arrival rate uncertainty
- [ ] Step 9: Evaluate cross-training and skill-based routing effects
- [ ] Step 10: Document findings and recommendations

## Progress Log

### 2026-09-02
- Created research project
- Defined research question and hypothesis
- Outlined methodology and analysis plan
- Identified key source materials (Robbins, Wang)

## Results

### Summary Statistics
<!-- To be filled after analysis -->

### Key Findings
<!-- To be filled after analysis -->

1. 
2. 
3. 

### Visualizations
<!-- Staffing comparison charts, SLA achievement plots -->

## Interpretation

<!-- What do the results mean for 9-1-1 operations? -->

## Conclusions

<!-- Final takeaways and implications for PSAP staffing -->

## Limitations & Future Work

- [ ] Data availability and quality constraints
- [ ] Model complexity vs. implementation feasibility
- [ ] Real-time adaptation capabilities
- [ ] Multi-site PSAP coordination
- [ ] Integration with workforce management systems

### Considerations & Extensions

**Caller Strategic Behavior:** Queueing-game models capture caller decisions (abandon, redial, wait) as strategic choices. This is particularly relevant for 9-1-1 where callers may have urgent needs but also limited patience.

**Arrival Rate Uncertainty:** Robbins' work shows that arrival rate uncertainty has a compounding effect on staffing errors. Consider robust optimization approaches that account for this uncertainty.

**Cross-Training Effects:** Flexible agents who can handle multiple call types provide a buffer against model errors. The staffing model should account for this flexibility value.

**Global SLA Constraints:** Real PSAPs have SLAs that span multiple time periods. The model should optimize staffing across these constraints, not just for individual periods.

## Connections

- [[168-Point Forecast Comparison - Discrete vs Continuous]]
- [[Research Note]]
- [[Research Project]]
- [Douglas County 9-1-1](https://www.dgcoks.gov/emergency-communications-911)

## References

### Erlang Model Foundations
1. Erlang, A.K. (1917). Solution of some problems in the theory of probabilities of significance in automatic telephone exchanges. *The Post Office Electrical Engineers Journal*, 10, 189-197.
2. Aksin, Z., Armony, M., & Mehrotra, V. (2007). The Modern Call-Center: A Multi-Disciplinary Perspective on Operations Management Research. *Production and Operations Management*, 16(6), 665-688.
3. Gans, N., Koole, G., & Mandelbaum, A. (2003). Telephone call centers: Tutorial, review, and research prospects. *Manufacturing & Service Operations Management*, 5(2), 79-141.
4. Brown, L., Gans, N., Mandelbaum, A., et al. (2005). Statistical Analysis of a Telephone Call Center: A Queueing-Science Perspective. *Journal of the American Statistical Association*, 100, 36-50.

### Robbins' Call Center Research
5. Robbins, T.R., D.J. Medeiros, and P. Dum. (2006) *Evaluating Arrival Rate Uncertainty in Call Centers* in *Proceedings of the 2006 Winter Simulation Conference*. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/wsc06final.pdf)
6. Robbins, T.R., D.J. Medeiros, and T.P. Harrison. (2007) *Partial Cross Training in Call Centers with Uncertain Arrivals and Global Service Level Agreements*. in *Proceedings of the 2007 Winter Simulation Conference*. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/robbinst68170.pdf)
7. Robbins, T.R., (2007) *Addressing Arrival Rate Uncertainty in Call Center Workforce Management*, in *Proceedings of the 2007 IEEE/INFORMS International Conference on Service Operations and Logistics, and Informatics*. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/IEEE%20Informs-Uncertain%20WFM.pdf)
8. Robbins, T.R. (2008). *A Simulation Based Scheduling Algorithm for Call Centers with Uncertain Arrival Rates* in *Proceedings of the 2008 Winter Simulation Conference*. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/wsc08paper-TRR.pdf)
9. Robbins, T.R., D.J. Medeiros, and T.P. Harrison. (2010) *Does the Erlang C Model fit in Real Call Centers?* *2010 Winter Simulation Conference*. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/DoesERCFit.pdf)
10. Robbins, T.R. and T.P. Harrison (2010). *A stochastic model for scheduling call centers with Uncertain Arrivals and Global Service Level Agreements*. European Journal of Operational Research 207: 1608-1619.
11. Robbins, T.R., D. J. Medeiros and T.P. Harrison (2010), *Cross Training in Call Centers with Uncertain Arrivals and Global Service Level Agreements*. International Journal of Operations and Quantitative Management 16(3), pp. 307-329.
12. Robbins, T.R. and T.P. Harrison (2011), *New Project Staffing for Outsourced Call Centers with Global Service Level Agreements*. Service Science 3(1), pp. 41-66.
13. Robbins, T.R. (2015), *Experienced Based Routing in Call Center Environments*. Service Science 7(2), pp. 132-148.
14. Robbins, T.R, (2016) *Evaluating the fit of the Erlang A Model in High Traffic Call Center Scenarios*. *2016 Winter Simulation Conference*. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/Erlang%20A%20High%20Traffic.pdf)
15. Robbins, T.R., (2017) *Complexity and Flexibility in Call Center Scheduling Models*. International Journal of Business and Social Science 8(12). [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/IJBSS%2017523-TR.pdf)
16. Robbins, T.R. (2019), *Evaluating the Performance of the Erlang Models for Call Centers*. International Journal of Applied Science and Technology, 9(1). [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/S-12130-TR.pdf)
17. Robbins, T.R. (2007). *Managing Service Capacity Under Uncertainty*. PhD Dissertation, Pennsylvania State University. [(PDF)](https://myweb.ecu.edu/robbinst/PDFs/Dissertation%20Final.pdf)

### Queueing-Game Theory
18. Wang Jinting (2026). [*Fundamentals of Queueing-Game Models*](https://doi.org/10.1007/978-981-95-0261-5)

### Supporting Methodology
19. Stckel, S.G., S.G. Henderson and V. Mehrotra (2009). Forecast Errors in Service Systems. *Probability in the Engineering and Informational Sciences*, 23, 305-332.
20. Stckel, S.G., W.B. Henderson and V. Mehrotra (2004). Service System Planning in the Presence of a Random Arrival Rate. Cornell University.
21. Green, L.V., P. Kolesar and J. Soares (2001). Improving the SIPP Approach for Staffing Service Systems That Have Cyclic Demands. *Operations Research*, 49, 549-564.
22. Harrison, J.M. and A. Zeevi. (2005). A Method for Staffing Large Call Centers Based on Stochastic Fluid Models. *Manufacturing & Service Operations Management*, 7, 20-36.
23. Jennings, O.B. and A. Mandelbaum. (1996). Server staffing to meet time-varying demand. *Management Science*, 42, 1383.
24. Halfin, S. and W. Whitt. (1981). Heavy-Traffic Limits for Queues with Many Exponential Servers. *Operations Research*, 29, 567-588.
25. Sakov, A. and S. Zeltyn. (2001). Empirical Analysis of a Call Center. Technion - Israel Institute of Technology.
26. Chen, B.P. K. and S.G. Henderson. (2001). Two Issues in Setting Call Center Staffing Levels. *Annals of Operations Research*, 108, 175-192.
27. Whitt, W. (2005). Staffing a Call Center with Uncertain Arrivals and Global Service Level Agreements. *Manufacturing & Service Operations Management*.
28. Bassamboo, A., J.M. Harrison and A. Zeevi. (2005). Design and Control of a Large Call Center: Asymptotic Analysis of an LP-based Method. *Operations Research*, 54, 419-435.
29. Borst, S., A. Mandelbaum and M.I. Reiman. (2004). Dimensioning Large Call Centers. *Operations Research*, 52, 17-35.
30. Mandelbaum, A., A. Sakov and S. Zeltyn. (2001). Empirical Analysis of a Call Center. Technion - Israel Institute of Technology.
31. Guha, S., A. Kumar and V. Mehrotra. (2007). Optimal Staffing of Telephone Call Centers. *Production and Operations Management*, 9, 33-51.
32. Law, A.M. (2007). *Simulation modeling and analysis*. Boston, McGraw-Hill.
33. Green, L.V., P.J. Kolesar and J. Soares. (2003). An Improved Heuristic for Staffing Telephone Call Centers with Limited Operating Hours. *Production and Operations Management*, 12, 46-61.
34. Santner, T.J., B.J. Williams and W.I. Notz. (2003). *The design and analysis of computer experiments*. New York, Springer.

## Code & Notebooks

- [[]]
