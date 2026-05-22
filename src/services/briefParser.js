export function extractSection(markdown, heading) {
  if (!markdown) return "";

  const pattern = new RegExp(
    `##\\s*\\d*\\.?\\s*${heading}[\\s\\S]*?(?=\\n##\\s*\\d*\\.?\\s|$)`,
    "i"
  );

  const match = markdown.match(pattern);
  if (!match) return "";

  return match[0]
    .replace(/^##\s*\d*\.?\s*.*\n?/i, "")
    .trim();
}

export function parseDailyBrief(markdown) {
  return {
    executiveSummary: extractSection(markdown, "Executive Summary"),
    priorities: extractSection(markdown, "Top 3 Priorities")
      .split("\n")
      .filter(Boolean),
    quickGlance: extractSection(markdown, "Quick Glance"),
    commitments: extractSection(markdown, "Commitments & Follow-ups"),
    risks: extractSection(markdown, "Risks / Friction")
      .split("\n")
      .filter(Boolean),
    opportunities: extractSection(markdown, "Opportunities")
      .split("\n")
      .filter(Boolean),
    peopleAwareness: extractSection(markdown, "Relationship / People Awareness"),
    strategicReminder: extractSection(markdown, "Strategic Reminder"),
  };
}