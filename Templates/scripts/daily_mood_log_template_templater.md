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
if (!entryCount) throw new Error("Entry count cancelled");
const numEntries = parseInt(entryCount);

const distortions = ["All-or-Nothing", "Overgeneralization", "Mental Filter", "Disqualifying Positive", "Jumping to Conclusions (Mind Reading)", "Jumping to Conclusions (Fortune Telling)", "Magnification/Minimization", "Emotional Reasoning", "Should Statements", "Labeling", "Personalization"];

// Helper to escape pipes for markdown tables
const escapePipe = (str) => String(str || "").replace(/\|/g, "\\|");
// Helper to convert newlines to markdown line breaks
const nl2br = (str) => String(str || "").replace(/\n/g, "  \n");

// Collect all entry data
const entries = [];
for (let i = 1; i <= numEntries; i++) {
  const time = await tp.system.prompt("Entry " + i + " Time (HH:MM):", i === 1 ? "08:00" : (i === 2 ? "12:00" : "17:00"));
  if (time === null) throw new Error("Time cancelled");
  
  const situation = await tp.system.prompt("Entry " + i + " Situation:", "", true);
  if (situation === null) throw new Error("Situation cancelled");
  
  const emotions = {
    sad: await tp.system.prompt("Entry " + i + " Sad (0-100%):", "0"),
    anxious: await tp.system.prompt("Entry " + i + " Anxious (0-100%):", "0"),
    angry: await tp.system.prompt("Entry " + i + " Angry (0-100%):", "0"),
    guilty: await tp.system.prompt("Entry " + i + " Guilty (0-100%):", "0"),
    hopeless: await tp.system.prompt("Entry " + i + " Hopeless (0-100%):", "0"),
    ashamed: await tp.system.prompt("Entry " + i + " Ashamed (0-100%):", "0"),
    other: await tp.system.prompt("Entry " + i + " Other Emotion (0-100%):", "0")
  };
  // Check for cancelled prompts
  if (Object.values(emotions).some(v => v === null)) throw new Error("Emotion cancelled");
  
  const thoughts = await tp.system.prompt("Entry " + i + " Automatic Thoughts (one per line):", "", true);
  if (thoughts === null) throw new Error("Thoughts cancelled");
  
  const selectedDistortions = await tp.system.suggester(distortions, distortions, true, "Entry " + i + " Select distortions (multiple):");
  // Ensure it's an array (suggester may return null, string, or array)
  const selectedArray = Array.isArray(selectedDistortions) ? selectedDistortions : [];
  const distortionOutput = selectedArray.length > 0
    ? selectedArray.map(d => "☐ " + d).join("  ")
    : distortions.map(d => "☐ " + d).join("  ");
  
  const positiveReframe = await tp.system.prompt("Entry " + i + " Positive Reframe:", "", true);
  if (positiveReframe === null) throw new Error("Positive reframe cancelled");
  
  const evidenceFor = await tp.system.prompt("Entry " + i + " Evidence For:", "", true);
  if (evidenceFor === null) throw new Error("Evidence for cancelled");
  
  const evidenceAgainst = await tp.system.prompt("Entry " + i + " Evidence Against:", "", true);
  if (evidenceAgainst === null) throw new Error("Evidence against cancelled");
  
  const balancedAlt = await tp.system.prompt("Entry " + i + " Balanced Alternative:", "", true);
  if (balancedAlt === null) throw new Error("Balanced alternative cancelled");
  
  const rerated = {
    sad: await tp.system.prompt("Entry " + i + " Re-rated Sad (0-100%):", "0"),
    anxious: await tp.system.prompt("Entry " + i + " Re-rated Anxious (0-100%):", "0"),
    angry: await tp.system.prompt("Entry " + i + " Re-rated Angry (0-100%):", "0"),
    guilty: await tp.system.prompt("Entry " + i + " Re-rated Guilty (0-100%):", "0"),
    hopeless: await tp.system.prompt("Entry " + i + " Re-rated Hopeless (0-100%):", "0"),
    ashamed: await tp.system.prompt("Entry " + i + " Re-rated Ashamed (0-100%):", "0"),
    other: await tp.system.prompt("Entry " + i + " Re-rated Other (0-100%):", "0")
  };
  if (Object.values(rerated).some(v => v === null)) throw new Error("Re-rated emotion cancelled");
  
  entries.push({time, situation, emotions, thoughts, distortions: distortionOutput, positiveReframe, evidenceFor, evidenceAgainst, balancedAlt, rerated});
}

// Daily Summary
const totalEntries = await tp.system.prompt("Total Entries:", numEntries.toString());
if (totalEntries === null) throw new Error("Total entries cancelled");
const avgPreMood = await tp.system.prompt("Avg Pre-Mood (%):", "");
if (avgPreMood === null) throw new Error("Avg pre-mood cancelled");
const avgPostMood = await tp.system.prompt("Avg Post-Mood (%):", "");
if (avgPostMood === null) throw new Error("Avg post-mood cancelled");
const avgImprovement = await tp.system.prompt("Avg Improvement (%):", "");
if (avgImprovement === null) throw new Error("Avg improvement cancelled");
const freqDistortion = await tp.system.suggester(distortions, distortions, false, "Most Frequent Distortion:");
if (freqDistortion === null) throw new Error("Freq distortion cancelled");
const helpfulTechnique = await tp.system.prompt("Most Helpful Technique:", "");
if (helpfulTechnique === null) throw new Error("Helpful technique cancelled");
const valuesTouched = await tp.system.prompt("Values Touched Today:", "", true);
if (valuesTouched === null) throw new Error("Values touched cancelled");

// Resistance Check
const resistanceExploration = await tp.system.prompt("Resistance Exploration:", "", true);
if (resistanceExploration === null) throw new Error("Resistance exploration cancelled");

// Tomorrow's Intention
const tomorrowExperiment = await tp.system.prompt("Tomorrow's Behavioral Experiment:", "", true);
if (tomorrowExperiment === null) throw new Error("Tomorrow experiment cancelled");
const predDifficulty = await tp.system.prompt("Predicted Difficulty (0-100%):", "50");
if (predDifficulty === null) throw new Error("Pred difficulty cancelled");
const predSatisfaction = await tp.system.prompt("Predicted Satisfaction (0-100%):", "50");
if (predSatisfaction === null) throw new Error("Pred satisfaction cancelled");

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
  tR += "| **Time** | " + escapePipe(e.time) + " |\n";
  tR += "| **Situation** | " + escapePipe(e.situation) + " |\n";
  tR += "| **Emotions (0-100%)** | Sad: " + escapePipe(e.emotions.sad) + "% | Anxious: " + escapePipe(e.emotions.anxious) + "% | Angry: " + escapePipe(e.emotions.angry) + "% | Guilty: " + escapePipe(e.emotions.guilty) + "% | Hopeless: " + escapePipe(e.emotions.hopeless) + "% | Ashamed: " + escapePipe(e.emotions.ashamed) + "% | Other: " + escapePipe(e.emotions.other) + "% |\n";
  tR += "| **Automatic Thought(s)** | " + escapePipe(nl2br(e.thoughts)) + " |\n";
  tR += "| **Distortions** | " + escapePipe(e.distortions) + " |\n";
  tR += "| **Positive Reframe** (Before challenging: *What does this struggle show about my values?*) | " + escapePipe(nl2br(e.positiveReframe)) + " |\n";
  tR += "| **Rational Response** (Evidence for/against → Balanced thought) | **For:** " + escapePipe(nl2br(e.evidenceFor)) + "<br>**Against:** " + escapePipe(nl2br(e.evidenceAgainst)) + "<br>**Balanced Alternative:** " + escapePipe(nl2br(e.balancedAlt)) + " |\n";
  tR += "| **Re-rated Emotions (0-100%)** | Sad: " + escapePipe(e.rerated.sad) + "% | Anxious: " + escapePipe(e.rerated.anxious) + "% | Angry: " + escapePipe(e.rerated.angry) + "% | Guilty: " + escapePipe(e.rerated.guilty) + "% | Hopeless: " + escapePipe(e.rerated.hopeless) + "% | Ashamed: " + escapePipe(e.rerated.ashamed) + "% | Other: " + escapePipe(e.rerated.other) + "% |\n\n";
  tR += "---\n\n";
}

tR += "## Daily Summary\n\n";
tR += "| Metric | Value |\n";
tR += "|---|---|\n";
tR += "| Total Entries | " + escapePipe(totalEntries) + " |\n";
tR += "| Avg Pre-Mood (all emotions) | " + escapePipe(avgPreMood) + " |\n";
tR += "| Avg Post-Mood (all emotions) | " + escapePipe(avgPostMood) + " |\n";
tR += "| Avg Improvement | " + escapePipe(avgImprovement) + " |\n";
tR += "| Most Frequent Distortion | " + escapePipe(freqDistortion) + " |\n";
tR += "| Most Helpful Technique | " + escapePipe(helpfulTechnique) + " |\n";
tR += "| Values Touched Today | " + escapePipe(nl2br(valuesTouched)) + " |\n\n";

tR += "---\n\n";

tR += "## Resistance Check (Magic Button)\n\n";
tR += "> *If I could push a button and instantly eliminate today's distress, would I?*\n";
tR += "> - [ ] Yes → Great, proceed with techniques\n";
tR += "> - [ ] No / Unsure → **Explore resistance first**: What might I lose? What does this feeling protect? What's the benefit of staying stuck?\n\n";
tR += "**Resistance Exploration:** " + escapePipe(nl2br(resistanceExploration)) + "\n\n";

tR += "---\n\n";

tR += "## Tomorrow's Intention\n\n";
tR += "**One behavioral experiment / exposure / values action I'll try tomorrow:** " + escapePipe(nl2br(tomorrowExperiment)) + "\n\n";
tR += "**Prediction (0-100%):**\n";
tR += "- Difficulty: " + escapePipe(predDifficulty) + "%\n";
tR += "- Satisfaction: " + escapePipe(predSatisfaction) + "%\n\n";

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