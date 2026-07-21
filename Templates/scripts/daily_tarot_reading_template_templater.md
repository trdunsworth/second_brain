---
tags: ["tarot", "daily", "guidance", "reflection", "attitude-adjustment"]
date: <% tp.date.now("YYYY-MM-DD") %>
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---

<%*
// All dynamic prompts at the top - runs before body renders
const goalsFile = await tp.file.include("Templates/scripts/attitude_adjustment_goals.md");
const goalMatches = goalsFile.match(/- "(.+)"/g);
const goals = goalMatches ? goalMatches.map(m => m.replace(/- "(.+)"/, '$1')) : [];

// Core Question
const coreQuestion = await tp.system.prompt("Today's Core Question:", "", true);

// Theme Card
const themeCard = await tp.system.prompt("Theme Card:");
const themeMeaning = await tp.system.prompt("Theme Meaning:", "", true);
const themeGoals = await tp.system.suggester(goals, goals, true, "Select relevant goals (multiple):");
  // suggester with multiple=true may return null/string, ensure array
  const themeGoalsArray = Array.isArray(themeGoals) ? themeGoals : [];
  let themeGoalsOutput = "";
  if (themeGoalsArray.length > 0) {
    themeGoalsOutput = themeGoalsArray.map(g => "- " + g).join("\n");
  }

// Guidance Card
const guidanceCard = await tp.system.prompt("Guidance Card:");
const guidanceMeaning = await tp.system.prompt("Guidance Meaning:", "", true);
const actionRequired = await tp.system.prompt("Action Required:", "", true);

// Challenge Card
const challengeCard = await tp.system.prompt("Challenge Card:");
const challengeMeaning = await tp.system.prompt("Challenge Meaning:", "", true);
const preventionStrategy = await tp.system.prompt("Prevention Strategy:", "", true);

// Opportunity Card
const opportunityCard = await tp.system.prompt("Opportunity Card:");
const opportunityMeaning = await tp.system.prompt("Opportunity Meaning:", "", true);
const howToCapture = await tp.system.prompt("How to Capture:", "", true);

// Reflection
const immediateInsights = await tp.system.prompt("Immediate Insights:", "", true);
const actionSteps = await tp.system.prompt("Action Steps:", "", true);
const meditationIntegration = await tp.system.prompt("Meditation Integration:", "", true);
const tomorrowFocus1 = await tp.system.prompt("Tomorrow's Focus 1:");
const tomorrowFocus2 = await tp.system.prompt("Tomorrow's Focus 2:");
const journalEntry = await tp.system.prompt("Journal Entry:", "", true);

// Build entire output via tR
tR += "# Daily Tarot Reading - " + tp.date.now("dddd, MMMM DD, YYYY") + "\n\n";

tR += "## Today's Core Question\n";
tR += coreQuestion + "\n\n";

tR += "## Daily Card Layout\n\n";

tR += "### Theme Card (Innings in the 40-Year Journey)\n";
tR += "**Card:** " + themeCard + "\n";
tR += "**Meaning:** " + themeMeaning + "\n";
tR += "**Connection to Goals:**\n";
if (themeGoalsOutput) {
  tR += themeGoalsOutput + "\n";
}
tR += "\n";

tR += "### Guidance Card (Wisdom from the Deep)\n";
tR += "**Card:** " + guidanceCard + "\n";
tR += "**Meaning:** " + guidanceMeaning + "\n";
tR += "**Action Required:** " + actionRequired + "\n\n";

tR += "### Challenge Card (What to Watch)\n";
tR += "**Card:** " + challengeCard + "\n";
tR += "**Meaning:** " + challengeMeaning + "\n";
tR += "**Prevention Strategy:** " + preventionStrategy + "\n\n";

tR += "### Opportunity Card (Hidden Potential)\n";
tR += "**Card:** " + opportunityCard + "\n";
tR += "**Meaning:** " + opportunityMeaning + "\n";
tR += "**How to Capture:** " + howToCapture + "\n\n";

tR += "## Connection to Today's Goals\n\n";
tR += "### Goal Alignment\n";
tR += "*Selected above*\n\n";

tR += "## Post-Reading Reflection\n\n";

tR += "### Immediate Insights\n";
tR += immediateInsights + "\n\n";

tR += "### Action Steps\n";
tR += actionSteps + "\n\n";

tR += "### Meditation Integration\n";
tR += meditationIntegration + "\n\n";

tR += "## Tomorrow's Focus\n";
tR += "1. " + tomorrowFocus1 + "\n";
tR += "2. " + tomorrowFocus2 + "\n\n";

tR += "## Tarot Practice Journal Entry\n";
tR += journalEntry + "\n\n";

tR += "## Success Metrics for Today\n\n";

tR += "### Tarot-Based Indicators\n";
tR += "- [ ] Honored the guidance received\n";
tR += "- [ ] Applied insights to daily decisions\n";
tR += "- [ ] Practiced meditation as suggested\n";
tR += "- [ ] Focused attention as indicated\n\n";

tR += "### Goal-Based Indicators\n";
tR += "- [ ] Connected to relevant personal growth area\n";
tR += "- [ ] Made progress toward identified goal\n";
tR += "- [ ] Maintained focus despite challenges\n";
tR += "- [ ] Improved mood/attitude\n\n";

tR += "---\n";
tR += "*Daily tarot practice - 40+ years of personal development*\n";
-%>

<%* tp.file.cursor() %>
