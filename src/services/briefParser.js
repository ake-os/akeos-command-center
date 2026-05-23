export function parseDailyBrief(text) {
  if (!text) {
    return {
      executiveSummary: "",
      priorities: [],
      opportunities: [],
      risks: [],
    };
  }

  const clean = text.replace(/\\n/g, "\n");

  const prioritiesMatch = clean.match(
    /\*\*Top Priorities\*\*([\s\S]*?)(\*\*|$)/
  );

  const opportunitiesMatch = clean.match(
    /\*\*Opportunities\*\*([\s\S]*?)(\*\*|$)/
  );

  const risksMatch = clean.match(
    /\*\*Risks.*?\*\*([\s\S]*?)(\*\*|$)/
  );

  return {
    executiveSummary: clean.split("\n").slice(0, 6).join("\n"),

    priorities: prioritiesMatch
      ? prioritiesMatch[1]
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.replace("-", "").trim())
      : [],

    opportunities: opportunitiesMatch
      ? opportunitiesMatch[1]
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.replace("-", "").trim())
      : [],

    risks: risksMatch
      ? risksMatch[1]
          .split("\n")
          .filter((line) => line.trim().startsWith("-"))
          .map((line) => line.replace("-", "").trim())
      : [],
  };
}