---
title: "Personal Measurements - <% tp.date.now('YYYY-MM-DD') %>"
tags: ["measurements", "criteria", "tracking", "attitude-adjustment"]
date: "<% tp.date.now('YYYY-MM-DD') %>"
created: "<% tp.date.now('YYYY-MM-DD HH:mm') %>"
---

<%*
// Helper function for 1-10 ratings
async function rate(prompt) {
  const options = ["1","2","3","4","5","6","7","8","9","10"];
  const values = [1,2,3,4,5,6,7,8,9,10];
  return await tp.system.suggester(options, values, false, prompt);
}

// ===== DOMAIN: Husband/Spouse Relationships =====
const husbandEmotionalCurrent = await rate("Husband - Emotional Connection (1-10):");
const husbandEmotionalGoal = await rate("Husband - Emotional Connection Goal (1-10):");
const husbandEmotionalTarget = await tp.system.prompt("Husband - Emotional Connection Weekly Target:");
const husbandCommCurrent = await rate("Husband - Communication Quality (1-10):");
const husbandCommGoal = await rate("Husband - Communication Goal (1-10):");
const husbandCommImprovements = await tp.system.prompt("Husband - Communication Improvements:", "", true);
const husbandTimeCurrent = await tp.system.prompt("Husband - Quality Time Current (hours/week):");
const husbandTimeGoal = await tp.system.prompt("Husband - Quality Time Goal (hours/week):");
const husbandTimeActivities = await tp.system.prompt("Husband - Quality Time Activities:", "", true);
const husbandBalanceCurrent = await rate("Husband - Partnership Balance (1-10):");
const husbandBalanceGoal = await rate("Husband - Partnership Balance Goal (1-10):");
const husbandBalanceAssessment = await tp.system.prompt("Husband - Balance Assessment Method:", "", true);

// ===== DOMAIN: Personal Character Traits =====
const patienceCurrent = await rate("Patience Level (1-10):");
const patienceGoal = await rate("Patience Goal (1-10):");
const patienceStressors = await tp.system.prompt("Patience Stressors:", "", true);
const patienceResponses = await tp.system.prompt("Patience Response Techniques:", "", true);
const focusCurrent = await tp.system.prompt("Focus Capacity Current (minutes):");
const focusGoal = await tp.system.prompt("Focus Capacity Goal (minutes):");
const focusDailyAvg = await tp.system.prompt("Focus Daily Average:", "", true);
const focusDistraction = await tp.system.prompt("Focus Distraction Management:", "", true);
const meditationCurrent = await tp.system.prompt("Meditation Current (minutes/day):");
const meditationGoal = await tp.system.prompt("Meditation Goal (minutes/day):");
const meditationMethods = await tp.system.prompt("Meditation Methods:", "", true);
const meditationIndicators = await tp.system.prompt("Meditation Progress Indicators:", "", true);
const moodCurrent = await rate("Mood/Attitude Score Current (1-10):");
const moodGoal = await rate("Mood/Attitude Goal (1-10):");
const moodTriggers = await tp.system.prompt("Mood Triggers:", "", true);
const moodBoosters = await tp.system.prompt("Mood Boosters:", "", true);
const empathyCurrent = await rate("Empathy Level Current (1-10):");
const empathyGoal = await rate("Empathy Goal (1-10):");
const empathyPractices = await tp.system.prompt("Empathy Practices:", "", true);

// ===== DOMAIN: Leadership/Personal Skills =====
const leadershipCurrent = await rate("Leadership Effectiveness (1-10):");
const leadershipGoal = await rate("Leadership Goal (1-10):");
const leadershipSkills = await tp.system.prompt("Leadership Skills to Develop:", "", true);
const leadershipDelegation = await tp.system.prompt("Leadership Delegation:", "", true);
const speakingCurrent = await rate("Public Speaking Comfort (1-10):");
const speakingGoal = await rate("Public Speaking Goal (1-10):");
const speakingOpportunities = await tp.system.prompt("Speaking Opportunities:", "", true);
const feedbackCurrent = await rate("Feedback Reception (1-10):");
const feedbackGoal = await rate("Feedback Reception Goal (1-10):");
const feedbackApproaches = await tp.system.prompt("Feedback Approaches:", "", true);

// ===== DOMAIN: Professional Skills =====
const technicalCurrent = await rate("Technical Competency (1-10):");
const technicalGoal = await rate("Technical Competency Goal (1-10):");
const technicalSkills = await tp.system.prompt("Technical Skills to Master:", "", true);
const industryCurrent = await rate("Industry Knowledge (1-10):");
const industryGoal = await rate("Industry Knowledge Goal (1-10):");
const industrySources = await tp.system.prompt("Industry Knowledge Sources:", "", true);
const networkingCurrent = await rate("Networking Capability (1-10):");
const networkingGoal = await rate("Networking Goal (1-10):");
const networkingActivities = await tp.system.prompt("Networking Activities:", "", true);

// ===== DOMAIN: Research & Personal Growth =====
const learningCurrent = await tp.system.prompt("Learning Capacity Current (hours/week):");
const learningGoal = await tp.system.prompt("Learning Capacity Goal (hours/week):");
const learningMethods = await tp.system.prompt("Learning Methods:", "", true);
const researchCurrent = await rate("Research Depth (1-10):");
const researchGoal = await rate("Research Depth Goal (1-10):");
const researchAreas = await tp.system.prompt("Research Areas of Focus:", "", true);
const applicationCurrent = await rate("Application Rate (1-10):");
const applicationGoal = await rate("Application Rate Goal (1-10):");
const applicationExamples = await tp.system.prompt("Application Examples:", "", true);

// Build output via tR
tR += "# Personal Measurements\n\n";
tR += "## Overview\n\n";
tR += "This document tracks personal measurement criteria for self-improvement across different life domains\n\n";
tR += "## Current Status\n\n";
tR += "Last updated: " + tp.date.now('YYYY-MM-DD') + "\n\n";

tR += "## Measurements by Domain\n\n";

tR += "### Domain: Husband/Spouse Relationships\n\n";

tR += "- **Emotional Connection**\n";
tR += "  - Scale: 1 (Very poor) to 10 (Excellent)\n";
tR += "  - Current: " + husbandEmotionalCurrent + "/10\n";
tR += "  - Goal: " + husbandEmotionalGoal + "/10\n";
tR += "  - Weekly target: Increase by " + husbandEmotionalTarget + "\n\n";

tR += "- **Communication Quality**\n";
tR += "  - Scale: 1 (Poor) to 10 (Excellent)\n";
tR += "  - Current: " + husbandCommCurrent + "/10\n";
tR += "  - Goal: " + husbandCommGoal + "/10\n";
tR += "  - Key improvement areas:\n";
tR += "    " + husbandCommImprovements + "\n\n";

tR += "- **Quality Time Together**\n";
tR += "  - Scale: Hours (0-100+ per week)\n";
tR += "  - Current: " + husbandTimeCurrent + " hours/week\n";
tR += "  - Goal: " + husbandTimeGoal + " hours/week\n";
tR += "  - Activities to increase:\n";
tR += "    " + husbandTimeActivities + "\n\n";

tR += "- **Partnership Balance**\n";
tR += "  - Scale: 1 (Imbalanced) to 10 (Well-balanced)\n";
tR += "  - Current: " + husbandBalanceCurrent + "/10\n";
tR += "  - Goal: " + husbandBalanceGoal + "/10\n";
tR += "  - Assessment method:\n";
tR += "    " + husbandBalanceAssessment + "\n\n";

tR += "### Domain: Personal Character Traits\n\n";

tR += "- **Patience Level**\n";
tR += "  - Scale: 1 (Very low) to 10 (High)\n";
tR += "  - Current: " + patienceCurrent + "/10\n";
tR += "  - Goal: " + patienceGoal + "/10\n";
tR += "  - Stress triggers:\n";
tR += "    " + patienceStressors + "\n";
tR += "  - Response techniques:\n";
tR += "    " + patienceResponses + "\n\n";

tR += "- **Focus Capacity**\n";
tR += "  - Scale: Minutes of uninterrupted work\n";
tR += "  - Current: " + focusCurrent + " minutes\n";
tR += "  - Goal: " + focusGoal + " minutes\n";
tR += "  - Average daily focus:\n";
tR += "    " + focusDailyAvg + "\n";
tR += "  - Distraction management:\n";
tR += "    " + focusDistraction + "\n\n";

tR += "- **Meditation/Mindfulness Practice**\n";
tR += "  - Scale: Minutes of regular practice\n";
tR += "  - Current: " + meditationCurrent + " minutes/day\n";
tR += "  - Goal: " + meditationGoal + " minutes/day\n";
tR += "  - Practice methods:\n";
tR += "    " + meditationMethods + "\n";
tR += "  - Progress indicators:\n";
tR += "    " + meditationIndicators + "\n\n";

tR += "- **Mood/Attitude Score**\n";
tR += "  - Scale: 1 (Negative) to 10 (Positive)\n";
tR += "  - Current: " + moodCurrent + "/10\n";
tR += "  - Goal: " + moodGoal + "/10\n";
tR += "  - Mood pattern triggers:\n";
tR += "    " + moodTriggers + "\n";
tR += "  - Mood boosters:\n";
tR += "    " + moodBoosters + "\n\n";

tR += "- **Empathy Level**\n";
tR += "  - Scale: 1 (Low) to 10 (High)\n";
tR += "  - Current: " + empathyCurrent + "/10\n";
tR += "  - Goal: " + empathyGoal + "/10\n";
tR += "  - Empathy practice methods:\n";
tR += "    " + empathyPractices + "\n\n";

tR += "### Domain: Leadership/Personal Skills\n\n";

tR += "- **Leadership Effectiveness**\n";
tR += "  - Scale: 1 (Poor) to 10 (Effective)\n";
tR += "  - Current: " + leadershipCurrent + "/10\n";
tR += "  - Goal: " + leadershipGoal + "/10\n";
tR += "  - Skills to develop:\n";
tR += "    " + leadershipSkills + "\n";
tR += "  - Delegation capability:\n";
tR += "    " + leadershipDelegation + "\n\n";

tR += "- **Public Speaking Comfort**\n";
tR += "  - Scale: 1 (Terrified) to 10 (Comfortable)\n";
tR += "  - Current: " + speakingCurrent + "/10\n";
tR += "  - Goal: " + speakingGoal + "/10\n";
tR += "  - Speaking opportunities:\n";
tR += "    " + speakingOpportunities + "\n\n";

tR += "- **Feedback Reception**\n";
tR += "  - Scale: 1 (Avoidant) to 10 (Seeking)\n";
tR += "  - Current: " + feedbackCurrent + "/10\n";
tR += "  - Goal: " + feedbackGoal + "/10\n";
tR += "  - Feedback approaches:\n";
tR += "    " + feedbackApproaches + "\n\n";

tR += "### Domain: Professional Skills\n\n";

tR += "- **Technical Competency**\n";
tR += "  - Scale: 1 (Basic) to 10 (Expert)\n";
tR += "  - Current: " + technicalCurrent + "/10\n";
tR += "  - Goal: " + technicalGoal + "/10\n";
tR += "  - Skills to master:\n";
tR += "    " + technicalSkills + "\n\n";

tR += "- **Industry Knowledge**\n";
tR += "  - Scale: 1 (Limited) to 10 (Comprehensive)\n";
tR += "  - Current: " + industryCurrent + "/10\n";
tR += "  - Goal: " + industryGoal + "/10\n";
tR += "  - Knowledge sources:\n";
tR += "    " + industrySources + "\n\n";

tR += "- **Networking Capability**\n";
tR += "  - Scale: 1 (Limited) to 10 (Extensive)\n";
tR += "  - Current: " + networkingCurrent + "/10\n";
tR += "  - Goal: " + networkingGoal + "/10\n";
tR += "  - Networking activities:\n";
tR += "    " + networkingActivities + "\n\n";

tR += "### Domain: Research & Personal Growth\n\n";

tR += "- **Learning Capacity**\n";
tR += "  - Scale: Hours of study per week\n";
tR += "  - Current: " + learningCurrent + " hours/week\n";
tR += "  - Goal: " + learningGoal + " hours/week\n";
tR += "  - Learning methods:\n";
tR += "    " + learningMethods + "\n\n";

tR += "- **Research Depth**\n";
tR += "  - Scale: 1 (Surface) to 10 (Deep)\n";
tR += "  - Current: " + researchCurrent + "/10\n";
tR += "  - Goal: " + researchGoal + "/10\n";
tR += "  - Research areas of focus:\n";
tR += "    " + researchAreas + "\n\n";

tR += "- **Application Rate**\n";
tR += "  - Scale: 1 (Never) to 10 (Always)\n";
tR += "  - Current: " + applicationCurrent + "/10\n";
tR += "  - Goal: " + applicationGoal + "/10\n";
tR += "  - Application examples:\n";
tR += "    " + applicationExamples + "\n\n";
-%>

<%* tp.file.cursor() %>
