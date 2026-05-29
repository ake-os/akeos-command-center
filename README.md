# AKEOS Command Center

AKEOS Command Center is a React and Vite dashboard for the Daily Executive Brief.

## Daily Brief Data Source

The primary data source is `public/daily-brief.json`. Vite serves that file at `/daily-brief.json`, and `src/lib/loadDailyBrief.js` fetches it with a cache-busting query string and refreshes it every 60 seconds.

The dashboard expects this canonical shape:

```json
{
  "generatedAt": "",
  "todaySummary": "",
  "meetings": [],
  "priorityEmails": [],
  "followUps": [],
  "priorities": [],
  "risks": [],
  "recommendedAction": ""
}
```

`src/App.jsx` consumes the normalized brief and renders the existing dashboard cards without changing layout, styling, colors, typography, or branding.

## Fallback Source

If `daily-brief.json` is missing, invalid, empty, or fails to load, the dashboard falls back to the existing Obsidian flow:

- `src/services/obsidian.js` fetches the current daily log markdown.
- `src/services/briefParser.js` parses markdown sections into brief fields.
- `src/App.jsx` normalizes that parsed result into the same daily brief shape used by the JSON source.

## n8n Integration

n8n should generate or update `public/daily-brief.json` using the canonical schema. After that file changes, the running dashboard will pick up the new data on its next 60-second refresh without code changes.

Suggested integration mapping:

- Google Calendar populates `meetings`.
- Gmail populates `priorityEmails`, `followUps`, `risks`, and `recommendedAction`.
- Slack populates `followUps`, `risks`, and priority context.
- Notion populates `priorities`, project context, and open action items.
- Obsidian remains available as the fallback daily-log source.
