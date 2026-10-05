---
title: "<% window._title = await tp.system.prompt('Speech Title:', '') %>"
date: "<% window._date = await tp.system.prompt('Speech Date (YYYY-MM-DD):', tp.date.now('YYYY-MM-DD'), true) %>"
pathway: "<% window._pathway = await tp.system.prompt('Pathway:', 'Presentation Mastery / Dynamic Leadership / Effective Coaching / Innovative Planning / Leadership Development / Motivational Strategies / Persuasive Influence / Strategic Relationships / Engaging Humor / Visionary Communication') %>"
level: "<% window._level = await tp.system.prompt('Level:', 'Level 1 / Level 2 / Level 3 / Level 4 / Level 5') %>"
project: "<% window._project = await tp.system.prompt('Project Name:', '') %>"
club: "<% window._club = await tp.system.prompt('Club:', 'Northwest Narrators Toastmasters Club') %>"
evaluator: "<% window._evaluator = await tp.system.prompt('Evaluator (optional):', '') %>"
tags: [toastmasters, speech, "<% (window._pathway || '').toLowerCase().replace(/\s+/g, '-') %>", "<% (window._level || '').toLowerCase().replace(/\s+/g, '-') %>"]
---

# <% window._title || '' %>

**Date:** <% window._date || '' %> | **Pathway:** <% window._pathway || '' %> | **Level:** <% window._level || '' %> | **Project:** <% window._project || '' %>
**Club:** <% window._club || '' %> | **Evaluator:** <% window._evaluator || '' %>
**Time:** <% tp.system.prompt('Time (e.g., 5-7 min):', '5-7 min') %>

---

## 🎯 Evaluator Introduction

*Brief intro for your evaluator — share your goals, focus areas, or specific things you'd like them to watch for.*

<% tp.system.prompt('Evaluator Introduction / Focus Areas:', '') %>

---

## 📝 Speech Content

### Opening
<% tp.system.prompt('Opening (hook, greeting, preview):', '') %>

### Body
#### Main Point 1
<% tp.system.prompt('Main Point 1:', '') %>

#### Main Point 2
<% tp.system.prompt('Main Point 2:', '') %>

#### Main Point 3
<% tp.system.prompt('Main Point 3:', '') %>

### Conclusion
<% tp.system.prompt('Conclusion (summary, call to action, memorable close):', '') %>

---

## 📚 References & Resources

| Title | Type | Link / Notes |
|-------|------|--------------|
|       | Book / Article / Video / Other | |
|       | Book / Article / Video / Other | |
|       | Book / Article / Video / Other | |

---

## 📋 Evaluation Notes

*To be filled in by evaluator during/after the speech*

### Strengths
- 
- 
- 

### Suggestions for Improvement
- 
- 
- 

### Overall Comments
<% tp.system.prompt('Evaluator Comments:', '') %>

---

## 🎤 Speaker Reflection (Post-Speech)

*Fill this in after receiving evaluation*

### What Went Well
- 
- 

### What to Improve Next Time
- 
- 

### Key Takeaway
<% tp.system.prompt('Key Takeaway:', '') %>

---

*Template: Toastmasters Speech Template | Pathway: <% window._pathway || '' %> | Level: <% window._level || '' %> | Project: <% window._project || '' %> | Date: <% window._date || '' %>*

<%* tp.file.cursor() %>
