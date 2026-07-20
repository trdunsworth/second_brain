---
title: "Daily Mood Log - <% tp.date.now("YYYY-MM-DD") %>"
tags: ["cbt", "mood-log", "daily", "burns", "team-cbt"]
date: <% tp.date.now("YYYY-MM-DD") %>
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
---

<%*
// All dynamic prompts at the top - runs before body renders

// Number of entries (1-3)
const entryCountOptions = ["1", "2", "3"];
const entryCount = await tp.system.suggester(entryCountOptions, entryCountOptions, false, "Number of entries (1-3):");
const numEntries = parseInt(entryCount);

const distortions = ["All-or-Nothing", "Overgeneralization", "Mental Filter", "Disqualifying Positive", "Jumping to Conclusions (Mind Reading)", "Jumping to Conclusions (Fortune Telling)", "Magnification/Minimization", "Emotional Reasoning", "Should Statements", "Labeling", "Personalization"];

// Collect all entry data
const entries = [];
for (let i = 1; i <= numEntries; i++) {
  const time = await tp.system.prompt("Entry " + i + " Time (HH:MM):", i === 1 ? "08:00" : (i === 2 ? "12:00" : "17:00"));
  const situation = await tp.system.prompt("Entry " + i + " Situation:", "", true);
  
  const emotions = {
    sad: await tp.system.prompt("Entry " + i + " Sad (0-100%):", "0"),
    anxious: await tp.system.prompt("Entry " + i + " Anxious (0-100%):", "0"),
    angry: await tp.system.prompt("Entry " + i + " Angry (0-100%):", "0"),
    guilty: await tp.system.prompt("Entry " + i + " Guilty (0-100%):", "0"),
    hopeless: await tp.system.prompt("Entry " + i + " Hopeless (0-100%):", "0"),
    ashamed: await tp.system.prompt("Entry " + i + " Ashamed (0-100%):", "0"),
    other: await tp.system.prompt("Entry " + i + " Other Emotion (0-100%):", "0")
  };
  
  const thoughts = await tp.system.prompt("Entry " + i + " Automatic Thoughts (one per line):", "", true);
  
  const selectedDistortions = await tp.system.suggester(distortions, distortions, true, "Entry " + i + " Select distortions (multiple):");
  const distortionOutput = selectedDistortions && selectedDistortions.length > 0 
    ? selectedDistortions.map(d => "☐ " + d).join("  ")
    : distortions.map(d => "☐ " + d).join("  ");
  
  const positiveReframe = await tp.system.prompt("Entry " + i + " Positive Reframe:", "", true);
  const evidenceFor = await tp.system.prompt("Entry " + i + " Evidence For:", "", true);
  const evidenceAgainst = await tp.system.prompt("Entry " + i + " Evidence Against:", "", true);
  const balancedAlt = await tp.system.prompt("Entry " + i + " Balanced Alternative:", "", true);
  
  const rerated = {
    sad: await tp.system.prompt("Entry " + i + " Re-rated Sad (0-100%):", "0"),
    anxious: await tp.system.prompt("Entry " + i + " Re-rated Anxious (0-100%):", "0"),
    angry: await tp.system.prompt("Entry " + i + " Re-rated Angry (0-100%):", "0"),
    guilty: await tp.system.prompt("Entry " + i + " Re-rated Guilty (0-100%):", "0"),
    hopeless: await tp.system.prompt("Entry " + i + " Re-rated Hopeless (0-100%):", "0"),
    ashamed: await tp.system.prompt("Entry " + i + " Re-rated Ashamed (0-100%):", "0"),
    other: await tp.system.prompt("Entry " + i + " Re-rated Other (0-100%):", "0")
  };
  
  entries.push({time, situation, emotions, thoughts, distortions: distortionOutput, positiveReframe, evidenceFor, evidenceAgainst, balancedAlt, rerated});
}

// Daily Summary
const totalEntries = await tp.system.prompt("Total Entries:", numEntries.toString());
const avgPreMood = await tp.system.prompt("Avg Pre-Mood (%):", "");
const avgPostMood = await tp.system.prompt("Avg Post-Mood (%):", "");
const avgImprovement = await tp.system.prompt("Avg Improvement (%):", "");
const freqDistortion = await tp.system.suggester(distortions, distortions, false, "Most Frequent Distortion:");
const helpfulTechnique = await tp.system.prompt("Most Helpful Technique:", "");
const valuesTouched = await tp.system.prompt("Values Touched Today:", "", true);

// Resistance Check
const resistanceExploration = await tp.system.prompt("Resistance Exploration:", "", true);

// Tomorrow's Intention
const tomorrowExperiment = await tp.system.prompt("Tomorrow's Behavioral Experiment:", "", true);
const predDifficulty = await tp.system.prompt("Predicted Difficulty (0-100%):", "50");
const predSatisfaction = await tp.system.prompt("Predicted Satisfaction (0-100%):", "50");

// Build output via tR
tR += "# Daily Mood Log (TEAM-CBT) - " + tp.date.now("dddd, MMMM DD, YYYY") + "\n\n";

tR += "> **Instructions** (per Dr. David Burns, *Feeling Great*):\n";
tR += "> 1. **Situation** - Briefly describe the triggering event (who, what, when, where)\n";
tR += "> 2. **Emotions** - Rate each feeling 0-100% (sad, anxious, angry, guilty, hopeless, etc.)\n";
tR += "> 3. **Automatic Thoughts** - Write the exact thoughts/images running through your mind\n";
tR += "> 4. **Distortions** - Label each thought with 1+ of the 10 cognitive distortions\n";
tR += "> 5. **Rational Response** - Challenge with evidence; write balanced alternative\n";
tR += "> 6. **Re-rate Emotions** - Rate emotions again 0-100% after restructuring\n\n";

tR += "---\n\n";

for (let i = 0; i < entries.length; i++) {
  const e = entries[i];
  const entryNum = i + 1;
  
  tR += "## Entry " + entryNum + "\n\n";
  tR += "| Column | Content |\n";
  tR += "|---|---|\n";
  tR += "| **Time** | " + e.time + " |\n";
  tR += "| **Situation** | " + e.situation + " |\n";
  tR += "| **Emotions (0-100%)** | Sad: " + e.emotions.sad + "% | Anxious: " + e.emotions.anxious + "% | Angry: " + e.emotions.angry + "% | Guilty: " + e.emotions.guilty + "% | Hopeless: " + e.emotions.hopeless + "% | Ashamed: " + e.emotions.ashamed + "% | Other: " + e.emotions.other + "% |\n";
  tR += "| **Automatic Thought(s)** | " + e.thoughts.replace(/\n/g, "<br>") + " |\n";
  tR += "| **Distortions** | " + e.distortions + " |\n";
  tR += "| **Positive Reframe** (Before challenging: *What does this struggle show about my values?*) | " + e.positiveReframe + " |\n";
  tR += "| **Rational Response** (Evidence for/against → Balanced thought) | **For:** " + e.evidenceFor + "<br>**Against:** " + e.evidenceAgainst + "<br>**Balanced Alternative:** " + e.balancedAlt + " |\n";
  tR += "| **Re-rated Emotions (0-100%)** | Sad: " + e.rerated.sad + "% | Anxious: " + e.rerated.anxious + "% | Angry: " + e.rerated.angry + "% | Guilty: " + e.rerated.guilty + "% | Hopeless: " + e.rerated.hopeless + "% | Ashamed: " + e.rerated.ashamed + "% | Other: " + e.rerated.other + "% |\n\n";
  tR += "---\n\n";
}

tR += "## Daily Summary\n\n";
tR += "| Metric | Value |\n";
tR += "|---|---|\n";
tR += "| Total Entries | " + totalEntries + " |\n";
tR += "| Avg Pre-Mood (all emotions) | " + avgPreMood + " |\n";
tR += "| Avg Post-Mood (all emotions) | " + avgPostMood + " |\n";
tR += "| Avg Improvement | " + avgImprovement + " |\n";
tR += "| Most Frequent Distortion | " + freqDistortion + " |\n";
tR += "| Most Helpful Technique | " + helpfulTechnique + " |\n";
tR += "| Values Touched Today | " + valuesTouched + " |\n\n";

tR += "---\n\n";

tR += "## Resistance Check (Magic Button)\n\n";
tR += "> *If I could push a button and instantly eliminate today's distress, would I?*\n";
tR += "> - [ ] Yes → Great, proceed with techniques\n";
tR += "> - [ ] No / Unsure → **Explore resistance first**: What might I lose? What does this feeling protect? What's the benefit of staying stuck?\n\n";
tR += "**Resistance Exploration:** " + resistanceExploration + "\n\n";

tR += "---\n\n";

tR += "## Tomorrow's Intention\n\n";
tR += "**One behavioral experiment / exposure / values action I'll try tomorrow:** " + tomorrowExperiment + "\n\n";
tR += "**Prediction (0-100%):**\n";
tR += "- Difficulty: " + predDifficulty + "%\n";
tR += "- Satisfaction: " + predSatisfaction + "%\n\n";

tR += "---\n\n";

tR += "## Quick Reference: 10 Cognitive Distortions\n\n";
tR += "| # | Distortion | Brief Definition |\n";
tR += "|---|---|---|\n";
tR += "| 1 | **All-or-Nothing** | Black-and-white; perfect or failure |\n";
tR += "| 2 | **Overgeneralization** | Single event = endless pattern (\"always/never\") |\n";
tR += "| 3 | **Mental Filter** | Focus exclusively on negative; ignore positive |\n";
tR += "| 4 | **Disqualifying Positive** | Positive experiences \"don't count\" |\n";
tR += "| 5 | **Jumping to Conclusions** | Mind reading (know others' thoughts) / Fortune telling (predict doom) |\n";
tR += "| 6 | **Magnification/Minimization** | Blow up negatives; shrink positives |\n";
tR += "| 7 | **Emotional Reasoning** | \"I feel it → it's true\" |\n";
tR += "| 8 | **Should Statements** | Rigid rules → guilt (self) / anger (others) |\n";
tR += "| 9 | **Labeling** | Global negative label vs. specific behavior |\n";
tR += "| 10 | **Personalization** | Blame self for external events not primarily your responsibility |\n\n";

tR += "---\n\n";

tR += "*Template based on Dr. David Burns' TEAM-CBT (Feeling Good, Feeling Great). Research doc: David_Burns_CBT_Research_Document.md*\n\n";
-%>

<%* tp.file.cursor() %>
