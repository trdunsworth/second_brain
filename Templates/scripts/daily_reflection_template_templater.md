---
title: "Daily Reflection - <% tp.date.now('YYYY-MM-DD') %>"
tags: ["daily", "progress", "attitude-adjustment"]
created: "<% tp.date.now('YYYY-MM-DD HH:mm') %>"
modified: "<% tp.date.now('YYYY-MM-DD HH:mm') %>"
last_updated: "<% tp.date.now('YYYY-MM-DD') %>"
---

<%*
// All dynamic prompts at the top - runs before body renders
const goalsFile = await tp.file.include('Templates/scripts/attitude_adjustment_goals.md');
const goalMatches = goalsFile.match(/- "(.+)"/g);
const goals = goalMatches ? goalMatches.map(m => m.replace(/- "(.+)"/, '$1')) : [];

const selectedGoal = await tp.system.suggester(goals, goals, false, 'Select Goal:');
const progressLevels = ['Low', 'Medium', 'High', 'Complete'];
const progress = await tp.system.suggester(progressLevels, progressLevels, false, 'Progress Level:');

// Collect all body content via prompts
const dailyTasks = await tp.system.prompt('Daily Tasks (one per line):', '', true);
const weekFocus = await tp.system.prompt("This Week's Focus:", '', true);
const weekActions = await tp.system.prompt('Weekly Actions (one per line):', '', true);
const challenges = await tp.system.prompt('Challenges:', '', true);
const wins = await tp.system.prompt('Wins:', '', true);
const futureNotes = await tp.system.prompt('Future Notes:', '', true);
const relatedGoals = await tp.system.prompt('Related Goals & Sources:', '', true);

// Build the entire output
tR += "# " + selectedGoal + " (Progress: " + progress + ")\n\n";

tR += "## Today's Progress\n\n";
tR += "### Daily Checklist\n\n";
tR += dailyTasks + "\n\n";

tR += "## Weekly Goals\n\n";
tR += "### This Week's Focus\n\n";
tR += weekFocus + "\n\n";
tR += "### Action Items\n\n";
tR += weekActions + "\n\n";

tR += "## Challenges & Wins\n\n";
tR += "### Challenges Encountered\n\n";
tR += challenges + "\n\n";
tR += "### Wins & Accomplishments\n\n";
tR += wins + "\n\n";

tR += "## CBT/TEAM-CBT Daily Spot-Check\n\n";
tR += "| Check | Status | Notes |\n";
tR += "|---|---|---|\n";
tR += "| Completed Daily Mood Log (1+ entries) | [ ] Yes / [ ] No | |\n";
tR += "| Identified top distortion today | | |\n";
tR += "| Used evidence-based challenge | [ ] Yes / [ ] No |\n";
tR += "| Practiced positive reframe | [ ] Yes / [ ] No |\n";
tR += "| Behavioral experiment / exposure | [ ] Yes / [ ] No |\n";
tR += "| Values-aligned action taken | | |\n\n";

tR += "## Notes for Future Sessions\n\n";
tR += futureNotes + "\n\n";

tR += "## Related Goals & Sources\n\n";
tR += relatedGoals + "\n\n";
-%>

<%* tp.file.cursor() %>
