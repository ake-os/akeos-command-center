# AKEOS-004 n8n Implementation

Use these steps to update the existing `AKEOS - Daily Executive Brief` n8n workflow so it publishes the dashboard data contract after the AI brief is generated. Do not remove or change the Obsidian write step.

## Node Sequence

Add these nodes after the existing AI brief generation step:

1. Existing node: `Generate Daily Executive Brief`
2. Existing node: `Write Daily Brief to Obsidian`
3. New Code node: `AKEOS-004 - Map Dashboard Daily Brief`
4. New Convert to File node: `AKEOS-004 - Convert JSON to File`
5. New Read/Write Files from Disk node: `AKEOS-004 - Write Dashboard Brief Temp`
6. New Read/Write Files from Disk node: `AKEOS-004 - Publish Dashboard Brief`

Keep the existing `Generate Daily Executive Brief` -> `Write Daily Executive Brief to Obsidian` connection unchanged. Add the AKEOS-004 nodes as a second branch from `Generate Daily Executive Brief` so the Obsidian write path remains untouched.

## Node 1: Existing `Generate Daily Executive Brief`

Keep this node unchanged. Its output must include the generated markdown brief somewhere on the item.

The Code node below checks these common fields, in order:

```text
output[0].content[0].text
dailyBriefMarkdown
briefMarkdown
markdown
text
output
content
message.content
response.text
choices[0].message.content
```

If your AI node uses a different field name, add that field name to the `pickMarkdown()` list in the Code node.

## Node 2: Existing `Write Daily Brief to Obsidian`

Keep this node unchanged. It remains connected from `Generate Daily Executive Brief`.

## Node 3: `AKEOS-004 - Map Dashboard Daily Brief`

Node type: `Code`

Mode:

```text
Run Once for All Items
```

Language:

```text
JavaScript
```

Code:

```js
const inputItems = $input.all();
const source = inputItems[0]?.json || {};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return Object.values(value);
  return [];
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value) || typeof value === "object") return "";
  return String(value).trim();
}

function pickFirstText(object, paths) {
  for (const path of paths) {
    const value = path.split(".").reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      if (key.endsWith("]")) {
        const match = key.match(/^(.+)\[(\d+)\]$/);
        if (!match) return undefined;
        return current[match[1]]?.[Number(match[2])];
      }
      return current[key];
    }, object);

    const text = cleanText(value);
    if (text) return text;
  }

  return "";
}

function pickMarkdown(object) {
  return pickFirstText(object, [
    "output[0].content[0].text",
    "dailyBriefMarkdown",
    "briefMarkdown",
    "markdown",
    "text",
    "output",
    "content",
    "message.content",
    "response.text",
    "choices[0].message.content",
  ]);
}

function formatMeetingTime(event) {
  const raw =
    event.time ||
    event.startTime ||
    event.start?.dateTime ||
    event.start?.date ||
    event.start ||
    "";

  if (!raw) return "TBD";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return cleanText(raw);

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mapMeeting(event) {
  const title = cleanText(
    event.title ||
      event.summary ||
      event.name ||
      event.subject ||
      event.eventTitle
  );

  if (!title) return null;

  return {
    time: formatMeetingTime(event),
    title,
    badge: cleanText(event.badge || event.priority || event.type || event.status) || "Strategic",
    prep:
      cleanText(event.prep || event.preparation || event.agenda || event.description || event.location) ||
      "Review context before meeting",
  };
}

function mapPriority(priority) {
  if (typeof priority === "string") {
    const title = cleanText(priority);
    return title ? { title, status: "High" } : null;
  }

  const title = cleanText(
    priority.title ||
      priority.priority ||
      priority.name ||
      priority.text ||
      priority.summary
  );

  if (!title) return null;

  return {
    title,
    status: cleanText(priority.status || priority.urgency || priority.priorityLevel || priority.badge) || "High",
  };
}

function mapEmail(message) {
  const subject = cleanText(message.subject || message.title || message.summary);
  if (!subject) return null;

  return {
    from: cleanText(message.from || message.sender || message.name || message.email),
    subject,
    summary: cleanText(message.summary || message.snippet || message.preview || message.body),
    urgency: cleanText(message.urgency || message.priority || message.status) || "Medium",
    actionRequired: cleanText(message.actionRequired || message.action || message.nextAction || message.replyNeeded),
  };
}

function toTextList(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string") return cleanText(item);
      return cleanText(item.title || item.text || item.summary || item.action || item.subject || item.name);
    })
    .filter(Boolean);
}

function extractSectionBullets(markdown, headingNames) {
  const names = headingNames.map((name) => name.toLowerCase());
  const lines = markdown.split(/\r?\n/);
  const bullets = [];
  let inSection = false;

  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (heading) {
      inSection = names.includes(heading[1].trim().toLowerCase());
      continue;
    }

    if (inSection && /^\s*[-*]\s+/.test(line)) {
      bullets.push(line.replace(/^\s*[-*]\s+/, "").trim());
    }
  }

  return bullets.filter(Boolean);
}

function extractRecommendedAction(markdown) {
  const section = extractSectionBullets(markdown, [
    "Recommended Action",
    "Recommended Next Action",
    "Next Action",
    "Strategic Reminder",
  ]);

  if (section[0]) return section[0];

  const match = markdown.match(/recommended (?:next )?action\s*:\s*(.+)/i);
  return match ? match[1].trim() : "";
}

function extractStrategicMeetings(markdown) {
  return extractSectionBullets(markdown, ["Strategic Meetings"])
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const title = cleanText(parts[1] || parts[0]);

      if (!title) return null;

      return {
        time: cleanText(parts[0]) || "TBD",
        title,
        badge: cleanText(parts[2]) || "Strategic",
        prep: cleanText(parts[3]) || "Review context before meeting",
      };
    })
    .filter(Boolean);
}

const markdown = pickMarkdown(source);

if (!markdown) {
  throw new Error("AKEOS-004: Missing AI daily brief markdown. Add the AI output field name to pickMarkdown().");
}

const calendarEvents = asArray(
  source.calendarEvents ||
    source.calendar ||
    source.events ||
    source.meetings
);

const gmailMessages = asArray(
  source.gmailMessages ||
    source.gmail ||
    source.emails ||
    source.priorityEmails
);

const mappedMeetings = calendarEvents.map(mapMeeting).filter(Boolean);
const meetings = mappedMeetings.length > 0 ? mappedMeetings : extractStrategicMeetings(markdown);
const priorityEmails = gmailMessages.map(mapEmail).filter(Boolean);

const gmailFollowUps = toTextList(
  gmailMessages.filter((message) => message.requiresReply || message.actionRequired || message.nextAction)
);
const followUps =
  toTextList(source.followUps).length > 0
    ? toTextList(source.followUps)
    : gmailFollowUps.length > 0
      ? gmailFollowUps
      : extractSectionBullets(markdown, ["People / Follow-ups", "Follow Ups", "Follow-ups"]);

const priorities =
  asArray(source.priorities).map(mapPriority).filter(Boolean).length > 0
    ? asArray(source.priorities).map(mapPriority).filter(Boolean)
    : extractSectionBullets(markdown, ["Current Priorities", "Top Priorities", "Priorities"]).map((title) => ({
        title,
        status: "High",
      }));

const risks =
  toTextList(source.risks).length > 0
    ? toTextList(source.risks)
    : extractSectionBullets(markdown, ["Risks", "Current Risks", "Risks / Concerns"]);

const recommendedAction =
  cleanText(source.recommendedAction || source.nextAction) ||
  extractRecommendedAction(markdown);

const dailyBrief = {
  generatedAt: new Date().toISOString(),
  todaySummary: markdown,
  meetings,
  priorityEmails,
  followUps,
  priorities,
  risks,
  recommendedAction,
};

const requiredFields = [
  "generatedAt",
  "todaySummary",
  "meetings",
  "priorityEmails",
  "followUps",
  "priorities",
  "risks",
  "recommendedAction",
];

for (const field of requiredFields) {
  if (!(field in dailyBrief)) {
    throw new Error(`AKEOS-004: Missing required field ${field}`);
  }
}

for (const field of ["meetings", "priorityEmails", "followUps", "priorities", "risks"]) {
  if (!Array.isArray(dailyBrief[field])) {
    throw new Error(`AKEOS-004: ${field} must be an array`);
  }
}

if (!dailyBrief.todaySummary.trim()) {
  throw new Error("AKEOS-004: todaySummary is empty");
}

if (
  dailyBrief.meetings.length === 0 &&
  dailyBrief.priorityEmails.length === 0 &&
  dailyBrief.followUps.length === 0 &&
  dailyBrief.priorities.length === 0 &&
  dailyBrief.risks.length === 0 &&
  !dailyBrief.recommendedAction.trim()
) {
  throw new Error("AKEOS-004: daily-brief.json would contain no usable dashboard content");
}

return [
  {
    json: {
      dailyBrief,
      fileName: "daily-brief.tmp.json",
      filePath: "/dashboard-public/daily-brief.tmp.json",
      finalPath: "/dashboard-public/daily-brief.json",
      fileContents: JSON.stringify(dailyBrief, null, 2),
    },
  },
];
```

## Node 4: `AKEOS-004 - Convert JSON to File`

Node type: `Convert to File`

Operation:

```text
Convert to Text File
```

Parameters:

```text
Text Input Field: fileContents
```

Options:

```text
File Name: ={{ $json.fileName }}
Encoding: utf8
```

Expected output binary field:

```text
data
```

## Node 5: `AKEOS-004 - Write Dashboard Brief Temp`

Node type: `Read/Write Files from Disk`

Operation:

```text
Write File to Disk
```

Parameters:

```text
File Path and Name: ={{ $json.filePath }}
Input Binary Field: data
```

Options:

```text
Append: false
```

This writes:

```text
/dashboard-public/daily-brief.tmp.json
```

## Node 6: `AKEOS-004 - Publish Dashboard Brief`

Node type: `Read/Write Files from Disk`

Operation:

```text
Write File to Disk
```

Parameters:

```text
File Path and Name: /dashboard-public/daily-brief.json
Input Binary Field: data
```

Options:

```text
Append: false
```

This publishes the final dashboard file after the temp file write succeeds. This n8n 2.19.5 image does not recognize the `Execute Command` node, so the working local implementation uses a second supported `Read/Write Files from Disk` node instead of a shell rename.

## Expressions Summary

Use these exact expressions in the n8n node fields:

```text
Convert to File > File Name:
={{ $json.fileName }}

Read/Write Files from Disk > File Path and Name:
={{ $json.filePath }}

Read/Write Files from Disk > Input Binary Field:
data

Publish Dashboard Brief > File Path and Name:
/dashboard-public/daily-brief.json

Publish Dashboard Brief > Input Binary Field:
data
```

## Docker Path Considerations

The recommended n8n container path is:

```text
/dashboard-public/daily-brief.json
```

Mount the dashboard public directory into the n8n container and use the container path in nodes 5 and 6.

Example Docker volume:

```yaml
volumes:
  - /Users/akeos/akeos/projects/akeos-command-center/public:/dashboard-public
```

Then use:

```text
Temp path:
/dashboard-public/daily-brief.tmp.json

Final path:
/dashboard-public/daily-brief.json

Execute Command:
mv -f /dashboard-public/daily-brief.tmp.json /dashboard-public/daily-brief.json
```

For n8n 2.0 or any install with file access restrictions enabled, allow the directory:

```text
N8N_RESTRICT_FILE_ACCESS_TO=/dashboard-public
```

The `Execute Command` node may be disabled in some self-hosted installs and is unavailable on n8n Cloud. If it is unavailable, replace nodes 5 and 6 with a small authenticated local HTTP file-writer service that performs the temp write and rename on the dashboard host.

In this local n8n 2.19.5 container, `Execute Command` is unavailable, so the active workflow uses node 5 to write `/dashboard-public/daily-brief.tmp.json` and node 6 to write `/dashboard-public/daily-brief.json` directly through `Read/Write Files from Disk`.

## Verification

After running the workflow, confirm:

```text
/dashboard-public/daily-brief.json
```

contains valid JSON with these top-level fields:

```text
generatedAt
todaySummary
meetings
priorityEmails
followUps
priorities
risks
recommendedAction
```

Then refresh the dashboard or wait up to 60 seconds for the dashboard poller to pick up the new data.
