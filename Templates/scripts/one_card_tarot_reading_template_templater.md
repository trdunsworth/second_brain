---
tags: ["tarot", "quick", "guidance", "reflection", "attitude-adjustment"]
date: <% tp.date.now("YYYY-MM-DD") %>
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---

<%*
// Read goals file using tp.app.vault.read() to avoid file dependency issues
const goalsTFile = tp.file.find_tfile("Templates/scripts/attitude_adjustment_goals.md");
const goalsContent = goalsTFile ? await tp.app.vault.read(goalsTFile) : "";
const goalMatches = goalsContent.match(/- "(.+)"/g);
const goals = goalMatches ? goalMatches.map(m => m.replace(/- "(.+)"/, '$1')) : [];

// Core Question
const coreQuestion = await tp.system.prompt("Today's Core Question:", "", true);

// Card
const cardName = await tp.system.prompt("Pull a Card - Card Name:");
const cardMeaning = await tp.system.prompt("Card Meaning:", "", true);
const cardGoals = await tp.system.suggester(goals, goals, true, "Select relevant goals (multiple):");
const cardGoalsArray = Array.isArray(cardGoals) ? cardGoals : [];
let cardGoalsOutput = "";
if (cardGoalsArray.length > 0) {
  cardGoalsOutput = cardGoalsArray.map(g => "- " + g).join("\n");
}

// Action & Reflection
const actionRequired = await tp.system.prompt("Action Required:", "", true);
const immediateInsight = await tp.system.prompt("Immediate Insight:", "", true);

// Build output
tR += "# Quick Tarot Reading - " + tp.date.now("dddd, MMMM DD, YYYY") + "\n\n";

tR += "## Today's Core Question\n";
tR += coreQuestion + "\n\n";

tR += "## Card Drawn\n";
tR += "**Card:** " + cardName + "\n";
tR += "**Meaning:** " + cardMeaning + "\n";
tR += "**Connection to Goals:**\n";
if (cardGoalsOutput) {
  tR += cardGoalsOutput + "\n";
}
tR += "\n";

tR += "## Action Required\n";
tR += actionRequired + "\n\n";

tR += "## Immediate Insight\n";
tR += immediateInsight + "\n\n";

tR += "---\n";
tR += "*Quick daily tarot check-in*\n";
-%>

<%* tp.file.cursor() %>
