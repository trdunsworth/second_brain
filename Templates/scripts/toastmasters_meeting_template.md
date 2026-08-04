# NNTC Meeting <% tp.date.now("YYYY-MM-DD") %>

**Meeting Number:** <% await tp.system.prompt("Meeting Number") %>
**Theme:** <% await tp.system.prompt("Meeting Theme (optional)") %>

---

## 📅 Meeting Details

- **Date:** <% tp.date.now("dddd, MMMM DD, YYYY") %>
- **Time:** <% tp.date.now("HH:mm") %> - <% tp.date.now("HH:mm", 1.5 * 60 * 60 * 1000) %>
- **Location:** <% await tp.system.prompt("Meeting Location") %>
- **Club:** Northern Neck Toastmasters Club

---

## 👥 Attendance

### Members Present
- 
- 
- 
- 
- 

### Guests
- 
- 
- 

---

## 🎭 Meeting Roles

| Role | Member |
|------|--------|
| **Sergeant-At-Arms** | |
| **President** | |
| **Toastmaster** | |
| **Table Topics Master** | |
| **General Evaluator** | |
| **Timer** | |
| **Ah Counter & Grammarian** | |
| **Listen Up, Leader** | |

### Speakers & Evaluators

| Role | Member | Pathway / Level | Speech Title | Time |
|------|--------|-----------------|--------------|------|
| **Speaker 1** | | <% await tp.system.prompt("Speaker 1 Pathway/Level") %> | <% await tp.system.prompt("Speaker 1 Speech Title") %> | 00:00 |
| **Speaker 2** | | <% await tp.system.prompt("Speaker 2 Pathway/Level") %> | <% await tp.system.prompt("Speaker 2 Speech Title") %> | 00:00 |
| **Speaker 3** | | <% await tp.system.prompt("Speaker 3 Pathway/Level") %> | <% await tp.system.prompt("Speaker 3 Speech Title") %> | 00:00 |
| **Evaluator 1** | | | | 00:00 |
| **Evaluator 2** | | | | 00:00 |
| **Evaluator 3** | | | | 00:00 |

---

## 🗣️ Table Topics

<%*
const tableTopicsCount = parseInt(await tp.system.prompt("Number of Table Topics participants (1-6)") || "3");
for (let i = 1; i <= tableTopicsCount; i++) {
    const name = await tp.system.prompt(`TT${i} - Participant Name`);
    const question = await tp.system.prompt(`TT${i} - Question Asked`);
    tR += `| **TT${i}** | ${name} | ${question} | 00:00 |\n`;
}
_%>

| # | Participant | Question | Time |
|---|-------------|----------|------|

---

## ⏱️ Timer's Report

| Role / Speaker | Time Used | Time Allowed | Status |
|----------------|-----------|--------------|--------|
<%*
const speakers = ["Speaker 1", "Speaker 2", "Speaker 3"];
for (const s of speakers) {
    tR += `| **${s}** | 00:00 | 5:00-7:00 | ☐ |\n`;
}
const evaluators = ["Evaluator 1", "Evaluator 2", "Evaluator 3"];
for (const e of evaluators) {
    tR += `| **${e}** | 00:00 | 2:00-3:00 | ☐ |\n`;
}
const ttCount = parseInt(await tp.system.prompt("Number of Table Topics participants (for Timer's Report)") || "3");
for (let i = 1; i <= ttCount; i++) {
    tR += `| **TT${i}** | 00:00 | 1:00-2:00 | ☐ |\n`;
}
_%>

**Timer Notes:** <% await tp.system.prompt("Timer notes / observations") %>

---

## 📄 Export to PDF

Run in Templater: `<% await tp.user.exportToPDF(tp.file.title) %>`

> **Requires:** `obsidian-pandoc` plugin + `pandoc` + `weasyprint` installed
> **Setup:** Copy `exportToPDF.js` to `.obsidian/plugins/templater/user-scripts/`

---

## 📝 Meeting Notes

### Word of the Day
**Word:** <% await tp.system.prompt("Word of the Day") %>
**Definition:** <% await tp.system.prompt("Definition") %>
**Used by:** <% await tp.system.prompt("Members who used the word (comma-separated)") %>

### Educational Moment / Tip
<% await tp.system.prompt("Educational moment or tip shared during meeting") %>

### Business Meeting Notes
<% await tp.system.prompt("Any business meeting items, announcements, or decisions") %>

### Guest Feedback / Comments
<% await tp.system.prompt("Guest feedback or comments") %>

---

## 🏆 Awards & Recognition

| Award | Recipient |
|-------|-----------|
| Best Speaker | |
| Best Evaluator | |
| Best Table Topics | |
| Most Improved | |
| Spark Plug / Spirit Award | |

---

## 📋 Action Items / Follow-up

- [ ] <% await tp.system.prompt("Action item 1") %>
- [ ] <% await tp.system.prompt("Action item 2") %>
- [ ] <% await tp.system.prompt("Action item 3") %>

---

## 📎 Attachments / Links

- Agenda: [[Agenda <% tp.date.now("YYYY-MM-DD") %>]]
- Recording: 
- Photos: 
- Pathways Progress Updates: 

---

*Template created with Templater • Meeting notes for Northern Neck Toastmasters Club*