---
title: "<% tp.system.prompt('Speech Title:') %>"
date: "<% tp.system.prompt('Speech Date (YYYY-MM-DD):', '', true, tp.date.now('YYYY-MM-DD')) %>"
pathway: "<% tp.system.prompt('Pathway:', 'Presentation Mastery / Dynamic Leadership / Effective Coaching / Innovative Planning / Leadership Development / Motivational Strategies / Persuasive Influence / Strategic Relationships / Engaging Humor / Visionary Communication') %>"
level: "<% tp.system.prompt('Level:', 'Level 1 / Level 2 / Level 3 / Level 4 / Level 5') %>"
project: "<% tp.system.prompt('Project Name:', '') %>"
club: "<% tp.system.prompt('Club:', 'Northwest Narrators Toastmasters Club') %>"
evaluator: "<% tp.system.prompt('Evaluator (optional):', '') %>"
tags: [toastmasters, speech, "<% tp.system.prompt('Pathway:', '').toLowerCase().replace(' ', '-') %>", "<% tp.system.prompt('Level:', '').toLowerCase().replace(' ', '-') %>"]
---

# <% tp.system.prompt('Speech Title:') %>

**Date:** <% tp.system.prompt('Speech Date (YYYY-MM-DD):', '', true, tp.date.now('YYYY-MM-DD')) %> | **Pathway:** <% tp.system.prompt('Pathway:', 'Presentation Mastery / Dynamic Leadership / Effective Coaching / Innovative Planning / Leadership Development / Motivational Strategies / Persuasive Influence / Strategic Relationships / Engaging Humor / Visionary Communication') %> | **Level:** <% tp.system.prompt('Level:', 'Level 1 / Level 2 / Level 3 / Level 4 / Level 5') %> | **Project:** <% tp.system.prompt('Project Name:', '') %>
**Club:** <% tp.system.prompt('Club:', 'Northwest Narrators Toastmasters Club') %> | **Evaluator:** <% tp.system.prompt('Evaluator (optional):', '') %>
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

*Template: Toastmasters Speech Template | Pathway: <% tp.system.prompt('Pathway:', '') %> | Level: <% tp.system.prompt('Level:', '') %> | Project: <% tp.system.prompt('Project Name:', '') %> | Date: <% tp.date.now('YYYY-MM-DD') %>*

<%* tp.file.cursor() %>