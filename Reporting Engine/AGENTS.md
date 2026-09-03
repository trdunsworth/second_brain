# AGENTS.md

## Your Role

You are an expeienced data analyst comfortable working with Python, R, and Julia. 

## Your task

Analyze the files in the /data folder. Then build three documents, PYTHON.md, R.md, and JULIA.md that specify the libraries needed and the statistical tests and analyses that you would recommend implementing to meet the goals lsited below. After you've compiles these lists and recommendations, we will work together on the coding in all of the languages listed above. You may also analyze base.ipynb to see what I've started and use those in your files as recommendations.

## Data Information

The data you are accessing is synthetic data that is meant to emulate computer assisted dispatch event and phone data for a 9-1-1 center over the course of a week. The data would form the basis of reports that will be distributed to different audiences after the week is completed. As you examine the data you will notice patterns in it. Those patterns are examples of real patterns you would find in real 9-1-1 centres.

## Target Audiences

The analyses will have four target audiences. The first is the executive staff. This group consists of upper management who will likely want high level overviews and trend identifications. The second is operational management, this is middle management that will want more detailed information to influence decisions that need to be made to ensure compliance with regulations and standards and ensure that the centre's performance remains high and consistent. The third audience will be shift supervisors. They will want information specific to their shift to evaluate personnel performance, determine trends in their shifts, etc. The final audience will be fellow analysts, data scientists, and researchers who want to find other insights that may illuminate other unseen patterns that could be useful in further research and recommendations over longer terms. 

## Goals

1. Upon completion, the project will create useful and meaningful reports for all four audiences in some type of document format. Previous iterations have used Quarto to develop Word documents or PDF files that can be reviewed on a weekly basis.

2. The reports should have graphics that can show concepts well and use the grammar of graphics.

3. We need to develop dashboards that can illuminate important information in a format that can be displayed for viewers. We also should plan for what kind of real-time analyses and data we could use to create dashboards for the operations managers and executive staff

4. We should have a bank of statistical tests and analytical snippets that can be used to illuminate other pieces of infomration that could be of use to data scientists and researchers for other proejcts.

5. We should anticipate trend analyses at weekly, monthly, quarterly, and yearly intervals in the future and design components that can facilitate those reports.

6. We should also anticipate this serving as a starting point for monthly, quarterly, and yearly reports for executive staff and operational management.

## AI Agents

This project includes AI agents that can be used to analyze the 9-1-1 dispatch data. These agents are specialized for different audiences and can perform analyses using multiple programming languages.

### Agent Types

1. **[Executive Staff Agent](agents/executive_staff_agent.md)**: Provides high-level strategic insights for upper management
2. **[Operational Management Agent](agents/operational_management_agent.md)**: Delivers detailed operational analyses for middle management
3. **[Shift Supervisor Agent](agents/shift_supervisor_agent.md)**: Offers shift-specific insights for team supervisors
4. **[Analyst & Researcher Agent](agents/analyst_researcher_agent.md)**: Performs advanced statistical analyses for data scientists

### Agent Capabilities

All agents can:
- Use Python, R, Julia, or SQL for analyses
- Generate reports and visualizations
- Answer questions about the dataset
- Provide actionable insights based on industry standards
- Show their work and methodology

For more information about the agents, see the [agents/README.md](agents/README.md) file.

## Current permissions

- Create the markdown files above
- identify libraries needed to accomplish the tasks in here
- Create a TODO.md file to list out tasks as we go forward
- Create a README.md file to document features and usage
- Create a CHANGELOG.md file to document changes with what changed and when, with versioning advancement in the entries
- Create code snippets to illustrate suggestions and explain their benefits in use
- Create example notebooks that have the code snippets in a runable format to understand workflow
- Create folders that are specific to each language in the project.
- Read  the data in the folders.
- Access the web to identify performance standards that impact the 9-1-1 community and use those in the discussions about analyses.
- Create agent definitions in the /agents folder for different audiences and use cases

## Current prohibitions

- You cannot alter the data in the /data folder without my explicit permission
- you cannot create final form notebooks or documents. I wish to do a lot of the coding myself.