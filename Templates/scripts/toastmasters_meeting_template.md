# NNTC Meeting <% tp.date.now("YYYY-MM-DD") %>

**Meeting Number:** <% tp.user.getNextMeetingNumber() || "TBD" %>
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
<%*
const memberCount = parseInt(await tp.system.prompt("Number of members present (0-15)") || "0");
for (let i = 1; i <= memberCount; i++) {
    const member = await tp.user.selectMember(`Member ${i}`);
    if (member) tR += `- ${member}\n`;
    else break;
}
if (memberCount === 0) tR += "- \n";
_%>

### Guests
<%*
const guestCount = parseInt(await tp.system.prompt("Number of guests (0-5)") || "0");
for (let i = 1; i <= guestCount; i++) {
    const guest = await tp.system.prompt(`Guest ${i} Name`);
    if (guest) tR += `- ${guest}\n`;
    else break;
}
if (guestCount === 0) tR += "- \n";
_%>

---

## 🎭 Meeting Roles

| Role | Member |
|------|--------|
| **Sergeant-At-Arms** | <% await tp.user.selectMember("Sergeant-At-Arms") %> |
| **President** | <% await tp.user.selectMember("President") %> |
| **Toastmaster** | <% await tp.user.selectMember("Toastmaster") %> |
| **Table Topics Master** | <% await tp.user.selectMember("Table Topics Master") %> |
| **General Evaluator** | <% await tp.user.selectMember("General Evaluator") %> |
| **Timer** | <% await tp.user.selectMember("Timer") %> |
| **Ah Counter & Grammarian** | <% await tp.user.selectMember("Ah Counter & Grammarian") %> |
| **Listen Up, Leader** | <% await tp.user.selectMember("Listen Up, Leader") %> |

### Speakers & Evaluators

| Role | Member | Pathway / Level | Speech Title | Time |
|------|--------|-----------------|--------------|------|
| **Speaker 1** | <% await tp.user.selectMember("Speaker 1") %> | <% await tp.system.prompt("Speaker 1 Pathway/Level") %> | <% await tp.system.prompt("Speaker 1 Speech Title") %> | 00:00 |
| **Speaker 2** | <% await tp.user.selectMember("Speaker 2") %> | <% await tp.system.prompt("Speaker 2 Pathway/Level") %> | <% await tp.system.prompt("Speaker 2 Speech Title") %> | 00:00 |
| **Speaker 3** | <% await tp.user.selectMember("Speaker 3") %> | <% await tp.system.prompt("Speaker 3 Pathway/Level") %> | <% await tp.system.prompt("Speaker 3 Speech Title") %> | 00:00 |
| **Evaluator 1** | <% await tp.user.selectMember("Evaluator 1") %> | | | 00:00 |
| **Evaluator 2** | <% await tp.user.selectMember("Evaluator 2") %> | | | 00:00 |
| **Evaluator 3** | <% await tp.user.selectMember("Evaluator 3") %> | | | 00:00 |

---

## 🗣️ Table Topics

<%*
const ttCount = parseInt(await tp.system.prompt("Number of Table Topics participants (1-6)") || "3");
for (let i = 1; i <= ttCount; i++) {
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

Run in Templater: `<% tp.user.exportToPDF(tp.file.title) %>`

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