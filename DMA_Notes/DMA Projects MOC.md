---
type: moc
topic: "DMA Projects Map of Content"
created: 2026-09-02
updated: 2026-09-02
tags:
  - moc
  - dma
  - projects
---

# DMA Projects Map of Content

This MOC connects all Dunsworth, Mann & Associates (DMA) LLC projects and related work.

## Active Projects

### [[NENA Survey Project]]
**Status:** In Progress
**Description:** National Emergency Number Association survey on PSAP operations
**Stack:** React, DuckDB, MotherDuck
**Related:** [[PSAP Staffing Model]], [[DMA Data Project]]

### [[SynthCCD Project]]
**Status:** v0.9.5 (Active Development)
**Description:** Synthetic CAD data generator for 9-1-1 testing and training
**Documentation:** [[SynthCCD/README]], [[SynthCCD/USERSGUIDE]], [[SynthCCD/CONTRIBUTING]]
**Related:** [[DMA Reporting Agent Project]]

### [[DMA Reporting Agent Project]]
**Status:** Planning
**Description:** Automated reporting agent for PSAP analytics
**Related:** [[Reporting Engine Notes 1]], [[SynthCCD Project]]

### [[R Information for DMA projects]]
**Status:** Reference
**Description:** R environment setup and tools for DMA projects
**Related:** [[Reporting Engine/Libraires and Tools Used]]

## Reporting & Analytics

### [[Reporting Engine Notes 1]]
**Status:** Exploration
**Description:** Reporting engine architecture and design notes
**Related:** [[Analyses Performed]], [[Libraires and Tools Used]]

### [[Analyses Performed]]
**Status:** Reference
**Description:** Catalog of analytical methods and outputs

### [[Libraires and Tools Used]]
**Status:** Reference
**Description:** Python/R libraries and tools for DMA analytics

## Future Projects

### [[New_CAD_Project/LLM based CAD]]
**Status:** Idea Stage
**Description:** LLM-powered CAD system exploration
**Related:** [[SynthCCD Project]], AI/ML research

## Infrastructure & Setup

### Python Environment
- **Package manager:** uv
- **Core libraries:** pandas, polars, DuckDB, scikit-learn, statsmodels
- **Visualization:** Plotly, matplotlib, seaborn
- **Forecasting:** TimeCopilot, Prophet
- **Reference:** [[PSAP_Analytics]] (migrated from foam_artefacts)

### R Environment
- **Reference:** [[R Information for DMA projects]]
- **Libraries:** See [[Libraires and Tools Used]]

## Key Standards & References

- **NENA STA-020** - 9-1-1 call answering standards
- **NFPA 1221** - Standard for emergency communications
- **APCO** - Association of Public-Safety Communications Officials
- **Reference:** [[NENA Survey]] (migrated from foam_artefacts)

## Related Research

- [[Research MOC]] - Academic research projects
- [[PSAP Staffing Model]] - Queueing models for staffing optimization
- [[168-Point Forecast Comparison - Discrete vs Continuous]] - Call volume forecasting

---

*Last updated: 2026-09-02*
