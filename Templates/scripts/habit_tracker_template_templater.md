---
title: "Habit Tracker - <% tp.date.now('YYYY-MM-DD') %>"
tags: ["habits", "daily", "tracking", "consistency"]
date: "<% tp.date.now('YYYY-MM-DD') %>"
created: "<% tp.date.now('YYYY-MM-DD HH:mm') %>"
---

<%*
// All prompts at top - collected before rendering
const coreHabits = await tp.system.prompt('Core Habits (one per line with status):', '- [ ] Habit 1\n- [ ] Habit 2\n- [ ] Habit 3', true);
const personalGrowthHabits = await tp.system.prompt('Personal Growth Habits (one per line with status):', '- [ ] Habit 1\n- [ ] Habit 2\n- [ ] Habit 3', true);
const wellnessHabits = await tp.system.prompt('Wellness Habits (one per line with status):', '- [ ] Habit 1\n- [ ] Habit 2\n- [ ] Habit 3', true);
const professionalHabits = await tp.system.prompt('Professional Habits (one per line with status):', '- [ ] Habit 1\n- [ ] Habit 2\n- [ ] Habit 3', true);
const dailyGoalsTable = await tp.system.prompt('Daily Goals Table Rows (format: | Habit Name | [ ] | Notes | 5 |):', '| Habit 1 | [ ] | | |\n| Habit 2 | [ ] | | |\n| Habit 3 | [ ] | | |', true);
const habitBreakdown = await tp.system.prompt('Detailed Habit Notes:', '', true);
const todaysFocus = await tp.system.prompt("Today's Focus:", '', true);
const challenges = await tp.system.prompt('Challenges:', '', true);
const wins = await tp.system.prompt('Wins:', '', true);

const energyOptions = ["Low", "Medium", "High"];
const energy = await tp.system.suggester(energyOptions, energyOptions, false, "Energy Level:");

const moodOptions = ["Poor", "Fair", "Good", "Excellent"];
const mood = await tp.system.suggester(moodOptions, moodOptions, false, "Mood:");

const energyMoodNotes = await tp.system.prompt('Energy & Mood Notes:', '', true);
const priority1 = await tp.system.prompt("Priority 1:", '');
const priority2 = await tp.system.prompt("Priority 2:", '');
const priority3 = await tp.system.prompt("Priority 3:", '');
const gratitudeNotes = await tp.system.prompt('Gratitude Notes:', '', true);
const tomorrowsHabits = await tp.system.prompt("Tomorrow's Habits:", '', true);

// Build the entire output via tR
tR += "# Daily Habit Tracking - " + tp.date.now('dddd, MMMM DD, YYYY') + "\n\n";
tR += "## Overview\n\n";
tR += "Track daily habits to build consistency and measure progress toward personal growth goals\n\n";
tR += "## Today's Habit Log\n\n";
tR += "### Core Habits\n\n";
tR += coreHabits + "\n\n";
tR += "### Personal Growth Habits\n\n";
tR += personalGrowthHabits + "\n\n";
tR += "### Wellness Habits\n\n";
tR += wellnessHabits + "\n\n";
tR += "### Professional Habits\n\n";
tR += professionalHabits + "\n\n";
tR += "## Progress Tracking\n\n";
tR += "### Daily Goals Completion\n\n";
tR += "| Habit | Status | Notes | Streak |\n";
tR += "|-------|--------|-------|--------|\n";
tR += dailyGoalsTable + "\n\n";
tR += "### Habit Breakdown\n\n";
tR += habitBreakdown + "\n\n";
tR += "## Reflection\n\n";
tR += "### Today's Focus\n\n";
tR += "What was the most important thing I accomplished today?\n";
tR += todaysFocus + "\n\n";
tR += "### Challenges\n\n";
tR += "What obstacles or distractions did I face?\n";
tR += challenges + "\n\n";
tR += "### Wins\n\n";
tR += "What small wins did I have today?\n";
tR += wins + "\n\n";
tR += "### Energy & Mood\n\n";
tR += "Energy level: [ ] " + energyOptions[0] + " | [ ] " + energyOptions[1] + " | [ ] " + energyOptions[2] + "\n\n";
tR += "Mood: [ ] " + moodOptions[0] + " | [ ] " + moodOptions[1] + " | [ ] " + moodOptions[2] + " | [ ] " + moodOptions[3] + "\n\n";
tR += energyMoodNotes + "\n\n";
tR += "### Tomorrow's Priorities\n\n";
tR += "1. " + priority1 + "\n";
tR += "2. " + priority2 + "\n";
tR += "3. " + priority3 + "\n\n";
tR += "## Gratitude\n\n";
tR += gratitudeNotes + "\n\n";
tR += "## Tomorrow's Habit Intentions\n\n";
tR += tomorrowsHabits + "\n\n";
-%>

<%* tp.file.cursor() %>
