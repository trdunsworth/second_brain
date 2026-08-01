---
creation_date: {{date:YYYY-MM-DD}}
modification_date: {{date:YYYY-MM-DD}}
title: Toastmasters Training Attendance Report
author: 
attendee_count: 300
---

# Toastmasters Training Attendance Report

## Training Information

**Training Course Name:** 
**Date:** 
**Location:** 
**Type of Training:** 

## Attendance Record

<%*
const count = parseInt(tp.frontmatter.attendee_count) || 300;
let table = "| Name | Email | Member Number | District | Division | Area | Club Name | Club Number | Section 1 | Section 2 | Section 3 | Complete |\n";
table += "|------|-------|---------------|----------|----------|------|-----------|-------------|-----------|-----------|-----------|----------|\n";
for (let i = 0; i < count; i++) {
  table += "|      |       |               |          |          |      |           |             |           |           |           |          |\n";
}
tR += table;
_%>

---

*Report generated on {{date:YYYY-MM-DD}}*
*Template configured for <% tp.frontmatter.attendee_count %> attendees (adjust attendee_count in frontmatter)*