import { useEffect, useState } from "react";

export const DAILY_BRIEF_PATH = "/daily-brief.json";

export const emptyDailyBrief = Object.freeze({
  generatedAt: "",
  todaySummary: "",
  meetings: [],
  priorityEmails: [],
  followUps: [],
  priorities: [],
  risks: [],
  recommendedAction: "",
});

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function pickText(value, keys) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  for (const key of keys) {
    const text = toText(value[key]);
    if (text) {
      return text;
    }
  }

  return "";
}

function normalizeMeeting(meeting) {
  if (!meeting || typeof meeting !== "object") {
    return null;
  }

  const title = pickText(meeting, ["title", "summary", "name", "subject"]);

  if (!title) {
    return null;
  }

  return {
    time: pickText(meeting, ["time", "startsAt", "startTime", "start"]) || "TBD",
    title,
    badge: pickText(meeting, ["badge", "type", "priority", "status"]) || "Strategic",
    prep: pickText(meeting, ["prep", "preparation", "context", "notes"]) || "Review context before meeting",
  };
}

function normalizePriority(priority) {
  if (Array.isArray(priority)) {
    const title = toText(priority[0]);

    if (!title) {
      return null;
    }

    return {
      title,
      status: toText(priority[1]) || "High",
    };
  }

  const title = pickText(priority, ["title", "priority", "name", "text", "summary"]);

  if (!title) {
    return null;
  }

  return {
    title,
    status: pickText(priority, ["status", "urgency", "priorityLevel", "badge"]) || "High",
  };
}

function normalizeTextItem(item) {
  const text = pickText(item, ["title", "text", "summary", "action", "subject", "name"]);
  return text || null;
}

function normalizePriorityEmail(email) {
  if (!email || typeof email !== "object") {
    return null;
  }

  const subject = pickText(email, ["subject", "title", "summary"]);

  if (!subject) {
    return null;
  }

  return {
    from: pickText(email, ["from", "sender", "name"]),
    subject,
    summary: pickText(email, ["summary", "snippet", "body"]),
    urgency: pickText(email, ["urgency", "priority", "status"]) || "Medium",
    actionRequired: pickText(email, ["actionRequired", "action", "nextAction"]),
  };
}

export function normalizeDailyBrief(data = {}) {
  return {
    ...emptyDailyBrief,
    generatedAt: toText(data.generatedAt),
    todaySummary: toText(data.todaySummary),
    meetings: toArray(data.meetings).map(normalizeMeeting).filter(Boolean),
    priorityEmails: toArray(data.priorityEmails)
      .map(normalizePriorityEmail)
      .filter(Boolean),
    followUps: toArray(data.followUps).map(normalizeTextItem).filter(Boolean),
    priorities: toArray(data.priorities).map(normalizePriority).filter(Boolean),
    risks: toArray(data.risks).map(normalizeTextItem).filter(Boolean),
    recommendedAction: toText(data.recommendedAction),
  };
}

export function isDailyBriefEmpty(brief) {
  if (!brief) {
    return true;
  }

  return (
    !brief.todaySummary &&
    brief.meetings.length === 0 &&
    brief.priorityEmails.length === 0 &&
    brief.followUps.length === 0 &&
    brief.priorities.length === 0 &&
    brief.risks.length === 0 &&
    !brief.recommendedAction
  );
}

export async function loadDailyBrief({ signal } = {}) {
  const response = await fetch(`${DAILY_BRIEF_PATH}?ts=${Date.now()}`, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load ${DAILY_BRIEF_PATH}`);
  }

  const text = await response.text();

  if (!text.trim()) {
    return emptyDailyBrief;
  }

  return normalizeDailyBrief(JSON.parse(text));
}

export function useDailyBrief({ refreshIntervalMs = 60000 } = {}) {
  const [state, setState] = useState({
    brief: null,
    error: null,
    status: "loading",
  });

  useEffect(() => {
    let isMounted = true;
    let controller;

    async function refresh(isInitialLoad = false) {
      controller?.abort();
      controller = new AbortController();

      if (isInitialLoad) {
        setState((current) => ({
          ...current,
          status: "loading",
        }));
      }

      try {
        const brief = await loadDailyBrief({ signal: controller.signal });

        if (!isMounted) {
          return;
        }

        setState({
          brief,
          error: null,
          status: isDailyBriefEmpty(brief) ? "empty" : "success",
        });
      } catch (error) {
        if (!isMounted || error.name === "AbortError") {
          return;
        }

        setState({
          brief: null,
          error,
          status: "error",
        });
      }
    }

    refresh(true);

    const intervalId =
      refreshIntervalMs > 0
        ? window.setInterval(() => refresh(false), refreshIntervalMs)
        : null;

    return () => {
      isMounted = false;
      controller?.abort();

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [refreshIntervalMs]);

  return state;
}
