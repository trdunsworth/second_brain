---
title: "Personal Measurements (Quick) - <% tp.date.now("YYYY-MM-DD") %>"
tags: ["personal", "measurements", "quick"]
created: "<% tp.date.now("YYYY-MM-DD HH:mm") %>"
---

<%*
const rate = async (prompt) => {
  const v = await tp.system.prompt(prompt + " (1-10):", "5");
  return v === null ? "" : v;
};
const num = async (prompt, def="") => {
  const v = await tp.system.prompt(prompt, def);
  return v === null ? "" : v;
};

const husbandEmo = await rate("Husband - Emotional Connection");
const husbandComm = await rate("Husband - Communication");
const husbandBal = await rate("Husband - Partnership Balance");
const patience = await rate("Patience");
const focus = await num("Focus Capacity (minutes)", "60");
const meditation = await num("Meditation (minutes/day)", "10");
const mood = await rate("Mood/Attitude");
const empathy = await rate("Empathy");
const leadership = await rate("Leadership");
const speaking = await rate("Public Speaking");
const feedback = await rate("Feedback Reception");
const technical = await rate("Technical Competency");
const industry = await rate("Industry Knowledge");
const networking = await rate("Networking");
const learning = await num("Learning Capacity (hours/week)", "5");
const research = await rate("Research Depth");
const application = await rate("Application Rate");

tR += "# Personal Measurements (Quick) - " + tp.date.now("dddd, MMMM DD, YYYY") + "\n\n";
tR += "| Domain | Current |\n";
tR += "|---|---|\n";
tR += "| Husband - Emotional Connection | " + husbandEmo + " |\n";
tR += "| Husband - Communication | " + husbandComm + " |\n";
tR += "| Husband - Partnership Balance | " + husbandBal + " |\n";
tR += "| Patience | " + patience + " |\n";
tR += "| Focus Capacity (min) | " + focus + " |\n";
tR += "| Meditation (min/day) | " + meditation + " |\n";
tR += "| Mood/Attitude | " + mood + " |\n";
tR += "| Empathy | " + empathy + " |\n";
tR += "| Leadership | " + leadership + " |\n";
tR += "| Public Speaking | " + speaking + " |\n";
tR += "| Feedback Reception | " + feedback + " |\n";
tR += "| Technical Competency | " + technical + " |\n";
tR += "| Industry Knowledge | " + industry + " |\n";
tR += "| Networking | " + networking + " |\n";
tR += "| Learning Capacity (h/wk) | " + learning + " |\n";
tR += "| Research Depth | " + research + " |\n";
tR += "| Application Rate | " + application + " |\n";
-%>

<%* tp.file.cursor() %>
