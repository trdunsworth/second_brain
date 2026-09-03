# 9-1-1 Dispatch Center AI Agents

This directory contains AI agent definitions for analyzing 9-1-1 dispatch center data. Each agent is specialized for a specific audience and can perform analyses using multiple programming languages.

## Agent Types

### [Executive Staff Agent](executive_staff_agent.md)
- **Audience**: Upper management and executive staff
- **Focus**: High-level strategic insights, trend identification, and performance summaries
- **Output**: Executive summaries, strategic recommendations, KPI dashboards

### [Operational Management Agent](operational_management_agent.md)
- **Audience**: Middle management and operational leaders
- **Focus**: Compliance monitoring, performance optimization, and operational efficiency
- **Output**: Detailed performance reports, compliance analyses, resource utilization insights

### [Shift Supervisor Agent](shift_supervisor_agent.md)
- **Audience**: Shift supervisors and team leads
- **Focus**: Personnel performance, shift trends, and team management
- **Output**: Shift-specific reports, individual performance analyses, scheduling insights

### [Analyst & Researcher Agent](analyst_researcher_agent.md)
- **Audience**: Data scientists, analysts, and researchers
- **Focus**: Advanced statistical modeling, pattern discovery, and research-grade insights
- **Output**: Technical research reports, predictive models, methodological guidance

## Capabilities

All agents can:

1. **Use Multiple Programming Languages**
   - Python (preferred for general analysis and visualization)
   - R (preferred for advanced statistical modeling)
   - Julia (preferred for high-performance computing)
   - SQL (for data extraction and transformation)

2. **Generate Reports and Visualizations**
   - Create various types of charts and graphs
   - Generate formatted reports in multiple formats
   - Build interactive dashboards when requested
   - Provide code snippets for reproducibility

3. **Answer Questions About the Dataset**
   - Explain data structures and contents
   - Identify patterns and trends
   - Perform ad-hoc analyses
   - Show their work and methodology

4. **Provide Actionable Insights**
   - Focus on practical recommendations
   - Support findings with data evidence
   - Consider industry standards and benchmarks
   - Highlight both successes and areas for improvement

## Usage

To use these agents:

1. **Identify your audience**: Choose the appropriate agent based on who will consume the analysis
2. **Formulate your question**: Be specific about what you want to know
3. **Request analysis**: Ask the agent to perform the analysis using the dataset
4. **Review results**: Examine the findings, visualizations, and recommendations

## Data Access

All agents have access to synthetic CAD (Computer Aided Dispatch) and phone data located in the `/data` folder. The data emulates a 9-1-1 center's operations over one week.

## Performance Standards

Agents reference industry standards including:
- **NENA**: National Emergency Number Association guidelines
- **IAED**: International Academies of Emergency Dispatch protocols
- **Local Regulations**: State and local emergency service requirements
- **Internal Policies**: Center-specific operational procedures

## Example Queries

### Executive Staff Agent
- "What are the key performance trends this week?"
- "How does our answer time compare to industry standards?"
- "Provide a summary of call volume patterns"

### Operational Management Agent
- "Which shifts are underperforming on dispatch times?"
- "What is our compliance rate with NENA standards?"
- "Analyze resource utilization across the week"

### Shift Supervisor Agent
- "How did Team A perform on the day shift this week?"
- "Which team members need additional training?"
- "What are the workload patterns for the evening shift?"

### Analyst & Researcher Agent
- "Can you build a predictive model for call volume?"
- "Identify spatial hotspots in emergency calls"
- "Perform a time series analysis of response times"

## Integration

These agents can be integrated with:
- LLM-powered chat interfaces
- Reporting automation systems
- Dashboard platforms
- Research workflows
- Educational and training programs