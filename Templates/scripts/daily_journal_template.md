---
creation date: <% tp.date.now("YYYY-MM-DD HH:mm") %>
modification date: <% tp.date.now("dddd Do MMMM YYYY HH:mm:ss") %>
author: Dr. Tony Dunsworth
title: Daily Journal <% tp.date.now("YYYY-MM-DD") %>
workday: false
---
<< [[<% tp.date.now("YYYY-MM-DD", -1) %>]] | [[<% tp.date.now("YYYY-MM-DD", 1) %>]] >>

# <% moment(tp.date.now("YYYY-MM-DD"),'YYYY-MM-DD').format("dddd, MMMM DD, YYYY") %>

## Starting Notes

<%* tp.file.cursor() %>

<%*
const day = tp.date.now("dddd", 0);
const isWeekday = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day);
if (isWeekday) {
  tR += "## ALX Work\n\n";
}
-%>

## DMA Work


## TI Work


## TODO

<%*
// Carry forward unchecked TODOs from previous day
const prevDate = tp.date.now("YYYY-MM-DD", -1);
const prevFile = tp.file.find_tfile(prevDate);
if (prevFile) {
  const prevContent = await tp.file.include(`[[${prevDate}]]`);
  const todoSection = prevContent.split("## TODO")[1];
  if (todoSection) {
    const lines = todoSection.split("\n");
    const unchecked = lines.filter(line => line.trim().startsWith("- [ ]"));
    if (unchecked.length > 0) {
      tR += unchecked.join("\n") + "\n";
    }
  }
}
-%>

- [ ]


## Daily Mood Log

<%*
const includeMoodLog = await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, "Include Daily Mood Log?");
if (includeMoodLog === "Yes") {
  tR += "\n" + await tp.file.include("Templates/scripts/daily_mood_log_template_templater.md");
}
-%>

## Project Updates



## Research Projects



## Habit Tracker

<%*
const includeHabitTracker = await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, "Include Habit Tracker?");
if (includeHabitTracker === "Yes") {
  tR += "\n" + await tp.file.include("Templates/scripts/habit_tracker_template_templater.md");
}
-%>

## Daily Reflection

<%*
const includeReflection = await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, "Include Daily Reflection?");
if (includeReflection === "Yes") {
  tR += "\n" + await tp.file.include("Templates/scripts/daily_reflection_template_templater.md");
}
-%>

## Daily Tarot Reading - <% tp.date.now("dddd, MMMM DD, YYYY") %>

<%*
const includeTarot = await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, "Include full Tarot reading template?");
if (includeTarot === "Yes") {
  tR += "\n" + await tp.file.include("Templates/scripts/daily_tarot_reading_template_templater.md");
}
-%>

## Blog Post Ideas

<%*
const includeBlog = await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, "Include Blog Idea Capture template?");
if (includeBlog === "Yes") {
  tR += "\n" + await tp.file.include("Templates/scripts/blog_idea_capture_template_templater.md");
}
-%>

## Personal Measurements

<%*
const includeMeasurements = await tp.system.suggester(["Yes", "No"], ["Yes", "No"], false, "Include Personal Measurements?");
if (includeMeasurements === "Yes") {
  tR += "\n" + await tp.file.include("Templates/scripts/personal_measurements_template_templater.md");
}
-%>

### Interesting Links.
