import React, { useEffect, useState } from "react";
import { fetchDailyLog } from "./services/obsidian";
import { parseDailyBrief } from "./services/briefParser";

const today = new Date();

const greeting =
  today.getHours() < 12
    ? "Good morning, Andy."
    : today.getHours() < 18
    ? "Good afternoon, Andy."
    : "Good evening, Andy.";

const dateLabel = today.toLocaleDateString(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const weatherHomes = [
  {
    place: "Edison, NJ",
    temp: "63°F",
    condition: "Partly Cloudy",
    high: "72°",
    low: "52°",
    rain: "42%",
    wind: "7 mph",
    icon: "🌤️",
  },
  {
    place: "Swisttal, Germany",
    temp: "57°F",
    condition: "Mostly Cloudy",
    high: "66°",
    low: "48°",
    rain: "55%",
    wind: "6 mph",
    icon: "⛅",
  },
];

const fallbackPriorities = [
  ["Drive GTM Execution & Pipeline", "High"],
  ["Prepare Strategy Days Stuttgart", "High"],
  ["Increase Strategic Visibility", "Medium"],
];

const fallbackRisks = [
  "Operational overload and excessive context switching",
  "Overdependence on Swen’s daily briefing when unavailable",
];

const fallbackOpportunities = [
  "Turn War Room metrics into executive synthesis",
  "Use AKEOS as a GTM intelligence layer",
];

const quickGlanceItems = [
  ["Focus Today", "Execute with Excellence"],
  ["Top Priority", "GTM Execution & Pipeline"],
  ["Energy", "High"],
  ["Time Block", "Deep Work"],
  ["Next Up", "GTM Leadership Call"],
];

const activeStateItems = [
  ["Identity", "Builder & Steward"],
  ["Season", "Build & Scale"],
  ["Primary Focus", "GTM Execution"],
  ["Energy State", "High"],
  ["Mindset", "Disciplined Optimism"],
];

const navItems = [
  ["⌂", "Command Center", true],
  ["▤", "Daily Brief", false],
  ["◎", "Active State", false],
  ["▥", "GTM War Room", false],
  ["▣", "Calendar", false],
  ["♟", "Relationships", false],
  ["♧", "Resources", false],
  ["⚙", "Settings", false],
];
const strategicMeetings = [
  {
    time: "09:00",
    title: "Board Strategy Review",
    badge: "Critical",
    prep: "Revenue forecast + GTM risks",
  },
  {
    time: "13:00",
    title: "Stuttgart Strategy Days Prep",
    badge: "Strategic",
    prep: "Leadership narrative alignment",
  },
  {
    time: "17:30",
    title: "Family Planning Session",
    badge: "Family",
    prep: "Germany/US coordination",
  },
];
const executionReadiness = {
  score: 82,
  status: "High Readiness",
  insight: "Today favors strategic execution over reactive operations.",
  signals: [
    ["Strategic Alignment", "High"],
    ["Meeting Load", "Moderate"],
    ["GTM Pressure", "Elevated"],
    ["Focus Protection", "Good"],
  ],
};

function Panel({ title, icon, children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-[#24445a] bg-[#071d2d]/85 shadow-[0_0_30px_rgba(0,0,0,.25)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-[#24445a]/80 px-5 py-4">
        <span className="text-xl text-[#d6ad63]">{icon}</span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-[#f3e6c8]">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MetricBox({ icon, value, label }) {
  return (
    <div className="rounded-lg border border-[#24445a] bg-[#0a263a] p-4 text-center">
      <div className="text-2xl text-[#d6ad63]">{icon}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs leading-4 text-[#b7c5cf]">{label}</div>
    </div>
  );
}

function Status({ children, tone = "green" }) {
  const colors = {
    green: "border-emerald-500/30 bg-emerald-500/20 text-emerald-200",
    gold: "border-[#d6ad63]/40 bg-[#d6ad63]/20 text-[#f3d28d]",
    blue: "border-sky-500/30 bg-sky-500/20 text-sky-200",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs ${colors[tone]}`}>
      {children}
    </span>
  );
}

function FooterLink({ children }) {
  return (
    <button className="mt-5 w-full rounded-lg border border-[#d6ad63]/60 px-4 py-3 text-sm font-medium text-[#d6ad63] hover:bg-[#d6ad63]/10">
      {children} →
    </button>
  );
}

export default function AKEOSCommandCenterV1() {
  const [dailyLog, setDailyLog] = useState("");
  const [dailyLogError, setDailyLogError] = useState("");
  const [parsedBrief, setParsedBrief] = useState(null);

  useEffect(() => {
    fetchDailyLog()
      .then((text) => {
        setDailyLog(text);
        setParsedBrief(parseDailyBrief(text));
      })
      .catch((error) => {
        console.error(error);
        setDailyLogError("Daily Executive Brief is not available yet.");
      });
  }, []);

  const priorities =
    parsedBrief?.priorities?.length > 0
      ? parsedBrief.priorities.map((item) => [item, "High"])
      : fallbackPriorities;

  const risks =
    parsedBrief?.risks?.length > 0 ? parsedBrief.risks : fallbackRisks;

  const opportunities =
    parsedBrief?.opportunities?.length > 0
      ? parsedBrief.opportunities
      : fallbackOpportunities;

  const summary =
    parsedBrief?.executiveSummary ||
    dailyLogError ||
    "Loading Daily Executive Brief...";

  return (
    <main className="min-h-screen bg-[#061827] text-[#f7f0df]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#24445a] bg-[#051522] p-5 lg:flex lg:flex-col">
          <div className="pt-3 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#d6ad63]/60 text-center text-sm text-[#f3e6c8]">
              Cale Family Trust Crest
            </div>
            <div className="mt-4 font-serif text-4xl tracking-[0.18em] text-[#f3e6c8]">
              CALE
            </div>
            <div className="mt-1 font-serif text-lg tracking-[0.23em] text-[#d6ad63]">
              FAMILY TRUST
            </div>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map(([icon, label, active]) => (
              <div
                key={label}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm ${
                  active
                    ? "border-l-2 border-[#d6ad63] bg-white/10 text-[#f3d28d]"
                    : "text-[#c6d2da] hover:bg-white/5"
                }`}
              >
                <span className="text-xl text-[#d6ad63]">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </nav>
        </aside>

        <section className="flex-1 overflow-hidden bg-[radial-gradient(circle_at_top_left,#123f5a_0%,transparent_35%),linear-gradient(135deg,#071d2d,#061827_55%,#020c15)] p-5 lg:p-8">
          <header className="grid gap-6 border-b border-[#24445a] pb-7 xl:grid-cols-[1.4fr_.8fr_.9fr]">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-[#d6ad63]/30 bg-[#d6ad63]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f3d28d]">
                All systems operational
              </div>
              <h1 className="font-serif text-4xl tracking-[0.16em] text-[#f3d28d] lg:text-5xl">
                AKEOS COMMAND CENTER
              </h1>
              <p className="mt-3 text-sm uppercase tracking-[0.28em] text-[#d6ad63]">
                Execute Today. Build Tomorrow. Preserve Forever.
              </p>
            </div>

            <div className="border-l border-[#24445a] pl-6">
              <div className="text-sm text-[#d6ad63]">▣ {dateLabel}</div>
              <div className="mt-3 text-2xl font-light text-white">
                {greeting}
              </div>
            </div>

            <div className="border-l border-[#24445a] pl-6">
              <div className="font-serif text-5xl leading-none text-[#d6ad63]">
                “
              </div>
              <p className="font-serif text-xl leading-7 text-[#f3e6c8]">
                The best way to predict the future is to create it.
              </p>
              <p className="mt-3 text-[#d6ad63]">— Peter Drucker</p>
            </div>
          </header>

          <div className="mt-7 grid gap-5 xl:grid-cols-[1.15fr_.9fr_1.1fr]">
            <Panel title="Weather" icon="☁">
              <div className="grid gap-4 md:grid-cols-2">
                {weatherHomes.map((home) => (
                  <div
                    key={home.place}
                    className="rounded-lg border border-[#24445a] bg-[#0a263a] p-4"
                  >
                    <div className="inline-block rounded bg-white/10 px-2 py-1 text-sm text-[#f3e6c8]">
                      {home.place}
                    </div>
                    <div className="mt-5 flex items-center gap-4">
                      <div className="text-5xl">{home.icon}</div>
                      <div>
                        <div className="text-4xl font-light text-white">
                          {home.temp}
                        </div>
                        <div className="text-sm text-[#b7c5cf]">
                          {home.condition}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#24445a] pt-4 text-sm text-[#c6d2da]">
                      <div>↑ {home.high}</div>
                      <div>↓ {home.low}</div>
                      <div>♢ {home.rain}</div>
                      <div>≋ {home.wind}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Quote of the Day" icon="“">
              <p className="font-serif text-2xl leading-9 text-[#f3e6c8]">
                Discipline is choosing between what you want now and what you
                want most.
              </p>
              <p className="mt-5 text-[#d6ad63]">— Abraham Lincoln</p>
            </Panel>

            <Panel title="Execution Readiness" icon="◈">
  <div className="text-center">
    <div className="text-6xl font-semibold text-[#f3d28d]">
      {executionReadiness.score}
      <span className="text-2xl text-[#8ea3b0]">/100</span>
    </div>

    <div className="mt-2 text-sm uppercase tracking-[0.2em] text-emerald-300">
      {executionReadiness.status}
    </div>
  </div>

  <div className="mt-6 space-y-3 text-sm">
    {executionReadiness.signals.map(([label, value]) => (
      <div
        key={label}
        className="flex items-center justify-between border-b border-[#24445a] pb-3"
      >
        <span className="text-[#c6d2da]">{label}</span>
        <span className="text-right text-white">{value}</span>
      </div>
    ))}
  </div>

  <div className="mt-5 rounded-lg border border-[#d6ad63]/30 bg-[#d6ad63]/10 p-3 text-sm leading-6 text-[#f3e6c8]">
    {executionReadiness.insight}
  </div>
</Panel>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.8fr_.9fr]">
            <Panel
              title="1. Today’s Daily Executive Brief"
              icon="▧"
              className="xl:row-span-2"
            >
              <div className="text-xs text-[#8ea3b0]">
                Generated this morning • Live from Obsidian
              </div>

              <div className="mt-5 max-h-[320px] overflow-y-auto rounded-lg border border-[#24445a] bg-[#0a263a]/40 p-5">
                <div className="space-y-4 text-sm leading-7 text-[#e5edf2]">
                  {summary
  .split("\n")
  .filter((line) => line.trim() !== "")
  .map((line, index) => {
    if (line.startsWith("# ")) {
      return (
        <h2 key={index} className="text-lg font-semibold text-white">
          {line.replace("# ", "")}
        </h2>
      );
    }

    if (line.startsWith("## ")) {
      return (
        <h3 key={index} className="pt-2 text-base font-semibold text-[#f3d28d]">
          {line.replace("## ", "")}
        </h3>
      );
    }

    if (line.startsWith("- ")) {
      return (
        <div key={index} className="flex gap-3">
          <span className="text-[#d6ad63]">•</span>
          <span>{line.replace("- ", "")}</span>
        </div>
      );
    }

    return <p key={index}>{line}</p>;
  })}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricBox icon="✓" value="3" label="Priorities On Track" />
                <MetricBox icon="⚠" value={risks.length} label="Risks Monitoring" />
                <MetricBox
                  icon="↗"
                  value={opportunities.length}
                  label="Opportunities Active"
                />
                <MetricBox icon="▣" value="5" label="Commitments This Week" />
              </div>

              <FooterLink>Open Full Brief</FooterLink>
            </Panel>

            <Panel title="2. Strategic Meetings" icon="✦">
  <div className="space-y-4 text-sm">
    {strategicMeetings.map((meeting) => (
      <div
        key={meeting.title}
        className="rounded-xl border border-[#24445a] bg-[#0a263a] p-4"
      >
        <div className="flex items-center justify-between">
          <div className="text-[#f3d28d]">{meeting.time}</div>

          <Status
            tone={
              meeting.badge === "Critical"
                ? "red"
                : meeting.badge === "Strategic"
                ? "gold"
                : "green"
            }
          >
            {meeting.badge}
          </Status>
        </div>

        <div className="mt-2 text-base text-white">
          {meeting.title}
        </div>

        <div className="mt-2 text-xs text-[#aab7c0]">
          Prep: {meeting.prep}
        </div>
      </div>
    ))}
  </div>

  <FooterLink>View Full Meeting Intelligence</FooterLink>
</Panel>

            <Panel title="3. Current Priorities" icon="☷">
              <div className="space-y-4">
                {priorities.slice(0, 3).map(([priority, status], index) => (
                  <div key={priority} className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d6ad63] text-[#d6ad63]">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-sm text-white">{priority}</div>
                    <Status tone={status === "High" ? "green" : "gold"}>
                      {status}
                    </Status>
                  </div>
                ))}
              </div>
              <FooterLink>View All Priorities</FooterLink>
            </Panel>

            <Panel title="4. Current Risks / Concerns" icon="♢">
              <ul className="space-y-4 text-sm text-[#e5edf2]">
                {risks.map((risk) => (
                  <li key={risk} className="flex gap-3">
                    <span className="text-red-400">●</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
              <FooterLink>View All Risks</FooterLink>
            </Panel>

            <Panel title="5. Current Opportunities" icon="⌁">
              <ul className="space-y-4 text-sm text-[#e5edf2]">
                {opportunities.map((opp) => (
                  <li key={opp} className="flex gap-3">
                    <span className="text-emerald-400">●</span>
                    <span>{opp}</span>
                  </li>
                ))}
              </ul>
              <FooterLink>View All Opportunities</FooterLink>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}
