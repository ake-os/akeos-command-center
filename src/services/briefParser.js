function getSection(text, heading) {
  const pattern = new RegExp(
    `##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
    "i"
  );

  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function getBullets(section) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
}

function parseStrategicMeetings(section) {
  if (!section) return [];

  return getBullets(section).map((line) => {
    const parts = line.split("|").map((part) => part.trim());

    return {
      time: parts[0] || "",
      title: parts[1] || "Untitled meeting",
      badge: parts[2] || "Strategic",
      prep: parts[3] || "Review context before meeting",
    };
  });
}

export function parseDailyBrief(text) {
  const clean = (text || "").replace(/\\n/g, "\n");

  return {
    executiveSummary: getBullets(getSection(clean, "Executive Summary")).join("\n"),
    priorities: getBullets(getSection(clean, "Top Priorities")),
    risks: getBullets(getSection(clean, "Risks")),
    opportunities: getBullets(getSection(clean, "Opportunities")),
    peopleFollowUps: getBullets(getSection(clean, "People / Follow-ups")),
    strategicReminder: getSection(clean, "Strategic Reminder"),
    strategicMeetings: parseStrategicMeetings(
      getSection(clean, "Strategic Meetings")
    ),
    raw: clean,
  };
}